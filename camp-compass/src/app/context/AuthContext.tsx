import React, { createContext, useContext, useState, ReactNode } from "react";

export type UserRole = "student" | "staff" | "admin" | "registrar";

export interface User {
  id: string;
  email: string;
  name: string;
  role: UserRole;
  department?: string;
  level?: string;
  tuitionPaid?: boolean;
}

interface AuthContextType {
  user: User | null;
  login: (email: string, password: string) => boolean;
  logout: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

// Mock users for demonstration
const mockUsers: Record<string, User & { password: string }> = {
  "student@campus.edu": {
    id: "1",
    email: "student@campus.edu",
    password: "student123",
    name: "Jane Doe",
    role: "student",
    department: "Computer Science",
    level: "Year 3",
    tuitionPaid: true,
  },
  "staff@campus.edu": {
    id: "2",
    email: "staff@campus.edu",
    password: "staff123",
    name: "Dr. John Smith",
    role: "staff",
    department: "Engineering",
  },
  "admin@campus.edu": {
    id: "3",
    email: "admin@campus.edu",
    password: "admin123",
    name: "Admin User",
    role: "admin",
  },
  "registrar@campus.edu": {
    id: "4",
    email: "registrar@campus.edu",
    password: "registrar123",
    name: "Registrar Office",
    role: "registrar",
  },
};

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);

  const login = (email: string, password: string): boolean => {
    const mockUser = mockUsers[email];
    if (mockUser && mockUser.password === password) {
      const { password: _, ...userWithoutPassword } = mockUser;
      setUser(userWithoutPassword);
      return true;
    }
    return false;
  };

  const logout = () => {
    setUser(null);
  };

  return (
    <AuthContext.Provider value={{ user, login, logout }}>
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
