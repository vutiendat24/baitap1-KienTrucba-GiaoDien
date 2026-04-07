'use client';

import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { User } from '@/types';
import { authAPI } from '@/lib/api';

interface AuthContextType {
  user: User | null;
  isLoading: boolean;
  error: string | null;
  login: (usernameOrEmail: string, password: string) => Promise<void>;
  register: (username: string, email: string, password: string, confirmPassword: string, fullName: string) => Promise<void>;
  logout: () => Promise<void>;
  clearError: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Check if user is already logged in on mount
  useEffect(() => {
    const storedUser = localStorage.getItem('user');
    if (storedUser) {
      try {
        const parsedUser = JSON.parse(storedUser);
        setUser(parsedUser);
        if (parsedUser.userId) {
           localStorage.setItem('userId', parsedUser.userId.toString());
        }
        if (parsedUser.token) {
           localStorage.setItem('token', parsedUser.token);
        }
      } catch (err) {
        localStorage.removeItem('user');
      }
    }
  }, []);

  const login = async (usernameOrEmail: string, password: string) => {
    setIsLoading(true);
    setError(null);
    try {
      const response = await authAPI.login({ usernameOrEmail, password });
      setUser(response as User);
      localStorage.setItem('user', JSON.stringify(response));
      if (response.userId) {
         localStorage.setItem('userId', response.userId.toString());
      }
      if (response.token) {
         localStorage.setItem('token', response.token);
      }
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Login failed';
      setError(message);
      throw err;
    } finally {
      setIsLoading(false);
    }
  };

  const register = async (username: string, email: string, password: string, confirmPassword: string, fullName: string) => {
    setIsLoading(true);
    setError(null);
    try {
      const response = await authAPI.register({ username, email, password, confirmPassword, fullName });
      // API_Details says register returns identical json to login (but without token).
      setUser(response as User);
      localStorage.setItem('user', JSON.stringify(response));
      if (response.userId) {
         localStorage.setItem('userId', response.userId.toString());
      }
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Registration failed';
      setError(message);
      throw err;
    } finally {
      setIsLoading(false);
    }
  };

  const logout = async () => {
    setIsLoading(true);
    setError(null);
    try {
      await authAPI.logout();
    } catch (err) {
      // Continue logout even if API call fails
    } finally {
      setUser(null);
      localStorage.removeItem('user');
      localStorage.removeItem('userId');
      localStorage.removeItem('token');
      setIsLoading(false);
    }
  };

  const clearError = () => setError(null);

  return (
    <AuthContext.Provider value={{ user, isLoading, error, login, register, logout, clearError }}>
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
