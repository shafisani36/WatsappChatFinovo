import {
  createContext,
  useContext,
  useEffect,
  useState,
} from "react";

import api, {
  startTokenRefresh,
  stopTokenRefresh,
} from "../api/axios";

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  const fetchUser = async () => {
    try {
      const response = await api.get("/auth/dashboard");

      setUser(response.data?.user || null);
    } catch (error) {
      console.error("FETCH USER ERROR:", error);
      setUser(null);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchUser();
  }, []);

  useEffect(() => {
    if (user) {
      startTokenRefresh();
    } else {
      stopTokenRefresh();
    }

    return () => {
      stopTokenRefresh();
    };
  }, [user]);

  const login = async (email, passwordHash) => {
    const response = await api.post("/auth/login", {
      email,
      passwordHash,
    });

    const loggedInUser = response.data?.user || null;

    setUser(loggedInUser);

    startTokenRefresh();

    return response.data;
  };

  const register = async (userData) => {
    const response = await api.post(
      "/auth/register",
      userData
    );

    return response.data;
  };

  const logout = async () => {
    try {
      await api.post("/auth/logout");
    } catch (error) {
      console.error("Logout request failed:", error);
    } finally {
      stopTokenRefresh();
      setUser(null);
    }
  };

  const role = user?.role || null;

  const isAdmin =
    role === "COMPANY_ADMIN" ||
    role === "ADMIN";

  const isManager =
    role === "MANAGER" ||
    role === "COMPANY_ADMIN" ||
    role === "ADMIN";

  const isEmployee =
    role === "EMPLOYEE";

  return (
    <AuthContext.Provider
      value={{
        user,
        loading,
        role,
        login,
        register,
        logout,
        fetchUser,
        isAdmin,
        isManager,
        isEmployee,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);

  if (!context) {
    throw new Error(
      "useAuth must be used inside AuthProvider"
    );
  }

  return context;
};