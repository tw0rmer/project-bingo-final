import React, { useState, useEffect } from 'react';
import { SiteLayout } from '@/components/SiteLayout';
import { useLocation } from 'wouter';
import { useAuth } from '@/contexts/AuthContext';
import { authApiRequest } from '@/lib/api';

interface User {
  id: number;
  email: string;
  username?: string;
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
  gamesCount?: number;
  maxGames?: number;
  description?: string;
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
  const [activeTab, setActiveTab] = useState<'users' | 'lobbies' | 'transactions' | 'prizes'>('users');
  const [users, setUsers] = useState<User[]>([]);
  const [lobbies, setLobbies] = useState<Lobby[]>([]);
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [gameMetaByLobby, setGameMetaByLobby] = useState<Record<number, { isPaused: boolean }>>({});
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [, setLocation] = useLocation();
  const { user, logout } = useAuth();

  // Search and selection states
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedUsers, setSelectedUsers] = useState<Set<number>>(new Set());
  const [selectAll, setSelectAll] = useState(false);

  // Form states
  const [showCreateLobby, setShowCreateLobby] = useState(false);
  const [showEditUser, setShowEditUser] = useState<User | null>(null);
  const [showEditLobby, setShowEditLobby] = useState<Lobby | null>(null);
  const [showBanConfirm, setShowBanConfirm] = useState<any>(null);
  
  // Game management states
  const [showGamesModal, setShowGamesModal] = useState<{lobbyId: number, lobbyName: string, games: any[]} | null>(null);
  const [loadingGames, setLoadingGames] = useState(false);
  
  // Prize pool states
  const [prizePoolInfo, setPrizePoolInfo] = useState<Record<number, any>>({});
  const [distributingPrize, setDistributingPrize] = useState<number | null>(null);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState<any>(null);
  const [showBulkDeleteConfirm, setShowBulkDeleteConfirm] = useState(false);

  useEffect(() => {
    fetchData();
  }, []);

  // Create new lobby
  const handleCreateLobby = async (e: React.FormEvent) => {
    e.preventDefault();
    const form = e.target as HTMLFormElement;
    const formData = new FormData(form);
    
    try {
      const lobbyData = {
        name: formData.get('name'),
        description: formData.get('description'),
        entryFee: formData.get('entryFee'),
        maxGames: formData.get('maxGames')
      };

      await authApiRequest('/lobbies/admin/create', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(lobbyData)
      });

      setShowCreateLobby(false);
      await fetchData(); // Refresh data
    } catch (error) {
      console.error('Create lobby error:', error);
      setError('Failed to create lobby');
    }
  };

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

  // New game management functions
  const viewLobbyGames = async (lobbyId: number) => {
    try {
      setLoadingGames(true);
      const [lobby, games] = await Promise.all([
        authApiRequest<Lobby>(`/lobbies/${lobbyId}`),
        authApiRequest<any[]>(`/lobbies/${lobbyId}/games`)
      ]);
      
      setShowGamesModal({
        lobbyId,
        lobbyName: lobby.name,
        games
      });
    } catch (error: any) {
      console.error('Failed to fetch lobby games:', error);
      setError('Failed to load lobby games');
    } finally {
      setLoadingGames(false);
    }
  };

  const addGameToLobby = async (lobbyId: number) => {
    try {
      await authApiRequest(`/admin/lobbies/${lobbyId}/games`, { 
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({}) // Let backend auto-generate game details
      });
      
      await fetchData(); // Refresh lobby data
      
      // If games modal is open, refresh it too
      if (showGamesModal && showGamesModal.lobbyId === lobbyId) {
        await viewLobbyGames(lobbyId);
      }
    } catch (error: any) {
      console.error('Failed to add game to lobby:', error);
      setError('Failed to add game to lobby');
    }
  };

  const deleteGame = async (gameId: number) => {
    try {
      await authApiRequest(`/admin/games/${gameId}`, { method: 'DELETE' });
      
      await fetchData(); // Refresh lobby data
      
      // Refresh games modal if open
      if (showGamesModal) {
        await viewLobbyGames(showGamesModal.lobbyId);
      }
    } catch (error: any) {
      console.error('Failed to delete game:', error);
      setError('Failed to delete game');
    }
  };

  const startGame = async (gameId: number) => {
    try {
      await authApiRequest(`/admin/games/${gameId}/start`, { method: 'POST' });
      
      // Refresh games modal if open
      if (showGamesModal) {
        await viewLobbyGames(showGamesModal.lobbyId);
      }
    } catch (error: any) {
      console.error('Failed to start game:', error);
      setError('Failed to start game');
    }
  };

  const resetLobbyGames = async (lobbyId: number) => {
    if (!confirm('Are you sure you want to reset this lobby? This will delete ALL games and clear all players.')) {
      return;
    }

    try {
      await authApiRequest(`/admin/lobbies/${lobbyId}/reset-games`, { method: 'POST' });
      
      await fetchData(); // Refresh lobby data
      
      // Refresh games modal if open
      if (showGamesModal && showGamesModal.lobbyId === lobbyId) {
        await viewLobbyGames(lobbyId);
      }
      
      setError('');
    } catch (error: any) {
      console.error('Failed to reset lobby games:', error);
      setError('Failed to reset lobby games');
    }
  };

  const resetGame = async (gameId: number) => {
    if (!confirm('Are you sure you want to reset this game? This will clear all players and refund their entry fees.')) {
      return;
    }

    try {
      await authApiRequest(`/admin/games/${gameId}/reset`, { method: 'POST' });
      
      await fetchData(); // Refresh lobby data
      
      // Refresh games modal if open
      if (showGamesModal) {
        await viewLobbyGames(showGamesModal.lobbyId);
      }
      
      setError('');
    } catch (error: any) {
      console.error('Failed to reset game:', error);
      setError('Failed to reset game');
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

  // Prize pool management functions
  const fetchPrizePoolInfo = async (lobbyId: number) => {
    try {
      const info = await authApiRequest(`/admin/prize-pool/${lobbyId}`);
      setPrizePoolInfo(prev => ({ ...prev, [lobbyId]: info }));
    } catch (error: any) {
      console.error('Failed to fetch prize pool info:', error);
    }
  };

  const distributePrize = async (lobbyId: number, winnerId: number) => {
    try {
      setDistributingPrize(lobbyId);
      const result = await authApiRequest(`/admin/distribute-prize/${lobbyId}`, {
        method: 'POST',
        body: JSON.stringify({ winnerId })
      });
      
      // Show success message
      alert(`Prize distributed successfully!\n\n` +
        `Winner: ${result.winnerUsername}\n` +
        `Lobby: ${result.lobbyName}\n` +
        `Total Pool: $${result.totalPrizePool}\n` +
        `House Take (30%): $${result.houseTake}\n` +
        `Winner Prize (70%): $${result.winnerPrize}`);
      
      // Refresh data
      await fetchData();
      await fetchPrizePoolInfo(lobbyId);
    } catch (error: any) {
      setError(error.message || 'Failed to distribute prize');
    } finally {
      setDistributingPrize(null);
    }
  };

  // Multi-select functionality
  const filteredUsers = users.filter(user => {
    if (!searchTerm) return true;
    const term = searchTerm.toLowerCase();
    return (
      user.email.toLowerCase().includes(term) ||
      user.id.toString().includes(term) ||
      (user.username && user.username.toLowerCase().includes(term))
    );
  });

  const handleSelectUser = (userId: number, checked: boolean) => {
    const newSelected = new Set(selectedUsers);
    if (checked) {
      newSelected.add(userId);
    } else {
      newSelected.delete(userId);
    }
    setSelectedUsers(newSelected);
    setSelectAll(newSelected.size === filteredUsers.length && filteredUsers.length > 0);
  };

  const handleSelectAll = (checked: boolean) => {
    if (checked) {
      const nonAdminUsers = filteredUsers.filter(user => !user.isAdmin);
      setSelectedUsers(new Set(nonAdminUsers.map(user => user.id)));
    } else {
      setSelectedUsers(new Set());
    }
    setSelectAll(checked);
  };

  const bulkDeleteUsers = async () => {
    try {
      const userIds = Array.from(selectedUsers);
      await authApiRequest('/admin/users/bulk-delete', {
        method: 'POST',
        body: JSON.stringify({ ids: userIds })
      });
      setSelectedUsers(new Set());
      setSelectAll(false);
      setShowBulkDeleteConfirm(false);
      fetchData();
    } catch (error: any) {
      setError(error.message || 'Failed to bulk delete users');
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
                { id: 'transactions', label: 'Transactions', count: transactions.length, icon: '💰' },
                { id: 'prizes', label: 'Prize Pools', count: lobbies.filter(l => l.seatsTaken > 0).length, icon: '🏆' }
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
            {/* Search and Multi-Select Controls */}
            <div className="bg-white rounded-lg border border-gray-200 p-4">
              <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center justify-between">
                <div className="flex-1 w-full sm:max-w-md">
                  <div className="relative">
                    <input
                      type="text"
                      placeholder="Search by email, username, or ID..."
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                      className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-casino-gold focus:border-transparent"
                    />
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                      <svg className="h-5 w-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                      </svg>
                    </div>
                  </div>
                </div>
                
                <div className="flex items-center gap-4 w-full sm:w-auto">
                  <div className="flex items-center gap-2">
                    <input
                      type="checkbox"
                      id="select-all"
                      checked={selectAll}
                      onChange={(e) => handleSelectAll(e.target.checked)}
                      className="w-4 h-4 text-casino-gold bg-gray-100 border-gray-300 rounded focus:ring-casino-gold"
                    />
                    <label htmlFor="select-all" className="text-sm font-medium text-gray-700">
                      Select All ({selectedUsers.size} selected)
                    </label>
                  </div>
                  
                  {selectedUsers.size > 0 && (
                    <button
                      onClick={() => setShowBulkDeleteConfirm(true)}
                      className="bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded-md text-sm font-medium transition-colors"
                    >
                      Delete Selected ({selectedUsers.size})
                    </button>
                  )}
                </div>
              </div>
              
              {filteredUsers.length !== users.length && (
                <div className="mt-2 text-sm text-gray-600">
                  Showing {filteredUsers.length} of {users.length} users
                </div>
              )}
            </div>

            {/* Mobile-First Card Layout */}
            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
              {filteredUsers.map((user) => (
                <div key={user.id} className={`bg-white rounded-lg border p-4 shadow-sm hover:shadow-md transition-shadow ${
                  selectedUsers.has(user.id) ? 'border-casino-gold bg-yellow-50' : 'border-gray-200'
                }`}>
                  <div className="flex items-start justify-between mb-3">
                    <div className="flex items-center gap-3 flex-1 min-w-0">
                      {!user.isAdmin && (
                        <input
                          type="checkbox"
                          checked={selectedUsers.has(user.id)}
                          onChange={(e) => handleSelectUser(user.id, e.target.checked)}
                          className="w-4 h-4 text-casino-gold bg-gray-100 border-gray-300 rounded focus:ring-casino-gold"
                        />
                      )}
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 mb-1">
                          <span className="text-xs font-medium text-gray-500">ID #{user.id}</span>
                          {user.isAdmin && (
                            <span className="bg-casino-gold text-white px-2 py-0.5 rounded text-xs font-bold">ADMIN</span>
                          )}
                        </div>
                        <h3 className="font-medium text-gray-900 truncate">{user.email}</h3>
                        {user.username && (
                          <p className="text-sm text-blue-600">@{user.username}</p>
                        )}
                        <p className="text-sm text-gray-600">Created: {new Date(user.createdAt).toLocaleDateString()}</p>
                      </div>
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
            
            {filteredUsers.length === 0 && users.length > 0 && (
              <div className="text-center py-8 text-gray-500">
                No users match your search criteria
              </div>
            )}
            
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

        {/* Bulk Delete Confirmation Modal */}
        {showBulkDeleteConfirm && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-lg p-6 max-w-md w-full">
              <h3 className="text-lg font-semibold text-red-900 mb-4">🗑️ Bulk Delete Users</h3>
              <p className="text-gray-600 mb-4">
                <strong>DANGER:</strong> This will permanently delete <strong>{selectedUsers.size} users</strong> and all their data.
              </p>
              <div className="bg-gray-50 rounded-md p-3 mb-4 max-h-32 overflow-y-auto">
                <p className="text-sm text-gray-600 mb-2">Users to be deleted:</p>
                {filteredUsers
                  .filter(user => selectedUsers.has(user.id))
                  .map(user => (
                    <div key={user.id} className="text-sm text-gray-800">
                      • {user.email} (ID: {user.id})
                    </div>
                  ))
                }
              </div>
              <p className="text-red-600 text-sm mb-6">
                This action cannot be undone!
              </p>
              <div className="flex gap-3">
                <button
                  onClick={bulkDeleteUsers}
                  className="flex-1 bg-red-600 hover:bg-red-700 text-white py-2 px-4 rounded font-medium"
                >
                  Delete {selectedUsers.size} Users
                </button>
                <button
                  onClick={() => setShowBulkDeleteConfirm(false)}
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
                      <div className="text-xs text-gray-500">Games</div>
                      <div className="font-bold text-gray-900">{lobby.gamesCount || 0}/4</div>
                    </div>
                    <div>
                      <div className="text-xs text-gray-500">Max Games</div>
                      <div className="font-bold text-green-600">{lobby.maxGames || 4}</div>
                    </div>
                  </div>
                  
                  <div className="space-y-2">
                    {/* Game Management - View Games in this Lobby */}
                    <button
                      onClick={() => viewLobbyGames(lobby.id)}
                      className="w-full bg-blue-600 hover:bg-blue-700 text-white py-2 px-3 rounded text-sm font-medium"
                    >
                      🎮 Manage Games ({lobby.gamesCount || 0})
                    </button>
                    
                    {/* Add New Game to Lobby */}
                    <button
                      onClick={() => addGameToLobby(lobby.id)}
                      className="w-full bg-green-600 hover:bg-green-700 text-white py-1.5 px-3 rounded text-sm font-medium"
                      disabled={(lobby.gamesCount || 0) >= (lobby.maxGames || 4)}
                    >
                      ➕ Add Game {(lobby.gamesCount || 0) >= (lobby.maxGames || 4) ? '(Max Reached)' : ''}
                    </button>
                    
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

        {/* Prize Pool Management Tab */}
        {activeTab === 'prizes' && (
          <div className="space-y-4">
            <div className="bg-white rounded-lg border border-gray-200 p-4">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">🏆 Prize Pool Distribution System</h3>
              <p className="text-gray-600 mb-4">
                Manage prize pools and distribute winnings to players. The system automatically takes 30% house cut and awards 70% to the winner.
              </p>
            </div>

            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
              {lobbies
                .filter(lobby => lobby.seatsTaken > 0)
                .map((lobby) => {
                  const totalPool = lobby.entryFee * lobby.seatsTaken;
                  const houseTake = Math.floor(totalPool * 0.30);
                  const winnerPrize = totalPool - houseTake;
                  
                  return (
                    <div key={lobby.id} className="bg-white rounded-lg border border-gray-200 p-4 shadow-sm">
                      <div className="flex items-start justify-between mb-3">
                        <div>
                          <h4 className="font-semibold text-gray-900">{lobby.name}</h4>
                          <p className="text-sm text-gray-600">Lobby #{lobby.id}</p>
                        </div>
                        <div className={`px-2 py-1 rounded-full text-xs font-medium ${
                          lobby.status === 'active' ? 'bg-green-100 text-green-800' :
                          lobby.status === 'waiting' ? 'bg-yellow-100 text-yellow-800' :
                          'bg-gray-100 text-gray-800'
                        }`}>
                          {lobby.status}
                        </div>
                      </div>
                      
                      <div className="space-y-2 mb-4">
                        <div className="flex justify-between text-sm">
                          <span className="text-gray-600">Entry Fee:</span>
                          <span className="font-medium">${lobby.entryFee}</span>
                        </div>
                        <div className="flex justify-between text-sm">
                          <span className="text-gray-600">Seats Taken:</span>
                          <span className="font-medium">{lobby.seatsTaken}/{lobby.maxSeats}</span>
                        </div>
                        <div className="flex justify-between text-sm">
                          <span className="text-gray-600">Total Pool:</span>
                          <span className="font-semibold text-green-600">${totalPool.toFixed(2)}</span>
                        </div>
                        <div className="flex justify-between text-sm">
                          <span className="text-gray-600">House Take (30%):</span>
                          <span className="font-medium text-orange-600">${houseTake.toFixed(2)}</span>
                        </div>
                        <div className="flex justify-between text-sm">
                          <span className="text-gray-600">Winner Prize (70%):</span>
                          <span className="font-semibold text-blue-600">${winnerPrize.toFixed(2)}</span>
                        </div>
                      </div>
                      
                      <div className="space-y-2">
                        <button
                          onClick={() => fetchPrizePoolInfo(lobby.id)}
                          className="w-full bg-blue-600 hover:bg-blue-700 text-white px-3 py-2 rounded-md text-sm font-medium transition-colors"
                        >
                          Refresh Pool Info
                        </button>
                        
                        <button
                          onClick={() => {
                            const winnerId = prompt(`Enter winner's User ID for ${lobby.name}:`);
                            if (winnerId && !isNaN(parseInt(winnerId))) {
                              distributePrize(lobby.id, parseInt(winnerId));
                            }
                          }}
                          disabled={distributingPrize === lobby.id}
                          className="w-full bg-green-600 hover:bg-green-700 disabled:bg-gray-400 text-white px-3 py-2 rounded-md text-sm font-medium transition-colors"
                        >
                          {distributingPrize === lobby.id ? 'Distributing...' : 'Distribute Prize'}
                        </button>
                        
                        <button
                          onClick={() => resetLobby(lobby.id)}
                          className="w-full bg-gray-600 hover:bg-gray-700 text-white px-3 py-2 rounded-md text-sm font-medium transition-colors"
                        >
                          Reset Lobby
                        </button>
                      </div>
                    </div>
                  );
                })}
            </div>
            
            {lobbies.filter(lobby => lobby.seatsTaken > 0).length === 0 && (
              <div className="bg-white rounded-lg border border-gray-200 p-8 text-center">
                <div className="text-gray-400 text-4xl mb-4">🏆</div>
                <h3 className="text-lg font-semibold text-gray-900 mb-2">No Active Prize Pools</h3>
                <p className="text-gray-600">
                  Prize pools will appear here when players join lobbies. Each lobby needs at least one player to generate a prize pool.
                </p>
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

      {/* Games Management Modal */}
      {showGamesModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg p-6 max-w-4xl w-full max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-xl font-semibold text-gray-900">
                🎮 Games in {showGamesModal.lobbyName}
              </h3>
              <button
                onClick={() => setShowGamesModal(null)}
                className="text-gray-400 hover:text-gray-600 text-2xl"
              >
                ×
              </button>
            </div>
            
            {loadingGames ? (
              <div className="text-center py-8">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto"></div>
                <p className="mt-2 text-gray-600">Loading games...</p>
              </div>
            ) : (
              <div className="space-y-4">
                <div className="flex justify-between items-center">
                  <p className="text-gray-600">
                    {showGamesModal.games.length} game(s) in this lobby (Max: 4)
                  </p>
                  <div className="flex gap-2">
                    <button
                      onClick={() => addGameToLobby(showGamesModal.lobbyId)}
                      className={`py-2 px-4 rounded-lg font-medium ${
                        showGamesModal.games.length >= 4
                          ? 'bg-gray-400 text-gray-600 cursor-not-allowed'
                          : 'bg-green-600 hover:bg-green-700 text-white'
                      }`}
                      disabled={showGamesModal.games.length >= 4}
                    >
                      ➕ Add New Game
                    </button>
                    <button
                      onClick={() => resetLobbyGames(showGamesModal.lobbyId)}
                      className="bg-orange-600 hover:bg-orange-700 text-white py-2 px-4 rounded-lg font-medium"
                    >
                      🔄 Reset Lobby
                    </button>
                  </div>
                </div>
                
                <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                  {showGamesModal.games.map((game) => (
                    <div key={game.id} className="bg-gray-50 rounded-lg border p-4">
                      <div className="flex items-start justify-between mb-3">
                        <div>
                          <h4 className="font-semibold text-gray-900">{game.name}</h4>
                          <p className="text-sm text-gray-600">Game #{game.gameNumber}</p>
                        </div>
                        <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                          game.status === 'waiting' ? 'bg-yellow-100 text-yellow-800' :
                          game.status === 'active' ? 'bg-green-100 text-green-800' :
                          'bg-gray-100 text-gray-800'
                        }`}>
                          {game.status}
                        </span>
                      </div>
                      
                      <div className="space-y-2 mb-4">
                        <div className="flex justify-between text-sm">
                          <span className="text-gray-600">Players:</span>
                          <span className="font-medium">{game.seatsTaken}/{game.maxSeats}</span>
                        </div>
                        <div className="flex justify-between text-sm">
                          <span className="text-gray-600">Prize Pool:</span>
                          <span className="font-medium text-green-600">${game.prizePool}</span>
                        </div>
                      </div>
                      
                      <div className="space-y-2">
                        {game.status === 'waiting' && (
                          <button
                            onClick={() => startGame(game.id)}
                            className="w-full bg-green-600 hover:bg-green-700 text-white py-2 px-3 rounded text-sm font-medium"
                          >
                            🚀 Start Game
                          </button>
                        )}
                        
                        <button
                          onClick={() => resetGame(game.id)}
                          className="w-full bg-orange-600 hover:bg-orange-700 text-white py-2 px-3 rounded text-sm font-medium"
                        >
                          🔄 Reset Game
                        </button>
                        
                        <button
                          onClick={() => deleteGame(game.id)}
                          className="w-full bg-red-600 hover:bg-red-700 text-white py-2 px-3 rounded text-sm font-medium"
                        >
                          🗑️ Delete Game
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
                
                {showGamesModal.games.length === 0 && (
                  <div className="text-center py-8 text-gray-500">
                    <p className="text-lg mb-2">No games in this lobby yet</p>
                    <p className="text-sm">Add games to start managing individual game sessions</p>
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
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