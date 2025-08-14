import React, { useState, useEffect } from 'react';
import { SiteLayout } from '@/components/SiteLayout';
import { useLocation } from 'wouter';
import { useAuth } from '@/contexts/AuthContext';
import { authApiRequest } from '@/lib/api';

interface User {
  id: number;
  email: string;
  balance: string;
  isAdmin: boolean;
  createdAt: string;
}

interface Lobby {
  id: number;
  name: string;
  entryFee: string;
  maxSeats: number;
  seatsTaken: number;
  status: string;
  createdAt: string;
}

interface Transaction {
  id: number;
  userId: number;
  amount: string;
  type: string;
  description: string;
  createdAt: string;
}

export default function AdminPage() {
  const [activeTab, setActiveTab] = useState<'users' | 'lobbies' | 'transactions'>('users');
  const [users, setUsers] = useState<User[]>([]);
  const [lobbies, setLobbies] = useState<Lobby[]>([]);
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [gameMetaByLobby, setGameMetaByLobby] = useState<Record<number, { isPaused: boolean }>>({});
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [, setLocation] = useLocation();
  const { user, logout } = useAuth();

  // Form states
  const [showCreateLobby, setShowCreateLobby] = useState(false);
  const [showEditUser, setShowEditUser] = useState<User | null>(null);
  const [showEditLobby, setShowEditLobby] = useState<Lobby | null>(null);
  const [showBanConfirm, setShowBanConfirm] = useState<any>(null);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState<any>(null);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      setLoading(true);
      const [usersData, lobbiesData, transactionsData] = await Promise.all([
        authApiRequest<User[]>('/admin/users'),
        authApiRequest<Lobby[]>('/admin/lobbies'),
        authApiRequest<Transaction[]>('/admin/wallet-transactions')
      ]);
      
      setUsers(usersData);
      setLobbies(lobbiesData);
      setTransactions(transactionsData);

      // Fetch live game snapshots for active lobbies to know pause state
      const metaEntries: Array<[number, { isPaused: boolean }]> = [];
      await Promise.all(
        lobbiesData
          .filter((l) => l.status === 'active')
          .map(async (l) => {
            try {
              const snap = await authApiRequest<any>(`/games/${l.id}/snapshot`);
              metaEntries.push([l.id, { isPaused: !!snap?.isPaused }]);
            } catch {
              // ignore when no active game
            }
          })
      );
      setGameMetaByLobby(Object.fromEntries(metaEntries));
    } catch (error: any) {
      console.error('Failed to fetch admin data:', error);
      if (error.message.includes('403')) {
        setError('Access denied. Admin privileges required.');
      } else {
        setError(error.message || 'Failed to load admin data');
      }
    } finally {
      setLoading(false);
    }
  };

  const updateUserBalance = async (userId: number, amount: number, description: string) => {
    try {
      await authApiRequest(`/admin/users/${userId}/balance`, {
        method: 'PUT',
        body: JSON.stringify({ amount: amount.toString(), description })
      });
      fetchData(); // Refresh data
    } catch (error: any) {
      setError(error.message || 'Failed to update user balance');
    }
  };

  const toggleUserAdmin = async (userId: number, isAdmin: boolean) => {
    try {
      await authApiRequest(`/admin/users/${userId}/admin`, {
        method: 'PUT',
        body: JSON.stringify({ isAdmin })
      });
      fetchData(); // Refresh data
    } catch (error: any) {
      setError(error.message || 'Failed to update admin status');
    }
  };

  const createLobby = async (name: string, entryFee: number, maxSeats: number) => {
    try {
      await authApiRequest('/admin/lobbies', {
        method: 'POST',
        body: JSON.stringify({ name, entryFee: entryFee.toString(), maxSeats })
      });
      setShowCreateLobby(false);
      fetchData(); // Refresh data
    } catch (error: any) {
      setError(error.message || 'Failed to create lobby');
    }
  };

  const updateLobby = async (lobbyId: number, updates: Partial<Lobby>) => {
    try {
      await authApiRequest(`/admin/lobbies/${lobbyId}`, {
        method: 'PUT',
        body: JSON.stringify(updates)
      });
      setShowEditLobby(null);
      fetchData(); // Refresh data
    } catch (error: any) {
      setError(error.message || 'Failed to update lobby');
    }
  };

  const deleteLobby = async (lobbyId: number) => {
    if (!confirm('Are you sure you want to delete this lobby?')) return;
    
    try {
      await authApiRequest(`/admin/lobbies/${lobbyId}`, {
        method: 'DELETE'
      });
      fetchData(); // Refresh data
    } catch (error: any) {
      setError(error.message || 'Failed to delete lobby');
    }
  };

  const fillLobbyWithBots = async (lobbyId: number) => {
    try {
      const countStr = prompt('How many bots to add?');
      const count = Math.max(0, parseInt(countStr || '0'));
      await authApiRequest(`/admin/lobbies/${lobbyId}/fill-bots`, {
        method: 'POST',
        body: JSON.stringify({ count })
      });
      fetchData();
    } catch (error: any) {
      setError(error.message || 'Failed to fill lobby with bots');
    }
  };

  const resetLobby = async (lobbyId: number) => {
    try {
      await authApiRequest(`/admin/lobbies/${lobbyId}/reset`, { method: 'POST' });
      fetchData();
    } catch (error: any) {
      setError(error.message || 'Failed to reset lobby');
    }
  };

  // User ban/delete handlers
  const handleBanUser = (userId: number, email: string) => {
    setShowBanConfirm({ userId, email });
  };

  const handleDeleteUser = (userId: number, email: string) => {
    setShowDeleteConfirm({ userId, email });
  };

  const confirmBanUser = async () => {
    if (!showBanConfirm) return;
    try {
      await authApiRequest(`/admin/users/${showBanConfirm.userId}/ban`, { method: 'POST' });
      setShowBanConfirm(null);
      fetchData();
    } catch (error: any) {
      setError(error.message || 'Failed to ban user');
    }
  };

  const confirmDeleteUser = async () => {
    if (!showDeleteConfirm) return;
    try {
      await authApiRequest(`/admin/users/${showDeleteConfirm.userId}`, { method: 'DELETE' });
      setShowDeleteConfirm(null);
      fetchData();
    } catch (error: any) {
      setError(error.message || 'Failed to delete user');
    }
  };

  const startLobbyGame = async (lobbyId: number) => {
    try { await authApiRequest(`/admin/lobbies/${lobbyId}/start`, { method: 'POST' }); fetchData(); } catch (error: any) { setError(error.message || 'Failed to start lobby game'); }
  };
  const pauseLobbyGame = async (lobbyId: number) => {
    try { await authApiRequest(`/games/${lobbyId}/pause`, { method: 'POST' }); setGameMetaByLobby(prev => ({ ...prev, [lobbyId]: { isPaused: true } })); } catch (e:any){ setError(e.message||'Failed to pause'); }
  };
  const resumeLobbyGame = async (lobbyId: number) => {
    try { await authApiRequest(`/games/${lobbyId}/resume`, { method: 'POST' }); setGameMetaByLobby(prev => ({ ...prev, [lobbyId]: { isPaused: false } })); } catch (e:any){ setError(e.message||'Failed to resume'); }
  };
  const stopLobbyGame = async (lobbyId: number) => {
    try { await authApiRequest(`/games/${lobbyId}/stop`, { method: 'POST' }); fetchData(); } catch (e:any){ setError(e.message||'Failed to stop'); }
  };
  const setLobbySpeed = async (lobbyId: number) => {
    try {
      const ms = parseInt(prompt('Call interval (ms)? 1000-5000') || '3000', 10);
      await authApiRequest(`/games/${lobbyId}/speed`, { method: 'POST', body: JSON.stringify({ ms }) });
    } catch (e:any){ setError(e.message||'Failed to set speed'); }
  };

  if (loading) {
    return (
      <SiteLayout hideAuthButtons>
        <div className="flex items-center justify-center pt-20">
          <div className="text-center">
            <div className="mb-4 h-8 w-8 animate-spin rounded-full border-b-2 border-gray-900"></div>
            <p className="text-gray-800">Loading admin panel...</p>
          </div>
        </div>
      </SiteLayout>
    );
  }

  if (error) {
    return (
      <SiteLayout hideAuthButtons>
        <div className="flex items-center justify-center pt-20">
          <div className="text-center">
            <p className="mb-4 text-red-600">Error: {error}</p>
            <div className="space-x-4">
              <button
                onClick={() => window.location.reload()}
                className="rounded bg-blue-600 px-4 py-2 text-white hover:bg-blue-700"
              >
                Retry
              </button>
              <button
                onClick={() => setLocation('/dashboard')}
                className="rounded bg-gray-800 px-4 py-2 text-white hover:bg-gray-900"
              >
                Back to Dashboard
              </button>
            </div>
          </div>
        </div>
      </SiteLayout>
    );
  }

  return (
    <SiteLayout hideAuthButtons>
      <main className="mx-auto max-w-7xl p-3 sm:p-4">
        {/* Header */}
        <div className="mb-4 sm:mb-6">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
            <div>
              <h1 className="text-2xl sm:text-3xl font-bold text-gray-900">Admin Panel</h1>
              <p className="text-sm text-gray-600 mt-1">Manage users, lobbies, and transactions</p>
            </div>
            <button
              onClick={() => setLocation('/dashboard')}
              className="text-casino-red hover:opacity-80 text-sm font-medium self-start sm:self-auto"
            >
              ← Back to Dashboard
            </button>
          </div>
        </div>

        {/* Mobile-Responsive Tabs */}
        <div className="mb-4 sm:mb-6">
          <div className="border-b border-gray-200">
            <nav className="flex space-x-1 overflow-x-auto pb-2 scrollbar-hide">
              {[
                { id: 'users', label: 'Users', count: users.length, icon: '👥' },
                { id: 'lobbies', label: 'Lobbies', count: lobbies.length, icon: '🏠' },
                { id: 'transactions', label: 'Transactions', count: transactions.length, icon: '💰' }
              ].map((tab) => (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id as any)}
                  className={`flex-shrink-0 flex items-center gap-2 py-2 px-3 border-b-2 font-medium text-sm transition-colors ${
                    activeTab === tab.id
                      ? 'border-casino-gold text-casino-red bg-yellow-50'
                      : 'border-transparent text-gray-600 hover:text-gray-800 hover:border-gray-300'
                  }`}
                >
                  <span className="text-base">{tab.icon}</span>
                  <span className="whitespace-nowrap">{tab.label}</span>
                  <span className="bg-gray-100 text-gray-700 px-1.5 py-0.5 rounded-full text-xs">
                    {tab.count}
                  </span>
                </button>
              ))}
            </nav>
          </div>
        </div>

        {/* Users Tab */}
        {activeTab === 'users' && (
          <div className="space-y-4">
            {/* Mobile-First Card Layout */}
            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
              {users.map((user) => (
                <div key={user.id} className="bg-white rounded-lg border border-gray-200 p-4 shadow-sm hover:shadow-md transition-shadow">
                  <div className="flex items-start justify-between mb-3">
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-1">
                        <span className="text-xs font-medium text-gray-500">ID #{user.id}</span>
                        {user.isAdmin && (
                          <span className="bg-casino-gold text-white px-2 py-0.5 rounded text-xs font-bold">ADMIN</span>
                        )}
                      </div>
                      <h3 className="font-medium text-gray-900 truncate">{user.email}</h3>
                      <p className="text-sm text-gray-600">Created: {new Date(user.createdAt).toLocaleDateString()}</p>
                    </div>
                  </div>
                  
                  <div className="mb-3">
                    <div className="text-xs text-gray-500 mb-1">Balance</div>
                    <div className="text-lg font-bold text-green-600">${parseFloat(user.balance).toFixed(2)}</div>
                  </div>
                  
                  <div className="flex flex-col gap-2">
                    <button
                      onClick={() => setShowEditUser(user)}
                      className="w-full bg-blue-600 hover:bg-blue-700 text-white py-1.5 px-3 rounded text-sm font-medium transition-colors"
                    >
                      Edit Balance
                    </button>
                    <div className="flex gap-2">
                      <button
                        onClick={() => toggleUserAdmin(user.id, !user.isAdmin)}
                        className={`flex-1 py-1.5 px-3 rounded text-sm font-medium transition-colors ${
                          user.isAdmin 
                            ? 'bg-red-100 hover:bg-red-200 text-red-800' 
                            : 'bg-green-100 hover:bg-green-200 text-green-800'
                        }`}
                      >
                        {user.isAdmin ? 'Remove Admin' : 'Make Admin'}
                      </button>
                      <button
                        onClick={() => handleBanUser(user.id, user.email)}
                        className="bg-orange-100 hover:bg-orange-200 text-orange-800 py-1.5 px-3 rounded text-sm font-medium transition-colors"
                        title="Ban User"
                      >
                        🚫
                      </button>
                    </div>
                    <button
                      onClick={() => handleDeleteUser(user.id, user.email)}
                      className="w-full bg-red-100 hover:bg-red-200 text-red-800 py-1.5 px-3 rounded text-sm font-medium transition-colors"
                    >
                      🗑️ Delete User
                    </button>
                  </div>
                </div>
              ))}
            </div>
            
            {users.length === 0 && (
              <div className="text-center py-8 text-gray-500">
                No users found
              </div>
            )}
          </div>
        )}

        {/* Mobile-Friendly Lobbies Tab */}
        {showBanConfirm && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-lg p-6 max-w-md w-full">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">⚠️ Ban User</h3>
              <p className="text-gray-600 mb-6">
                Are you sure you want to ban <strong>{showBanConfirm.email}</strong>? 
                This will prevent them from logging in and playing games.
              </p>
              <div className="flex gap-3">
                <button
                  onClick={confirmBanUser}
                  className="flex-1 bg-red-600 hover:bg-red-700 text-white py-2 px-4 rounded font-medium"
                >
                  Ban User
                </button>
                <button
                  onClick={() => setShowBanConfirm(null)}
                  className="flex-1 bg-gray-300 hover:bg-gray-400 text-gray-800 py-2 px-4 rounded font-medium"
                >
                  Cancel
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Delete User Confirmation Modal */}
        {showDeleteConfirm && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-lg p-6 max-w-md w-full">
              <h3 className="text-lg font-semibold text-red-900 mb-4">🗑️ Delete User</h3>
              <p className="text-gray-600 mb-4">
                <strong>DANGER:</strong> This will permanently delete user <strong>{showDeleteConfirm.email}</strong> and all their data.
              </p>
              <p className="text-red-600 text-sm mb-6">
                This action cannot be undone!
              </p>
              <div className="flex gap-3">
                <button
                  onClick={confirmDeleteUser}
                  className="flex-1 bg-red-600 hover:bg-red-700 text-white py-2 px-4 rounded font-medium"
                >
                  Delete Permanently
                </button>
                <button
                  onClick={() => setShowDeleteConfirm(null)}
                  className="flex-1 bg-gray-300 hover:bg-gray-400 text-gray-800 py-2 px-4 rounded font-medium"
                >
                  Cancel
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Mobile-Friendly Lobbies Tab */}
        {activeTab === 'lobbies' && (
          <div className="space-y-4">
            <div className="flex flex-col sm:flex-row gap-2 sm:items-center sm:justify-between">
              <h2 className="text-lg font-semibold text-gray-900">Lobby Management</h2>
              <button
                onClick={() => setShowCreateLobby(true)}
                className="bg-casino-gold hover:bg-yellow-500 text-white py-2 px-4 rounded-lg font-medium text-sm self-start sm:self-auto"
              >
                + Create Lobby
              </button>
            </div>
            
            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
              {lobbies.map((lobby) => (
                <div key={lobby.id} className="bg-white rounded-lg border border-gray-200 p-4 shadow-sm">
                  <div className="flex items-start justify-between mb-3">
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-1">
                        <span className="text-xs font-medium text-gray-500">ID #{lobby.id}</span>
                        <span className={`px-2 py-0.5 rounded-full text-xs font-bold ${
                          lobby.status === 'active' ? 'bg-green-100 text-green-700' :
                          lobby.status === 'finished' ? 'bg-purple-100 text-purple-700' :
                          'bg-yellow-100 text-yellow-700'
                        }`}>
                          {lobby.status.toUpperCase()}
                        </span>
                      </div>
                      <h3 className="font-medium text-gray-900 mb-1">{lobby.name}</h3>
                      <p className="text-sm text-gray-600">Created: {new Date(lobby.createdAt).toLocaleDateString()}</p>
                    </div>
                  </div>
                  
                  <div className="grid grid-cols-3 gap-2 mb-3 text-center">
                    <div>
                      <div className="text-xs text-gray-500">Entry</div>
                      <div className="font-bold text-casino-red">${lobby.entryFee}</div>
                    </div>
                    <div>
                      <div className="text-xs text-gray-500">Players</div>
                      <div className="font-bold text-gray-900">{lobby.seatsTaken}/{lobby.maxSeats}</div>
                    </div>
                    <div>
                      <div className="text-xs text-gray-500">Prize</div>
                      <div className="font-bold text-green-600">${(parseFloat(lobby.entryFee) * lobby.seatsTaken * 0.9).toFixed(0)}</div>
                    </div>
                  </div>
                  
                  <div className="space-y-2">
                    {lobby.status === 'waiting' && (
                      <div className="grid grid-cols-2 gap-2">
                        <button
                          onClick={() => startLobbyGame(lobby.id)}
                          className="bg-green-600 hover:bg-green-700 text-white py-1.5 px-2 rounded text-xs font-medium"
                        >
                          Start
                        </button>
                        <button
                          onClick={() => fillLobbyWithBots(lobby.id)}
                          className="bg-blue-600 hover:bg-blue-700 text-white py-1.5 px-2 rounded text-xs font-medium"
                        >
                          Add Bots
                        </button>
                      </div>
                    )}
                    
                    {lobby.status === 'active' && (
                      <div className="grid grid-cols-3 gap-1">
                        <button
                          onClick={() => gameMetaByLobby[lobby.id]?.isPaused ? resumeLobbyGame(lobby.id) : pauseLobbyGame(lobby.id)}
                          className="bg-indigo-600 hover:bg-indigo-700 text-white py-1.5 px-1 rounded text-xs font-medium"
                        >
                          {gameMetaByLobby[lobby.id]?.isPaused ? 'Resume' : 'Pause'}
                        </button>
                        <button
                          onClick={() => setLobbySpeed(lobby.id)}
                          className="bg-purple-600 hover:bg-purple-700 text-white py-1.5 px-1 rounded text-xs font-medium"
                        >
                          Speed
                        </button>
                        <button
                          onClick={() => stopLobbyGame(lobby.id)}
                          className="bg-yellow-600 hover:bg-yellow-700 text-white py-1.5 px-1 rounded text-xs font-medium"
                        >
                          Stop
                        </button>
                      </div>
                    )}
                    
                    <div className="grid grid-cols-3 gap-1 pt-2 border-t border-gray-100">
                      <button
                        onClick={() => setShowEditLobby(lobby)}
                        className="bg-gray-600 hover:bg-gray-700 text-white py-1.5 px-1 rounded text-xs font-medium"
                      >
                        Edit
                      </button>
                      <button
                        onClick={() => resetLobby(lobby.id)}
                        className="bg-orange-600 hover:bg-orange-700 text-white py-1.5 px-1 rounded text-xs font-medium"
                      >
                        Reset
                      </button>
                      <button
                        onClick={() => deleteLobby(lobby.id)}
                        className="bg-red-600 hover:bg-red-700 text-white py-1.5 px-1 rounded text-xs font-medium"
                      >
                        Delete
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
            
            {lobbies.length === 0 && (
              <div className="text-center py-8 text-gray-500">
                No lobbies found
              </div>
            )}
          </div>
        )}

        {/* Mobile-Friendly Transactions Tab */}
        {activeTab === 'transactions' && (
          <div className="space-y-4">
            <h2 className="text-lg font-semibold text-gray-900">Recent Transactions</h2>
            
            <div className="space-y-3">
              {transactions.map((transaction) => (
                <div key={transaction.id} className="bg-white rounded-lg border border-gray-200 p-4 shadow-sm">
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-1">
                        <span className="text-xs font-medium text-gray-500">ID #{transaction.id}</span>
                        <span className={`px-2 py-0.5 rounded-full text-xs font-bold ${
                          parseFloat(transaction.amount) > 0 ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'
                        }`}>
                          {transaction.type.toUpperCase()}
                        </span>
                      </div>
                      <p className="font-medium text-gray-900 mb-1">{transaction.description}</p>
                      <p className="text-xs text-gray-500">
                        User #{transaction.userId} • {new Date(transaction.createdAt).toLocaleString()}
                      </p>
                    </div>
                    <div className="text-right">
                      <div className={`text-lg font-bold ${
                        parseFloat(transaction.amount) > 0 ? 'text-green-600' : 'text-red-600'
                      }`}>
                        {parseFloat(transaction.amount) > 0 ? '+' : ''}${parseFloat(transaction.amount).toFixed(2)}
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
            
            {transactions.length === 0 && (
              <div className="text-center py-8 text-gray-500">
                No transactions found
              </div>
            )}
          </div>
        )}
      </main>

      {/* Modals - outside main content */}
      {/* Ban User Confirmation Modal */}
      {showBanConfirm && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg p-6 max-w-md w-full">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">⚠️ Ban User</h3>
            <p className="text-gray-600 mb-6">
              Are you sure you want to ban <strong>{showBanConfirm.email}</strong>? 
              This will prevent them from logging in and playing games.
            </p>
            <div className="flex gap-3">
              <button
                onClick={confirmBanUser}
                className="flex-1 bg-red-600 hover:bg-red-700 text-white py-2 px-4 rounded font-medium"
              >
                Ban User
              </button>
              <button
                onClick={() => setShowBanConfirm(null)}
                className="flex-1 bg-gray-300 hover:bg-gray-400 text-gray-800 py-2 px-4 rounded font-medium"
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Delete User Confirmation Modal */}
      {showDeleteConfirm && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg p-6 max-w-md w-full">
            <h3 className="text-lg font-semibold text-red-900 mb-4">🗑️ Delete User</h3>
            <p className="text-gray-600 mb-4">
              <strong>DANGER:</strong> This will permanently delete user <strong>{showDeleteConfirm.email}</strong> and all their data.
            </p>
            <p className="text-red-600 text-sm mb-6">
              This action cannot be undone!
            </p>
            <div className="flex gap-3">
              <button
                onClick={confirmDeleteUser}
                className="flex-1 bg-red-600 hover:bg-red-700 text-white py-2 px-4 rounded font-medium"
              >
                Delete Permanently
              </button>
              <button
                onClick={() => setShowDeleteConfirm(null)}
                className="flex-1 bg-gray-300 hover:bg-gray-400 text-gray-800 py-2 px-4 rounded font-medium"
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Additional Modals */}
      {showEditUser && (
        <EditUserModal
          user={showEditUser}
          onClose={() => setShowEditUser(null)}
          onSubmit={(amount, description) => {
            updateUserBalance(showEditUser.id, amount, description);
            setShowEditUser(null);
          }}
        />
      )}

      {showCreateLobby && (
        <CreateLobbyModal
          onClose={() => setShowCreateLobby(false)}
          onSubmit={createLobby}
        />
      )}

      {showEditLobby && (
        <EditLobbyModal
          lobby={showEditLobby}
          onClose={() => setShowEditLobby(null)}
          onSubmit={(updates) => updateLobby(showEditLobby.id, updates)}
        />
      )}
    </SiteLayout>
  );
}

// Edit User Modal Component
function EditUserModal({ user, onClose, onSubmit }: {
  user: User;
  onClose: () => void;
  onSubmit: (amount: number, description: string) => void;
}) {
  const [amount, setAmount] = useState('');
  const [description, setDescription] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const numAmount = parseFloat(amount);
    if (isNaN(numAmount)) return;
    onSubmit(numAmount, description);
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-gray-800 rounded-lg p-6 w-full max-w-md">
        <h3 className="text-lg font-bold mb-4">Edit User Balance</h3>
        <p className="text-gray-400 mb-4">
          User: {user.email} (Current Balance: ${user.balance})
        </p>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium mb-2">Amount (+ for credit, - for debit)</label>
            <input
              type="number"
              step="0.01"
              value={amount}
              onChange={(e) => setAmount(e.target.value)}
              className="w-full bg-gray-700 border border-gray-600 rounded px-3 py-2"
              placeholder="e.g., 100 or -50"
              required
            />
          </div>
          <div>
            <label className="block text-sm font-medium mb-2">Description</label>
            <input
              type="text"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              className="w-full bg-gray-700 border border-gray-600 rounded px-3 py-2"
              placeholder="Reason for balance change"
            />
          </div>
          <div className="flex space-x-4">
            <button
              type="submit"
              className="flex-1 bg-blue-600 py-2 rounded hover:bg-blue-700"
            >
              Update Balance
            </button>
            <button
              type="button"
              onClick={onClose}
              className="flex-1 bg-gray-600 py-2 rounded hover:bg-gray-700"
            >
              Cancel
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

// Create Lobby Modal Component
function CreateLobbyModal({ onClose, onSubmit }: {
  onClose: () => void;
  onSubmit: (name: string, entryFee: number, maxSeats: number) => void;
}) {
  const [name, setName] = useState('');
  const [entryFee, setEntryFee] = useState('');
  const [maxSeats, setMaxSeats] = useState('15');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const fee = parseFloat(entryFee);
    const seats = parseInt(maxSeats);
    if (!name || isNaN(fee) || isNaN(seats)) return;
    onSubmit(name, fee, seats);
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-gray-800 rounded-lg p-6 w-full max-w-md">
        <h3 className="text-lg font-bold mb-4">Create New Lobby</h3>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium mb-2">Lobby Name</label>
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="w-full bg-gray-700 border border-gray-600 rounded px-3 py-2"
              placeholder="e.g., Evening Bingo"
              required
            />
          </div>
          <div>
            <label className="block text-sm font-medium mb-2">Entry Fee ($)</label>
            <input
              type="number"
              step="0.01"
              value={entryFee}
              onChange={(e) => setEntryFee(e.target.value)}
              className="w-full bg-gray-700 border border-gray-600 rounded px-3 py-2"
              placeholder="e.g., 10.00"
              required
            />
          </div>
          <div>
            <label className="block text-sm font-medium mb-2">Max Seats</label>
            <input
              type="number"
              value={maxSeats}
              onChange={(e) => setMaxSeats(e.target.value)}
              className="w-full bg-gray-700 border border-gray-600 rounded px-3 py-2"
              placeholder="15"
              min="1"
              max="50"
              required
            />
          </div>
          <div className="flex space-x-4">
            <button
              type="submit"
              className="flex-1 bg-green-600 py-2 rounded hover:bg-green-700"
            >
              Create Lobby
            </button>
            <button
              type="button"
              onClick={onClose}
              className="flex-1 bg-gray-600 py-2 rounded hover:bg-gray-700"
            >
              Cancel
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

// Edit Lobby Modal Component
function EditLobbyModal({ lobby, onClose, onSubmit }: {
  lobby: Lobby;
  onClose: () => void;
  onSubmit: (updates: Partial<Lobby>) => void;
}) {
  const [name, setName] = useState(lobby.name);
  const [entryFee, setEntryFee] = useState(lobby.entryFee);
  const [maxSeats, setMaxSeats] = useState(lobby.maxSeats.toString());
  const [status, setStatus] = useState(lobby.status);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const fee = parseFloat(entryFee);
    const seats = parseInt(maxSeats);
    if (!name || isNaN(fee) || isNaN(seats)) return;
    
    onSubmit({
      name,
      entryFee: fee.toString(),
      maxSeats: seats,
      status
    });
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-gray-800 rounded-lg p-6 w-full max-w-md">
        <h3 className="text-lg font-bold mb-4">Edit Lobby</h3>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium mb-2">Lobby Name</label>
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="w-full bg-gray-700 border border-gray-600 rounded px-3 py-2"
              required
            />
          </div>
          <div>
            <label className="block text-sm font-medium mb-2">Entry Fee ($)</label>
            <input
              type="number"
              step="0.01"
              value={entryFee}
              onChange={(e) => setEntryFee(e.target.value)}
              className="w-full bg-gray-700 border border-gray-600 rounded px-3 py-2"
              required
            />
          </div>
          <div>
            <label className="block text-sm font-medium mb-2">Max Seats</label>
            <input
              type="number"
              value={maxSeats}
              onChange={(e) => setMaxSeats(e.target.value)}
              className="w-full bg-gray-700 border border-gray-600 rounded px-3 py-2"
              min="1"
              max="50"
              required
            />
          </div>
          <div>
            <label className="block text-sm font-medium mb-2">Status</label>
            <select
              value={status}
              onChange={(e) => setStatus(e.target.value)}
              className="w-full bg-gray-700 border border-gray-600 rounded px-3 py-2"
            >
              <option value="waiting">Waiting</option>
              <option value="active">Active</option>
              <option value="finished">Finished</option>
            </select>
          </div>
          <div className="flex space-x-4">
            <button
              type="submit"
              className="flex-1 bg-blue-600 py-2 rounded hover:bg-blue-700"
            >
              Update Lobby
            </button>
            <button
              type="button"
              onClick={onClose}
              className="flex-1 bg-gray-600 py-2 rounded hover:bg-gray-700"
            >
              Cancel
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}