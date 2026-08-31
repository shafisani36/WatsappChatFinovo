const { Op } = require("sequelize");
const { Conversation, ConversationParticipant, Message, User } = require("../models/index.model");

const isAdmin = (role) => role === "COMPANY_ADMIN";

class ChatService {
  // List everyone in the tenant a user could start a chat with.
  async getChattableUsers(tenantId, excludeUserId) {
    return User.findAll({
      where: { tenantId, id: { [Op.ne]: excludeUserId } },
      attributes: ["id", "name", "role"],
      order: [["name", "ASC"]],
    });
  }

  // Conversations the requester is actually a participant of, newest first,
  // with a small preview + unread count for the sidebar list.
  async getMyConversations(tenantId, userId) {
    const memberships = await ConversationParticipant.findAll({
      where: { userId },
      include: [
        {
          model: Conversation,
          where: { tenantId },
          include: [
            {
              model: ConversationParticipant,
              as: "participants",
              include: [{ model: User, attributes: ["id", "name", "role"] }],
            },
          ],
        },
      ],
    });

    const results = await Promise.all(
      memberships.map(async (membership) => {
        const conversation = membership.Conversation;

        const lastMessage = await Message.findOne({
          where: { conversationId: conversation.id },
          order: [["createdAt", "DESC"]],
          include: [{ model: User, as: "sender", attributes: ["id", "name"] }],
        });

        const unreadCount = await Message.count({
          where: {
            conversationId: conversation.id,
            senderId: { [Op.ne]: userId },
            createdAt: { [Op.gt]: membership.lastReadAt || new Date(0) },
          },
        });

        const otherParticipants = conversation.participants
          .filter((p) => p.userId !== userId)
          .map((p) => ({ id: p.User.id, name: p.User.name, role: p.User.role }));

        return {
          id: conversation.id,
          type: conversation.type,
          name: conversation.type === "GROUP" ? conversation.name : otherParticipants[0]?.name || "Unknown",
          participants: otherParticipants,
          lastMessage: lastMessage
            ? { content: lastMessage.content, senderName: lastMessage.sender.name, createdAt: lastMessage.createdAt }
            : null,
          lastMessageAt: conversation.lastMessageAt,
          unreadCount,
        };
      })
    );

    return results.sort((a, b) => new Date(b.lastMessageAt || 0) - new Date(a.lastMessageAt || 0));
  }

  async findOrCreateDirectConversation(tenantId, userId, otherUserId) {
    if (userId === otherUserId) {
      throw new Error("CANNOT_CHAT_WITH_SELF");
    }

    const otherUser = await User.findOne({ where: { id: otherUserId, tenantId } });
    if (!otherUser) {
      throw new Error("USER_NOT_FOUND");
    }

    // Look for an existing DIRECT conversation shared by exactly these two.
    const myMemberships = await ConversationParticipant.findAll({
      where: { userId },
      include: [{ model: Conversation, where: { tenantId, type: "DIRECT" } }],
    });

    for (const membership of myMemberships) {
      const otherMembership = await ConversationParticipant.findOne({
        where: { conversationId: membership.conversationId, userId: otherUserId },
      });
      if (otherMembership) {
        return membership.Conversation;
      }
    }

    const conversation = await Conversation.create({
      tenantId,
      type: "DIRECT",
      createdById: userId,
    });

    await ConversationParticipant.bulkCreate([
      { conversationId: conversation.id, userId },
      { conversationId: conversation.id, userId: otherUserId },
    ]);

    return conversation;
  }

  async createGroupConversation(tenantId, createdById, name, participantIds = []) {
    if (!name || !name.trim()) {
      throw new Error("GROUP_NAME_REQUIRED");
    }

    const uniqueParticipantIds = [...new Set([...participantIds, createdById])];

    const validUsers = await User.count({ where: { tenantId, id: uniqueParticipantIds } });
    if (validUsers !== uniqueParticipantIds.length) {
      throw new Error("INVALID_PARTICIPANTS");
    }

    const conversation = await Conversation.create({
      tenantId,
      type: "GROUP",
      name: name.trim(),
      createdById,
    });

    await ConversationParticipant.bulkCreate(
      uniqueParticipantIds.map((userId) => ({ conversationId: conversation.id, userId }))
    );

    return conversation;
  }

  async assertParticipantOrAdmin(conversationId, tenantId, requester) {
    const conversation = await Conversation.findOne({ where: { id: conversationId, tenantId } });
    if (!conversation) {
      throw new Error("CONVERSATION_NOT_FOUND");
    }

    if (isAdmin(requester.role)) {
      return conversation;
    }

    const membership = await ConversationParticipant.findOne({
      where: { conversationId, userId: requester.id },
    });
    if (!membership) {
      throw new Error("NOT_A_PARTICIPANT");
    }

    return conversation;
  }

  async getMessages(tenantId, requester, conversationId) {
    await this.assertParticipantOrAdmin(conversationId, tenantId, requester);

    return Message.findAll({
      where: { conversationId },
      include: [{ model: User, as: "sender", attributes: ["id", "name", "role"] }],
      order: [["createdAt", "ASC"]],
    });
  }

  async sendMessage(tenantId, senderId, conversationId, content) {
    if (!content || !content.trim()) {
      throw new Error("EMPTY_MESSAGE");
    }

    // Sending requires actual membership — admin oversight is read-only,
    // an admin shouldn't be able to post into a chat they're not part of.
    const membership = await ConversationParticipant.findOne({
      where: { conversationId, userId: senderId },
    });
    if (!membership) {
      throw new Error("NOT_A_PARTICIPANT");
    }

    const message = await Message.create({
      tenantId,
      conversationId,
      senderId,
      content: content.trim(),
    });

    await Conversation.update({ lastMessageAt: message.createdAt }, { where: { id: conversationId } });

    return Message.findByPk(message.id, {
      include: [{ model: User, as: "sender", attributes: ["id", "name", "role"] }],
    });
  }

  async markAsRead(userId, conversationId) {
    await ConversationParticipant.update(
      { lastReadAt: new Date() },
      { where: { conversationId, userId } }
    );
  }

  // Admin-only: every conversation in the tenant, regardless of membership.
  async getAllConversationsForAdmin(tenantId, adminId) {
    const conversations = await Conversation.findAll({
      where: { tenantId },
      include: [
        {
          model: ConversationParticipant,
          as: "participants",
          include: [{ model: User, attributes: ["id", "name", "role"] }],
        },
      ],
      order: [["lastMessageAt", "DESC"]],
    });

    return conversations.map((conversation) => ({
      id: conversation.id,
      type: conversation.type,
      name:
        conversation.type === "GROUP"
          ? conversation.name
          : conversation.participants.map((p) => p.User.name).join(" & "),
      participants: conversation.participants.map((p) => ({ id: p.User.id, name: p.User.name, role: p.User.role })),
      lastMessageAt: conversation.lastMessageAt,
      iAmParticipant: conversation.participants.some((p) => p.userId === adminId),
    }));
  }
}

module.exports = new ChatService();