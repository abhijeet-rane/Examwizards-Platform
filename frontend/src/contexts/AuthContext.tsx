import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { apiService } from '../services/apiService';

interface User {
  username: string;
  email?: string;
  role: 'admin' | 'instructor' | 'student';
  fullName?: string;
  avatarUrl?: string;
  gender?: 'Male' | 'Female' | 'Other';
  phoneNumber?: string;
}

interface AuthContextType {
  user: User | null;
  token: string | null;
  login: (email: string, password: string) => Promise<void>;
  register: (userData: RegisterData) => Promise<void>;
  logout: () => void;
  loading: boolean;
}

interface RegisterData {
  fullName: string;
  username: string;
  email: string;
  phoneNumber?: string;
  gender: 'Male' | 'Female' | 'Other';
  password: string;
  role: 'admin' | 'instructor' | 'student';
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

interface AuthProviderProps {
  children: ReactNode;
}

export const AuthProvider: React.FC<AuthProviderProps> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [token, setToken] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const initializeAuth = () => {
      const storedToken = localStorage.getItem('token');
      const storedUser = localStorage.getItem('user');
      
      if (storedToken && storedUser) {
        try {
          // Basic token format validation
          const parts = storedToken.split('.');
          if (parts.length === 3) {
            // Token format looks valid
            setToken(storedToken);
            setUser(JSON.parse(storedUser));
            apiService.setAuthToken(storedToken);
          } else {
            // Invalid token format, clear storage
            console.warn('Invalid token format detected, clearing auth data');
            apiService.clearAuth();
          }
        } catch (error) {
          // Error parsing stored data, clear storage
          console.warn('Error parsing stored auth data, clearing storage');
          apiService.clearAuth();
        }
      }
      setLoading(false);
    };

    initializeAuth();
  }, []);

  const login = async (username: string, password: string) => {
    try {
      const response = await apiService.login({ username, password });
      // Axios returns the full response object, so destructure 'data' from it
      const { token: authToken, ...userData } = response.data ? response.data : response;
      setToken(authToken);
      setUser(userData as User);
      localStorage.setItem('token', authToken);
      localStorage.setItem('user', JSON.stringify(userData));
      apiService.setAuthToken(authToken);
    } catch (error) {
      throw error;
    }
  };

  const register = async (userData: RegisterData) => {
    try {
      const response = await apiService.register(userData);
      // Auto-login after registration
      await login(userData.username, userData.password);
    } catch (error) {
      throw error;
    }
  };

  const logout = () => {
    setUser(null);
    setToken(null);
    apiService.clearAuth();
  };

  const value = {
    user,
    token,
    login,
    register,
    logout,
    loading
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};