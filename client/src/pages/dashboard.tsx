import React, { useState, useEffect } from 'react';
import { SiteLayout } from '@/components/SiteLayout';
import { useLocation } from 'wouter';
import { useAuth } from '../contexts/AuthContext';
import { useSocket } from '../contexts/SocketContext';
import { apiRequest } from '../lib/api';
import ConnectionStatus from '../components/ConnectionStatus';
import { PatternIndicatorPopup } from '../components/tutorial/PatternIndicatorPopup';

interface Lobby {
  id: number;
  name: string;
  entryFee: string;
  maxSeats: number;
  seatsTaken: number;
  status: string;
}

interface Transaction {
  id: number;
  type: string;
  amount: number;
  description: string;
  timestamp: string;
}

interface User {
  id: number;
  email: string;
  balance: number | string; // Handle both string and number types from API
  isAdmin?: boolean;
}

interface DashboardData {
  user: User;
  lobbies: Lobby[];
  recentTransactions: Transaction[];
}

export default function DashboardPage() {
  const { user, logout } = useAuth();
  const [, setLocation] = useLocation();
  const [data, setData] = useState<DashboardData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [showPatternPopup, setShowPatternPopup] = useState(false);

  // Helper function to safely get balance as number
  const getBalanceAsNumber = (balance: number | string): number => {
    return typeof balance === 'string' ? parseFloat(balance) || 0 : balance;
  };

  const checkPatternPopupPreference = async () => {
    try {
      const token = localStorage.getItem('token');
      if (!token) return;

      const response = await apiRequest<{ shouldShow: boolean }>('/notification-preferences/pattern_indicator_popup', {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      
      if (response.shouldShow) {
        setShowPatternPopup(true);
      }
    } catch (error) {
      console.log('[PATTERN_POPUP] Preference check failed:', error);
      // Default to showing popup if API fails
      setShowPatternPopup(true);
    }
  };

  const fetchDashboardData = async () => {
    try {
      setError('');
      const token = localStorage.getItem('token');
      
      if (!token) {
        setError('No authentication token found');
        logout();
        return;
      }

      console.log('[DASHBOARD] Fetching dashboard data with token...');
      const response = await apiRequest<DashboardData>('/dashboard', {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      
      console.log('[DASHBOARD] Dashboard data received:', {
        userEmail: response.user?.email,
        isAdmin: response.user?.isAdmin,
        lobbiesCount: response.lobbies?.length
      });
      
      setData(response);
      
      // Check pattern popup preference after dashboard loads
      await checkPatternPopupPreference();
    } catch (err: any) {
      console.error('[DASHBOARD] Fetch error:', err);
      if (err.message?.includes('401') || err.message?.includes('token')) {
        logout();
        setLocation('/login');
      } else {
        setError(err.message || 'Failed to load dashboard data');
      }
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (!user) {
      setLocation('/login');
      return;
    }
    fetchDashboardData();
  }, [user, setLocation]);

  const handleViewLobby = (lobbyId: number) => {
    setLocation(`/lobby-select/${lobbyId}`);
  };

  const handleLogout = () => {
    logout();
    setLocation('/');
  };

  const handlePatternPopupDismiss = async (doNotShowAgain: boolean = false) => {
    setShowPatternPopup(false);
    
    if (doNotShowAgain) {
      try {
        const token = localStorage.getItem('token');
        if (token) {
          await apiRequest('/notification-preferences/pattern_indicator_popup/dismiss', {
            method: 'POST',
            headers: { 'Authorization': `Bearer ${token}` }
          });
        }
      } catch (error) {
        console.error('[PATTERN_POPUP] Failed to save dismiss preference:', error);
      }
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-900 text-white flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-green-500 mx-auto mb-4"></div>
          <p>Loading dashboard...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gray-900 text-white flex items-center justify-center">
        <div className="text-center">
          <div className="text-red-500 text-xl mb-4">⚠️</div>
          <h1 className="text-xl font-bold mb-2">Error</h1>
          <p className="text-gray-400 mb-4">{error}</p>
          <button
            onClick={fetchDashboardData}
            className="bg-green-600 hover:bg-green-700 px-4 py-2 rounded text-white mr-2"
          >
            Retry
          </button>
          <button
            onClick={handleLogout}
            className="bg-gray-600 hover:bg-gray-700 px-4 py-2 rounded text-white"
          >
            Logout
          </button>
        </div>
      </div>
    );
  }

  if (!data) {
    return null;
  }

  return (
    <SiteLayout hideAuthButtons>
      <div className="max-w-7xl mx-auto p-3 sm:p-6">
        {/* Header - Mobile Responsive */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between mb-6 gap-3">
          <div>
            <h1 className="text-2xl sm:text-3xl font-bold text-gray-900">Dashboard</h1>
            <div className="text-sm text-gray-600 mt-1">
              Welcome back, {user?.username || user?.email?.split('@')[0]}
              {user?.isAdmin && <span className="ml-2 bg-casino-gold text-white px-2 py-0.5 rounded text-xs font-bold">ADMIN</span>}
            </div>
          </div>
          
          <div className="flex flex-wrap items-center gap-2">
            <ConnectionStatus showDetails={true} className="text-xs sm:text-sm" />
            {user?.isAdmin && (
              <button
                onClick={() => setLocation('/admin')}
                className="bg-casino-red hover:opacity-90 px-3 py-1.5 sm:px-4 sm:py-2 rounded text-xs sm:text-sm font-medium text-white"
              >
                Admin Panel
              </button>
            )}
          </div>
        </div>
        {/* ADD BALANCE Feature */}
        <div className="mb-6 rounded-xl bg-gradient-to-r from-casino-gold to-yellow-400 p-4 sm:p-6 shadow-lg border border-yellow-300">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            <div>
              <h2 className="text-lg sm:text-xl font-bold text-white mb-2">💰 Add Balance</h2>
              <p className="text-yellow-100 text-sm">Fund your account to start playing! Multiple payment options available.</p>
            </div>
            <button
              onClick={() => setLocation('/add-balance')}
              className="bg-white text-casino-gold hover:bg-yellow-50 px-6 py-3 rounded-lg font-bold text-sm shadow-md transition-colors self-start sm:self-auto"
            >
              Add Funds →
            </button>
          </div>
        </div>

        {/* User Info Card - Improved Mobile Layout */}
        <div className="mb-6 rounded-xl bg-gradient-to-r from-white to-gray-50 p-4 sm:p-6 shadow-lg border border-gray-200">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-4">
            <h2 className="text-lg sm:text-xl font-bold text-gray-900">Account Information</h2>
            <button
              onClick={() => setLocation('/profile')}
              className="bg-casino-red hover:opacity-90 text-white px-4 py-2 rounded-lg font-medium text-sm self-start sm:self-auto"
            >
              Edit Profile
            </button>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="bg-white rounded-lg p-3 border border-gray-100">
              <p className="text-xs text-gray-500 uppercase tracking-wider">Email Address</p>
              <p className="text-base sm:text-lg font-medium text-gray-900 mt-1">{data.user.email}</p>
            </div>
            <div className="bg-white rounded-lg p-3 border border-gray-100">
              <p className="text-xs text-gray-500 uppercase tracking-wider">Current Balance</p>
              <p className="text-xl sm:text-2xl font-bold text-green-600 mt-1">${getBalanceAsNumber(data.user.balance).toFixed(2)}</p>
            </div>
          </div>
        </div>

        {/* Available Lobbies - Improved Mobile Grid */}
        <div className="mb-6 rounded-xl bg-white p-4 sm:p-6 shadow-lg border-2 border-casino-gold">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg sm:text-xl font-bold text-gray-900">Available Lobbies</h2>
            <button
              onClick={fetchDashboardData}
              className="flex items-center gap-1 text-xs sm:text-sm text-gray-600 hover:text-gray-900 transition-colors"
            >
              <span className="text-base">🔄</span>
              <span>Refresh</span>
            </button>
          </div>
          {!data.lobbies || data.lobbies.length === 0 ? (
            <p className="text-gray-600 text-center py-8">No lobbies available at the moment.</p>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {data.lobbies.map((room) => (
                <div key={room.id} className="bg-gradient-to-br from-gray-50 to-white rounded-lg shadow-md border border-gray-200 p-4 hover:shadow-lg transition-all">
                  {/* Lobby Header */}
                  <div className="flex justify-between items-start mb-3">
                    <div>
                      <h3 className="text-base sm:text-lg font-bold text-casino-red">{room.name}</h3>
                      <p className="text-xs text-gray-500">Lobby #{room.id}</p>
                    </div>
                    <span className="px-2 py-1 rounded-full text-xs font-bold bg-green-100 text-green-700">
                      AVAILABLE
                    </span>
                  </div>
                  
                  {/* Lobby Stats */}
                  <div className="space-y-2 mb-4">
                    <div className="flex justify-between text-sm">
                      <span className="text-gray-600">Games:</span>
                      <span className="font-semibold text-gray-900">4/4</span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span className="text-gray-600">Prize Pool:</span>
                      <span className="font-bold text-green-600">$0.00</span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span className="text-gray-600">Entry Fee:</span>
                      <span className="font-semibold text-gray-900">${room.entryFee}</span>
                    </div>
                  </div>
                  
                  {/* Action Button */}
                  <button 
                    onClick={() => handleViewLobby(room.id)} 
                    className="w-full py-2 px-4 rounded-lg font-medium text-sm transition-colors bg-casino-gold text-white hover:bg-yellow-500"
                  >
                    Enter Lobby
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Recent Transactions */}
        {data.recentTransactions && data.recentTransactions.length > 0 && (
          <div className="mb-8 rounded-lg bg-white p-6 shadow border border-gray-200">
            <h2 className="mb-4 text-xl font-bold">Recent Transactions</h2>
            <div className="space-y-2">
              {data.recentTransactions.slice(0, 5).map((transaction, index) => (
                <div key={index} className="flex justify-between border-b border-gray-200 py-2">
                  <span>{transaction.description || transaction.type}</span>
                  <span className={transaction.amount > 0 ? 'text-green-700' : 'text-red-700'}>
                    {transaction.amount > 0 ? '+' : ''}${Math.abs(transaction.amount)}
                  </span>
                </div>
              ))}
            </div>
          </div>
        )}

        <ConnectionStatus className="mt-6" />
      </div>

      {/* Pattern Indicator Popup - Only shows once per user per 24 hours */}
      <PatternIndicatorPopup
        isOpen={showPatternPopup}
        onClose={() => handlePatternPopupDismiss(false)}
        onDoNotShowAgain={() => handlePatternPopupDismiss(true)}
      />
    </SiteLayout>
  );
}