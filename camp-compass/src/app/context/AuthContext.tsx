"use client";

import React, { createContext, useContext, useState, useEffect, ReactNode } from "react";
import { authService } from "@/lib/authService";

export type UserRole = "student" | "staff" | "admin" | "registrar";

export interface User {
  id: string;
  email: string;
  name: string;
  role: UserRole;
  departmentId?: string;
  department?: string;
  levelId?: string;
  level?: string;
  tuitionPaid?: boolean;
  isFirstLogin?: boolean;
}

interface AuthContextType {
  user: User | null;
  loading: boolean;
  login: (email: string, password: string) => Promise<User | null>;
  logout: () => void;
  changePassword: (newPassword: string) => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const initAuth = async () => {
      const stored = sessionStorage.getItem("cc_user");
      if (stored) {
        const parsedUser = JSON.parse(stored);
        setUser(parsedUser);

        // Try to validate token with backend
        try {
          const response = await authService.getMe();
          if (!response.data) {
            // Token invalid, clear user
            logout();
          }
        } catch (error) {
          // Token invalid, clear user
          logout();
        }
      }
      setLoading(false);
    };

    initAuth();
  }, []);

  const login = async (email: string, password: string): Promise<User | null> => {
    try {
      const response = await authService.login({ email, password });

      if (response.data && response.data.user) {
        const userData = response.data.user;
        setUser(userData);
        sessionStorage.setItem("cc_user", JSON.stringify(userData));
        return userData;
      }
      return null;
    } catch (error) {
      console.error("Login error:", error);
      return null;
    }
  };

  const logout = () => {
    setUser(null);
    sessionStorage.removeItem("cc_user");
    authService.logout();
  };

  const changePassword = (newPassword: string) => {
    if (!user) return;
    // Note: This would need a backend endpoint for password change
    // For now, just update local state
    const updated = { ...user, isFirstLogin: false };
    setUser(updated);
    sessionStorage.setItem("cc_user", JSON.stringify(updated));
  };

  return (
    <AuthContext.Provider value={{ user, loading, login, logout, changePassword }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
}
