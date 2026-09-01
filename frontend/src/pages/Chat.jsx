import { useEffect, useRef, useState } from "react";
import toast from "react-hot-toast";

import api from "../api/axios";
import { useAuth } from "../contexts/AuthContext";
import "../assets/styles/chat.css";
const initials = (name = "") =>
  name
    .split(" ")
    .map((p) => p[0])
    .slice(0, 2)
    .join("")
    .toUpperCase();

const formatTime = (dateStr) => {
  if (!dateStr) return "";

  return new Date(dateStr).toLocaleTimeString([], {
    hour: "2-digit",
    minute: "2-digit",
  });
};

const Chat = () => {
  const { user, isAdmin } = useAuth();

  const [view, setView] = useState("mine");
  const [conversations, setConversations] = useState([]);
  const [selectedId, setSelectedId] = useState(null);
  const [messages, setMessages] = useState([]);
  const [messageText, setMessageText] = useState("");
  const [sending, setSending] = useState(false);

  const [showNewChat, setShowNewChat] = useState(false);
  const [newChatMode, setNewChatMode] = useState("direct");
  const [chattableUsers, setChattableUsers] = useState([]);
  const [groupName, setGroupName] = useState("");
  const [selectedUserIds, setSelectedUserIds] = useState([]);

  const messagesEndRef = useRef(null);

  const selectedConversation = conversations.find(
    (conversation) => conversation.id === selectedId
  );

  const isReadOnly =
    view === "admin" &&
    isAdmin &&
    !selectedConversation?.iAmParticipant;

  const loadConversations = async () => {
    try {
      const endpoint =
        view === "admin"
          ? "/chat/admin/conversations"
          : "/chat/conversations";

      const response = await api.get(endpoint);

      setConversations(response.data.data);
    } catch (error) {
      toast.error("Could not load conversations");
    }
  };

  const loadMessages = async (conversationId) => {
    try {
      const response = await api.get(
        `/chat/conversations/${conversationId}/messages`
      );

      setMessages(response.data.data);

      if (view === "mine") {
        api
          .patch(`/chat/conversations/${conversationId}/read`)
          .catch(() => {});
      }
    } catch (error) {
      toast.error("Could not load messages");
    }
  };

  const loadChattableUsers = async () => {
    try {
      const response = await api.get("/chat/users");

      setChattableUsers(response.data.data);
    } catch (error) {
    }
  };

  useEffect(() => {
    loadConversations();

    setSelectedId(null);
    setMessages([]);

    const poll = setInterval(loadConversations, 8000);

    return () => clearInterval(poll);

  }, [view]);

  useEffect(() => {
    if (!selectedId) return;

    loadMessages(selectedId);

    const poll = setInterval(() => {
      loadMessages(selectedId);
    }, 3000);

    return () => clearInterval(poll);

  }, [selectedId]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({
      behavior: "smooth",
    });
  }, [messages]);

  const sendMessage = async (event) => {
    event.preventDefault();

    if (!messageText.trim() || !selectedId) return;

    setSending(true);

    try {
      await api.post(
        `/chat/conversations/${selectedId}/messages`,
        {
          content: messageText.trim(),
        }
      );

      setMessageText("");

      await loadMessages(selectedId);
      await loadConversations();
    } catch (error) {
      toast.error(
        error.response?.data?.message ||
          "Could not send message"
      );
    } finally {
      setSending(false);
    }
  };

  const openNewChat = () => {
    setShowNewChat(true);
    setNewChatMode("direct");
    setGroupName("");
    setSelectedUserIds([]);

    loadChattableUsers();
  };

  const closeNewChat = () => {
    setShowNewChat(false);
    setGroupName("");
    setSelectedUserIds([]);
  };

  const startDirectChat = async (otherUserId) => {
    try {
      const response = await api.post(
        "/chat/conversations/direct",
        {
          userId: otherUserId,
        }
      );

      closeNewChat();

      setView("mine");

      await loadConversations();

      setSelectedId(response.data.data.id);
    } catch (error) {
      toast.error(
        error.response?.data?.message ||
          "Could not start chat"
      );
    }
  };

  const createGroup = async (event) => {
    event.preventDefault();

    if (
      !groupName.trim() ||
      selectedUserIds.length === 0
    ) {
      toast.error(
        "Group name and at least one member are required"
      );

      return;
    }

    try {
      const response = await api.post(
        "/chat/conversations/group",
        {
          name: groupName.trim(),
          participantIds: selectedUserIds,
        }
      );

      closeNewChat();

      setView("mine");

      await loadConversations();

      setSelectedId(response.data.data.id);
    } catch (error) {
      toast.error(
        error.response?.data?.message ||
          "Could not create group"
      );
    }
  };

  const toggleUserSelection = (userId) => {
    setSelectedUserIds((previous) =>
      previous.includes(userId)
        ? previous.filter((id) => id !== userId)
        : [...previous, userId]
    );
  };

  const selectConversation = (conversationId) => {
    setSelectedId(conversationId);
  };

  return (
    <div className="chat-page">

      <div className="chat-header animate-in">

        <div className="chat-heading">

          <div className="chat-title-line">

  
            <div>
              <div className="chat-title-row">

                <h1>Chat</h1>

              </div>

              <p>
                {view === "admin"
                  ? "Every conversation in the company"
                  : "Talk with your teammates"}
              </p>
            </div>

          </div>

        </div>

        <div className="chat-header-actions">

          {isAdmin && (
            <button
              className="chat-secondary-button"
              onClick={() =>
                setView(
                  view === "mine"
                    ? "admin"
                    : "mine"
                )
              }
            >
              <span>
                {view === "mine"
                  ? "◉"
                  : "←"}
              </span>

              {view === "mine"
                ? "View All"
                : "My Chats"}
            </button>
          )}

          {view === "mine" && (
            <button
              className="chat-new-button"
              onClick={openNewChat}
            >
              <span>+</span>
              New Chat
            </button>
          )}

        </div>

      </div>



      <div className="chat-workspace animate-card">

  
        <aside className="chat-conversations">

          <div className="chat-sidebar-header">

            <div>
              <span className="section-kicker">
                MESSAGES
              </span>

              <h2>
                {view === "admin"
                  ? "All conversations"
                  : "Your conversations"}
              </h2>
            </div>

            <span className="chat-conversation-count">
              {conversations.length}
            </span>

          </div>

          <div className="chat-conversation-list">

            {conversations.length === 0 ? (

              <div className="chat-no-conversations">

                <div className="chat-empty-icon">
                  💬
                </div>

                <strong>
                  No conversations
                </strong>

                <p>
                  {view === "admin"
                    ? "No conversations exist in the company yet."
                    : "Start a conversation with a teammate."}
                </p>

                {view === "mine" && (
                  <button
                    onClick={openNewChat}
                    className="chat-empty-action"
                  >
                    + New Chat
                  </button>
                )}

              </div>

            ) : (

              conversations.map((conversation) => (

                <button
                  key={conversation.id}
                  type="button"
                  className={`chat-conversation ${
                    selectedId === conversation.id
                      ? "selected"
                      : ""
                  }`}
                  onClick={() =>
                    selectConversation(
                      conversation.id
                    )
                  }
                >

                  <div className="chat-conversation-avatar">

                    {conversation.type === "GROUP"
                      ? "#"
                      : initials(conversation.name)}

                  </div>

                  <div className="chat-conversation-info">

                    <div className="chat-conversation-top">

                      <strong>
                        {conversation.name}
                      </strong>

                      {conversation.unreadCount > 0 && (
                        <span className="chat-unread">
                          {conversation.unreadCount}
                        </span>
                      )}

                    </div>

                    <p>
                      {conversation.lastMessage
                        ? `${conversation.lastMessage.senderName}: ${conversation.lastMessage.content}`
                        : "No messages yet"}
                    </p>

                  </div>

                </button>

              ))

            )}

          </div>

        </aside>

        <main className="chat-thread">

          {!selectedId ? (

            <div className="chat-welcome">

              <div className="chat-welcome-icon">
                💬
              </div>

              <h2>
                Start a conversation
              </h2>

              <p>
                Select a conversation from the
                sidebar to view your messages.
              </p>

              {view === "mine" && (
                <button
                  className="chat-welcome-button"
                  onClick={openNewChat}
                >
                  + Start New Chat
                </button>
              )}

            </div>

          ) : (

            <>


              <div className="chat-thread-header">

                <div className="chat-thread-user">

                  <div className="chat-thread-avatar">
                    {selectedConversation?.type ===
                    "GROUP"
                      ? "#"
                      : initials(
                          selectedConversation?.name
                        )}
                  </div>

                  <div>

                    <h2>
                      {selectedConversation?.name}
                    </h2>

                    {selectedConversation?.type ===
                    "GROUP" ? (
                      <p>
                        {selectedConversation.participants
                          ?.map((participant) => participant.name)
                          .join(", ")}
                      </p>
                    ) : (
                      <p>
                        Direct conversation
                      </p>
                    )}

                  </div>

                </div>

                <div className="chat-thread-status">
                  <span></span>
                  Active
                </div>

              </div>


              <div className="chat-messages">

                {messages.length === 0 ? (

                  <div className="chat-no-messages">

                    <div>
                      💬
                    </div>

                    <strong>
                      No messages yet
                    </strong>

                    <p>
                      Send the first message in
                      this conversation.
                    </p>

                  </div>

                ) : (

                  messages.map((message) => {

                    const mine =
                      message.senderId === user.id;

                    return (
                      <div
                        key={message.id}
                        className={`chat-message-row ${
                          mine ? "mine" : "other"
                        }`}
                      >

                        {!mine &&
                          selectedConversation?.type ===
                            "GROUP" && (
                            <span className="chat-message-sender">
                              {message.sender?.name}
                            </span>
                          )}

                        <div className="chat-message-line">

                          {!mine && (
                            <div className="chat-message-avatar">
                              {initials(
                                message.sender?.name
                              )}
                            </div>
                          )}

                          <div
                            className={`chat-message ${
                              mine
                                ? "mine"
                                : "other"
                            }`}
                          >
                            {message.content}

                            <span className="chat-message-time">
                              {formatTime(
                                message.createdAt
                              )}
                            </span>
                          </div>

                        </div>

                      </div>
                    );
                  })

                )}

                <div ref={messagesEndRef} />

              </div>


              {isReadOnly ? (

                <div className="chat-readonly">

                  <span>◉</span>

                  <div>
                    <strong>
                      Admin read-only view
                    </strong>

                    <p>
                      You can read this conversation,
                      but you are not a participant.
                    </p>
                  </div>

                </div>

              ) : (

                <form
                  className="chat-composer"
                  onSubmit={sendMessage}
                >

                  <input
                    placeholder="Write a message..."
                    value={messageText}
                    onChange={(event) =>
                      setMessageText(
                        event.target.value
                      )
                    }
                    disabled={sending}
                  />

                  <button
                    type="submit"
                    disabled={
                      sending ||
                      !messageText.trim()
                    }
                  >
                    {sending ? (
                      <>
                        <span className="button-spinner"></span>
                        Sending
                      </>
                    ) : (
                      <>
                        Send
                        <span>→</span>
                      </>
                    )}
                  </button>

                </form>

              )}

            </>

          )}

        </main>

      </div>

      {showNewChat && (

        <div
          className="chat-modal-overlay"
          onClick={closeNewChat}
        >

          <div
            className="chat-modal animate-card"
            onClick={(event) =>
              event.stopPropagation()
            }
          >

            <div className="chat-modal-header">

              <div>

                <span className="section-kicker">
                  NEW CONVERSATION
                </span>

                <h2>
                  Start a chat
                </h2>

                <p>
                  Connect with one or more
                  teammates.
                </p>

              </div>

              <button
                type="button"
                className="chat-modal-close"
                onClick={closeNewChat}
              >
                ×
              </button>

            </div>


            <div className="chat-mode-switch">

              <button
                type="button"
                className={
                  newChatMode === "direct"
                    ? "active"
                    : ""
                }
                onClick={() =>
                  setNewChatMode("direct")
                }
              >
                <span>◉</span>
                Direct Message
              </button>

              <button
                type="button"
                className={
                  newChatMode === "group"
                    ? "active"
                    : ""
                }
                onClick={() =>
                  setNewChatMode("group")
                }
              >
                <span>#</span>
                Group Chat
              </button>

            </div>


            {newChatMode === "direct" ? (

              <div className="chat-user-list">

                {chattableUsers.length === 0 ? (

                  <div className="chat-users-empty">
                    No teammates available.
                  </div>

                ) : (

                  chattableUsers.map((chatUser) => (

                    <button
                      key={chatUser.id}
                      type="button"
                      className="chat-user-option"
                      onClick={() =>
                        startDirectChat(
                          chatUser.id
                        )
                      }
                    >

                      <div className="chat-user-avatar">
                        {initials(
                          chatUser.name
                        )}
                      </div>

                      <div className="chat-user-info">

                        <strong>
                          {chatUser.name}
                        </strong>

                        <span>
                          {chatUser.role}
                        </span>

                      </div>

                      <span className="chat-user-arrow">
                        →
                      </span>

                    </button>

                  ))

                )}

              </div>

            ) : (

              <form
                className="chat-group-form"
                onSubmit={createGroup}
              >

                <div className="form-group">

                  <label>
                    Group name
                  </label>

                  <input
                    required
                    value={groupName}
                    onChange={(event) =>
                      setGroupName(
                        event.target.value
                      )
                    }
                    placeholder="e.g. Marketing Team"
                  />

                </div>

                <div className="form-group">

                  <div className="chat-members-label">

                    <label>
                      Members
                    </label>

                    <span>
                      {selectedUserIds.length} selected
                    </span>

                  </div>

                  <div className="chat-members-list">

                    {chattableUsers.map(
                      (chatUser) => (

                        <label
                          key={chatUser.id}
                          className={`chat-member-option ${
                            selectedUserIds.includes(
                              chatUser.id
                            )
                              ? "selected"
                              : ""
                          }`}
                        >

                          <input
                            type="checkbox"
                            checked={selectedUserIds.includes(
                              chatUser.id
                            )}
                            onChange={() =>
                              toggleUserSelection(
                                chatUser.id
                              )
                            }
                          />

                          <div className="chat-member-avatar">
                            {initials(
                              chatUser.name
                            )}
                          </div>

                          <div>

                            <strong>
                              {chatUser.name}
                            </strong>

                            <span>
                              {chatUser.role}
                            </span>

                          </div>

                        </label>

                      )
                    )}

                  </div>

                </div>

                <button
                  className="chat-create-group-button"
                  type="submit"
                  disabled={
                    !groupName.trim() ||
                    selectedUserIds.length === 0
                  }
                >
                  Create Group
                  <span>→</span>
                </button>

              </form>

            )}

          </div>

        </div>

      )}

    </div>
  );
};

export default Chat;