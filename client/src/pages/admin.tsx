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
      <main className="mx-auto max-w-7xl p-4">
        {/* Tabs */}
        <div className="mb-6 border-b border-gray-200">
          <nav className="-mb-px flex space-x-8">
            {[
              { id: 'users', label: 'Users', count: users.length },
              { id: 'lobbies', label: 'Lobbies', count: lobbies.length },
              { id: 'transactions', label: 'Transactions', count: transactions.length }
            ].map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id as any)}
                className={`py-2 px-1 border-b-2 font-medium text-sm ${
                  activeTab === tab.id
                    ? 'border-casino-gold text-casino-red'
                    : 'border-transparent text-gray-600 hover:text-gray-800 hover:border-gray-300'
                }`}
              >
                {tab.label} ({tab.count})
              </button>
            ))}
          </nav>
        </div>

        {/* Users Tab */}
        {activeTab === 'users' && (
          <div className="space-y-6">
            <div className="overflow-x-auto">
              <table className="min-w-full bg-white rounded-lg">
                <thead>
                  <tr className="bg-gray-100">
                    <th className="px-4 py-3 text-left">ID</th>
                    <th className="px-4 py-3 text-left">Email</th>
                    <th className="px-4 py-3 text-left">Username</th>
                    <th className="px-4 py-3 text-left">Balance</th>
                    <th className="px-4 py-3 text-left">Admin</th>
                    <th className="px-4 py-3 text-left">Created</th>
                    <th className="px-4 py-3 text-left">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {users.map((user) => (
                    <tr key={user.id} className="border-t border-gray-200">
                      <td className="px-4 py-3">{user.id}</td>
                      <td className="px-4 py-3">{user.email}</td>
                      <td className="px-4 py-3">{(user as any).username || '-'}</td>
                      <td className="px-4 py-3">${user.balance}</td>
                      <td className="px-4 py-3">
                        {user.isAdmin ? (
                          <span className="bg-casino-gold text-white px-2 py-1 rounded text-xs">ADMIN</span>
                        ) : (
                          <span className="bg-gray-800 text-white px-2 py-1 rounded text-xs">USER</span>
                        )}
                      </td>
                      <td className="px-4 py-3">
                        {new Date(user.createdAt).toLocaleDateString()}
                      </td>
                      <td className="px-4 py-3">
                        <div className="flex space-x-2">
                          <button
                            onClick={() => setShowEditUser(user)}
                            className="bg-blue-600 px-2 py-1 rounded text-xs text-white hover:bg-blue-700"
                          >
                            Edit Balance
                          </button>
                          <button
                            onClick={async () => {
                              const newUsername = prompt('Set username', (user as any).username || '') || '';
                              if (!newUsername) return;
                              try { await authApiRequest(`/admin/users/${user.id}/username`, { method: 'PUT', body: JSON.stringify({ username: newUsername }) }); fetchData(); } catch (e:any) { setError(e.message||'Failed to update username'); }
                            }}
                            className="bg-purple-600 px-2 py-1 rounded text-xs text-white hover:bg-purple-700"
                          >
                            Set Username
                          </button>
                          <button
                            onClick={() => toggleUserAdmin(user.id, !user.isAdmin)}
                            className={`px-2 py-1 rounded text-xs text-white ${
                              user.isAdmin 
                                ? 'bg-red-600 hover:bg-red-700' 
                                : 'bg-casino-red hover:opacity-90'
                            }`}
                          >
                            {user.isAdmin ? 'Remove Admin' : 'Make Admin'}
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* Lobbies Tab */}
        {activeTab === 'lobbies' && (
          <div className="space-y-6">
            <div className="flex justify-between items-center">
              <h2 className="text-xl font-bold">Lobby Management</h2>
              <button
                onClick={() => setShowCreateLobby(true)}
                className="bg-green-600 px-4 py-2 rounded hover:bg-green-700"
              >
                Create Lobby
              </button>
            </div>

            <div className="overflow-x-auto">
              <table className="min-w-full bg-white rounded-lg">
                <thead>
                  <tr className="bg-gray-100">
                    <th className="px-4 py-3 text-left">ID</th>
                    <th className="px-4 py-3 text-left">Name</th>
                    <th className="px-4 py-3 text-left">Entry Fee</th>
                    <th className="px-4 py-3 text-left">Seats</th>
                    <th className="px-4 py-3 text-left">Status</th>
                    <th className="px-4 py-3 text-left">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {lobbies.map((lobby) => (
                    <tr key={lobby.id} className="border-t border-gray-200">
                      <td className="px-4 py-3">{lobby.id}</td>
                      <td className="px-4 py-3">{lobby.name}</td>
                      <td className="px-4 py-3">${lobby.entryFee}</td>
                      <td className="px-4 py-3">{lobby.seatsTaken}/{lobby.maxSeats}</td>
                      <td className="px-4 py-3">
                        <span className={`px-2 py-1 rounded text-xs text-white ${
                          lobby.status === 'active' ? 'bg-green-600' :
                          lobby.status === 'waiting' ? 'bg-casino-gold' : 'bg-gray-600'
                        }`}>
                          {lobby.status.toUpperCase()}
                        </span>
                      </td>
                      <td className="px-4 py-3">
                        <div className="flex space-x-2">
                          <button
                            onClick={() => setShowEditLobby(lobby)}
                            className="bg-blue-600 px-2 py-1 rounded text-xs text-white hover:bg-blue-700"
                          >
                            Edit
                          </button>
                          <button
                            onClick={() => fillLobbyWithBots(lobby.id)}
                            className="bg-casino-red px-2 py-1 rounded text-xs text-white hover:opacity-90"
                            disabled={lobby.seatsTaken >= lobby.maxSeats}
                          >
                            Fill Bots
                          </button>
                          <button
                            onClick={() => resetLobby(lobby.id)}
                            className="bg-gray-800 px-2 py-1 rounded text-xs text-white hover:bg-black"
                          >
                            Reset
                          </button>
                          <button
                            onClick={() => startLobbyGame(lobby.id)}
                            className="bg-green-600 px-2 py-1 rounded text-xs text-white hover:bg-green-700"
                            disabled={lobby.status === 'active'}
                          >
                            Start
                          </button>
                          {lobby.status === 'active' && (
                            <>
                              {!gameMetaByLobby[lobby.id]?.isPaused && (
                                <button onClick={() => pauseLobbyGame(lobby.id)} className="bg-indigo-600 px-2 py-1 rounded text-xs text-white hover:bg-indigo-700">Pause</button>
                              )}
                              {gameMetaByLobby[lobby.id]?.isPaused && (
                                <button onClick={() => resumeLobbyGame(lobby.id)} className="bg-indigo-500 px-2 py-1 rounded text-xs text-white hover:bg-indigo-600">Resume</button>
                              )}
                              <button onClick={() => stopLobbyGame(lobby.id)} className="bg-yellow-600 px-2 py-1 rounded text-xs text-white hover:bg-yellow-700">Stop</button>
                              <button onClick={() => setLobbySpeed(lobby.id)} className="bg-casino-gold px-2 py-1 rounded text-xs text-white hover:bg-yellow-500">Speed</button>
                            </>
                          )}
                          <button
                            onClick={() => deleteLobby(lobby.id)}
                            className="bg-red-600 px-2 py-1 rounded text-xs text-white hover:bg-red-700"
                          >
                            Delete
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* Transactions Tab */}
        {activeTab === 'transactions' && (
          <div className="space-y-6">
            <div className="overflow-x-auto">
              <table className="min-w-full bg-white rounded-lg">
                <thead>
                  <tr className="bg-gray-100">
                    <th className="px-4 py-3 text-left">ID</th>
                    <th className="px-4 py-3 text-left">User ID</th>
                    <th className="px-4 py-3 text-left">Amount</th>
                    <th className="px-4 py-3 text-left">Type</th>
                    <th className="px-4 py-3 text-left">Description</th>
                    <th className="px-4 py-3 text-left">Date</th>
                  </tr>
                </thead>
                <tbody>
                  {transactions.map((transaction) => (
                    <tr key={transaction.id} className="border-t border-gray-200">
                      <td className="px-4 py-3">{transaction.id}</td>
                      <td className="px-4 py-3">{transaction.userId}</td>
                      <td className="px-4 py-3">
                        <span className={parseFloat(transaction.amount) >= 0 ? 'text-green-700' : 'text-red-700'}>
                          {parseFloat(transaction.amount) >= 0 ? '+' : ''}${transaction.amount}
                        </span>
                      </td>
                      <td className="px-4 py-3">
                        <span className={`px-2 py-1 rounded text-xs text-white ${
                          transaction.type === 'deposit' ? 'bg-green-600' :
                          transaction.type === 'withdrawal' ? 'bg-red-600' : 'bg-blue-600'
                        }`}>
                          {transaction.type.toUpperCase()}
                        </span>
                      </td>
                      <td className="px-4 py-3">{transaction.description}</td>
                      <td className="px-4 py-3">
                        {new Date(transaction.createdAt).toLocaleDateString()}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </main>

      {/* Modals */}
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