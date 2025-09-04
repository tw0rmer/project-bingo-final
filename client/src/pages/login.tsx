import React, { useState, useEffect } from 'react';
import { SiteLayout } from '@/components/SiteLayout';
import { useLocation } from 'wouter';
import { useAuth } from '../contexts/AuthContext';
import { apiRequest } from '../lib/api';
import { LogIn, User, Crown, Sparkles, Star, Lock, Mail } from 'lucide-react';

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

  // Check if user is already logged in and redirect
  const isAlreadyLoggedIn = !!user;

  // Auto-redirect to dashboard if already logged in
  useEffect(() => {
    if (user) {
      console.log('[LOGIN] User already authenticated, redirecting to dashboard...');
      setLocation('/dashboard');
    }
  }, [user, setLocation]);

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
      
      console.log('[LOGIN] Attempting login for:', identifier);
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
      <div className="min-h-screen bg-gradient-to-br from-indigo-50 via-purple-50 to-pink-50 py-12 px-4 relative overflow-hidden">
        {/* Background decorations */}
        <div className="absolute inset-0">
          <div className="absolute top-20 left-10 w-20 h-20 bg-gradient-to-br from-indigo-300 to-purple-400 rounded-full opacity-20 animate-bounce-soft"></div>
          <div className="absolute top-40 right-20 w-16 h-16 bg-gradient-to-br from-purple-300 to-pink-400 rounded-full opacity-20 animate-pulse"></div>
          <div className="absolute bottom-32 left-1/4 w-24 h-24 bg-gradient-to-br from-pink-300 to-red-400 rounded-full opacity-15 animate-bounce-soft" style={{ animationDelay: '1s' }}></div>
          <div className="absolute bottom-20 right-10 w-12 h-12 bg-gradient-to-br from-blue-300 to-indigo-400 rounded-full opacity-20 animate-pulse" style={{ animationDelay: '2s' }}></div>
        </div>

        <div className="max-w-md mx-auto relative z-10">
          <div className="bg-white/95 backdrop-blur-sm rounded-3xl shadow-2xl p-10 border-2 border-gradient-to-r from-indigo-200 to-purple-200 relative overflow-hidden">
            {/* Subtle gradient overlay */}
            <div className="absolute inset-0 bg-gradient-to-br from-indigo-50/30 via-purple-50/20 to-pink-50/30 rounded-3xl"></div>
            
            {/* Floating sparkles */}
            <div className="absolute top-6 right-6">
              <Sparkles className="text-purple-400 animate-pulse" size={20} />
            </div>
            <div className="absolute top-12 left-8">
              <Star className="text-indigo-400 animate-bounce-soft" size={16} />
            </div>
            <div className="absolute bottom-6 left-6">
              <Sparkles className="text-pink-400 animate-pulse" size={18} style={{ animationDelay: '0.5s' }} />
            </div>

            <div className="relative z-10">
              {/* Header */}
              <div className="text-center mb-8">
                <div className="inline-flex items-center justify-center w-20 h-20 bg-gradient-to-br from-indigo-500 to-purple-600 rounded-full mb-6 shadow-lg">
                  <LogIn className="text-white" size={40} />
                </div>
                
                <h1 className="text-4xl md:text-5xl font-black text-transparent bg-clip-text bg-gradient-to-r from-indigo-600 via-purple-600 to-pink-600 mb-4">
                  Welcome Back!
                </h1>
                <p className="text-xl text-gray-700 mb-6">Sign in to your WildCard account and start winning!</p>
                
                {/* Trust indicators */}
                <div className="flex justify-center items-center space-x-4 text-sm font-semibold">
                  <div className="flex items-center text-green-600">
                    <div className="w-2 h-2 bg-green-500 rounded-full mr-2 animate-pulse"></div>
                    <span>Secure Login</span>
                  </div>
                  <div className="w-1 h-1 bg-gray-400 rounded-full"></div>
                  <div className="flex items-center text-purple-600">
                    <Star className="mr-2" size={16} />
                    <span>Protected Account</span>
                  </div>
                </div>
              </div>

              {/* Current Auth Status */}
              {isAlreadyLoggedIn && (
                <div className="bg-gradient-to-r from-blue-50 to-indigo-50 border-2 border-blue-200 text-blue-700 px-6 py-4 rounded-2xl mb-8 shadow-lg">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="font-bold">Already logged in as:</p>
                      <p className="text-sm flex items-center">
                        {user?.isAdmin ? <Crown className="mr-1" size={16} /> : <User className="mr-1" size={16} />}
                        {user?.email} {user?.isAdmin && '(Admin)'}
                      </p>
                    </div>
                    <button
                      onClick={() => setLocation('/dashboard')}
                      className="bg-gradient-to-r from-indigo-500 to-purple-600 hover:from-indigo-600 hover:to-purple-700 px-4 py-2 rounded-xl text-sm text-white font-semibold shadow-lg transform hover:scale-105 transition-all"
                    >
                      Go to Dashboard
                    </button>
                  </div>
                </div>
              )}

        {/* Developer Helper removed per request */}

              {/* Error Message */}
              {error && (
                <div className="bg-gradient-to-r from-red-50 to-pink-50 border-2 border-red-200 text-red-700 px-6 py-4 rounded-2xl mb-8 shadow-lg">
                  <div className="flex items-center">
                    <div className="w-4 h-4 bg-red-500 rounded-full mr-3 animate-pulse"></div>
                    <span className="font-semibold">{error}</span>
                  </div>
                </div>
              )}

              {/* Quick Login Section */}
              <div className="space-y-4 mb-8">
                <div className="text-center">
                  <p className="text-lg font-semibold text-gray-700 mb-4">Quick Login for Testing:</p>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <button
                    onClick={() => quickLogin('admin')}
                    disabled={loading}
                    className="group relative overflow-hidden flex flex-col items-center space-y-2 p-6 rounded-2xl bg-gradient-to-br from-red-500 to-pink-600 hover:from-red-600 hover:to-pink-700 disabled:bg-gray-400 disabled:cursor-not-allowed text-white font-semibold transition-all duration-300 transform hover:scale-105 shadow-xl"
                  >
                    <div className="absolute inset-0 bg-white/10 opacity-0 group-hover:opacity-100 transition-opacity"></div>
                    <Crown className="mb-2 relative z-10" size={24} />
                    <span className="relative z-10">Login as Admin</span>
                    <span className="text-xs opacity-75 relative z-10">admin@bingo.com</span>
                  </button>
                  <button
                    onClick={() => quickLogin('user')}
                    disabled={loading}
                    className="group relative overflow-hidden flex flex-col items-center space-y-2 p-6 rounded-2xl bg-gradient-to-br from-blue-500 to-indigo-600 hover:from-blue-600 hover:to-indigo-700 disabled:bg-gray-400 disabled:cursor-not-allowed text-white font-semibold transition-all duration-300 transform hover:scale-105 shadow-xl"
                  >
                    <div className="absolute inset-0 bg-white/10 opacity-0 group-hover:opacity-100 transition-opacity"></div>
                    <User className="mb-2 relative z-10" size={24} />
                    <span className="relative z-10">Login as User</span>
                    <span className="text-xs opacity-75 relative z-10">user@test.com</span>
                  </button>
                </div>
              </div>

              {/* Divider */}
              <div className="relative mb-8">
                <div className="absolute inset-0 flex items-center">
                  <div className="w-full border-t-2 border-gradient-to-r from-transparent via-gray-300 to-transparent"></div>
                </div>
                <div className="relative flex justify-center text-sm">
                  <span className="px-4 bg-white/95 text-gray-600 font-semibold rounded-full">Or sign in manually</span>
                </div>
              </div>

              {/* Login Form */}
              <form onSubmit={handleSubmit} className="space-y-6">
                <div className="space-y-6">
                  <div>
                    <label htmlFor="identifier" className="block text-sm font-bold text-gray-700 mb-2">
                      Email or Username
                    </label>
                    <div className="relative">
                      <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                        <Mail className="h-5 w-5 text-gray-400" />
                      </div>
                      <input
                        type="text"
                        id="identifier"
                        value={identifier}
                        onChange={(e) => setIdentifier(e.target.value)}
                        className="w-full pl-10 pr-4 py-4 bg-white border-2 border-gray-200 rounded-xl text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-purple-500 transition-all font-medium"
                        placeholder="Enter your email or username"
                        required
                      />
                    </div>
                  </div>

                  <div>
                    <label htmlFor="password" className="block text-sm font-bold text-gray-700 mb-2">
                      Password
                    </label>
                    <div className="relative">
                      <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                        <Lock className="h-5 w-5 text-gray-400" />
                      </div>
                      <input
                        type="password"
                        id="password"
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        className="w-full pl-10 pr-4 py-4 bg-white border-2 border-gray-200 rounded-xl text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-purple-500 transition-all font-medium"
                        placeholder="Enter your password"
                        required
                      />
                    </div>
                  </div>
                </div>

                <button
                  type="submit"
                  disabled={loading}
                  className="w-full bg-gradient-to-r from-indigo-500 via-purple-600 to-pink-600 hover:from-indigo-600 hover:via-purple-700 hover:to-pink-700 disabled:bg-gray-300 disabled:cursor-not-allowed text-white font-bold py-4 px-6 rounded-xl transition-all duration-300 transform hover:scale-105 shadow-xl"
                >
                  <div className="flex items-center justify-center">
                    <LogIn className="mr-2" size={20} />
                    {loading ? 'Signing In...' : 'Sign In to WildCard'}
                  </div>
                </button>
              </form>

              {/* Footer */}
              <div className="mt-8 text-center">
                <p className="text-lg text-gray-600">
                  Don't have an account?{' '}
                  <button
                    onClick={() => setLocation('/register')}
                    className="text-transparent bg-clip-text bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700 font-bold transition-all duration-300 transform hover:scale-105"
                  >
                    Sign up here!
                  </button>
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </SiteLayout>
  );
}