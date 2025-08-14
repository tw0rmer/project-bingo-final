import React, { useState } from 'react';
import { SiteLayout } from '@/components/SiteLayout';
import { useLocation } from 'wouter';
import { useAuth } from '../contexts/AuthContext';
import { apiRequest } from '../lib/api';

export default function LoginPage() {
  const [identifier, setIdentifier] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [, setLocation] = useLocation();
  const { login, user } = useAuth();

  // Development helper function
  const clearStoredAuth = () => {
    console.log('[DEV] Clearing all stored authentication data...');
    localStorage.clear(); // Clear everything including session ID
    window.location.reload();
  };

  // Check if user is already logged in
  const isAlreadyLoggedIn = !!user;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      // Use the apiRequest utility to handle the API call
      interface LoginResponse {
        message: string;
        token: string;
        user: {
          id: number;
          email: string;
          username?: string;
          balance: string;
        };
      }
      
      console.log('[LOGIN] Attempting login for:', email);
      const data = await apiRequest<LoginResponse>('/auth/login', {
        method: 'POST',
        body: JSON.stringify({ identifier, password }),
      });

      console.log('[LOGIN] Login response received:', { token: !!data.token, userEmail: data.user?.email });

      // Use the login function from AuthContext
      await login(data.token);
      
      // Navigate to dashboard
      setLocation('/dashboard');
    } catch (err: any) {
      console.error('[LOGIN] Login error:', err);
      setError(err.message || 'An error occurred during login');
    } finally {
      setLoading(false);
    }
  };

  const quickLogin = async (userType: 'admin' | 'user') => {
    setLoading(true);
    setError('');

    const credentials = userType === 'admin' 
      ? { email: 'admin@bingo.com', password: 'admin123' }
      : { email: 'user@test.com', password: 'user123' };

    try {
      interface LoginResponse {
        message: string;
        token: string;
        user: {
          id: number;
          email: string;
          balance: string;
        };
      }
      
      console.log('[LOGIN] Quick login as:', userType, credentials.email);
      const data = await apiRequest<LoginResponse>('/auth/login', {
        method: 'POST',
        body: JSON.stringify(credentials),
      });

      console.log('[LOGIN] Quick login response received:', { token: !!data.token, userEmail: data.user?.email });

      // Use the login function from AuthContext
      await login(data.token);
      
      // Navigate to dashboard
      setLocation('/dashboard');
    } catch (err: any) {
      console.error('[LOGIN] Quick login error:', err);
      setError(err.message || 'An error occurred during quick login');
    } finally {
      setLoading(false);
    }
  };

  return (
    <SiteLayout hideSubNav={true}>
      <div className="w-full max-w-md bg-white rounded-lg shadow-lg p-8 mx-auto my-10">
        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold mb-2 text-casino-red">Welcome Back</h1>
          <p className="text-gray-600">Sign in to your WildCard account</p>
        </div>

        {/* Current Auth Status */}
        {isAlreadyLoggedIn && (
          <div className="bg-blue-50 border border-blue-200 text-blue-700 px-4 py-3 rounded mb-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="font-medium">Already logged in as:</p>
                <p className="text-sm">{user?.email} {user?.isAdmin && '(Admin)'}</p>
              </div>
              <button
                onClick={() => setLocation('/dashboard')}
                className="bg-casino-gold hover:bg-yellow-500 px-3 py-1 rounded text-sm text-white"
              >
                Go to Dashboard
              </button>
            </div>
          </div>
        )}

        {/* Developer Helper removed per request */}

        {/* Error Message */}
        {error && (
          <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded mb-6">{error}</div>
        )}

        {/* Quick Login Section */}
        <div className="space-y-3 mb-6">
          <div className="text-center">
            <p className="text-sm text-gray-600 mb-3">Quick Login for Testing:</p>
          </div>
          <div className="grid grid-cols-2 gap-3">
            <button
              onClick={() => quickLogin('admin')}
              disabled={loading}
              className="flex flex-col items-center space-y-1 p-3 rounded-lg bg-casino-red hover:opacity-90 disabled:bg-gray-400 disabled:cursor-not-allowed text-white text-sm font-medium transition-colors"
            >
              <span className="text-xs mb-1">👑</span>
              <span>Login as Admin</span>
              <span className="text-xs opacity-75">admin@bingo.com</span>
            </button>
            <button
              onClick={() => quickLogin('user')}
              disabled={loading}
              className="flex flex-col items-center space-y-1 p-3 rounded-lg bg-blue-600 hover:bg-blue-700 disabled:bg-gray-400 disabled:cursor-not-allowed text-white text-sm font-medium transition-colors"
            >
              <span className="text-xs mb-1">👤</span>
              <span>Login as User</span>
              <span className="text-xs opacity-75">user@test.com</span>
            </button>
          </div>
        </div>

        {/* Divider */}
        <div className="relative mb-6">
          <div className="absolute inset-0 flex items-center">
            <div className="w-full border-t border-gray-200"></div>
          </div>
          <div className="relative flex justify-center text-sm">
            <span className="px-2 bg-white text-gray-500">Or sign in manually</span>
          </div>
        </div>

        {/* Login Form */}
        <form onSubmit={handleSubmit} className="space-y-6">
          <div>
            <label htmlFor="email" className="block text-sm font-medium text-gray-300 mb-1">
              Email or Username
            </label>
            <input
              type="text"
              id="identifier"
              value={identifier}
              onChange={(e) => setIdentifier(e.target.value)}
              className="w-full px-3 py-2 bg-white border border-gray-300 rounded-md text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-casino-gold focus:border-transparent"
              placeholder="Enter your email or username"
              required
            />
          </div>

          <div>
            <label htmlFor="password" className="block text-sm font-medium text-gray-300 mb-1">
              Password
            </label>
            <input
              type="password"
              id="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full px-3 py-2 bg-white border border-gray-300 rounded-md text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-casino-gold focus:border-transparent"
              placeholder="Enter your password"
              required
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-casino-gold hover:bg-yellow-500 disabled:bg-gray-300 disabled:cursor-not-allowed text-white font-medium py-2 px-4 rounded-md transition-colors"
          >
            {loading ? 'Signing In...' : 'Sign In'}
          </button>
        </form>

        {/* Footer */}
        <div className="mt-6 text-center">
          <p className="text-sm text-gray-400">
            Don't have an account?{' '}
            <button
              onClick={() => setLocation('/register')}
              className="text-casino-red hover:opacity-80 font-medium"
            >
              Sign up
            </button>
          </p>
        </div>
      </div>
    </SiteLayout>
  );
}