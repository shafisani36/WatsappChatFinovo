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

      setUser(response.data.user);
    } catch (error) {
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

    setUser(response.data.user);

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
      console.error(
        "Logout request failed:",
        error
      );
    } finally {
      stopTokenRefresh();
      setUser(null);
    }
  };


  const isManager =
    user?.role === "MANAGER" ||
    user?.role === "COMPANY_ADMIN" ||
    user?.role === "ADMIN";

  const isAdmin =
    user?.role === "COMPANY_ADMIN" ||
    user?.role === "ADMIN";

  const isEmployee =
    user?.role === "EMPLOYEE";

  return (
    <AuthContext.Provider
      value={{
        user,
        loading,
        login,
        register,
        logout,
        fetchUser,
        isManager,
        isAdmin,
        isEmployee,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () =>
  useContext(AuthContext);