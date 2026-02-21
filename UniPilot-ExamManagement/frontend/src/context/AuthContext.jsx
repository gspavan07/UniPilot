import { createContext, useContext, useState, useEffect, useCallback, useMemo } from "react";
import { authService } from "../services/authService.js";
import { setAccessToken, clearAccessToken } from "../utils/api.js";

const AuthContext = createContext(null);

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
};

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  // Initialize Auth on Mount
  useEffect(() => {
    const initAuth = async () => {
      try {
        const { accessToken } = await authService.refreshToken();
        if (accessToken) {
          setAccessToken(accessToken);
          const userData = await authService.getCurrentUser();
          setUser(userData);
        }
      } catch (error) {
        // Expected if no valid refresh cookie exists
      } finally {
        setLoading(false);
      }
    };
    initAuth();
  }, []);

  const login = useCallback(async (email, password) => {
    try {
      const response = await authService.login(email, password);
      // Role validation specific to Exam Management Panel
      if (
        response?.data?.user?.role !== "super_admin" &&
        response?.data?.user?.role !== "faculty" &&
        response?.data?.user?.role !== "hod"
      ) {
        return { success: false, error: "You are not authorized to login" };
      }

      const { accessToken, user } = response.data;
      setAccessToken(accessToken);
      setUser(user);

      return { success: true };
    } catch (error) {
      console.error("Login error:", error);
      return {
        success: false,
        error: error.response?.data?.error || "Login failed",
      };
    }
  }, []);

  const logout = useCallback(async () => {
    try {
      await authService.logout();
    } catch (error) {
      console.error("Logout error:", error);
    } finally {
      clearAccessToken();
      setUser(null);
    }
  }, []);

  const value = useMemo(() => ({
    user,
    loading,
    login,
    logout,
    isAuthenticated: !!user,
  }), [user, loading, login, logout]);

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};
