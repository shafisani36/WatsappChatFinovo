const chatService = require("../services/chat.service");

const getChattableUsers = async (req, res) => {
  try {
    const { tenantId, id } = req.user;
    const users = await chatService.getChattableUsers(tenantId, id);
    res.status(200).json({ message: "Users fetched successfully", data: users });
  } catch (error) {
    res.status(500).json({ message: "Error fetching users", error: error.message });
  }
};

const getMyConversations = async (req, res) => {
  try {
    const { tenantId, id } = req.user;
    const conversations = await chatService.getMyConversations(tenantId, id);
    res.status(200).json({ message: "Conversations fetched successfully", data: conversations });
  } catch (error) {
    res.status(500).json({ message: "Error fetching conversations", error: error.message });
  }
};

const startDirectConversation = async (req, res) => {
  try {
    const { tenantId, id } = req.user;
    const { userId } = req.body;

    if (!userId) {
      return res.status(400).json({ message: "userId is required" });
    }

    const conversation = await chatService.findOrCreateDirectConversation(tenantId, id, userId);
    res.status(201).json({ message: "Conversation ready", data: conversation });
  } catch (error) {
    if (error.message === "CANNOT_CHAT_WITH_SELF") {
      return res.status(400).json({ message: "You can't start a conversation with yourself" });
    }
    if (error.message === "USER_NOT_FOUND") {
      return res.status(404).json({ message: "User not found" });
    }
    res.status(500).json({ message: "Error starting conversation", error: error.message });
  }
};

const createGroupConversation = async (req, res) => {
  try {
    const { tenantId, id } = req.user;
    const { name, participantIds } = req.body;

    const conversation = await chatService.createGroupConversation(tenantId, id, name, participantIds);
    res.status(201).json({ message: "Group created", data: conversation });
  } catch (error) {
    if (error.message === "GROUP_NAME_REQUIRED") {
      return res.status(400).json({ message: "Group name is required" });
    }
    if (error.message === "INVALID_PARTICIPANTS") {
      return res.status(400).json({ message: "One or more participants are invalid" });
    }
    res.status(500).json({ message: "Error creating group", error: error.message });
  }
};

const getMessages = async (req, res) => {
  try {
    const { tenantId, id, role } = req.user;
    const messages = await chatService.getMessages(tenantId, { id, role }, req.params.id);
    res.status(200).json({ message: "Messages fetched successfully", data: messages });
  } catch (error) {
    if (error.message === "CONVERSATION_NOT_FOUND") {
      return res.status(404).json({ message: "Conversation not found" });
    }
    if (error.message === "NOT_A_PARTICIPANT") {
      return res.status(403).json({ message: "You are not part of this conversation" });
    }
    res.status(500).json({ message: "Error fetching messages", error: error.message });
  }
};

const sendMessage = async (req, res) => {
  try {
    const { tenantId, id } = req.user;
    const message = await chatService.sendMessage(tenantId, id, req.params.id, req.body.content);
    res.status(201).json({ message: "Message sent", data: message });
  } catch (error) {
    if (error.message === "EMPTY_MESSAGE") {
      return res.status(400).json({ message: "Message cannot be empty" });
    }
    if (error.message === "NOT_A_PARTICIPANT") {
      return res.status(403).json({ message: "You are not part of this conversation" });
    }
    res.status(500).json({ message: "Error sending message", error: error.message });
  }
};

const markAsRead = async (req, res) => {
  try {
    const { id } = req.user;
    await chatService.markAsRead(id, req.params.id);
    res.status(200).json({ message: "Marked as read" });
  } catch (error) {
    res.status(500).json({ message: "Error marking as read", error: error.message });
  }
};

const getAllConversationsForAdmin = async (req, res) => {
  try {
    const { tenantId, id } = req.user;
    const conversations = await chatService.getAllConversationsForAdmin(tenantId, id);
    res.status(200).json({ message: "All conversations fetched successfully", data: conversations });
  } catch (error) {
    res.status(500).json({ message: "Error fetching conversations", error: error.message });
  }
};

module.exports = {
  getChattableUsers,
  getMyConversations,
  startDirectConversation,
  createGroupConversation,
  getMessages,
  sendMessage,
  markAsRead,
  getAllConversationsForAdmin,
};