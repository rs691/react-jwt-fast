// src/context/AuthContext.tsx
import axios, { AxiosError } from 'axios';
import { createContext, ReactNode, useEffect, useState } from 'react';
import type { ApiErrorResponse, LoginResponse, RegisterResponse, User } from '../types';

interface AuthContextType {
  user: User | null;
  token: string | null;
  login: (username: string, password: string) => Promise<void>;
  register: (username: string, email: string, password: string) => Promise<void>;
  logout: () => void;
  isLoading: boolean;
}

export const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [user, setUser] = useState<User | null>(null);
  const [token, setToken] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    console.log('[AUTH CONTEXT] Initializing...');
    
    // Check for existing token in localStorage
    const storedToken = localStorage.getItem('access_token');
    console.log('[AUTH CONTEXT] Checking localStorage for token:', storedToken ? 'Found' : 'Not found');
    
    if (storedToken) {
      console.log('[AUTH CONTEXT] Token found in localStorage:', storedToken.substring(0, 20) + '...');
      setToken(storedToken);
      fetchUserData(storedToken);
    } else {
      console.log('[AUTH CONTEXT] No token found in localStorage');
      setIsLoading(false);
    }
  }, []);

  const fetchUserData = async (authToken: string) => {
    console.log('[AUTH CONTEXT] Fetching user data with token:', authToken.substring(0, 20) + '...');
    
    try {
      const response = await axios.get<User>('http://localhost:8000/users/me', {
        headers: {
          Authorization: `Bearer ${authToken}`,
        },
      });
      
      console.log('[AUTH CONTEXT] User data received:', response.data);
      setUser(response.data);
    } catch (error) {
      console.error('[AUTH CONTEXT] Failed to fetch user data:', error);
      localStorage.removeItem('access_token');
      setToken(null);
    } finally {
      setIsLoading(false);
    }
  };

  const login = async (username: string, password: string) => {
    console.log('[AUTH CONTEXT] Login attempt for username:', username);
    
    try {
      const formData = new FormData();
      formData.append('username', username);
      formData.append('password', password);

      console.log('[AUTH CONTEXT] Sending login request to backend...');
      const response = await axios.post<LoginResponse>('http://localhost:8000/login', formData);
      
      const { access_token } = response.data;
      console.log('[AUTH CONTEXT] Login successful! Token received:', access_token.substring(0, 20) + '...');
      console.log('[AUTH CONTEXT] Full token:', access_token);
      
      // Store token in localStorage
      localStorage.setItem('access_token', access_token);
      console.log('[AUTH CONTEXT] Token stored in localStorage');
      
      setToken(access_token);
      
      // Fetch user data
      await fetchUserData(access_token);
      console.log('[AUTH CONTEXT] Login flow complete');
    } catch (error) {
      const axiosError = error as AxiosError<ApiErrorResponse>;
      console.error('[AUTH CONTEXT] Login failed:', axiosError.response?.data || axiosError.message);
      throw error;
    }
  };

  const register = async (username: string, email: string, password: string) => {
    console.log('[AUTH CONTEXT] Registration attempt for username:', username, 'email:', email);
    
    try {
      console.log('[AUTH CONTEXT] Sending registration request to backend...');
      const response = await axios.post<RegisterResponse>('http://localhost:8000/register', {
        username,
        email,
        password,
      });
      
      console.log('[AUTH CONTEXT] Registration successful! User data:', response.data);
      console.log('[AUTH CONTEXT] Auto-logging in after registration...');
      
      // Auto-login after registration
      await login(username, password);
    } catch (error) {
      const axiosError = error as AxiosError<ApiErrorResponse>;
      console.error('[AUTH CONTEXT] Registration failed:', axiosError.response?.data || axiosError.message);
      throw error;
    }
  };

  const logout = () => {
    console.log('[AUTH CONTEXT] Logging out user:', user?.username);
    console.log('[AUTH CONTEXT] Removing token from localStorage');
    
    localStorage.removeItem('access_token');
    setUser(null);
    setToken(null);
    
    console.log('[AUTH CONTEXT] Logout complete');
  };

  // Log token changes
  useEffect(() => {
    if (token) {
      console.log('[AUTH CONTEXT] Current token in state:', token.substring(0, 20) + '...');
    } else {
      console.log('[AUTH CONTEXT] No token in state');
    }
  }, [token]);

  return (
    <AuthContext.Provider value={{ user, token, login, register, logout, isLoading }}>
      {children}
    </AuthContext.Provider>
  );
};