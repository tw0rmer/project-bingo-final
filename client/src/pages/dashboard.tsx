import React, { useState, useEffect } from 'react';
import { SiteLayout } from '@/components/SiteLayout';
import { useLocation } from 'wouter';
import { useAuth } from '../contexts/AuthContext';
import { useSocket } from '../contexts/SocketContext';
import { apiRequest } from '../lib/api';
import ConnectionStatus from '../components/ConnectionStatus';

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

  // Helper function to safely get balance as number
  const getBalanceAsNumber = (balance: number | string): number => {
    return typeof balance === 'string' ? parseFloat(balance) || 0 : balance;
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
    setLocation(`/lobby/${lobbyId}`);
  };

  const handleLogout = () => {
    logout();
    setLocation('/');
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
      <div className="max-w-6xl mx-auto p-6">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center space-x-4">
            <h1 className="text-2xl font-bold">Dashboard</h1>
            <div className="text-sm text-gray-600">
              Welcome, {user.username || user.email}
              {user.isAdmin && <span className="ml-2 bg-casino-gold text-dark-brown px-2 py-0.5 rounded text-xs">ADMIN</span>}
            </div>
          </div>
          <div className="flex items-center space-x-4">
            <ConnectionStatus showDetails={true} className="text-sm" />
            {user.isAdmin && (
              <button
                onClick={() => setLocation('/admin')}
                className="bg-casino-red hover:opacity-90 px-4 py-2 rounded text-sm font-medium text-white"
              >
                Admin Dashboard
              </button>
            )}
            <button
              onClick={logout}
              className="bg-gray-800 hover:bg-gray-900 px-4 py-2 rounded text-sm text-white border border-gray-700"
            >
              Logout
            </button>
          </div>
        </div>
        {/* User Info */}
        <div className="mb-8 rounded-lg bg-white p-6 shadow border border-gray-200">
          <h2 className="mb-4 text-xl font-bold">Account Information</h2>
          <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
            <div>
              <p className="text-gray-600">Email</p>
              <p className="text-lg text-gray-900">{data.user.email}</p>
            </div>
            <div>
              <p className="text-gray-600">Balance</p>
              <p className="text-lg font-bold text-green-700">${getBalanceAsNumber(data.user.balance)}</p>
            </div>
          </div>
        </div>

        {/* Available Lobbies */}
        <div className="mb-8 rounded-lg bg-white p-6 shadow border-2 border-casino-gold">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-xl font-bold">Available Lobbies</h2>
            <button
              onClick={fetchDashboardData}
              className="text-sm text-gray-600 hover:text-gray-900"
            >
              🔄 Refresh
            </button>
          </div>
          {!data.lobbies || data.lobbies.length === 0 ? (
            <p className="text-gray-600">No lobbies available at the moment.</p>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              {data.lobbies.map((room) => (
                <div key={room.id} className="bg-gradient-to-br from-light-cream to-white rounded-xl shadow-lg border-2 border-casino-gold p-6 hover:shadow-xl transition-all">
                  <div className="flex justify-between items-start mb-4">
                    <div>
                      <h3 className="text-xl font-bold casino-red">{room.name}</h3>
                      <p className="text-gray-600">Lobby #{room.id}</p>
                    </div>
                    <span className={`px-2 py-1 rounded text-xs font-bold ${room.status==='active'?'bg-green-100 text-green-800': room.status==='finished'?'bg-purple-100 text-purple-800':'bg-yellow-100 text-yellow-800'}`}>{room.status.toUpperCase()}</span>
                  </div>
                  <div className="space-y-3 mb-6">
                    <div className="flex justify-between"><span className="text-gray-700">Players:</span><span className="font-semibold">{room.seatsTaken}/{room.maxSeats}</span></div>
                    <div className="flex justify-between"><span className="text-gray-700">Prize Pool:</span><span className="font-bold casino-gold">${(parseFloat(room.entryFee)*room.seatsTaken).toFixed(2)}</span></div>
                    <div className="flex justify-between"><span className="text-gray-700">Entry Fee:</span><span className="font-semibold">${room.entryFee}</span></div>
                    <div className="flex justify-between"><span className="text-gray-700">Status:</span><span className={`font-semibold ${room.status==='active'?'text-green-600':room.status==='finished'?'text-purple-600':'casino-red'}`}>{room.status}</span></div>
                  </div>
                  <div className="flex space-x-2">
                    <button onClick={() => handleViewLobby(room.id)} className="flex-1 rounded bg-blue-600 px-4 py-2 text-white hover:bg-blue-700">View Lobby</button>
                    <button onClick={() => handleViewLobby(room.id)} className="rounded bg-casino-gold px-4 py-2 text-white hover:bg-yellow-500" disabled={room.seatsTaken >= room.maxSeats || room.status !== 'waiting'}>
                      {room.seatsTaken >= room.maxSeats ? 'Full' : room.status !== 'waiting' ? 'Started' : 'Join'}
                    </button>
                  </div>
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

        {/* Admin Panel */}
        {data.user.isAdmin && (
          <div className="mt-6 rounded-lg bg-rose-50 p-6 shadow border border-rose-100">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-xl font-bold mb-2 text-casino-red">Admin Panel</h2>
                <p className="text-gray-700">Access admin controls for users, lobbies, and transactions</p>
              </div>
              <button
                onClick={() => setLocation('/admin')}
                className="rounded-lg bg-casino-gold px-6 py-3 text-white hover:bg-yellow-500 font-semibold text-lg flex items-center space-x-2"
              >
                <span>🛠️</span>
                <span>Open Admin Dashboard</span>
              </button>
            </div>
            <div className="mt-4 grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="bg-white rounded p-3 border border-rose-100">
                <div className="text-gray-600 text-sm">User Management</div>
                <div className="text-casino-red font-medium">Manage accounts & balances</div>
              </div>
              <div className="bg-white rounded p-3 border border-rose-100">
                <div className="text-gray-600 text-sm">Lobby Control</div>
                <div className="text-casino-red font-medium">Create & manage game rooms</div>
              </div>
              <div className="bg-white rounded p-3 border border-rose-100">
                <div className="text-gray-600 text-sm">Transaction Monitor</div>
                <div className="text-casino-red font-medium">View all financial activity</div>
              </div>
            </div>
          </div>
        )}
      </div>
    </SiteLayout>
  );
}