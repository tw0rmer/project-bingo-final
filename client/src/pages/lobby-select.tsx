import React, { useState, useEffect } from 'react';
import { SiteLayout } from '@/components/SiteLayout';
import { useLocation, useParams } from 'wouter';
import { useAuth } from '../contexts/AuthContext';
import { apiRequest } from '../lib/api';
import { Button } from '@/components/ui/button';
import { ArrowLeft, Play, Users, DollarSign, Trophy } from 'lucide-react';

interface Game {
  id: number;
  lobbyId: number;
  name: string;
  gameNumber: number;
  maxSeats: number;
  seatsTaken: number;
  winnerId: number | null;
  status: string;
  prizePool: number;
}

interface Lobby {
  id: number;
  name: string;
  description: string;
  entryFee: number;
  maxGames: number;
  status: string;
}

interface User {
  id: number;
  email: string;
  balance: number;
  isAdmin?: boolean;
}

export default function LobbySelectPage() {
  const params = useParams();
  const lobbyId = parseInt(params.id || '0');
  const [, setLocation] = useLocation();
  const { user } = useAuth();
  
  const [lobby, setLobby] = useState<Lobby | null>(null);
  const [games, setGames] = useState<Game[]>([]);
  const [userInfo, setUserInfo] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        setError('');

        const token = localStorage.getItem('token');
        if (!token) {
          setError('No authentication token found');
          setLocation('/login');
          return;
        }

        // Fetch lobby, games, and user data
        const [lobbyResponse, gamesResponse, userResponse] = await Promise.all([
          apiRequest<Lobby>(`/lobbies/${lobbyId}`, {
            headers: { 'Authorization': `Bearer ${token}` }
          }),
          apiRequest<Game[]>(`/lobbies/${lobbyId}/games`, {
            headers: { 'Authorization': `Bearer ${token}` }
          }),
          apiRequest<{ user: User }>('/dashboard', {
            headers: { 'Authorization': `Bearer ${token}` }
          }).then(data => data.user)
        ]);

        setLobby(lobbyResponse);
        setGames(gamesResponse);
        setUserInfo(userResponse);

        console.log('[LOBBY SELECT] Data loaded:', {
          lobby: lobbyResponse.name,
          gamesCount: gamesResponse.length,
          userEmail: userResponse.email
        });

      } catch (error) {
        console.error('[LOBBY SELECT] Error fetching data:', error);
        setError('Failed to load lobby data');
      } finally {
        setLoading(false);
      }
    };

    if (lobbyId) {
      fetchData();
    } else {
      setError('Invalid lobby ID');
      setLoading(false);
    }
  }, [lobbyId, setLocation]);

  const handleJoinGame = (gameId: number) => {
    setLocation(`/games/${gameId}`);
  };

  const handleBackToDashboard = () => {
    setLocation('/dashboard');
  };

  if (loading) {
    return (
      <SiteLayout hideAuthButtons>
        <div className="max-w-7xl mx-auto p-6">
          <div className="flex items-center justify-center min-h-96">
            <div className="animate-spin w-8 h-8 border-4 border-casino-gold border-t-transparent rounded-full" />
          </div>
        </div>
      </SiteLayout>
    );
  }

  if (error) {
    return (
      <SiteLayout hideAuthButtons>
        <div className="max-w-7xl mx-auto p-6">
          <div className="bg-red-50 border border-red-200 rounded-lg p-4 text-center">
            <p className="text-red-600 mb-4">{error}</p>
            <Button onClick={handleBackToDashboard} variant="outline">
              <ArrowLeft className="w-4 h-4 mr-2" />
              Back to Dashboard
            </Button>
          </div>
        </div>
      </SiteLayout>
    );
  }

  if (!lobby || !userInfo) {
    return null;
  }

  return (
    <SiteLayout hideAuthButtons>
      <div className="max-w-7xl mx-auto p-3 sm:p-6">
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-4">
            <Button 
              onClick={handleBackToDashboard} 
              variant="outline" 
              size="sm"
              className="shrink-0"
            >
              <ArrowLeft className="w-4 h-4 mr-2" />
              Back
            </Button>
            <div>
              <h1 className="text-2xl sm:text-3xl font-bold text-gray-900">{lobby.name}</h1>
              <p className="text-gray-600 text-sm">{lobby.description}</p>
            </div>
          </div>
          <div className="text-right">
            <p className="text-sm text-gray-500">Your Balance</p>
            <p className="text-xl font-bold text-green-600">${userInfo.balance.toFixed(2)}</p>
          </div>
        </div>

        {/* Lobby Info Card */}
        <div className="mb-6 rounded-xl bg-gradient-to-r from-casino-gold to-yellow-400 p-4 sm:p-6 shadow-lg">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            <div>
              <h2 className="text-lg sm:text-xl font-bold text-white mb-2">Lobby Information</h2>
              <div className="flex flex-wrap gap-4 text-yellow-100">
                <div className="flex items-center gap-1">
                  <DollarSign className="w-4 h-4" />
                  <span className="text-sm">Entry Fee: ${lobby.entryFee}</span>
                </div>
                <div className="flex items-center gap-1">
                  <Play className="w-4 h-4" />
                  <span className="text-sm">{lobby.maxGames} Games Available</span>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Games List */}
        <div className="rounded-xl bg-white p-4 sm:p-6 shadow-lg border-2 border-casino-gold">
          <h2 className="text-lg sm:text-xl font-bold text-gray-900 mb-4">Select Games to Join</h2>
          <p className="text-gray-600 text-sm mb-6">
            You can join up to 4 games simultaneously. Each game has a ${lobby.entryFee} entry fee per seat.
          </p>

          {games.length === 0 ? (
            <p className="text-gray-600 text-center py-8">No games available in this lobby.</p>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-2 gap-4">
              {games.map((game) => (
                <div 
                  key={game.id} 
                  className="bg-gradient-to-br from-gray-50 to-white rounded-lg shadow-md border border-gray-200 p-4 hover:shadow-lg transition-all"
                >
                  {/* Game Header */}
                  <div className="flex justify-between items-start mb-3">
                    <div>
                      <h3 className="text-base sm:text-lg font-bold text-casino-red">
                        Game {game.gameNumber}
                      </h3>
                      <p className="text-xs text-gray-500">{game.name}</p>
                    </div>
                    <span className={`px-2 py-1 rounded-full text-xs font-bold ${
                      game.status === 'waiting' ? 'bg-green-100 text-green-700' : 
                      game.status === 'active' ? 'bg-yellow-100 text-yellow-700' : 
                      'bg-purple-100 text-purple-700'
                    }`}>
                      {game.status.toUpperCase()}
                    </span>
                  </div>
                  
                  {/* Game Stats */}
                  <div className="space-y-2 mb-4">
                    <div className="flex justify-between text-sm">
                      <span className="text-gray-600 flex items-center gap-1">
                        <Users className="w-3 h-3" />
                        Players:
                      </span>
                      <span className="font-semibold text-gray-900">
                        {game.seatsTaken}/{game.maxSeats}
                      </span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span className="text-gray-600 flex items-center gap-1">
                        <Trophy className="w-3 h-3" />
                        Prize Pool:
                      </span>
                      <span className="font-bold text-green-600">
                        ${game.prizePool.toFixed(2)}
                      </span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span className="text-gray-600 flex items-center gap-1">
                        <DollarSign className="w-3 h-3" />
                        Entry Fee:
                      </span>
                      <span className="font-semibold text-gray-900">
                        ${lobby.entryFee}
                      </span>
                    </div>
                  </div>
                  
                  {/* Join Button */}
                  <Button 
                    onClick={() => handleJoinGame(game.id)} 
                    className={`w-full ${
                      game.status === 'waiting' 
                        ? 'bg-casino-gold text-white hover:bg-yellow-500' 
                        : game.status === 'active'
                        ? 'bg-blue-600 text-white hover:bg-blue-700'
                        : 'bg-gray-200 text-gray-600 cursor-not-allowed'
                    }`}
                    disabled={game.status === 'finished'}
                  >
                    <Play className="w-4 h-4 mr-2" />
                    {game.status === 'waiting' ? 'Join Game' : 
                     game.status === 'active' ? 'Join In Progress' : 
                     'Game Finished'}
                  </Button>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </SiteLayout>
  );
}