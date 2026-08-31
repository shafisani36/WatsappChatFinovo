import { createContext, useContext, useState, useEffect, useRef } from "react";
import api from "../api/axios";

const NON_PRODUCTIVE_DOMAINS = [
  "youtube.com",
  "facebook.com",
  "twitter.com",
  "x.com",
  "instagram.com",
  "netflix.com",
  "reddit.com",
];

const SessionContext = createContext();

export function SessionProvider({ children }) {
  const [currentSession, setCurrentSession] = useState(null);
  const [loading, setLoading] = useState(true);
  const [activityState, setActivityState] = useState("ACTIVE");
  const [currentCategory, setCurrentCategory] = useState("PRODUCTIVE");
  
  const isUserActive = useRef(true);

  const fetchSession = async () => {
    try {
      const response = await api.get("/sessions/current");
      const data = response.data?.data;
      setCurrentSession(data || null);
    } catch (error) {
      console.error("Failed to fetch session:", error);
      setCurrentSession(null);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchSession();
  }, []);

  useEffect(() => {
    let activityTimeout;

    const handleUserActivity = () => {
      isUserActive.current = true;
      setActivityState("ACTIVE");

      clearTimeout(activityTimeout);
      activityTimeout = setTimeout(() => {
        isUserActive.current = false;
        setActivityState("IDLE");
      }, 15000); 
    };

    window.addEventListener("mousemove", handleUserActivity);
    window.addEventListener("keydown", handleUserActivity);
    window.addEventListener("scroll", handleUserActivity);

    return () => {
      window.removeEventListener("mousemove", handleUserActivity);
      window.removeEventListener("keydown", handleUserActivity);
      window.removeEventListener("scroll", handleUserActivity);
      clearTimeout(activityTimeout);
    };
  }, []);

  useEffect(() => {
    const activeSessionId = currentSession?.id || currentSession?.sessionId;
    if (!activeSessionId) return;

    const interval = setInterval(async () => {
      const active = isUserActive.current;
      const currentDomain = window.location.hostname;
      const isNonProd = NON_PRODUCTIVE_DOMAINS.some((d) => currentDomain.includes(d));
      
      const category = active ? (isNonProd ? "NON_PRODUCTIVE" : "PRODUCTIVE") : "NON_PRODUCTIVE";
      const state = active ? "ACTIVE" : "IDLE";

      setCurrentCategory(category);

      try {
        await api.post("/activity/events", {
          sessionId: activeSessionId,
          application: "Browser",
          domain: currentDomain,
          activityState: state,
          category: category,
          durationSeconds: 5,
        });
      } catch (err) {
        console.error("Heartbeat log failed:", err);
      }
    }, 5000);

    return () => clearInterval(interval);
  }, [currentSession]);

  return (
    <SessionContext.Provider
      value={{
        currentSession,
        setCurrentSession,
        fetchSession,
        loading,
        activityState,
        currentCategory,
      }}
    >
      {children}
    </SessionContext.Provider>
  );
}

export const useSession = () => useContext(SessionContext);