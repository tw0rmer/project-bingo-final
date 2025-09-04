import React, { useState, useEffect } from 'react';
import { SiteLayout } from '@/components/SiteLayout';
import { useLocation } from 'wouter';
import { useAuth } from '../contexts/AuthContext';
import { useSocket } from '../contexts/SocketContext';
import { apiRequest } from '../lib/api';
import ConnectionStatus from '../components/ConnectionStatus';
import { PatternIndicatorPopup } from '../components/tutorial/PatternIndicatorPopup';
import { Crown, User, DollarSign, CreditCard, Gamepad2, RefreshCw, Settings, TrendingUp, Sparkles, Star, Play, Timer, Users } from 'lucide-react';

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
  stats?: {
    totalWinnings: number;
    gamesWon: number;
  };
}

export default function DashboardPage() {
  const { user, logout } = useAuth();
  const [, setLocation] = useLocation();
  const { socket, isConnected } = useSocket();
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
      // Don't show popup if API fails or endpoint doesn't exist
      setShowPatternPopup(false);
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

  // Real-time updates for dashboard data
  useEffect(() => {
    if (!socket || !isConnected) return;

    console.log('[DASHBOARD] Setting up real-time update listeners');

    // Listen for game win events to refresh dashboard data
    const handlePlayerWon = (data: any) => {
      console.log('[DASHBOARD] Player won event received:', data);
      // Check if the current user is the winner
      if (data.userId === user?.id) {
        console.log('[DASHBOARD] Current user won! Refreshing dashboard data...');
        // Add a small delay to ensure database updates are complete
        setTimeout(() => {
          fetchDashboardData();
        }, 1000);
      }
    };

    // Listen for specific game won events
    const handleGameWon = (data: any) => {
      console.log('[DASHBOARD] Game won event received:', data);
      if (data.userId === user?.id) {
        console.log('[DASHBOARD] Current user won a game! Refreshing dashboard data...');
        // Add a longer delay to ensure game winnerId is updated in database
        setTimeout(() => {
          fetchDashboardData();
        }, 2000);
      }
    };

    // Listen for balance updates
    const handleBalanceUpdate = (data: any) => {
      console.log('[DASHBOARD] Balance update event received:', data);
      if (data.userId === user?.id) {
        console.log('[DASHBOARD] Current user balance updated! Refreshing dashboard data...');
        setTimeout(() => {
          fetchDashboardData();
        }, 500);
      }
    };

    // Listen for wallet transactions
    const handleTransactionCreated = (data: any) => {
      console.log('[DASHBOARD] Transaction created event received:', data);
      if (data.userId === user?.id) {
        console.log('[DASHBOARD] Current user transaction created! Refreshing dashboard data...');
        setTimeout(() => {
          fetchDashboardData();
        }, 500);
      }
    };

    // Register event listeners
    socket.on('player_won', handlePlayerWon);
    socket.on('game_won', handleGameWon);
    socket.on('balance_updated', handleBalanceUpdate);
    socket.on('transaction_created', handleTransactionCreated);

    // Cleanup function
    return () => {
      socket.off('player_won', handlePlayerWon);
      socket.off('game_won', handleGameWon);
      socket.off('balance_updated', handleBalanceUpdate);
      socket.off('transaction_created', handleTransactionCreated);
    };
  }, [socket, isConnected, user?.id, fetchDashboardData]);

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
      <div className="min-h-screen bg-gradient-to-br from-indigo-50 via-purple-50 to-pink-50 flex items-center justify-center relative overflow-hidden">
        {/* Background decorations */}
        <div className="absolute inset-0">
          <div className="absolute top-20 left-10 w-20 h-20 bg-gradient-to-br from-indigo-300 to-purple-400 rounded-full opacity-20 animate-bounce-soft"></div>
          <div className="absolute top-40 right-20 w-16 h-16 bg-gradient-to-br from-purple-300 to-pink-400 rounded-full opacity-20 animate-pulse"></div>
          <div className="absolute bottom-32 left-1/4 w-24 h-24 bg-gradient-to-br from-pink-300 to-red-400 rounded-full opacity-15 animate-bounce-soft" style={{ animationDelay: '1s' }}></div>
        </div>
        
        <div className="text-center relative z-10">
          <div className="bg-white/95 backdrop-blur-sm rounded-3xl p-12 shadow-2xl border-2 border-gradient-to-r from-indigo-200 to-purple-200">
            <div className="w-20 h-20 bg-gradient-to-br from-indigo-500 to-purple-600 rounded-2xl flex items-center justify-center mx-auto mb-6 shadow-lg">
              <div className="animate-spin rounded-full h-12 w-12 border-4 border-white border-t-transparent"></div>
            </div>
            <h2 className="text-2xl font-black text-transparent bg-clip-text bg-gradient-to-r from-indigo-600 to-purple-600 mb-2">Loading Dashboard</h2>
            <p className="text-gray-700 font-medium">Please wait while we fetch your data...</p>
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-red-50 via-pink-50 to-orange-50 flex items-center justify-center relative overflow-hidden">
        {/* Background decorations */}
        <div className="absolute inset-0">
          <div className="absolute top-20 left-10 w-20 h-20 bg-gradient-to-br from-red-300 to-pink-400 rounded-full opacity-20 animate-bounce-soft"></div>
          <div className="absolute top-40 right-20 w-16 h-16 bg-gradient-to-br from-pink-300 to-orange-400 rounded-full opacity-20 animate-pulse"></div>
        </div>
        
        <div className="text-center relative z-10">
          <div className="bg-white/95 backdrop-blur-sm rounded-3xl p-12 shadow-2xl border-2 border-gradient-to-r from-red-200 to-pink-200 max-w-md">
            <div className="w-20 h-20 bg-gradient-to-br from-red-500 to-pink-600 rounded-2xl flex items-center justify-center mx-auto mb-6 shadow-lg">
              <span className="text-white text-4xl">⚠️</span>
            </div>
            <h1 className="text-3xl font-black text-transparent bg-clip-text bg-gradient-to-r from-red-600 to-pink-600 mb-4">Error</h1>
            <p className="text-gray-700 mb-8 font-medium">{error}</p>
            <div className="flex flex-col gap-3">
          <button
            onClick={fetchDashboardData}
                className="bg-gradient-to-r from-green-500 to-emerald-600 hover:from-green-600 hover:to-emerald-700 px-8 py-3 rounded-2xl text-white font-bold shadow-lg transition-all duration-300 transform hover:scale-105"
          >
                <RefreshCw className="mr-2 inline" size={20} />
            Retry
          </button>
          <button
            onClick={handleLogout}
                className="border-2 border-gray-400 text-gray-700 hover:bg-gray-100 px-8 py-3 rounded-2xl font-bold transition-all duration-300"
          >
            Logout
          </button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (!data) {
    return null;
  }

  return (
    <SiteLayout hideAuthButtons>
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50 relative overflow-hidden">
        {/* Background decorations */}
        <div className="absolute inset-0">
          <div className="absolute top-20 left-10 w-20 h-20 bg-gradient-to-br from-blue-300 to-indigo-400 rounded-full opacity-20 animate-bounce-soft"></div>
          <div className="absolute top-40 right-20 w-16 h-16 bg-gradient-to-br from-indigo-300 to-purple-400 rounded-full opacity-20 animate-pulse"></div>
          <div className="absolute bottom-32 left-1/4 w-24 h-24 bg-gradient-to-br from-purple-300 to-pink-400 rounded-full opacity-15 animate-bounce-soft" style={{ animationDelay: '1s' }}></div>
          
          {/* Floating sparkles */}
          <div className="absolute top-32 right-1/4 opacity-20">
            <Sparkles className="text-blue-400 animate-pulse" size={20} />
          </div>
          <div className="absolute bottom-40 left-1/3 opacity-15">
            <Star className="text-indigo-400 animate-bounce-soft" size={16} />
          </div>
        </div>
        
        <div className="max-w-7xl mx-auto p-4 sm:p-6 relative z-10">
          {/* Compact Header with Account Info */}
          <div className="bg-white/95 backdrop-blur-sm rounded-3xl p-4 sm:p-6 shadow-2xl border-2 border-gradient-to-r from-blue-200 to-indigo-200 mb-4 relative overflow-hidden">
            <div className="absolute inset-0 bg-gradient-to-br from-blue-50/30 to-indigo-50/30"></div>
            
            {/* Floating decorative elements */}
            <div className="absolute top-3 right-3">
              <Sparkles className="text-blue-400 animate-pulse" size={16} />
            </div>
            <div className="absolute top-4 left-4">
              <Star className="text-indigo-400 animate-bounce-soft" size={14} />
            </div>
            
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 relative z-10">
              <div className="flex items-center space-x-3">
                <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-2xl flex items-center justify-center shadow-lg">
                  {user?.isAdmin ? (
                    <Crown className="text-white" size={24} />
                  ) : (
                    <User className="text-white" size={24} />
                  )}
                </div>
          <div>
                  <h1 className="text-2xl sm:text-3xl font-black text-transparent bg-clip-text bg-gradient-to-r from-blue-600 to-indigo-600">
                    Dashboard
                  </h1>
                  <div className="text-sm sm:text-base text-gray-700 flex items-center">
                    <span className="font-semibold">Welcome back, {user?.username || user?.email?.split('@')[0]}</span>
                    {user?.isAdmin && (
                      <span className="ml-2 bg-gradient-to-r from-yellow-500 to-orange-500 text-white px-2 py-0.5 rounded-full text-xs font-bold shadow-lg">
                        <Crown className="inline mr-1" size={12} />
                        ADMIN
                      </span>
                    )}
                  </div>
            </div>
          </div>
          
          <div className="flex flex-wrap items-center gap-2">
            {user?.isAdmin && (
              <button
                onClick={() => setLocation('/admin')}
                    className="bg-gradient-to-r from-red-500 to-pink-600 hover:from-red-600 hover:to-pink-700 px-4 py-2 rounded-xl text-white font-bold shadow-lg transition-all duration-300 transform hover:scale-105 text-sm"
              >
                    <Settings className="mr-1 inline" size={16} />
                Admin Panel
              </button>
            )}
                <button
                  onClick={() => setLocation('/profile')}
                  className="bg-gradient-to-r from-blue-500 to-indigo-600 hover:from-blue-600 hover:to-indigo-700 text-white px-4 py-2 rounded-xl font-bold shadow-lg transition-all duration-300 transform hover:scale-105 text-sm"
                >
                  <Settings className="mr-1 inline" size={16} />
                  Edit Profile
                </button>
                <button
                  onClick={() => setLocation('/add-balance')}
                  className="bg-gradient-to-r from-yellow-500 to-orange-500 hover:from-yellow-600 hover:to-orange-600 text-white px-4 py-2 rounded-xl font-bold shadow-lg transition-all duration-300 transform hover:scale-105 text-sm"
                >
                  <CreditCard className="mr-1 inline" size={16} />
                  Add Balance
                </button>
              </div>
            </div>
          </div>

          {/* Compact Stats Grid */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-4">
            {/* Email Card */}
            <div className="bg-white/95 backdrop-blur-sm rounded-2xl p-3 shadow-xl border-2 border-green-200 relative overflow-hidden">
              <div className="absolute inset-0 bg-gradient-to-br from-green-50/50 to-blue-50/50"></div>
              <div className="relative z-10">
                <div className="flex items-center mb-1">
                  <div className="w-6 h-6 bg-gradient-to-br from-gray-500 to-gray-600 rounded-lg flex items-center justify-center mr-2">
                    <span className="text-white text-xs font-bold">@</span>
                  </div>
                  <p className="text-xs text-gray-600 font-bold uppercase tracking-wider">Email</p>
                </div>
                <p className="text-xs font-bold text-gray-900 truncate">{data.user.email}</p>
        </div>
            </div>
            
            {/* Balance Card */}
            <div className="bg-white/95 backdrop-blur-sm rounded-2xl p-3 shadow-xl border-2 border-green-200 relative overflow-hidden">
              <div className="absolute inset-0 bg-gradient-to-br from-green-50/50 to-emerald-50/50"></div>
              <div className="relative z-10">
                <div className="flex items-center mb-1">
                  <div className="w-6 h-6 bg-gradient-to-br from-green-500 to-emerald-600 rounded-lg flex items-center justify-center mr-2">
                    <DollarSign className="text-white" size={12} />
                  </div>
                  <p className="text-xs text-gray-600 font-bold uppercase tracking-wider">Balance</p>
                </div>
                <p className="text-lg font-black text-transparent bg-clip-text bg-gradient-to-r from-green-600 to-emerald-600">
                  ${getBalanceAsNumber(data.user.balance).toFixed(2)}
                </p>
          </div>
        </div>

            {/* Total Winnings Card */}
            <div className="bg-gradient-to-br from-green-50 to-emerald-50 rounded-2xl p-3 shadow-xl border-2 border-green-200 relative overflow-hidden">
              <div className="absolute inset-0 bg-gradient-to-br from-green-100/30 to-emerald-100/30"></div>
              <div className="relative z-10">
                <div className="flex items-center mb-1">
                  <div className="w-6 h-6 bg-gradient-to-br from-green-500 to-emerald-600 rounded-lg flex items-center justify-center mr-2">
                    <DollarSign className="text-white" size={12} />
                  </div>
                  <p className="text-xs text-gray-600 font-bold uppercase tracking-wider">Winnings</p>
                </div>
                <p className="text-lg font-black text-transparent bg-clip-text bg-gradient-to-r from-green-600 to-emerald-600">
                  ${(data.stats?.totalWinnings || 0).toFixed(2)}
                </p>
          </div>
            </div>

            {/* Games Won Card */}
            <div className="bg-gradient-to-br from-blue-50 to-indigo-50 rounded-2xl p-3 shadow-xl border-2 border-blue-200 relative overflow-hidden">
              <div className="absolute inset-0 bg-gradient-to-br from-blue-100/30 to-indigo-100/30"></div>
              <div className="relative z-10">
                <div className="flex items-center mb-1">
                  <div className="w-6 h-6 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-lg flex items-center justify-center mr-2">
                    <span className="text-white text-xs">🏆</span>
                  </div>
                  <p className="text-xs text-gray-600 font-bold uppercase tracking-wider">Won</p>
                </div>
                <p className="text-lg font-black text-transparent bg-clip-text bg-gradient-to-r from-blue-600 to-indigo-600">
                  {data.stats?.gamesWon || 0}
                </p>
              </div>
            </div>
          </div>

          {/* Main Content Grid */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
            {/* Available Lobbies - Takes 2/3 on large screens */}
            <div className="lg:col-span-2">
              <div className="bg-white/95 backdrop-blur-sm rounded-3xl p-4 sm:p-6 shadow-2xl border-2 border-gradient-to-r from-purple-200 to-pink-200 relative overflow-hidden">
                <div className="absolute inset-0 bg-gradient-to-br from-purple-400 to-pink-500 rounded-3xl transform rotate-1 opacity-20"></div>
                <div className="absolute top-3 right-3">
                  <Gamepad2 className="text-purple-400 animate-pulse" size={20} />
        </div>

                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-6 relative z-10">
                  <div className="flex items-center">
                    <div className="w-10 h-10 bg-gradient-to-br from-purple-500 to-pink-600 rounded-2xl flex items-center justify-center mr-3">
                      <Gamepad2 className="text-white" size={20} />
                    </div>
                    <h2 className="text-xl font-black text-transparent bg-clip-text bg-gradient-to-r from-purple-600 to-pink-600">Available Lobbies</h2>
                  </div>
            <button
              onClick={fetchDashboardData}
                    className="flex items-center gap-2 bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700 text-white px-4 py-2 rounded-xl font-bold shadow-lg transition-all duration-300 transform hover:scale-105 text-sm"
            >
                    <RefreshCw className="animate-spin" size={16} />
              <span>Refresh</span>
            </button>
          </div>
                  
          {!data.lobbies || data.lobbies.length === 0 ? (
                  <div className="text-center py-8">
                    <div className="w-16 h-16 bg-gradient-to-br from-gray-300 to-gray-400 rounded-2xl flex items-center justify-center mx-auto mb-4">
                      <Gamepad2 className="text-white" size={32} />
                    </div>
                    <p className="text-lg font-bold text-gray-700 mb-1">No lobbies available</p>
                    <p className="text-sm text-gray-600">Check back soon for new games!</p>
                  </div>
                ) : (
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 relative z-10">
                    {data.lobbies.map((room, index) => {
                      const isPopular = index === 1; // Make middle lobby popular
                      const isPremium = parseFloat(room.entryFee) >= 25;
                      
                      return (
                        <div key={room.id} className={`group relative overflow-hidden rounded-2xl p-3 shadow-xl border-2 transition-all duration-300 transform hover:scale-105 hover:shadow-2xl ${
                          isPopular 
                            ? 'bg-gradient-to-br from-yellow-50 via-orange-50 to-red-50 border-gradient-to-r from-orange-200 to-red-200' 
                            : isPremium 
                              ? 'bg-gradient-to-br from-purple-50 via-blue-50 to-indigo-50 border-gradient-to-r from-purple-200 to-indigo-200'
                              : 'bg-gradient-to-br from-green-50 via-emerald-50 to-teal-50 border-gradient-to-r from-green-200 to-teal-200'
                        }`}>
                          
                          {/* Popular badge */}
                          {isPopular && (
                            <div className="absolute -top-1 -right-1 z-20">
                              <div className="bg-gradient-to-r from-orange-500 to-red-500 text-white px-2 py-0.5 rounded-full text-xs font-bold shadow-lg transform rotate-12">
                                🔥 POPULAR
                              </div>
                            </div>
                          )}
                          
                          {/* Premium badge */}
                          {isPremium && !isPopular && (
                            <div className="absolute -top-1 -right-1 z-20">
                              <div className="bg-gradient-to-r from-purple-600 to-indigo-600 text-white px-2 py-0.5 rounded-full text-xs font-bold shadow-lg transform rotate-12">
                                💎 PREMIUM
                              </div>
                            </div>
                          )}

                          <div className={`absolute inset-0 ${
                            isPopular 
                              ? 'bg-gradient-to-br from-yellow-50/30 to-red-50/30' 
                              : isPremium 
                                ? 'bg-gradient-to-br from-purple-50/30 to-indigo-50/30'
                                : 'bg-gradient-to-br from-green-50/30 to-teal-50/30'
                          }`}></div>
                          
                          <div className="relative z-10">
                  {/* Lobby Header */}
                  <div className="flex justify-between items-start mb-3">
                    <div>
                                <h3 className="text-base font-black text-gray-800 group-hover:text-gray-900 transition-colors">{room.name}</h3>
                                <p className="text-xs text-gray-600 font-medium">Lobby #{room.id}</p>
                    </div>
                              <span className="px-2 py-0.5 rounded-full text-xs font-bold bg-green-100 text-green-700 shadow-sm">
                                🟢 LIVE
                    </span>
                  </div>
                  
                            {/* Compact Lobby Stats */}
                            <div className="space-y-1 mb-3">
                              <div className="flex justify-between items-center bg-white/70 rounded-lg p-1.5">
                                <div className="flex items-center">
                                  <Timer className="w-3 h-3 text-gray-600 mr-1" />
                                  <span className="text-xs text-gray-700 font-medium">Games:</span>
                                </div>
                                <span className="font-bold text-gray-800 text-xs">4/4</span>
                              </div>
                              <div className="flex justify-between items-center bg-white/70 rounded-lg p-1.5">
                                <div className="flex items-center">
                                  <TrendingUp className="w-3 h-3 text-gray-600 mr-1" />
                                  <span className="text-xs text-gray-700 font-medium">Prize:</span>
                                </div>
                                <span className="font-bold text-green-600 text-xs">$0.00</span>
                    </div>
                              <div className="flex justify-between items-center bg-white/70 rounded-lg p-1.5">
                                <div className="flex items-center">
                                  <DollarSign className="w-3 h-3 text-gray-600 mr-1" />
                                  <span className="text-xs text-gray-700 font-medium">Entry:</span>
                    </div>
                                <span className="font-bold text-gray-800 text-xs">${room.entryFee}</span>
                    </div>
                  </div>
                  
                  {/* Action Button */}
                  <button 
                    onClick={() => handleViewLobby(room.id)} 
                              className={`w-full py-2 px-3 rounded-xl font-bold text-xs transition-all duration-300 transform group-hover:scale-105 shadow-lg ${
                                isPopular 
                                  ? 'bg-gradient-to-r from-orange-500 to-red-500 hover:from-orange-600 hover:to-red-600 text-white shadow-orange-200' 
                                  : isPremium 
                                    ? 'bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-700 hover:to-indigo-700 text-white shadow-purple-200'
                                    : 'bg-gradient-to-r from-green-500 to-teal-500 hover:from-green-600 hover:to-teal-600 text-white shadow-green-200'
                              }`}
                            >
                              <Play className="mr-1 inline" size={14} />
                    Enter Lobby
                  </button>
                </div>
                        </div>
                      );
                    })}
            </div>
          )}
              </div>
            </div>

            {/* Recent Transactions - Takes 1/3 on large screens */}
            <div className="lg:col-span-1">
              {data.recentTransactions && data.recentTransactions.length > 0 ? (
                <div className="bg-white/95 backdrop-blur-sm rounded-3xl p-4 sm:p-6 shadow-2xl border-2 border-gradient-to-r from-cyan-200 to-blue-200 relative overflow-hidden h-full">
                  <div className="absolute inset-0 bg-gradient-to-br from-cyan-400 to-blue-500 rounded-3xl transform -rotate-1 opacity-20"></div>
                  <div className="absolute top-3 right-3">
                    <TrendingUp className="text-cyan-400 animate-pulse" size={20} />
                  </div>
                  
                  <div className="flex items-center mb-6 relative z-10">
                    <div className="w-10 h-10 bg-gradient-to-br from-cyan-500 to-blue-600 rounded-2xl flex items-center justify-center mr-3">
                      <TrendingUp className="text-white" size={20} />
                    </div>
                    <h2 className="text-xl font-black text-transparent bg-clip-text bg-gradient-to-r from-cyan-600 to-blue-600">Recent Transactions</h2>
        </div>

                  <div className="space-y-3 relative z-10 max-h-96 overflow-y-auto">
              {data.recentTransactions.slice(0, 5).map((transaction, index) => (
                      <div key={index} className="group relative overflow-hidden bg-white/90 rounded-xl p-3 border-2 border-cyan-100 shadow-lg hover:shadow-xl transition-all duration-300 transform hover:scale-105">
                        <div className="absolute inset-0 bg-gradient-to-br from-cyan-50/50 to-blue-50/50"></div>
                        <div className="flex justify-between items-center relative z-10">
                          <div className="flex items-center">
                            <div className={`w-8 h-8 rounded-lg flex items-center justify-center mr-3 ${
                              transaction.amount > 0 
                                ? 'bg-gradient-to-br from-green-500 to-emerald-600' 
                                : 'bg-gradient-to-br from-red-500 to-pink-600'
                            }`}>
                              {transaction.amount > 0 ? (
                                <TrendingUp className="text-white" size={16} />
                              ) : (
                                <DollarSign className="text-white" size={16} />
                              )}
                            </div>
                            <div>
                              <p className="font-bold text-gray-800 text-sm">{transaction.description || transaction.type}</p>
                              <p className="text-xs text-gray-600">Transaction #{index + 1}</p>
                            </div>
                          </div>
                          <div className="text-right">
                            <p className={`text-lg font-black ${transaction.amount > 0 ? 'text-green-600' : 'text-red-600'}`}>
                              {transaction.amount > 0 ? '+' : ''}${Math.abs(transaction.amount).toFixed(2)}
                            </p>
                            <p className="text-xs text-gray-500 font-medium">
                              {new Date(transaction.timestamp).toLocaleDateString()}
                            </p>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              ) : (
                <div className="bg-white/95 backdrop-blur-sm rounded-3xl p-4 sm:p-6 shadow-2xl border-2 border-gradient-to-r from-gray-200 to-gray-300 relative overflow-hidden h-full">
                  <div className="text-center py-8">
                    <div className="w-16 h-16 bg-gradient-to-br from-gray-300 to-gray-400 rounded-2xl flex items-center justify-center mx-auto mb-4">
                      <TrendingUp className="text-white" size={32} />
                    </div>
                    <p className="text-lg font-bold text-gray-700 mb-1">No transactions yet</p>
                    <p className="text-sm text-gray-600">Your transaction history will appear here</p>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
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