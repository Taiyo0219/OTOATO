import { createContext, useContext, useEffect, useMemo, useState } from "react";
import {
  clearStoredAuthToken,
  fetchCurrentUser,
  getStoredAuthToken,
  loginUser,
  logoutUser,
  registerUser
} from "../services/apiClient.js";

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [status, setStatus] = useState(() => (getStoredAuthToken() ? "loading" : "guest"));
  const [message, setMessage] = useState("");

  useEffect(() => {
    let isActive = true;

    async function restoreSession() {
      if (!getStoredAuthToken()) {
        setStatus("guest");
        return;
      }

      try {
        const currentUser = await fetchCurrentUser();

        if (!isActive) {
          return;
        }

        setUser(currentUser);
        setStatus("authenticated");
        setMessage("");
      } catch (error) {
        if (!isActive) {
          return;
        }

        clearStoredAuthToken();
        setUser(null);
        setStatus("guest");
        setMessage("ログイン期限が切れました。もう一度ログインしてください。");
      }
    }

    restoreSession();

    return () => {
      isActive = false;
    };
  }, []);

  const login = async ({ email, password }) => {
    setStatus("loading");
    setMessage("");

    try {
      const loggedInUser = await loginUser({ email, password });
      setUser(loggedInUser);
      setStatus("authenticated");
      return loggedInUser;
    } catch (error) {
      setUser(null);
      setStatus("guest");
      setMessage(error.message || "ログインに失敗しました。");
      throw error;
    }
  };

  const register = async ({ displayName, email, password }) => {
    setStatus("loading");
    setMessage("");

    try {
      const registeredUser = await registerUser({ displayName, email, password });
      setUser(registeredUser);
      setStatus("authenticated");
      return registeredUser;
    } catch (error) {
      setUser(null);
      setStatus("guest");
      setMessage(error.message || "新規登録に失敗しました。");
      throw error;
    }
  };

  const logout = async () => {
    await logoutUser();
    setUser(null);
    setStatus("guest");
    setMessage("");
  };

  const value = useMemo(() => ({
    user,
    status,
    message,
    isAuthenticated: status === "authenticated" && Boolean(user),
    isLoading: status === "loading",
    login,
    register,
    logout,
    clearMessage: () => setMessage("")
  }), [message, status, user]);

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const context = useContext(AuthContext);

  if (!context) {
    throw new Error("useAuth must be used within AuthProvider");
  }

  return context;
}
