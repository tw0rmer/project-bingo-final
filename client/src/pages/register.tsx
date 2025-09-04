import React, { useState, useEffect } from 'react';
import { SiteLayout } from '@/components/SiteLayout';
import { useLocation } from 'wouter';
import { useAuth } from '@/contexts/AuthContext';
import { apiRequest } from '@/lib/api';
import { UserPlus, User, Mail, Lock, CheckCircle, Sparkles, Star, Shield } from 'lucide-react';

export default function RegisterPage() {
  const [email, setEmail] = useState('');
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [, setLocation] = useLocation();
  const { login, user } = useAuth();

  // Auto-redirect to dashboard if already logged in
  useEffect(() => {
    if (user) {
      console.log('[REGISTER] User already authenticated, redirecting to dashboard...');
      setLocation('/dashboard');
    }
  }, [user, setLocation]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // Validate passwords match
    if (password !== confirmPassword) {
      setError('Passwords do not match');
      return;
    }
    
    setLoading(true);
    setError('');

    try {
      // Use the apiRequest utility to handle the API call
      interface RegisterResponse {
        message: string;
        token: string;
        user: {
          id: number;
          email: string;
          username?: string;
          balance: string;
        };
      }
      
      const data = await apiRequest<RegisterResponse>('/auth/register', {
        method: 'POST',
        body: JSON.stringify({ email, password, username }),
      });

      // Use the login function from AuthContext
      login(data.token);
      
      // Navigate to dashboard
      setLocation('/dashboard');
    } catch (err: any) {
      setError(err.message || 'An error occurred during registration');
    } finally {
      setLoading(false);
    }
  };

  return (
    <SiteLayout hideSubNav={true}>
      <div className="min-h-screen bg-gradient-to-br from-emerald-50 via-teal-50 to-cyan-50 py-12 px-4 relative overflow-hidden">
        {/* Background decorations */}
        <div className="absolute inset-0">
          <div className="absolute top-20 left-10 w-20 h-20 bg-gradient-to-br from-emerald-300 to-teal-400 rounded-full opacity-20 animate-bounce-soft"></div>
          <div className="absolute top-40 right-20 w-16 h-16 bg-gradient-to-br from-teal-300 to-cyan-400 rounded-full opacity-20 animate-pulse"></div>
          <div className="absolute bottom-32 left-1/4 w-24 h-24 bg-gradient-to-br from-cyan-300 to-blue-400 rounded-full opacity-15 animate-bounce-soft" style={{ animationDelay: '1s' }}></div>
          <div className="absolute bottom-20 right-10 w-12 h-12 bg-gradient-to-br from-green-300 to-emerald-400 rounded-full opacity-20 animate-pulse" style={{ animationDelay: '2s' }}></div>
        </div>

        <div className="max-w-md mx-auto relative z-10">
          <div className="bg-white/95 backdrop-blur-sm rounded-3xl shadow-2xl p-10 border-2 border-gradient-to-r from-emerald-200 to-teal-200 relative overflow-hidden">
            {/* Subtle gradient overlay */}
            <div className="absolute inset-0 bg-gradient-to-br from-emerald-50/30 via-teal-50/20 to-cyan-50/30 rounded-3xl"></div>
            
            {/* Floating sparkles */}
            <div className="absolute top-6 right-6">
              <Sparkles className="text-teal-400 animate-pulse" size={20} />
            </div>
            <div className="absolute top-12 left-8">
              <Star className="text-emerald-400 animate-bounce-soft" size={16} />
            </div>
            <div className="absolute bottom-6 left-6">
              <Sparkles className="text-cyan-400 animate-pulse" size={18} style={{ animationDelay: '0.5s' }} />
            </div>

            <div className="relative z-10">
              {/* Header */}
              <div className="text-center mb-8">
                <div className="inline-flex items-center justify-center w-20 h-20 bg-gradient-to-br from-emerald-500 to-teal-600 rounded-full mb-6 shadow-lg">
                  <UserPlus className="text-white" size={40} />
                </div>
                
                <h2 className="text-4xl md:text-5xl font-black text-transparent bg-clip-text bg-gradient-to-r from-emerald-600 via-teal-600 to-cyan-600 mb-4">
                  Join WildCard!
                </h2>
                <p className="text-xl text-gray-700 mb-6">Create your account and start your winning journey!</p>
                
                {/* Trust indicators */}
                <div className="flex justify-center items-center space-x-4 text-sm font-semibold">
                  <div className="flex items-center text-green-600">
                    <Shield className="mr-2" size={16} />
                    <span>100% Secure</span>
                  </div>
                  <div className="w-1 h-1 bg-gray-400 rounded-full"></div>
                  <div className="flex items-center text-teal-600">
                    <CheckCircle className="mr-2" size={16} />
                    <span>Instant Signup</span>
                  </div>
                </div>
        </div>
        
        {error && (
                <div className="bg-gradient-to-r from-red-50 to-pink-50 border-2 border-red-200 text-red-700 px-6 py-4 rounded-2xl mb-8 shadow-lg">
                  <div className="flex items-center">
                    <div className="w-4 h-4 bg-red-500 rounded-full mr-3 animate-pulse"></div>
                    <span className="font-semibold">{error}</span>
                  </div>
          </div>
        )}
        
              {/* Registration Form */}
              <form className="space-y-6" onSubmit={handleSubmit}>
                <div className="space-y-6">
            <div>
                    <label htmlFor="username" className="block text-sm font-bold text-gray-700 mb-2">
                Username
              </label>
                    <div className="relative">
                      <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                        <User className="h-5 w-5 text-gray-400" />
                      </div>
              <input
                id="username"
                name="username"
                type="text"
                autoComplete="username"
                        className="w-full pl-10 pr-4 py-4 bg-white border-2 border-gray-200 rounded-xl text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-teal-500 focus:border-teal-500 transition-all font-medium"
                        placeholder="Choose a unique username"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
              />
            </div>
                  </div>

            <div>
                    <label htmlFor="email" className="block text-sm font-bold text-gray-700 mb-2">
                      Email Address
              </label>
                    <div className="relative">
                      <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                        <Mail className="h-5 w-5 text-gray-400" />
                      </div>
              <input
                id="email"
                name="email"
                type="email"
                autoComplete="email"
                required
                        className="w-full pl-10 pr-4 py-4 bg-white border-2 border-gray-200 rounded-xl text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-teal-500 focus:border-teal-500 transition-all font-medium"
                        placeholder="Enter your email address"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
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
                id="password"
                name="password"
                type="password"
                autoComplete="new-password"
                required
                        className="w-full pl-10 pr-4 py-4 bg-white border-2 border-gray-200 rounded-xl text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-teal-500 focus:border-teal-500 transition-all font-medium"
                        placeholder="Create a secure password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
              />
            </div>
                  </div>

            <div>
                    <label htmlFor="confirmPassword" className="block text-sm font-bold text-gray-700 mb-2">
                Confirm Password
              </label>
                    <div className="relative">
                      <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                        <CheckCircle className={`h-5 w-5 ${password && confirmPassword && password === confirmPassword ? 'text-green-500' : 'text-gray-400'}`} />
                      </div>
              <input
                id="confirmPassword"
                name="confirmPassword"
                type="password"
                autoComplete="new-password"
                required
                        className={`w-full pl-10 pr-4 py-4 bg-white border-2 rounded-xl text-gray-900 placeholder-gray-400 focus:outline-none transition-all font-medium ${
                          password && confirmPassword && password === confirmPassword 
                            ? 'border-green-300 focus:ring-2 focus:ring-green-500 focus:border-green-500' 
                            : password && confirmPassword && password !== confirmPassword
                              ? 'border-red-300 focus:ring-2 focus:ring-red-500 focus:border-red-500'
                              : 'border-gray-200 focus:ring-2 focus:ring-teal-500 focus:border-teal-500'
                        }`}
                        placeholder="Confirm your password"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
              />
                    </div>
                    {password && confirmPassword && password !== confirmPassword && (
                      <p className="text-red-500 text-sm mt-2 font-medium">Passwords do not match</p>
                    )}
                    {password && confirmPassword && password === confirmPassword && (
                      <p className="text-green-500 text-sm mt-2 font-medium">✓ Passwords match</p>
                    )}
            </div>
          </div>

                <div className="space-y-4">
            <button
              type="submit"
              disabled={loading}
                    className="w-full bg-gradient-to-r from-emerald-500 via-teal-600 to-cyan-600 hover:from-emerald-600 hover:via-teal-700 hover:to-cyan-700 disabled:bg-gray-300 disabled:cursor-not-allowed text-white font-bold py-4 px-6 rounded-xl transition-all duration-300 transform hover:scale-105 shadow-xl"
            >
                    <div className="flex items-center justify-center">
                      <UserPlus className="mr-2" size={20} />
                      {loading ? 'Creating Account...' : 'Create My Account'}
                    </div>
            </button>

                  {/* Benefits */}
                  <div className="bg-gradient-to-r from-emerald-50 to-teal-50 rounded-xl p-4 border border-emerald-200">
                    <h4 className="font-bold text-gray-800 mb-2">🎁 What you get:</h4>
                    <ul className="text-sm text-gray-700 space-y-1">
                      <li>• Welcome bonus on your first deposit</li>
                      <li>• Access to exclusive bingo games</li>
                      <li>• Instant payouts and secure account</li>
                    </ul>
                  </div>
          </div>
          
                <div className="text-center">
                  <p className="text-lg text-gray-600">
                    Already have an account?{' '}
                    <button
                      type="button"
                      onClick={() => setLocation('/login')}
                      className="text-transparent bg-clip-text bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-700 hover:to-teal-700 font-bold transition-all duration-300 transform hover:scale-105"
                    >
                      Sign in here!
                    </button>
                  </p>
                </div>
              </form>
            </div>
          </div>
        </div>
      </div>
    </SiteLayout>
  );
}