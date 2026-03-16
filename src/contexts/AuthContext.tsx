import React, { createContext, useContext, useState, useEffect, ReactNode } from "react";
import { supabase } from "@/lib/supabase";

interface User {
  id: number;
  msnv: string;
  password: string;
  name: string;
  role: string;
}

interface AuthContextType {
  user: User | null;
  login: (msnv: string, password: string, remember?: boolean) => Promise<boolean>;
  logout: () => void;
  isAdmin: () => boolean;
  isAuthenticated: boolean;
  refreshUser: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth must be used inside AuthProvider");
  }
  return context;
};

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  // Restore session
  useEffect(() => {
    const local = localStorage.getItem("sessionUser");
    const session = sessionStorage.getItem("sessionUser");

    if (local) {
      setUser(JSON.parse(local));
    } else if (session) {
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

      console.log("LOGIN DATA:", data);
      console.log("LOGIN ERROR:", error);

      if (error || !data) {
        console.log("Login failed");
        return false;
      }

      setUser(data);

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

  // REFRESH USER
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

  // PERMISSION
  const isAdmin = () => user?.role === "admin";

  const value: AuthContextType = {
    user,
    login,
    logout,
    isAdmin,
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