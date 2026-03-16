import React, { createContext, useContext, useState, useEffect, ReactNode } from "react";
import { supabase } from "@/lib/supabase";

interface User {
  id: string;
  msnv: string;
  fullName: string;
  department: string;
  position: string;
  role: string;
  status: boolean;
}

interface AuthContextType {
  user: User | null;
  login: (msnv: string, password: string, remember?: boolean) => Promise<boolean>;
  logout: () => void;
  isAdmin: () => boolean;
  canApprove: () => boolean;
  isAuthenticated: boolean;
  refreshUser: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) throw new Error("useAuth must be used inside AuthProvider");
  return context;
};

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  // Restore session
  useEffect(() => {
    const session = localStorage.getItem("sessionUser");

    if (session) {
      setUser(JSON.parse(session));
    }

    setLoading(false);
  }, []);

  // LOGIN
  const login = async (msnv: string, password: string, remember = false) => {
    try {
      const { data, error } = await supabase
        .from("users")
        .select("*")
        .eq("msnv", msnv)
        .eq("password", password)
        .single();
        console.log("DATA:", data);
        console.log("ERROR:", error);

      if (error || !data) {
        console.log("Login failed");
        return false;
      }

      if (!data.status) {
        console.log("User locked");
        return false;
      }

      setUser(data);

      // Save session
      if (remember) {
        localStorage.setItem("sessionUser", JSON.stringify(data));
      } else {
        sessionStorage.setItem("sessionUser", JSON.stringify(data));
      }

      return true;
    } catch (err) {
      console.error("Login error:", err);
      return false;
    }
  };

  // LOGOUT
  const logout = () => {
    setUser(null);
    localStorage.removeItem("sessionUser");
    sessionStorage.removeItem("sessionUser");
  };

  // REFRESH USER DATA
  const refreshUser = async () => {
    if (!user) return;

    const { data } = await supabase
      .from("users")
      .select("*")
      .eq("msnv", user.msnv)
      .single();

    if (data) {
      setUser(data);
      localStorage.setItem("sessionUser", JSON.stringify(data));
    }
  };

  // PERMISSIONS
  const isAdmin = () => user?.role === "Admin";

  const canApprove = () =>
    user?.role === "Admin" || user?.role === "Duyệt";

  const value: AuthContextType = {
    user,
    login,
    logout,
    isAdmin,
    canApprove,
    isAuthenticated: !!user,
    refreshUser
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-screen">
        <div>Đang tải hệ thống...</div>
      </div>
    );
  }

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}