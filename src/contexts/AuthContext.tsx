import React, { createContext, useContext, useEffect, useState } from 'react';
import { useSQLiteAuth } from '@/hooks/use-sqlite';
import { User } from '@/lib/sqlite-api';

interface UserProfile {
  id: number;
  email: string;
  role: 'therapist' | 'parent' | 'child';
  name: string;
  createdAt: string;
}

interface AuthContextType {
  user: User | null;
  userProfile: UserProfile | null;
  loading: boolean;
  error: string | null;
  signIn: (email: string, password: string) => Promise<void>;
  signUp: (email: string, password: string, name: string, role: 'therapist' | 'parent' | 'child') => Promise<void>;
  logout: () => Promise<void>;
  quickLogin: (role: 'therapist' | 'parent' | 'child') => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { user, loading, error, login, register, quickLogin, logout } = useSQLiteAuth();
  const [userProfile, setUserProfile] = useState<UserProfile | null>(null);

  // Update userProfile when user changes
  useEffect(() => {
    if (user) {
      setUserProfile({
        id: user.id,
        email: user.email,
        role: user.role,
        name: user.name,
        createdAt: user.created_at
      });
    } else {
      setUserProfile(null);
    }
  }, [user]);

  const signIn = async (email: string, password: string) => {
    try {
      await login(email, password);
    } catch (error) {
      throw error;
    }
  };

  const signUp = async (email: string, password: string, name: string, role: 'therapist' | 'parent' | 'child') => {
    try {
      await register(name, email, password, role);
    } catch (error) {
      throw error;
    }
  };

  const handleQuickLogin = async (role: 'therapist' | 'parent' | 'child') => {
    try {
      await quickLogin(role);
    } catch (error) {
      throw error;
    }
  };

  const handleLogout = async () => {
    logout();
  };

  const value: AuthContextType = {
    user,
    userProfile,
    loading,
    error,
    signIn,
    signUp,
    logout: handleLogout,
    quickLogin: handleQuickLogin
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};
