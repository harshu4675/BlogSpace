import {
  createContext,
  useContext,
  useState,
  useEffect,
  useCallback,
} from "react";
import api from "../utils/api";
import { getErrorMessage } from "../utils/helpers";
import toast from "react-hot-toast";

const AuthContext = createContext(null);

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) throw new Error("useAuth must be used within AuthProvider");
  return context;
};

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [isAuthenticated, setIsAuthenticated] = useState(false);

  const checkAuth = useCallback(async () => {
    try {
      const token = localStorage.getItem("accessToken");
      if (!token) {
        setLoading(false);
        return;
      }

      const { data } = await api.get("/auth/me");
      setUser(data.data.user);
      setIsAuthenticated(true);
    } catch (error) {
      localStorage.removeItem("accessToken");
      localStorage.removeItem("user");
      setUser(null);
      setIsAuthenticated(false);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    checkAuth();
  }, [checkAuth]);

  const register = async (userData) => {
    try {
      const { data } = await api.post("/auth/register", userData);
      localStorage.setItem("accessToken", data.data.accessToken);
      setUser(data.data.user);
      setIsAuthenticated(true);
      toast.success(data.message);
      return { success: true };
    } catch (error) {
      const message = getErrorMessage(error);
      toast.error(message);
      return { success: false, message };
    }
  };

  const login = async (credentials) => {
    try {
      const { data } = await api.post("/auth/login", credentials);
      localStorage.setItem("accessToken", data.data.accessToken);
      setUser(data.data.user);
      setIsAuthenticated(true);
      toast.success(data.message);
      return { success: true };
    } catch (error) {
      const message = getErrorMessage(error);
      toast.error(message);
      return { success: false, message };
    }
  };

  const logout = async () => {
    try {
      await api.post("/auth/logout");
    } catch (error) {
      // silent
    } finally {
      localStorage.removeItem("accessToken");
      localStorage.removeItem("user");
      setUser(null);
      setIsAuthenticated(false);
      toast.success("Logged out successfully!");
    }
  };

  const updateProfile = async (updateData) => {
    try {
      const { data } = await api.put("/auth/update-profile", updateData);
      setUser(data.data.user);
      toast.success("Profile updated!");
      return { success: true };
    } catch (error) {
      toast.error(getErrorMessage(error));
      return { success: false };
    }
  };

  const updateAvatar = async (file) => {
    try {
      const formData = new FormData();
      formData.append("avatar", file);
      const { data } = await api.put("/auth/avatar", formData, {
        headers: { "Content-Type": "multipart/form-data" },
      });
      setUser(data.data.user);
      toast.success("Avatar updated!");
      return { success: true };
    } catch (error) {
      toast.error(getErrorMessage(error));
      return { success: false };
    }
  };

  const changePassword = async (passwords) => {
    try {
      const { data } = await api.put("/auth/change-password", passwords);
      toast.success(data.message);
      return { success: true };
    } catch (error) {
      toast.error(getErrorMessage(error));
      return { success: false };
    }
  };

  const isAdmin = user?.role === "admin" || user?.role === "superadmin";
  const isAuthor = ["author", "editor", "admin", "superadmin"].includes(
    user?.role,
  );

  const value = {
    user,
    loading,
    isAuthenticated,
    isAdmin,
    isAuthor,
    register,
    login,
    logout,
    updateProfile,
    updateAvatar,
    changePassword,
    checkAuth,
    setUser,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};
