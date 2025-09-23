import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { User, AuthResponse } from '../types';
import apiService from '../services/api';

interface AuthContextType {
  user: User | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  login: (usernameOrEmail: string, password: string) => Promise<{ success: boolean; error?: string }>;
  register: (userData: {
    username: string;
    email: string;
    password: string;
    firstName: string;
    lastName: string;
  }) => Promise<{ success: boolean; error?: string }>;
  logout: () => void;
  refreshUser: () => Promise<void>;
  hasRole: (role: string) => boolean;
  hasAnyRole: (roles: string[]) => boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

interface AuthProviderProps {
  children: ReactNode;
}

export const AuthProvider: React.FC<AuthProviderProps> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  const isAuthenticated = !!user;

  // Khởi tạo user khi component mount
  useEffect(() => {
    initializeAuth();
  }, []);

  const initializeAuth = async () => {
    setIsLoading(true);
    try {
      const token = localStorage.getItem('accessToken');
      if (token) {
        const userData = await apiService.getCurrentUser();
        setUser(userData);
      }
    } catch (error) {
      console.error('Failed to initialize auth:', error);
      apiService.logout();
    } finally {
      setIsLoading(false);
    }
  };

  const login = async (usernameOrEmail: string, password: string) => {
    try {
      setIsLoading(true);
      const authResponse: AuthResponse = await apiService.login({
        usernameOrEmail,
        password,
      });

      // Lưu auth data
      apiService.storeAuthData(authResponse);

      // Load user data
      const userData = await apiService.getCurrentUser();
      setUser(userData);

      return { success: true };
    } catch (error: any) {
      console.error('Login failed:', error);
      return {
        success: false,
        error: error.response?.data?.error || 'Đăng nhập thất bại',
      };
    } finally {
      setIsLoading(false);
    }
  };

  const register = async (userData: {
    username: string;
    email: string;
    password: string;
    firstName: string;
    lastName: string;
  }) => {
    try {
      setIsLoading(true);
      const authResponse: AuthResponse = await apiService.register({
        ...userData,
        role: 'USER',
      });

      // Lưu auth data
      apiService.storeAuthData(authResponse);

      // Load user data
      const newUserData = await apiService.getCurrentUser();
      setUser(newUserData);

      return { success: true };
    } catch (error: any) {
      console.error('Registration failed:', error);
      return {
        success: false,
        error: error.response?.data?.error || 'Đăng ký thất bại',
      };
    } finally {
      setIsLoading(false);
    }
  };

  const logout = () => {
    apiService.logout();
    setUser(null);
  };

  const refreshUser = async () => {
    try {
      const userData = await apiService.getCurrentUser();
      setUser(userData);
    } catch (error) {
      console.error('Failed to refresh user:', error);
      logout();
    }
  };

  const hasRole = (role: string): boolean => {
    return user?.role === role;
  };

  const hasAnyRole = (roles: string[]): boolean => {
    return user ? roles.includes(user.role) : false;
  };

  const value: AuthContextType = {
    user,
    isAuthenticated,
    isLoading,
    login,
    register,
    logout,
    refreshUser,
    hasRole,
    hasAnyRole,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export const useAuth = (): AuthContextType => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

export default AuthContext;