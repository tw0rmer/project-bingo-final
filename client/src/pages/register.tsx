import React, { useState } from 'react';
import { SiteLayout } from '@/components/SiteLayout';
import { useLocation } from 'wouter';
import { useAuth } from '@/contexts/AuthContext';
import { apiRequest } from '@/lib/api';

export default function RegisterPage() {
  const [email, setEmail] = useState('');
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [, setLocation] = useLocation();
  const { login } = useAuth();

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
      <div className="w-full max-w-md space-y-8 rounded-lg bg-white p-8 shadow-md mx-auto my-10">
        <div className="text-center">
          <h2 className="mt-6 text-3xl font-bold text-casino-red">Create your account</h2>
        </div>
        
        {error && (
          <div className="rounded-md bg-red-50 p-4 text-red-700 border border-red-200">
            <p>{error}</p>
          </div>
        )}
        
        <form className="mt-8 space-y-6" onSubmit={handleSubmit}>
          <div className="space-y-4 rounded-md shadow-sm">
            <div>
              <label htmlFor="username" className="sr-only">
                Username
              </label>
              <input
                id="username"
                name="username"
                type="text"
                autoComplete="username"
                className="relative block w-full rounded-md border border-gray-300 bg-white p-3 text-gray-900 placeholder-gray-400 focus:ring-2 focus:ring-casino-gold"
                placeholder="Choose a username"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
              />
            </div>
            <div>
              <label htmlFor="email" className="sr-only">
                Email address
              </label>
              <input
                id="email"
                name="email"
                type="email"
                autoComplete="email"
                required
                className="relative block w-full rounded-md border border-gray-300 bg-white p-3 text-gray-900 placeholder-gray-400 focus:ring-2 focus:ring-casino-gold"
                placeholder="Email address"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
              />
            </div>
            <div>
              <label htmlFor="password" className="sr-only">
                Password
              </label>
              <input
                id="password"
                name="password"
                type="password"
                autoComplete="new-password"
                required
                className="relative block w-full rounded-md border border-gray-300 bg-white p-3 text-gray-900 placeholder-gray-400 focus:ring-2 focus:ring-casino-gold"
                placeholder="Password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
              />
            </div>
            <div>
              <label htmlFor="confirmPassword" className="sr-only">
                Confirm Password
              </label>
              <input
                id="confirmPassword"
                name="confirmPassword"
                type="password"
                autoComplete="new-password"
                required
                className="relative block w-full rounded-md border border-gray-300 bg-white p-3 text-gray-900 placeholder-gray-400 focus:ring-2 focus:ring-casino-gold"
                placeholder="Confirm Password"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
              />
            </div>
          </div>

          <div>
            <button
              type="submit"
              disabled={loading}
              className="group relative flex w-full justify-center rounded-md bg-casino-gold px-3 py-3 text-sm font-semibold text-white hover:bg-yellow-500 focus:outline-none disabled:opacity-70"
            >
              {loading ? 'Creating account...' : 'Sign up'}
            </button>
          </div>
          
          <div className="flex items-center justify-center">
            <div className="text-sm">
              <a href="/login" className="font-medium text-casino-red hover:opacity-80">
                Already have an account? Sign in
              </a>
            </div>
          </div>
        </form>
      </div>
    </SiteLayout>
  );
}