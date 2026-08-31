import { useEffect, useRef, useState } from "react";
import toast from "react-hot-toast";

import api from "../api/axios";
import { useAuth } from "../contexts/AuthContext";

const initials = (name = "") =>
  name
    .split(" ")
    .map((p) => p[0])
    .slice(0, 2)
    .join("")
    .toUpperCase();

const formatTime = (dateStr) => {
  if (!dateStr) return "";
  return new Date(dateStr).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });
};

const Chat = () => {
  const { user, isAdmin } = useAuth();

  const [view, setView] = useState("mine"); // "mine" | "admin"
  const [conversations, setConversations] = useState([]);
  const [selectedId, setSelectedId] = useState(null);
  const [messages, setMessages] = useState([]);
  const [messageText, setMessageText] = useState("");
  const [sending, setSending] = useState(false);

  const [showNewChat, setShowNewChat] = useState(false);
  const [newChatMode, setNewChatMode] = useState("direct"); // "direct" | "group"
  const [chattableUsers, setChattableUsers] = useState([]);
  const [groupName, setGroupName] = useState("");
  const [selectedUserIds, setSelectedUserIds] = useState([]);

  const messagesEndRef = useRef(null);
  const selectedConversation = conversations.find((c) => c.id === selectedId);
  const isReadOnly = view === "admin" && isAdmin && !selectedConversation?.iAmParticipant;

  const loadConversations = async () => {
    try {
      const endpoint = view === "admin" ? "/chat/admin/conversations" : "/chat/conversations";
      const response = await api.get(endpoint);
      setConversations(response.data.data);
    } catch (error) {
      toast.error("Could not load conversations");
    }
  };

  const loadMessages = async (conversationId) => {
    try {
      const response = await api.get(`/chat/conversations/${conversationId}/messages`);
      setMessages(response.data.data);
      if (view === "mine") {
        api.patch(`/chat/conversations/${conversationId}/read`).catch(() => {});
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
      // silent — dropdown just stays empty
    }
  };

  useEffect(() => {
    loadConversations();
    setSelectedId(null);
    setMessages([]);
    const poll = setInterval(loadConversations, 8000);
    return () => clearInterval(poll);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [view]);

  useEffect(() => {
    if (!selectedId) return;
    loadMessages(selectedId);
    const poll = setInterval(() => loadMessages(selectedId), 3000);
    return () => clearInterval(poll);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [selectedId]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const sendMessage = async (event) => {
    event.preventDefault();
    if (!messageText.trim() || !selectedId) return;

    setSending(true);
    try {
      await api.post(`/chat/conversations/${selectedId}/messages`, { content: messageText });
      setMessageText("");
      loadMessages(selectedId);
      loadConversations();
    } catch (error) {
      toast.error(error.response?.data?.message || "Could not send message");
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

  const startDirectChat = async (otherUserId) => {
    try {
      const response = await api.post("/chat/conversations/direct", { userId: otherUserId });
      setShowNewChat(false);
      setView("mine");
      await loadConversations();
      setSelectedId(response.data.data.id);
    } catch (error) {
      toast.error(error.response?.data?.message || "Could not start chat");
    }
  };

  const createGroup = async (event) => {
    event.preventDefault();
    if (!groupName.trim() || selectedUserIds.length === 0) {
      toast.error("Group name and at least one member are required");
      return;
    }
    try {
      const response = await api.post("/chat/conversations/group", {
        name: groupName,
        participantIds: selectedUserIds,
      });
      setShowNewChat(false);
      setView("mine");
      await loadConversations();
      setSelectedId(response.data.data.id);
    } catch (error) {
      toast.error(error.response?.data?.message || "Could not create group");
    }
  };

  const toggleUserSelection = (userId) => {
    setSelectedUserIds((prev) => (prev.includes(userId) ? prev.filter((id) => id !== userId) : [...prev, userId]));
  };

  return (
    <div className="team-page">
      <div className="page-header animate-in">
        <div>
          <h1>Chat</h1>
          <p>{view === "admin" ? "Every conversation in the company" : "Talk with your teammates"}</p>
        </div>

        <div style={{ display: "flex", gap: 10 }}>
          {isAdmin && (
            <button
              className="refresh-button"
              onClick={() => setView(view === "mine" ? "admin" : "mine")}
            >
              {view === "mine" ? "View All (Admin)" : "Back to My Chats"}
            </button>
          )}
          {view === "mine" && (
            <button className="auth-button" style={{ width: "auto", padding: "10px 18px" }} onClick={openNewChat}>
              + New Chat
            </button>
          )}
        </div>
      </div>

      <div className="dashboard-card animate-card" style={{ padding: 0, display: "grid", gridTemplateColumns: "300px 1fr", minHeight: 520, overflow: "hidden" }}>
        {/* Conversation list */}
        <div style={{ borderRight: "1px solid var(--border-light)", overflowY: "auto", maxHeight: 600 }}>
          {conversations.length === 0 ? (
            <div style={{ padding: 20, color: "var(--text-muted)", fontSize: 12 }}>
              {view === "admin" ? "No conversations in the company yet." : "No chats yet — start one!"}
            </div>
          ) : (
            conversations.map((conv) => (
              <div
                key={conv.id}
                onClick={() => setSelectedId(conv.id)}
                style={{
                  padding: "14px 16px",
                  borderBottom: "1px solid var(--border-light)",
                  cursor: "pointer",
                  background: selectedId === conv.id ? "var(--primary-light)" : "transparent",
                  display: "flex",
                  alignItems: "center",
                  gap: 10,
                }}
              >
                <div className="employee-avatar" style={{ flexShrink: 0 }}>
                  {conv.type === "GROUP" ? "#" : initials(conv.name)}
                </div>
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                    <strong style={{ fontSize: 12, color: "var(--text)" }}>{conv.name}</strong>
                    {conv.unreadCount > 0 && (
                      <span
                        style={{
                          background: "var(--primary)",
                          color: "white",
                          borderRadius: 999,
                          fontSize: 9,
                          fontWeight: 700,
                          padding: "2px 7px",
                        }}
                      >
                        {conv.unreadCount}
                      </span>
                    )}
                  </div>
                  <p
                    style={{
                      fontSize: 11,
                      color: "var(--text-muted)",
                      margin: 0,
                      whiteSpace: "nowrap",
                      overflow: "hidden",
                      textOverflow: "ellipsis",
                    }}
                  >
                    {conv.lastMessage ? `${conv.lastMessage.senderName}: ${conv.lastMessage.content}` : "No messages yet"}
                  </p>
                </div>
              </div>
            ))
          )}
        </div>

        {/* Message thread */}
        <div style={{ display: "flex", flexDirection: "column" }}>
          {!selectedId ? (
            <div style={{ flex: 1, display: "flex", alignItems: "center", justifyContent: "center", color: "var(--text-muted)", fontSize: 13 }}>
              Select a conversation to start chatting
            </div>
          ) : (
            <>
              <div style={{ padding: "14px 20px", borderBottom: "1px solid var(--border-light)" }}>
                <strong style={{ fontSize: 13 }}>{selectedConversation?.name}</strong>
                {selectedConversation?.type === "GROUP" && (
                  <p style={{ fontSize: 11, color: "var(--text-muted)", margin: 0 }}>
                    {selectedConversation.participants.map((p) => p.name).join(", ")}
                  </p>
                )}
              </div>

              <div style={{ flex: 1, overflowY: "auto", padding: 20, display: "flex", flexDirection: "column", gap: 10, maxHeight: 440 }}>
                {messages.map((msg) => {
                  const mine = msg.senderId === user.id;
                  return (
                    <div key={msg.id} style={{ display: "flex", flexDirection: "column", alignItems: mine ? "flex-end" : "flex-start" }}>
                      {!mine && selectedConversation?.type === "GROUP" && (
                        <span style={{ fontSize: 10, color: "var(--text-muted)", marginBottom: 2 }}>{msg.sender?.name}</span>
                      )}
                      <div
                        style={{
                          background: mine ? "var(--primary)" : "#f1f5f9",
                          color: mine ? "white" : "var(--text)",
                          padding: "9px 13px",
                          borderRadius: 14,
                          borderBottomRightRadius: mine ? 4 : 14,
                          borderBottomLeftRadius: mine ? 14 : 4,
                          maxWidth: 360,
                          fontSize: 13,
                          wordBreak: "break-word",
                        }}
                      >
                        {msg.content}
                      </div>
                      <span style={{ fontSize: 9, color: "var(--text-muted)", marginTop: 2 }}>{formatTime(msg.createdAt)}</span>
                    </div>
                  );
                })}
                <div ref={messagesEndRef} />
              </div>

              {isReadOnly ? (
                <div style={{ padding: "14px 20px", borderTop: "1px solid var(--border-light)", fontSize: 11, color: "var(--text-muted)" }}>
                  Admin view — you can read this conversation but you're not a participant, so you can't send messages.
                </div>
              ) : (
                <form onSubmit={sendMessage} style={{ padding: "14px 20px", borderTop: "1px solid var(--border-light)", display: "flex", gap: 10 }}>
                  <input
                    placeholder="Type a message..."
                    value={messageText}
                    onChange={(e) => setMessageText(e.target.value)}
                    style={{ flex: 1, border: "1px solid #d9dee5", borderRadius: 8, padding: "10px 12px", fontSize: 12, outline: "none" }}
                  />
                  <button className="auth-button" style={{ width: "auto", padding: "10px 20px" }} type="submit" disabled={sending}>
                    Send
                  </button>
                </form>
              )}
            </>
          )}
        </div>
      </div>

      {showNewChat && (
        <div
          style={{
            position: "fixed",
            inset: 0,
            background: "rgba(15, 23, 42, 0.4)",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            zIndex: 50,
          }}
          onClick={() => setShowNewChat(false)}
        >
          <div className="dashboard-card animate-card" style={{ width: 420, maxHeight: "80vh", overflowY: "auto" }} onClick={(e) => e.stopPropagation()}>
            <div className="card-header">
              <h2>New Chat</h2>
            </div>

            <div style={{ display: "flex", gap: 8, marginBottom: 16 }}>
              <button
                className={newChatMode === "direct" ? "auth-button" : "refresh-button"}
                style={{ flex: 1 }}
                onClick={() => setNewChatMode("direct")}
                type="button"
              >
                Direct Message
              </button>
              <button
                className={newChatMode === "group" ? "auth-button" : "refresh-button"}
                style={{ flex: 1 }}
                onClick={() => setNewChatMode("group")}
                type="button"
              >
                Group Chat
              </button>
            </div>

            {newChatMode === "direct" ? (
              <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
                {chattableUsers.map((u) => (
                  <button
                    key={u.id}
                    onClick={() => startDirectChat(u.id)}
                    style={{
                      display: "flex",
                      alignItems: "center",
                      gap: 10,
                      padding: "10px 12px",
                      border: "1px solid var(--border-light)",
                      borderRadius: 8,
                      background: "white",
                      cursor: "pointer",
                      textAlign: "left",
                    }}
                  >
                    <div className="employee-avatar">{initials(u.name)}</div>
                    <div>
                      <div style={{ fontSize: 12, fontWeight: 600 }}>{u.name}</div>
                      <div style={{ fontSize: 10, color: "var(--text-muted)" }}>{u.role}</div>
                    </div>
                  </button>
                ))}
              </div>
            ) : (
              <form onSubmit={createGroup}>
                <div className="form-group">
                  <label>Group name</label>
                  <input required value={groupName} onChange={(e) => setGroupName(e.target.value)} placeholder="e.g. Marketing Team" />
                </div>

                <div className="form-group">
                  <label>Members</label>
                  <div style={{ display: "flex", flexDirection: "column", gap: 6, maxHeight: 220, overflowY: "auto" }}>
                    {chattableUsers.map((u) => (
                      <label key={u.id} style={{ display: "flex", alignItems: "center", gap: 8, fontSize: 12 }}>
                        <input type="checkbox" checked={selectedUserIds.includes(u.id)} onChange={() => toggleUserSelection(u.id)} />
                        {u.name} <span style={{ color: "var(--text-muted)", fontSize: 10 }}>({u.role})</span>
                      </label>
                    ))}
                  </div>
                </div>

                <button className="auth-button" type="submit">
                  Create Group
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