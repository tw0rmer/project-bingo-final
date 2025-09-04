import React, { useState, useEffect } from 'react';
import { SiteLayout } from '@/components/SiteLayout';
import { useLocation } from 'wouter';
import { useAuth } from '@/contexts/AuthContext';
import { authApiRequest } from '@/lib/api';
import { 
  Users, 
  Home, 
  DollarSign, 
  Trophy, 
  ArrowLeft, 
  Search, 
  Settings, 
  Trash2, 
  Edit, 
  Plus,
  Play,
  Pause,
  Square,
  Zap,
  RefreshCw,
  Eye,
  Crown,
  Shield,
  Sparkles,
  Star,
  TrendingUp,
  AlertTriangle,
  CheckCircle,
  X
} from 'lucide-react';

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
  const [activeTab, setActiveTab] = useState<'users' | 'lobbies' | 'transactions' | 'prizes' | 'settings'>('users');
  const [users, setUsers] = useState<User[]>([]);
  const [lobbies, setLobbies] = useState<Lobby[]>([]);
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [gameMetaByLobby, setGameMetaByLobby] = useState<Record<number, { isPaused: boolean }>>({});
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [, setLocation] = useLocation();
  const { user, logout } = useAuth();

  // Debug settings state
  const [debugEnabled, setDebugEnabled] = useState(() => {
    return localStorage.getItem('debugEnabled') === 'true';
  });

  // Debug toggle function
  const toggleDebugMode = (enabled: boolean) => {
    setDebugEnabled(enabled);
    localStorage.setItem('debugEnabled', enabled.toString());
    
    // Update global debug state
    if (enabled) {
      localStorage.setItem('debugMode', 'true');
      console.log('🐛 Debug mode enabled by admin');
    } else {
      localStorage.removeItem('debugMode');
      console.log('🐛 Debug mode disabled by admin');
    }
  };

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
        <div className="min-h-screen bg-gradient-to-br from-red-50 via-pink-50 to-orange-50">
          {/* Animated Background Decorations */}
          <div className="fixed inset-0 overflow-hidden pointer-events-none">
            <div className="absolute top-20 left-10 w-32 h-32 bg-gradient-to-br from-red-400/20 to-pink-400/20 rounded-full animate-pulse"></div>
            <div className="absolute top-40 right-20 w-24 h-24 bg-gradient-to-br from-orange-400/20 to-red-400/20 rounded-full animate-bounce-soft"></div>
            <div className="absolute bottom-20 left-20 w-28 h-28 bg-gradient-to-br from-pink-400/20 to-red-400/20 rounded-full animate-pulse"></div>
            <div className="absolute bottom-40 right-10 w-20 h-20 bg-gradient-to-br from-orange-400/20 to-pink-400/20 rounded-full animate-bounce-soft"></div>
          </div>

          <div className="flex items-center justify-center pt-20 relative z-10">
            <div className="text-center bg-white/95 backdrop-blur-sm rounded-3xl p-8 border-2 border-gray-200/50 shadow-2xl">
              <div className="w-16 h-16 bg-gradient-to-br from-red-500 to-pink-600 rounded-2xl flex items-center justify-center mx-auto mb-4 shadow-2xl">
                <Settings size={32} className="text-white animate-spin" />
              </div>
              <p className="text-xl font-bold bg-gradient-to-r from-gray-800 to-gray-600 bg-clip-text text-transparent">Loading admin panel...</p>
            </div>
          </div>
        </div>
      </SiteLayout>
    );
  }

  if (error) {
    return (
      <SiteLayout hideAuthButtons>
        <div className="min-h-screen bg-gradient-to-br from-red-50 via-pink-50 to-orange-50">
          {/* Animated Background Decorations */}
          <div className="fixed inset-0 overflow-hidden pointer-events-none">
            <div className="absolute top-20 left-10 w-32 h-32 bg-gradient-to-br from-red-400/20 to-pink-400/20 rounded-full animate-pulse"></div>
            <div className="absolute top-40 right-20 w-24 h-24 bg-gradient-to-br from-orange-400/20 to-red-400/20 rounded-full animate-bounce-soft"></div>
            <div className="absolute bottom-20 left-20 w-28 h-28 bg-gradient-to-br from-pink-400/20 to-red-400/20 rounded-full animate-pulse"></div>
            <div className="absolute bottom-40 right-10 w-20 h-20 bg-gradient-to-br from-orange-400/20 to-pink-400/20 rounded-full animate-bounce-soft"></div>
          </div>

          <div className="flex items-center justify-center pt-20 relative z-10">
            <div className="text-center bg-white/95 backdrop-blur-sm rounded-3xl p-8 border-2 border-gray-200/50 shadow-2xl">
              <div className="w-16 h-16 bg-gradient-to-br from-red-500 to-pink-600 rounded-2xl flex items-center justify-center mx-auto mb-4 shadow-2xl">
                <AlertTriangle size={32} className="text-white" />
              </div>
              <p className="text-xl font-bold text-red-700 mb-4">Error: {error}</p>
              <div className="flex gap-4 justify-center">
              <button
                onClick={() => window.location.reload()}
                  className="bg-gradient-to-r from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700 text-white px-6 py-3 rounded-2xl font-bold shadow-lg hover:shadow-xl transition-all duration-300"
              >
                Retry
              </button>
              <button
                onClick={() => setLocation('/dashboard')}
                  className="bg-gradient-to-r from-gray-600 to-gray-700 hover:from-gray-700 hover:to-gray-800 text-white px-6 py-3 rounded-2xl font-bold shadow-lg hover:shadow-xl transition-all duration-300"
              >
                Back to Dashboard
              </button>
              </div>
            </div>
          </div>
        </div>
      </SiteLayout>
    );
  }

  return (
    <SiteLayout hideAuthButtons>
      <div className="min-h-screen bg-gradient-to-br from-red-50 via-pink-50 to-orange-50">
        {/* Animated Background Decorations */}
        <div className="fixed inset-0 overflow-hidden pointer-events-none">
          <div className="absolute top-20 left-10 w-32 h-32 bg-gradient-to-br from-red-400/20 to-pink-400/20 rounded-full animate-pulse"></div>
          <div className="absolute top-40 right-20 w-24 h-24 bg-gradient-to-br from-orange-400/20 to-red-400/20 rounded-full animate-bounce-soft"></div>
          <div className="absolute bottom-20 left-20 w-28 h-28 bg-gradient-to-br from-pink-400/20 to-red-400/20 rounded-full animate-pulse"></div>
          <div className="absolute bottom-40 right-10 w-20 h-20 bg-gradient-to-br from-orange-400/20 to-pink-400/20 rounded-full animate-bounce-soft"></div>
        </div>

        <main className="mx-auto max-w-7xl p-3 sm:p-4 relative z-10">
          {/* Enhanced Header */}
          <div className="mb-8">
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-6">
              <div className="text-center sm:text-left">
                <div className="flex items-center justify-center sm:justify-start gap-3 mb-4">
                  <div className="w-16 h-16 bg-gradient-to-br from-red-500 to-pink-600 rounded-2xl flex items-center justify-center shadow-2xl">
                    <Crown size={32} className="text-white" />
                  </div>
                  <div className="floating-sparkles">
                    <Sparkles size={20} className="text-yellow-500 animate-pulse" />
                    <Star size={16} className="text-orange-500 animate-bounce-soft" />
                  </div>
                </div>
                <h1 className="text-4xl font-bold bg-gradient-to-r from-gray-800 to-gray-600 bg-clip-text text-transparent mb-2">Admin Panel</h1>
                <p className="text-lg text-gray-600">Manage users, lobbies, and transactions</p>
            </div>
            <button
              onClick={() => setLocation('/dashboard')}
                className="flex items-center gap-2 text-gray-700 hover:text-gray-900 transition-colors text-sm font-medium bg-white/80 backdrop-blur-sm rounded-xl px-4 py-2 border border-gray-200/50 shadow-lg hover:shadow-xl self-start sm:self-auto"
            >
                <ArrowLeft size={16} />
                Back to Dashboard
            </button>
          </div>
        </div>

                  {/* Enhanced Mobile-Responsive Tabs */}
          <div className="mb-8">
            <div className="bg-white/95 backdrop-blur-sm rounded-2xl border-2 border-gray-200/50 shadow-xl overflow-hidden">
              <nav className="flex">
                {[
                  { id: 'users', label: 'Users', count: users.length, icon: Users },
                  { id: 'lobbies', label: 'Lobbies', count: lobbies.length, icon: Home },
                  { id: 'transactions', label: 'Transactions', count: transactions.length, icon: DollarSign },
                  { id: 'prizes', label: 'Prize Pools', count: lobbies.filter(l => l.seatsTaken > 0).length, icon: Trophy },
                  { id: 'settings', label: 'Settings', count: 0, icon: Settings }
                ].map((tab) => {
                  const Icon = tab.icon;
                  return (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id as any)}
                      className={`flex-1 flex items-center justify-center gap-3 py-4 px-6 font-bold text-sm transition-all duration-300 ${
                    activeTab === tab.id
                          ? 'bg-gradient-to-r from-red-500 to-pink-600 text-white shadow-lg scale-105'
                          : 'text-gray-600 hover:text-gray-800 hover:bg-gray-50'
                  }`}
                >
                      <Icon size={20} />
                  <span className="whitespace-nowrap">{tab.label}</span>
                      <span className={`px-2 py-1 rounded-full text-xs font-bold ${
                        activeTab === tab.id 
                          ? 'bg-white/20 text-white' 
                          : 'bg-gray-100 text-gray-700'
                      }`}>
                    {tab.count}
                  </span>
                </button>
                  );
                })}
            </nav>
          </div>
        </div>

                  {/* Enhanced Users Tab */}
        {activeTab === 'users' && (
            <div className="space-y-8">
              {/* Enhanced Search and Multi-Select Controls */}
              <div className="bg-white/95 backdrop-blur-sm rounded-3xl border-2 border-gray-200/50 shadow-2xl p-8">
                <div className="flex flex-col sm:flex-row gap-6 items-start sm:items-center justify-between">
                <div className="flex-1 w-full sm:max-w-md">
                  <div className="relative">
                    <input
                      type="text"
                      placeholder="Search by email, username, or ID..."
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                        className="w-full pl-12 pr-6 py-4 border-2 border-gray-200 rounded-2xl focus:ring-4 focus:ring-red-400/30 focus:border-red-500 text-lg transition-all duration-300"
                      />
                      <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                        <Search size={20} className="text-gray-400" />
                    </div>
                  </div>
                </div>
                
                  <div className="flex items-center gap-6 w-full sm:w-auto">
                    <div className="flex items-center gap-3">
                    <input
                      type="checkbox"
                      id="select-all"
                      checked={selectAll}
                      onChange={(e) => handleSelectAll(e.target.checked)}
                        className="w-5 h-5 text-red-500 bg-gray-100 border-gray-300 rounded focus:ring-red-500"
                    />
                      <label htmlFor="select-all" className="text-lg font-bold text-gray-700">
                      Select All ({selectedUsers.size} selected)
                    </label>
                  </div>
                  
                  {selectedUsers.size > 0 && (
                    <button
                      onClick={() => setShowBulkDeleteConfirm(true)}
                      className="bg-gradient-to-r from-red-500 to-red-600 hover:from-red-600 hover:to-red-700 text-white px-6 py-3 rounded-2xl font-bold shadow-lg hover:shadow-xl transition-all duration-300 flex items-center gap-2"
                    >
                      <Trash2 size={18} />
                      Delete Selected ({selectedUsers.size})
                    </button>
                  )}
                </div>
              </div>
              
              {filteredUsers.length !== users.length && (
                <div className="bg-blue-50 border border-blue-200 rounded-2xl p-4 text-center">
                  <p className="text-lg font-bold text-blue-700">
                  Showing {filteredUsers.length} of {users.length} users
                  </p>
                </div>
              )}
            </div>

            {/* Enhanced Mobile-First Card Layout */}
            <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
              {filteredUsers.map((user) => (
                <div key={user.id} className={`bg-white/95 backdrop-blur-sm rounded-3xl border-2 p-6 shadow-2xl hover:shadow-3xl transition-all duration-300 ${
                  selectedUsers.has(user.id) ? 'border-red-500 bg-red-50/80' : 'border-gray-200/50'
                }`}>
                  <div className="flex items-start justify-between mb-4">
                    <div className="flex items-center gap-4 flex-1 min-w-0">
                      {!user.isAdmin && (
                        <input
                          type="checkbox"
                          checked={selectedUsers.has(user.id)}
                          onChange={(e) => handleSelectUser(user.id, e.target.checked)}
                          className="w-5 h-5 text-red-500 bg-gray-100 border-gray-300 rounded focus:ring-red-500"
                        />
                      )}
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-3 mb-2">
                          <span className="text-sm font-bold text-gray-500 bg-gray-100 px-3 py-1 rounded-full">ID #{user.id}</span>
                          {user.isAdmin && (
                            <span className="bg-gradient-to-r from-red-500 to-pink-600 text-white px-3 py-1 rounded-full text-sm font-bold flex items-center gap-1">
                              <Crown size={14} />
                              ADMIN
                            </span>
                          )}
                        </div>
                        <h3 className="text-xl font-bold text-gray-800 truncate mb-1">{user.email}</h3>
                        {user.username && (
                          <p className="text-lg text-blue-600 font-medium">@{user.username}</p>
                        )}
                        <p className="text-sm text-gray-600">Created: {new Date(user.createdAt).toLocaleDateString()}</p>
                      </div>
                    </div>
                  </div>
                  
                  <div className="mb-6">
                    <div className="text-sm text-gray-500 mb-2 font-bold">Balance</div>
                    <div className="text-2xl font-bold bg-gradient-to-r from-green-600 to-emerald-600 bg-clip-text text-transparent">
                      ${parseFloat(user.balance).toFixed(2)}
                    </div>
                  </div>
                  
                  <div className="flex flex-col gap-3">
                    <button
                      onClick={() => setShowEditUser(user)}
                      className="w-full bg-gradient-to-r from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700 text-white py-3 px-4 rounded-2xl font-bold shadow-lg hover:shadow-xl transition-all duration-300 flex items-center justify-center gap-2"
                    >
                      <Edit size={18} />
                      Edit Balance
                    </button>
                    <div className="flex gap-3">
                      <button
                        onClick={() => toggleUserAdmin(user.id, !user.isAdmin)}
                        className={`flex-1 py-3 px-4 rounded-2xl font-bold transition-all duration-300 flex items-center justify-center gap-2 ${
                          user.isAdmin 
                            ? 'bg-gradient-to-r from-red-100 to-red-200 hover:from-red-200 hover:to-red-300 text-red-800 shadow-lg hover:shadow-xl' 
                            : 'bg-gradient-to-r from-green-100 to-green-200 hover:from-green-200 hover:to-green-300 text-green-800 shadow-lg hover:shadow-xl'
                        }`}
                      >
                        <Shield size={16} />
                        {user.isAdmin ? 'Remove Admin' : 'Make Admin'}
                      </button>
                      <button
                        onClick={() => handleBanUser(user.id, user.email)}
                        className="bg-gradient-to-r from-orange-100 to-orange-200 hover:from-orange-200 hover:to-orange-300 text-orange-800 py-3 px-4 rounded-2xl font-bold transition-all duration-300 shadow-lg hover:shadow-xl"
                        title="Ban User"
                      >
                        <AlertTriangle size={16} />
                      </button>
                    </div>
                    <button
                      onClick={() => handleDeleteUser(user.id, user.email)}
                      className="w-full bg-gradient-to-r from-red-100 to-red-200 hover:from-red-200 hover:to-red-300 text-red-800 py-3 px-4 rounded-2xl font-bold transition-all duration-300 shadow-lg hover:shadow-xl flex items-center justify-center gap-2"
                    >
                      <Trash2 size={18} />
                      Delete User
                    </button>
                  </div>
                </div>
              ))}
            </div>
            
            {filteredUsers.length === 0 && users.length > 0 && (
              <div className="text-center py-12 bg-white/95 backdrop-blur-sm rounded-3xl border-2 border-gray-200/50 shadow-2xl">
                <div className="w-16 h-16 bg-gradient-to-br from-gray-400 to-gray-500 rounded-2xl flex items-center justify-center mx-auto mb-4 shadow-2xl">
                  <Search size={32} className="text-white" />
                </div>
                <p className="text-xl font-bold text-gray-600">No users match your search criteria</p>
              </div>
            )}
            
            {users.length === 0 && (
              <div className="text-center py-12 bg-white/95 backdrop-blur-sm rounded-3xl border-2 border-gray-200/50 shadow-2xl">
                <div className="w-16 h-16 bg-gradient-to-br from-gray-400 to-gray-500 rounded-2xl flex items-center justify-center mx-auto mb-4 shadow-2xl">
                  <Users size={32} className="text-white" />
                </div>
                <p className="text-xl font-bold text-gray-600">No users found</p>
              </div>
            )}
          </div>
        )}

        {/* Mobile-Friendly Lobbies Tab */}
        {showBanConfirm && (
          <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
            <div className="bg-white/95 backdrop-blur-sm rounded-3xl border-2 border-gray-200/50 p-8 max-w-md w-full shadow-2xl">
              <div className="flex items-center gap-4 mb-6">
                <div className="w-16 h-16 bg-gradient-to-br from-orange-500 to-red-600 rounded-2xl flex items-center justify-center shadow-2xl">
                  <AlertTriangle size={32} className="text-white" />
                </div>
                <div>
                  <h3 className="text-2xl font-bold bg-gradient-to-r from-gray-800 to-gray-600 bg-clip-text text-transparent mb-2">Ban User</h3>
                  <p className="text-lg text-gray-600">
                    Are you sure you want to ban <strong className="text-red-600">{showBanConfirm.email}</strong>? 
                This will prevent them from logging in and playing games.
              </p>
                </div>
              </div>
              <div className="flex gap-4">
                <button
                  onClick={confirmBanUser}
                  className="flex-1 bg-gradient-to-r from-red-500 to-red-600 hover:from-red-600 hover:to-red-700 text-white py-4 px-6 rounded-2xl font-bold shadow-lg hover:shadow-xl transition-all duration-300"
                >
                  Ban User
                </button>
                <button
                  onClick={() => setShowBanConfirm(null)}
                  className="flex-1 bg-gradient-to-r from-gray-500 to-gray-600 hover:from-gray-600 hover:to-gray-700 text-white py-4 px-6 rounded-2xl font-bold shadow-lg hover:shadow-xl transition-all duration-300"
                >
                  Cancel
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Enhanced Delete User Confirmation Modal */}
        {showDeleteConfirm && (
          <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
            <div className="bg-white/95 backdrop-blur-sm rounded-3xl border-2 border-gray-200/50 p-8 max-w-md w-full shadow-2xl">
              <div className="flex items-center gap-4 mb-6">
                <div className="w-16 h-16 bg-gradient-to-br from-red-500 to-pink-600 rounded-2xl flex items-center justify-center shadow-2xl">
                  <Trash2 size={32} className="text-white" />
                </div>
                <div>
                  <h3 className="text-2xl font-bold bg-gradient-to-r from-gray-800 to-gray-600 bg-clip-text text-transparent mb-2">Delete User</h3>
                  <p className="text-lg text-gray-600 mb-4">
                    <strong className="text-red-600">DANGER:</strong> This will permanently delete user <strong className="text-red-600">{showDeleteConfirm.email}</strong> and all their data.
                  </p>
                  <p className="text-red-600 text-lg font-bold">
                This action cannot be undone!
              </p>
                </div>
              </div>
              <div className="flex gap-4">
                <button
                  onClick={confirmDeleteUser}
                  className="flex-1 bg-gradient-to-r from-red-500 to-red-600 hover:from-red-600 hover:to-red-700 text-white py-4 px-6 rounded-2xl font-bold shadow-lg hover:shadow-xl transition-all duration-300"
                >
                  Delete Permanently
                </button>
                <button
                  onClick={() => setShowDeleteConfirm(null)}
                  className="flex-1 bg-gradient-to-r from-gray-500 to-gray-600 hover:from-gray-600 hover:to-gray-700 text-white py-4 px-6 rounded-2xl font-bold shadow-lg hover:shadow-xl transition-all duration-300"
                >
                  Cancel
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Enhanced Bulk Delete Confirmation Modal */}
        {showBulkDeleteConfirm && (
          <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
            <div className="bg-white/95 backdrop-blur-sm rounded-3xl border-2 border-gray-200/50 p-8 max-w-md w-full shadow-2xl">
              <div className="flex items-center gap-4 mb-6">
                <div className="w-16 h-16 bg-gradient-to-br from-red-500 to-pink-600 rounded-2xl flex items-center justify-center shadow-2xl">
                  <Trash2 size={32} className="text-white" />
                </div>
                <div>
                  <h3 className="text-2xl font-bold bg-gradient-to-r from-gray-800 to-gray-600 bg-clip-text text-transparent mb-2">Bulk Delete Users</h3>
                  <p className="text-lg text-gray-600 mb-4">
                    <strong className="text-red-600">DANGER:</strong> This will permanently delete <strong className="text-red-600">{selectedUsers.size} users</strong> and all their data.
                  </p>
                </div>
              </div>
              <div className="bg-gray-50 rounded-2xl p-4 mb-6 max-h-32 overflow-y-auto">
                <p className="text-sm text-gray-600 mb-3 font-bold">Users to be deleted:</p>
                {filteredUsers
                  .filter(user => selectedUsers.has(user.id))
                  .map(user => (
                    <div key={user.id} className="text-sm text-gray-800 mb-1">
                      • {user.email} (ID: {user.id})
                    </div>
                  ))
                }
              </div>
              <p className="text-red-600 text-lg font-bold mb-6">
                This action cannot be undone!
              </p>
              <div className="flex gap-4">
                <button
                  onClick={bulkDeleteUsers}
                  className="flex-1 bg-gradient-to-r from-red-500 to-red-600 hover:from-red-600 hover:to-red-700 text-white py-4 px-6 rounded-2xl font-bold shadow-lg hover:shadow-xl transition-all duration-300"
                >
                  Delete {selectedUsers.size} Users
                </button>
                <button
                  onClick={() => setShowBulkDeleteConfirm(false)}
                  className="flex-1 bg-gradient-to-r from-gray-500 to-gray-600 hover:from-gray-600 hover:to-gray-700 text-white py-4 px-6 rounded-2xl font-bold shadow-lg hover:shadow-xl transition-all duration-300"
                >
                  Cancel
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Enhanced Lobbies Tab */}
        {activeTab === 'lobbies' && (
          <div className="space-y-8">
            <div className="flex flex-col sm:flex-row gap-4 sm:items-center sm:justify-between">
              <div>
                <h2 className="text-3xl font-bold bg-gradient-to-r from-gray-800 to-gray-600 bg-clip-text text-transparent mb-2">Lobby Management</h2>
                <p className="text-lg text-gray-600">Create and manage game lobbies</p>
              </div>
              <button
                onClick={() => setShowCreateLobby(true)}
                className="bg-gradient-to-r from-green-500 to-emerald-600 hover:from-green-600 hover:to-emerald-700 text-white py-4 px-6 rounded-2xl font-bold shadow-lg hover:shadow-xl transition-all duration-300 flex items-center gap-2 self-start sm:self-auto"
              >
                <Plus size={20} />
                Create Lobby
              </button>
            </div>
            
            <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
              {lobbies.map((lobby) => (
                <div key={lobby.id} className="bg-white/95 backdrop-blur-sm rounded-3xl border-2 border-gray-200/50 p-6 shadow-2xl hover:shadow-3xl transition-all duration-300">
                  <div className="flex items-start justify-between mb-4">
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-3 mb-3">
                        <span className="text-sm font-bold text-gray-500 bg-gray-100 px-3 py-1 rounded-full">ID #{lobby.id}</span>
                        <span className={`px-3 py-1 rounded-full text-sm font-bold ${
                          lobby.status === 'active' ? 'bg-gradient-to-r from-green-100 to-emerald-100 text-green-800' :
                          lobby.status === 'finished' ? 'bg-gradient-to-r from-purple-100 to-pink-100 text-purple-800' :
                          'bg-gradient-to-r from-yellow-100 to-orange-100 text-yellow-800'
                        }`}>
                          {lobby.status.toUpperCase()}
                        </span>
                      </div>
                      <h3 className="text-xl font-bold text-gray-800 mb-2">{lobby.name}</h3>
                      <p className="text-sm text-gray-600">Created: {new Date(lobby.createdAt).toLocaleDateString()}</p>
                    </div>
                  </div>
                  
                  <div className="grid grid-cols-3 gap-4 mb-6 text-center">
                    <div className="bg-gradient-to-r from-red-50 to-pink-50 rounded-2xl p-3">
                      <div className="text-sm text-gray-500 font-bold mb-1">Entry</div>
                      <div className="text-xl font-bold bg-gradient-to-r from-red-600 to-pink-600 bg-clip-text text-transparent">${lobby.entryFee}</div>
                    </div>
                    <div className="bg-gradient-to-r from-blue-50 to-indigo-50 rounded-2xl p-3">
                      <div className="text-sm text-gray-500 font-bold mb-1">Games</div>
                      <div className="text-xl font-bold text-gray-800">{lobby.gamesCount || 0}/4</div>
                    </div>
                    <div className="bg-gradient-to-r from-green-50 to-emerald-50 rounded-2xl p-3">
                      <div className="text-sm text-gray-500 font-bold mb-1">Max Games</div>
                      <div className="text-xl font-bold text-green-600">{lobby.maxGames || 4}</div>
                    </div>
                  </div>
                  
                  <div className="space-y-3">
                    {/* Game Management - View Games in this Lobby */}
                    <button
                      onClick={() => viewLobbyGames(lobby.id)}
                      className="w-full bg-gradient-to-r from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700 text-white py-3 px-4 rounded-2xl font-bold shadow-lg hover:shadow-xl transition-all duration-300 flex items-center justify-center gap-2"
                    >
                      <Eye size={18} />
                      Manage Games ({lobby.gamesCount || 0})
                    </button>
                    
                    {/* Add New Game to Lobby */}
                    <button
                      onClick={() => addGameToLobby(lobby.id)}
                      className="w-full bg-gradient-to-r from-green-500 to-emerald-600 hover:from-green-600 hover:to-emerald-700 text-white py-3 px-4 rounded-2xl font-bold shadow-lg hover:shadow-xl transition-all duration-300 flex items-center justify-center gap-2"
                      disabled={(lobby.gamesCount || 0) >= (lobby.maxGames || 4)}
                    >
                      <Plus size={18} />
                      Add Game {(lobby.gamesCount || 0) >= (lobby.maxGames || 4) ? '(Max Reached)' : ''}
                    </button>
                    
                    <div className="grid grid-cols-3 gap-3 pt-4 border-t border-gray-200">
                      <button
                        onClick={() => setShowEditLobby(lobby)}
                        className="bg-gradient-to-r from-gray-500 to-gray-600 hover:from-gray-600 hover:to-gray-700 text-white py-3 px-2 rounded-2xl font-bold shadow-lg hover:shadow-xl transition-all duration-300"
                      >
                        Edit
                      </button>
                      <button
                        onClick={() => resetLobby(lobby.id)}
                        className="bg-gradient-to-r from-orange-500 to-red-500 hover:from-orange-600 hover:to-red-600 text-white py-3 px-2 rounded-2xl font-bold shadow-lg hover:shadow-xl transition-all duration-300"
                      >
                        Reset
                      </button>
                      <button
                        onClick={() => deleteLobby(lobby.id)}
                        className="bg-gradient-to-r from-red-500 to-red-600 hover:from-red-600 hover:to-red-700 text-white py-3 px-2 rounded-2xl font-bold shadow-lg hover:shadow-xl transition-all duration-300"
                      >
                        Delete
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
            
            {lobbies.length === 0 && (
              <div className="text-center py-12 bg-white/95 backdrop-blur-sm rounded-3xl border-2 border-gray-200/50 shadow-2xl">
                <div className="w-16 h-16 bg-gradient-to-br from-gray-400 to-gray-500 rounded-2xl flex items-center justify-center mx-auto mb-4 shadow-2xl">
                  <Home size={32} className="text-white" />
                </div>
                <p className="text-xl font-bold text-gray-600">No lobbies found</p>
              </div>
            )}
          </div>
        )}

        {/* Enhanced Transactions Tab */}
        {activeTab === 'transactions' && (
          <div className="space-y-8">
            <div>
              <h2 className="text-3xl font-bold bg-gradient-to-r from-gray-800 to-gray-600 bg-clip-text text-transparent mb-2">Recent Transactions</h2>
              <p className="text-lg text-gray-600">Monitor all financial activities</p>
            </div>
            
            <div className="space-y-4">
              {transactions.map((transaction) => (
                <div key={transaction.id} className="bg-white/95 backdrop-blur-sm rounded-3xl border-2 border-gray-200/50 p-6 shadow-2xl hover:shadow-3xl transition-all duration-300">
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <div className="flex items-center gap-3 mb-3">
                        <span className="text-sm font-bold text-gray-500 bg-gray-100 px-3 py-1 rounded-full">ID #{transaction.id}</span>
                        <span className={`px-3 py-1 rounded-full text-sm font-bold ${
                          parseFloat(transaction.amount) > 0 ? 'bg-gradient-to-r from-green-100 to-emerald-100 text-green-800' : 'bg-gradient-to-r from-red-100 to-pink-100 text-red-800'
                        }`}>
                          {transaction.type.toUpperCase()}
                        </span>
                      </div>
                      <p className="text-xl font-bold text-gray-800 mb-2">{transaction.description}</p>
                      <p className="text-sm text-gray-600">
                        User #{transaction.userId} • {new Date(transaction.createdAt).toLocaleString()}
                      </p>
                    </div>
                    <div className="text-right">
                      <div className={`text-2xl font-bold ${
                        parseFloat(transaction.amount) > 0 ? 'bg-gradient-to-r from-green-600 to-emerald-600 bg-clip-text text-transparent' : 'bg-gradient-to-r from-red-600 to-pink-600 bg-clip-text text-transparent'
                      }`}>
                        {parseFloat(transaction.amount) > 0 ? '+' : ''}${parseFloat(transaction.amount).toFixed(2)}
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
            
            {transactions.length === 0 && (
              <div className="text-center py-12 bg-white/95 backdrop-blur-sm rounded-3xl border-2 border-gray-200/50 shadow-2xl">
                <div className="w-16 h-16 bg-gradient-to-br from-gray-400 to-gray-500 rounded-2xl flex items-center justify-center mx-auto mb-4 shadow-2xl">
                  <DollarSign size={32} className="text-white" />
                </div>
                <p className="text-xl font-bold text-gray-600">No transactions found</p>
              </div>
            )}
          </div>
        )}

        {/* Enhanced Prize Pool Management Tab */}
        {activeTab === 'prizes' && (
          <div className="space-y-8">
            <div className="bg-white/95 backdrop-blur-sm rounded-3xl border-2 border-gray-200/50 p-8 shadow-2xl">
              <div className="flex items-center gap-4 mb-4">
                <div className="w-16 h-16 bg-gradient-to-br from-yellow-500 to-orange-600 rounded-2xl flex items-center justify-center shadow-2xl">
                  <Trophy size={32} className="text-white" />
                </div>
                <div>
                  <h3 className="text-2xl font-bold bg-gradient-to-r from-gray-800 to-gray-600 bg-clip-text text-transparent mb-2">Prize Pool Distribution System</h3>
                  <p className="text-lg text-gray-600">
                Manage prize pools and distribute winnings to players. The system automatically takes 30% house cut and awards 70% to the winner.
              </p>
                </div>
              </div>
            </div>

            <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
              {lobbies
                .filter(lobby => lobby.seatsTaken > 0)
                .map((lobby) => {
                  const totalPool = lobby.entryFee * lobby.seatsTaken;
                  const houseTake = Math.floor(totalPool * 0.30);
                  const winnerPrize = totalPool - houseTake;
                  
                  return (
                    <div key={lobby.id} className="bg-white/95 backdrop-blur-sm rounded-3xl border-2 border-gray-200/50 p-6 shadow-2xl hover:shadow-3xl transition-all duration-300">
                      <div className="flex items-start justify-between mb-4">
                        <div>
                          <h4 className="text-xl font-bold text-gray-800 mb-1">{lobby.name}</h4>
                          <p className="text-sm text-gray-600">Lobby #{lobby.id}</p>
                        </div>
                        <div className={`px-3 py-1 rounded-full text-sm font-bold ${
                          lobby.status === 'active' ? 'bg-gradient-to-r from-green-100 to-emerald-100 text-green-800' :
                          lobby.status === 'waiting' ? 'bg-gradient-to-r from-yellow-100 to-orange-100 text-yellow-800' :
                          'bg-gradient-to-r from-gray-100 to-gray-200 text-gray-800'
                        }`}>
                          {lobby.status}
                        </div>
                      </div>
                      
                      <div className="space-y-3 mb-6">
                        <div className="flex justify-between text-sm bg-gradient-to-r from-red-50 to-pink-50 rounded-2xl p-3">
                          <span className="text-gray-600 font-bold">Entry Fee:</span>
                          <span className="font-bold text-red-600">${lobby.entryFee}</span>
                        </div>
                        <div className="flex justify-between text-sm bg-gradient-to-r from-blue-50 to-indigo-50 rounded-2xl p-3">
                          <span className="text-gray-600 font-bold">Seats Taken:</span>
                          <span className="font-bold text-blue-600">{lobby.seatsTaken}/{lobby.maxSeats}</span>
                        </div>
                        <div className="flex justify-between text-sm bg-gradient-to-r from-green-50 to-emerald-50 rounded-2xl p-3">
                          <span className="text-gray-600 font-bold">Total Pool:</span>
                          <span className="font-bold text-green-600">${totalPool.toFixed(2)}</span>
                        </div>
                        <div className="flex justify-between text-sm bg-gradient-to-r from-orange-50 to-red-50 rounded-2xl p-3">
                          <span className="text-gray-600 font-bold">House Take (30%):</span>
                          <span className="font-bold text-orange-600">${houseTake.toFixed(2)}</span>
                        </div>
                        <div className="flex justify-between text-sm bg-gradient-to-r from-purple-50 to-pink-50 rounded-2xl p-3">
                          <span className="text-gray-600 font-bold">Winner Prize (70%):</span>
                          <span className="font-bold text-purple-600">${winnerPrize.toFixed(2)}</span>
                        </div>
                      </div>
                      
                      <div className="space-y-3">
                        <button
                          onClick={() => fetchPrizePoolInfo(lobby.id)}
                          className="w-full bg-gradient-to-r from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700 text-white py-3 px-4 rounded-2xl font-bold shadow-lg hover:shadow-xl transition-all duration-300 flex items-center justify-center gap-2"
                        >
                          <RefreshCw size={18} />
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
                          className="w-full bg-gradient-to-r from-green-500 to-emerald-600 hover:from-green-600 hover:to-emerald-700 disabled:from-gray-400 disabled:to-gray-500 text-white py-3 px-4 rounded-2xl font-bold shadow-lg hover:shadow-xl transition-all duration-300 flex items-center justify-center gap-2"
                        >
                          <Trophy size={18} />
                          {distributingPrize === lobby.id ? 'Distributing...' : 'Distribute Prize'}
                        </button>
                        
                        <button
                          onClick={() => resetLobby(lobby.id)}
                          className="w-full bg-gradient-to-r from-gray-500 to-gray-600 hover:from-gray-600 hover:to-gray-700 text-white py-3 px-4 rounded-2xl font-bold shadow-lg hover:shadow-xl transition-all duration-300 flex items-center justify-center gap-2"
                        >
                          <RefreshCw size={18} />
                          Reset Lobby
                        </button>
                      </div>
                    </div>
                  );
                })}
            </div>
            
            {lobbies.filter(lobby => lobby.seatsTaken > 0).length === 0 && (
              <div className="text-center py-12 bg-white/95 backdrop-blur-sm rounded-3xl border-2 border-gray-200/50 shadow-2xl">
                <div className="w-16 h-16 bg-gradient-to-br from-yellow-500 to-orange-600 rounded-2xl flex items-center justify-center mx-auto mb-4 shadow-2xl">
                  <Trophy size={32} className="text-white" />
                </div>
                <h3 className="text-xl font-bold text-gray-800 mb-2">No Active Prize Pools</h3>
                <p className="text-lg text-gray-600">
                  Prize pools will appear here when players join lobbies. Each lobby needs at least one player to generate a prize pool.
                </p>
              </div>
            )}
          </div>
        )}

        {/* Enhanced Settings Tab */}
        {activeTab === 'settings' && (
          <div className="space-y-8">
            <div className="bg-white/95 backdrop-blur-sm rounded-3xl border-2 border-gray-200/50 p-8 shadow-2xl">
              <div className="flex items-center gap-4 mb-6">
                <div className="w-16 h-16 bg-gradient-to-br from-blue-500 to-purple-600 rounded-2xl flex items-center justify-center shadow-2xl">
                  <Settings size={32} className="text-white" />
                </div>
                <div>
                  <h3 className="text-2xl font-bold bg-gradient-to-r from-gray-800 to-gray-600 bg-clip-text text-transparent mb-2">System Settings</h3>
                  <p className="text-lg text-gray-600">
                    Configure system-wide settings and preferences for the bingo platform.
                  </p>
                </div>
              </div>
            </div>

            {/* Debug Mode Settings */}
            <div className="bg-white/95 backdrop-blur-sm rounded-3xl border-2 border-gray-200/50 p-8 shadow-2xl">
              <div className="flex items-center justify-between mb-6">
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 bg-gradient-to-br from-yellow-500 to-orange-600 rounded-xl flex items-center justify-center shadow-lg">
                    <Zap size={24} className="text-white" />
                  </div>
                  <div>
                    <h4 className="text-xl font-bold text-gray-800 mb-1">Debug Mode</h4>
                    <p className="text-gray-600">
                      Enable debug panels and enhanced logging for game development and troubleshooting.
                    </p>
                  </div>
                </div>
                <div className="flex items-center gap-4">
                  <div className="text-right">
                    <p className="text-sm font-bold text-gray-700">
                      {debugEnabled ? 'Enabled' : 'Disabled'}
                    </p>
                    <p className="text-xs text-gray-500">
                      {debugEnabled ? 'Debug panels visible' : 'Debug panels hidden'}
                    </p>
                  </div>
                  <button
                    onClick={() => toggleDebugMode(!debugEnabled)}
                    className={`relative inline-flex h-12 w-24 items-center rounded-full transition-colors duration-300 focus:outline-none focus:ring-4 focus:ring-blue-400/30 ${
                      debugEnabled 
                        ? 'bg-gradient-to-r from-green-500 to-emerald-600' 
                        : 'bg-gradient-to-r from-gray-400 to-gray-500'
                    }`}
                  >
                    <span
                      className={`inline-block h-8 w-8 transform rounded-full bg-white shadow-lg transition-transform duration-300 ${
                        debugEnabled ? 'translate-x-12' : 'translate-x-1'
                      }`}
                    />
                  </button>
                </div>
              </div>
              
              <div className="bg-gradient-to-r from-blue-50 to-purple-50 rounded-2xl p-6 border border-blue-200">
                <h5 className="text-lg font-bold text-gray-800 mb-3">Debug Features:</h5>
                <ul className="space-y-2 text-sm text-gray-700">
                  <li className="flex items-center gap-2">
                    <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                    <span>Game Debug Panel - Shows real-time game state information</span>
                  </li>
                  <li className="flex items-center gap-2">
                    <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                    <span>Enhanced Console Logging - Detailed browser and server logs</span>
                  </li>
                  <li className="flex items-center gap-2">
                    <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                    <span>Pattern Progress Tracking - Visual indicators for bingo patterns</span>
                  </li>
                  <li className="flex items-center gap-2">
                    <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                    <span>Socket Event Monitoring - Real-time communication debugging</span>
                  </li>
                </ul>
              </div>
            </div>

            {/* System Information */}
            <div className="bg-white/95 backdrop-blur-sm rounded-3xl border-2 border-gray-200/50 p-8 shadow-2xl">
              <div className="flex items-center gap-4 mb-6">
                <div className="w-12 h-12 bg-gradient-to-br from-green-500 to-emerald-600 rounded-xl flex items-center justify-center shadow-lg">
                  <Shield size={24} className="text-white" />
                </div>
                <div>
                  <h4 className="text-xl font-bold text-gray-800 mb-1">System Information</h4>
                  <p className="text-gray-600">
                    Current system status and configuration details.
                  </p>
                </div>
              </div>
              
              <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                <div className="bg-gradient-to-r from-green-50 to-emerald-50 rounded-2xl p-4 border border-green-200">
                  <div className="flex items-center gap-2 mb-2">
                    <CheckCircle size={16} className="text-green-600" />
                    <span className="text-sm font-bold text-green-800">Server Status</span>
                  </div>
                  <p className="text-lg font-bold text-green-700">Online</p>
                </div>
                
                <div className="bg-gradient-to-r from-blue-50 to-indigo-50 rounded-2xl p-4 border border-blue-200">
                  <div className="flex items-center gap-2 mb-2">
                    <Users size={16} className="text-blue-600" />
                    <span className="text-sm font-bold text-blue-800">Active Users</span>
                  </div>
                  <p className="text-lg font-bold text-blue-700">{users.filter(u => u.balance > 0).length}</p>
                </div>
                
                <div className="bg-gradient-to-r from-purple-50 to-pink-50 rounded-2xl p-4 border border-purple-200">
                  <div className="flex items-center gap-2 mb-2">
                    <Home size={16} className="text-purple-600" />
                    <span className="text-sm font-bold text-purple-800">Active Lobbies</span>
                  </div>
                  <p className="text-lg font-bold text-purple-700">{lobbies.filter(l => l.status === 'active').length}</p>
                </div>
              </div>
            </div>
          </div>
        )}
      </main>
      </div>

      {/* Modals - outside main content */}
      {/* Enhanced Ban User Confirmation Modal */}
      {showBanConfirm && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-white/95 backdrop-blur-sm rounded-3xl border-2 border-gray-200/50 p-8 max-w-md w-full shadow-2xl">
            <div className="flex items-center gap-4 mb-6">
              <div className="w-16 h-16 bg-gradient-to-br from-orange-500 to-red-600 rounded-2xl flex items-center justify-center shadow-2xl">
                <AlertTriangle size={32} className="text-white" />
              </div>
              <div>
                <h3 className="text-2xl font-bold bg-gradient-to-r from-gray-800 to-gray-600 bg-clip-text text-transparent mb-2">Ban User</h3>
                <p className="text-lg text-gray-600">
                  Are you sure you want to ban <strong className="text-red-600">{showBanConfirm.email}</strong>? 
              This will prevent them from logging in and playing games.
            </p>
              </div>
            </div>
            <div className="flex gap-4">
              <button
                onClick={confirmBanUser}
                className="flex-1 bg-gradient-to-r from-red-500 to-red-600 hover:from-red-600 hover:to-red-700 text-white py-4 px-6 rounded-2xl font-bold shadow-lg hover:shadow-xl transition-all duration-300"
              >
                Ban User
              </button>
              <button
                onClick={() => setShowBanConfirm(null)}
                className="flex-1 bg-gradient-to-r from-gray-500 to-gray-600 hover:from-gray-600 hover:to-gray-700 text-white py-4 px-6 rounded-2xl font-bold shadow-lg hover:shadow-xl transition-all duration-300"
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Enhanced Delete User Confirmation Modal */}
      {showDeleteConfirm && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-white/95 backdrop-blur-sm rounded-3xl border-2 border-gray-200/50 p-8 max-w-md w-full shadow-2xl">
            <div className="flex items-center gap-4 mb-6">
              <div className="w-16 h-16 bg-gradient-to-br from-red-500 to-pink-600 rounded-2xl flex items-center justify-center shadow-2xl">
                <Trash2 size={32} className="text-white" />
              </div>
              <div>
                <h3 className="text-2xl font-bold bg-gradient-to-r from-gray-800 to-gray-600 bg-clip-text text-transparent mb-2">Delete User</h3>
                <p className="text-lg text-gray-600 mb-4">
                  <strong className="text-red-600">DANGER:</strong> This will permanently delete user <strong className="text-red-600">{showDeleteConfirm.email}</strong> and all their data.
                </p>
                <p className="text-red-600 text-lg font-bold">
              This action cannot be undone!
            </p>
              </div>
            </div>
            <div className="flex gap-4">
              <button
                onClick={confirmDeleteUser}
                className="flex-1 bg-gradient-to-r from-red-500 to-red-600 hover:from-red-600 hover:to-red-700 text-white py-4 px-6 rounded-2xl font-bold shadow-lg hover:shadow-xl transition-all duration-300"
              >
                Delete Permanently
              </button>
              <button
                onClick={() => setShowDeleteConfirm(null)}
                className="flex-1 bg-gradient-to-r from-gray-500 to-gray-600 hover:from-gray-600 hover:to-gray-700 text-white py-4 px-6 rounded-2xl font-bold shadow-lg hover:shadow-xl transition-all duration-300"
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Enhanced Bulk Delete Confirmation Modal */}
      {showBulkDeleteConfirm && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-white/95 backdrop-blur-sm rounded-3xl border-2 border-gray-200/50 p-8 max-w-md w-full shadow-2xl">
            <div className="flex items-center gap-4 mb-6">
              <div className="w-16 h-16 bg-gradient-to-br from-red-500 to-pink-600 rounded-2xl flex items-center justify-center shadow-2xl">
                <Trash2 size={32} className="text-white" />
              </div>
              <div>
                <h3 className="text-2xl font-bold bg-gradient-to-r from-gray-800 to-gray-600 bg-clip-text text-transparent mb-2">Bulk Delete Users</h3>
                <p className="text-lg text-gray-600 mb-4">
                  <strong className="text-red-600">DANGER:</strong> This will permanently delete <strong className="text-red-600">{selectedUsers.size} users</strong> and all their data.
                </p>
              </div>
            </div>
            <div className="bg-gray-50 rounded-2xl p-4 mb-6 max-h-32 overflow-y-auto">
              <p className="text-sm text-gray-600 mb-3 font-bold">Users to be deleted:</p>
              {filteredUsers
                .filter(user => selectedUsers.has(user.id))
                .map(user => (
                  <div key={user.id} className="text-sm text-gray-800 mb-1">
                    • {user.email} (ID: {user.id})
                  </div>
                ))
              }
            </div>
            <p className="text-red-600 text-lg font-bold mb-6">
              This action cannot be undone!
            </p>
            <div className="flex gap-4">
              <button
                onClick={bulkDeleteUsers}
                className="flex-1 bg-gradient-to-r from-red-500 to-red-600 hover:from-red-600 hover:to-red-700 text-white py-4 px-6 rounded-2xl font-bold shadow-lg hover:shadow-xl transition-all duration-300"
              >
                Delete {selectedUsers.size} Users
              </button>
              <button
                onClick={() => setShowBulkDeleteConfirm(false)}
                className="flex-1 bg-gradient-to-r from-gray-500 to-gray-600 hover:from-gray-600 hover:to-gray-700 text-white py-4 px-6 rounded-2xl font-bold shadow-lg hover:shadow-xl transition-all duration-300"
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

      {/* Enhanced Games Management Modal */}
      {showGamesModal && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-white/95 backdrop-blur-sm rounded-3xl border-2 border-gray-200/50 p-8 max-w-4xl w-full max-h-[90vh] overflow-y-auto shadow-2xl">
            <div className="flex items-center justify-between mb-8">
              <div className="flex items-center gap-4">
                <div className="w-16 h-16 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-2xl flex items-center justify-center shadow-2xl">
                  <Eye size={32} className="text-white" />
                </div>
                <div>
                  <h3 className="text-2xl font-bold bg-gradient-to-r from-gray-800 to-gray-600 bg-clip-text text-transparent">
                    Games in {showGamesModal.lobbyName}
              </h3>
                  <p className="text-lg text-gray-600">Manage games and their status</p>
                </div>
              </div>
              <button
                onClick={() => setShowGamesModal(null)}
                className="w-12 h-12 bg-gradient-to-r from-gray-500 to-gray-600 hover:from-gray-600 hover:to-gray-700 text-white rounded-2xl font-bold shadow-lg hover:shadow-xl transition-all duration-300 flex items-center justify-center"
              >
                <X size={24} />
              </button>
            </div>
            
            {loadingGames ? (
              <div className="text-center py-12">
                <div className="w-16 h-16 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-2xl flex items-center justify-center mx-auto mb-4 shadow-2xl animate-spin">
                  <RefreshCw size={32} className="text-white" />
                </div>
                <p className="text-xl font-bold text-gray-600">Loading games...</p>
              </div>
            ) : (
              <div className="space-y-6">
                <div className="flex justify-between items-center bg-gradient-to-r from-blue-50 to-indigo-50 rounded-2xl p-6">
                  <p className="text-lg font-bold text-gray-700">
                    {showGamesModal.games.length} game(s) in this lobby (Max: 4)
                  </p>
                  <div className="flex gap-4">
                    <button
                      onClick={() => addGameToLobby(showGamesModal.lobbyId)}
                      className={`py-3 px-6 rounded-2xl font-bold shadow-lg hover:shadow-xl transition-all duration-300 flex items-center gap-2 ${
                        showGamesModal.games.length >= 4
                          ? 'bg-gradient-to-r from-gray-400 to-gray-500 text-gray-600 cursor-not-allowed'
                          : 'bg-gradient-to-r from-green-500 to-emerald-600 hover:from-green-600 hover:to-emerald-700 text-white'
                      }`}
                      disabled={showGamesModal.games.length >= 4}
                    >
                      <Plus size={18} />
                      Add New Game
                    </button>
                    <button
                      onClick={() => resetLobbyGames(showGamesModal.lobbyId)}
                      className="bg-gradient-to-r from-orange-500 to-red-500 hover:from-orange-600 hover:to-red-600 text-white py-3 px-6 rounded-2xl font-bold shadow-lg hover:shadow-xl transition-all duration-300 flex items-center gap-2"
                    >
                      <RefreshCw size={18} />
                      Reset Lobby
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