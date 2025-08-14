import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { useLocation } from 'wouter';
import { apiRequest } from '../lib/api';

interface User {
  id: number;
  email: string;
  isAdmin: boolean;
  balance: number;
  username?: string;
}

interface AuthContextType {
  user: User | null;
  loading: boolean;
  error: string | null;
  login: (token: string) => void;
  logout: () => void;
  isAuthenticated: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

interface AuthProviderProps {
  children: ReactNode;
}

export function AuthProvider({ children }: AuthProviderProps) {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [, setLocation] = useLocation();

  // Check if user is logged in on initial load
  useEffect(() => {
    const checkAuth = async () => {
      const token = localStorage.getItem('token');
      const storedSessionId = localStorage.getItem('serverSessionId');
      
      console.log('[AUTH] Checking authentication on startup...');
      console.log('[AUTH] Stored token exists:', !!token);
      console.log('[AUTH] Stored server session ID:', storedSessionId);
      console.log('[AUTH] Full localStorage contents:', Object.keys(localStorage).map(key => `${key}: ${localStorage.getItem(key)}`));
      
      // First, check if server has restarted by comparing session IDs
      try {
        const sessionResponse = await apiRequest<{ sessionId: string }>('/auth/session');
        const currentSessionId = sessionResponse.sessionId;
        console.log('[AUTH] Current server session ID:', currentSessionId);
        
        if (storedSessionId && storedSessionId !== currentSessionId) {
          console.log('[AUTH] Server restarted detected!');
          console.log('[AUTH] Stored session:', storedSessionId);
          console.log('[AUTH] Current session:', currentSessionId);
          console.log('[AUTH] Clearing all stored authentication data...');
          localStorage.clear(); // Clear everything to be sure
          setUser(null);
          setLoading(false);
          return;
        }
        
        // Store the current session ID for future comparisons
        localStorage.setItem('serverSessionId', currentSessionId);
      } catch (err) {
        console.error('[AUTH] Error checking server session:', err);
        // If we can't check session, proceed with normal token validation
      }
      
      if (!token) {
        console.log('[AUTH] No token found, user not authenticated');
        setLoading(false);
        return;
      }
      
      try {
        // Fetch user data from the server using token
        interface UserData {
          id: number;
          email: string;
          balance: string;
          isAdmin: boolean;
          createdAt: string;
        }
        
        console.log('[AUTH] Validating stored token...');
        const userData = await apiRequest<UserData>('/auth/me', {
          headers: {
            'Authorization': `Bearer ${token}`
          }
        });
        
        console.log('[AUTH] Token valid, auto-login successful:', { 
          id: userData.id, 
          email: userData.email, 
          isAdmin: userData.isAdmin 
        });
        
        setUser({
          id: userData.id,
          email: userData.email,
          isAdmin: userData.isAdmin || false,
          balance: parseFloat(userData.balance) || 0,
          username: userData.username || undefined
        });
        setError(null);
      } catch (err: any) {
        console.error('[AUTH] Stored token validation failed:', err.message);
        console.log('[AUTH] Clearing invalid token and requiring fresh login');
        // Token is invalid, remove it
        localStorage.removeItem('token');
        setUser(null);
        setError('Session expired. Please log in again.');
      } finally {
        setLoading(false);
      }
    };

    checkAuth();
  }, []);

  const login = async (token: string) => {
    try {
      console.log('[AUTH] Manual login attempt...');
      localStorage.setItem('token', token);
      
      // Fetch user data
      interface UserData {
        id: number;
        email: string;
        balance: string;
        isAdmin: boolean;
        createdAt: string;
      }
      
      const userData = await apiRequest<UserData>('/auth/me', {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      
      console.log('[AUTH] Manual login successful:', { 
        id: userData.id, 
        email: userData.email, 
        isAdmin: userData.isAdmin 
      });
      
      // Store the current server session ID along with the token
      try {
        const sessionResponse = await apiRequest<{ sessionId: string }>('/auth/session');
        localStorage.setItem('serverSessionId', sessionResponse.sessionId);
        console.log('[AUTH] Stored server session ID:', sessionResponse.sessionId);
      } catch (err) {
        console.error('[AUTH] Failed to get server session ID:', err);
      }
      
      setUser({
        id: userData.id,
        email: userData.email,
        isAdmin: userData.isAdmin || false,
        balance: parseFloat(userData.balance) || 0,
        username: userData.username || undefined
      });
      setError(null);
    } catch (err: any) {
      console.error('[AUTH] Manual login failed:', err.message);
      localStorage.removeItem('token');
      setUser(null);
      setError(err.message || 'Login failed');
      throw err;
    }
  };

  const logout = () => {
    console.log('[AUTH] Logging out user...');
    localStorage.removeItem('token');
    localStorage.removeItem('serverSessionId');
    setUser(null);
    setError(null);
  };

  const value: AuthContextType = {
    user,
    loading,
    error,
    login,
    logout,
    isAuthenticated: !!user,
  };

  return (
    <AuthContext.Provider value={value}>
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

// Development helper function to clear stored authentication
export const clearStoredAuth = () => {
  console.log('[AUTH] Clearing all stored authentication data');
  localStorage.removeItem('token');
  window.location.reload();
};