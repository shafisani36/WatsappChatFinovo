import React, { createContext, useContext, useState } from "react";
import api from "../api/axios";
import { disconnectSocket } from "../api/socket";

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(() => {
    const stored = localStorage.getItem("user");
    return stored ? JSON.parse(stored) : null;
  });

  const login = async (email, password) => {
    const { data } = await api.post("/auth/login", { email, password });
    localStorage.setItem("token", data.token);
    localStorage.setItem("refreshToken", data.refreshToken);
    localStorage.setItem("user", JSON.stringify(data.user));
    setUser(data.user);
    return data.user;
  };

  const updateUserPoints = (points) => {
    setUser((u) => {
      const updated = { ...u, points };
      localStorage.setItem("user", JSON.stringify(updated));
      return updated;
    });
  };

  const logout = async () => {
    const refreshToken = localStorage.getItem("refreshToken");
    try {
      await api.post("/auth/logout", { refreshToken });
    } catch {
      // ignore — we clear local state regardless
    }
    disconnectSocket();
    localStorage.clear();
    setUser(null);
  };

  return (
    <AuthContext.Provider value={{ user, login, logout, updateUserPoints }}>
      {children}
    </AuthContext.Provider>
  );
}

export const useAuth = () => useContext(AuthContext);
