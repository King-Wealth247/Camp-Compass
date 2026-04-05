import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';

export type UserRole = 'student' | 'staff' | 'admin' | 'registrar';

export interface User {
  id: string;
  email: string;
  name: string;
  role: UserRole;
  department?: string;
  level?: string;
  tuitionPaid?: boolean;
  isFirstLogin?: boolean;
}

interface AuthContextType {
  user: User | null;
  loading: boolean;
  login: (email: string, password: string) => User | null;
  logout: () => void;
  changePassword: (newPassword: string) => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

type MockUser = User & { password: string };

const initialMockUsers: Record<string, MockUser> = {
  'student@campus.edu': {
    id: '1',
    email: 'student@campus.edu',
    password: 'student123',
    name: 'Jane Doe',
    role: 'student',
    department: 'Computer Science',
    level: 'Year 3',
    tuitionPaid: true,
    isFirstLogin: true,
  },
  'staff@campus.edu': {
    id: '2',
    email: 'staff@campus.edu',
    password: 'staff123',
    name: 'Dr. John Smith',
    role: 'staff',
    department: 'Engineering',
    isFirstLogin: true,
  },
  'admin@campus.edu': {
    id: '3',
    email: 'admin@campus.edu',
    password: 'admin123',
    name: 'Admin User',
    role: 'admin',
    isFirstLogin: true,
  },
  'registrar@campus.edu': {
    id: '4',
    email: 'registrar@campus.edu',
    password: 'registrar123',
    name: 'Registrar Office',
    role: 'registrar',
    isFirstLogin: true,
  },
};

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [mockUsers, setMockUsers] = useState<Record<string, MockUser>>(initialMockUsers);

  useEffect(() => {
    AsyncStorage.getItem('cc_user').then((stored) => {
      if (stored) setUser(JSON.parse(stored));
      setLoading(false);
    });
  }, []);

  const login = (email: string, password: string): User | null => {
    const mockUser = mockUsers[email];
    if (mockUser && mockUser.password === password) {
      const { password: _, ...userWithoutPassword } = mockUser;
      setUser(userWithoutPassword);
      AsyncStorage.setItem('cc_user', JSON.stringify(userWithoutPassword));
      return userWithoutPassword;
    }
    return null;
  };

  const logout = () => {
    setUser(null);
    AsyncStorage.removeItem('cc_user');
  };

  const changePassword = (newPassword: string) => {
    if (!user) return;
    setMockUsers((prev) => ({
      ...prev,
      [user.email]: { ...prev[user.email], password: newPassword, isFirstLogin: false },
    }));
    const updated = { ...user, isFirstLogin: false };
    setUser(updated);
    AsyncStorage.setItem('cc_user', JSON.stringify(updated));
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
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}
