import { io } from "socket.io-client";

let socket = null;

// One shared connection for the whole app. Pages call getSocket() and
// attach their own listeners (e.g. "task:updated") in a useEffect,
// and remove just their own listener on cleanup — the connection itself
// stays open for the lifetime of the logged-in session.
export function getSocket() {
  if (!socket) {
    const base = import.meta.env.VITE_API_URL || "http://localhost:5000";
    socket = io(base, { withCredentials: true, autoConnect: true });
  }
  return socket;
}

export function disconnectSocket() {
  if (socket) {
    socket.disconnect();
    socket = null;
  }
}
