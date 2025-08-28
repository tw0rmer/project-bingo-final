import React, { useState, useEffect } from 'react';
import { SiteLayout } from '@/components/SiteLayout';
import { useLocation, useParams } from 'wouter';
import { useAuth } from '../contexts/AuthContext';
import { useSocket } from '../contexts/SocketContext';
import { apiRequest } from '../lib/api';
import { Button } from '@/components/ui/button';
import { ArrowLeft, Users, DollarSign, Trophy, Play } from 'lucide-react';

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
  balance: number | string;
  isAdmin?: boolean;
}

interface Participant {
  id: number;
  gameId: number;
  userId: number;
  seatNumber: number;
  joinedAt: string;
  user?: {
    id: number;
    email: string;
  };
}

export default function GamePage() {
  const params = useParams();
  const gameId = parseInt(params.id || '0');
  const [, setLocation] = useLocation();
  const { user } = useAuth();
  const { socket } = useSocket();
  
  const [game, setGame] = useState<Game | null>(null);
  const [lobby, setLobby] = useState<Lobby | null>(null);
  const [participants, setParticipants] = useState<Participant[]>([]);
  const [userInfo, setUserInfo] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [joining, setJoining] = useState(false);
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

        // Fetch game data
        const gameResponse = await apiRequest<Game>(`/games/${gameId}`, {
          headers: { 'Authorization': `Bearer ${token}` }
        });

        setGame(gameResponse);

        // Fetch lobby data
        const lobbyResponse = await apiRequest<Lobby>(`/lobbies/${gameResponse.lobbyId}`, {
          headers: { 'Authorization': `Bearer ${token}` }
        });

        setLobby(lobbyResponse);

        // Fetch participants and user data
        const [participantsResponse, userResponse] = await Promise.all([
          apiRequest<Participant[]>(`/games/${gameId}/participants`, {
            headers: { 'Authorization': `Bearer ${token}` }
          }),
          apiRequest<{ user: User }>('/dashboard', {
            headers: { 'Authorization': `Bearer ${token}` }
          }).then(data => data.user)
        ]);

        setParticipants(participantsResponse);
        setUserInfo(userResponse);

        console.log('[GAME PAGE] Data loaded:', {
          game: gameResponse.name,
          lobby: lobbyResponse.name,
          participants: participantsResponse.length,
          userEmail: userResponse.email
        });

      } catch (error) {
        console.error('[GAME PAGE] Error fetching data:', error);
        setError('Failed to load game data');
      } finally {
        setLoading(false);
      }
    };

    if (gameId) {
      fetchData();
    } else {
      setError('Invalid game ID');
      setLoading(false);
    }
  }, [gameId, setLocation]);

  const handleJoinGame = async (seatNumber: number) => {
    if (!game || !userInfo) return;

    try {
      setJoining(true);
      const token = localStorage.getItem('token');

      await apiRequest(`/games/${gameId}/join`, {
        method: 'POST',
        headers: { 
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ seatNumber })
      });

      // Refresh participant data
      const participantsResponse = await apiRequest<Participant[]>(`/games/${gameId}/participants`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      setParticipants(participantsResponse);

    } catch (error: any) {
      console.error('[GAME PAGE] Join error:', error);
      setError(error.message || 'Failed to join game');
    } finally {
      setJoining(false);
    }
  };

  const handleBackToLobby = () => {
    if (lobby) {
      setLocation(`/lobby-select/${lobby.id}`);
    } else {
      setLocation('/dashboard');
    }
  };

  const handleBackToDashboard = () => {
    setLocation('/dashboard');
  };

  const getUserSeat = () => {
    if (!userInfo) return null;
    return participants.find(p => p.userId === userInfo.id);
  };

  const isUserInGame = () => {
    return getUserSeat() !== undefined;
  };

  const getAvailableSeats = () => {
    const occupiedSeats = participants.map(p => p.seatNumber);
    const available = [];
    for (let i = 1; i <= (game?.maxSeats || 15); i++) {
      if (!occupiedSeats.includes(i)) {
        available.push(i);
      }
    }
    return available;
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
            <div className="flex gap-2 justify-center">
              <Button onClick={handleBackToDashboard} variant="outline">
                <ArrowLeft className="w-4 h-4 mr-2" />
                Back to Dashboard
              </Button>
              {lobby && (
                <Button onClick={handleBackToLobby} variant="outline">
                  Back to Lobby
                </Button>
              )}
            </div>
          </div>
        </div>
      </SiteLayout>
    );
  }

  if (!game || !lobby || !userInfo) {
    return null;
  }

  const availableSeats = getAvailableSeats();
  const userSeat = getUserSeat();

  return (
    <SiteLayout hideAuthButtons>
      <div className="max-w-7xl mx-auto p-3 sm:p-6">
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-4">
            <Button 
              onClick={handleBackToLobby} 
              variant="outline" 
              size="sm"
              className="shrink-0"
            >
              <ArrowLeft className="w-4 h-4 mr-2" />
              Back to Lobby
            </Button>
            <div>
              <h1 className="text-2xl sm:text-3xl font-bold text-gray-900">{game.name}</h1>
              <p className="text-gray-600 text-sm">{lobby.name}</p>
            </div>
          </div>
          <div className="text-right">
            <p className="text-sm text-gray-500">Your Balance</p>
            <p className="text-xl font-bold text-green-600">
              ${typeof userInfo.balance === 'number' ? userInfo.balance.toFixed(2) : parseFloat(userInfo.balance?.toString() || '0').toFixed(2)}
            </p>
          </div>
        </div>

        {/* Game Info Card */}
        <div className="mb-6 rounded-xl bg-gradient-to-r from-casino-gold to-yellow-400 p-4 sm:p-6 shadow-lg">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            <div>
              <h2 className="text-lg sm:text-xl font-bold text-white mb-2">Game Information</h2>
              <div className="flex flex-wrap gap-4 text-yellow-100">
                <div className="flex items-center gap-1">
                  <DollarSign className="w-4 h-4" />
                  <span className="text-sm">Entry Fee: ${lobby.entryFee}</span>
                </div>
                <div className="flex items-center gap-1">
                  <Users className="w-4 h-4" />
                  <span className="text-sm">{game.seatsTaken}/{game.maxSeats} Players</span>
                </div>
                <div className="flex items-center gap-1">
                  <Trophy className="w-4 h-4" />
                  <span className="text-sm">Prize Pool: ${(game.prizePool || 0).toFixed(2)}</span>
                </div>
              </div>
            </div>
            <div className="bg-white/20 rounded-lg p-3">
              <p className="text-yellow-100 text-sm mb-1">Game Status</p>
              <span className={`px-3 py-1 rounded-full text-sm font-bold ${
                game.status === 'waiting' ? 'bg-green-500 text-white' : 
                game.status === 'active' ? 'bg-blue-500 text-white' : 
                'bg-gray-500 text-white'
              }`}>
                {game.status.toUpperCase()}
              </span>
            </div>
          </div>
        </div>

        {/* User Status */}
        {isUserInGame() && userSeat && (
          <div className="mb-6 rounded-lg bg-green-50 border border-green-200 p-4">
            <h3 className="text-green-800 font-semibold mb-1">You're in this game!</h3>
            <p className="text-green-600 text-sm">Seat #{userSeat.seatNumber}</p>
          </div>
        )}

        {/* Join Game Section */}
        {!isUserInGame() && game.status === 'waiting' && availableSeats.length > 0 && (
          <div className="mb-6 rounded-xl bg-white p-4 sm:p-6 shadow-lg border-2 border-casino-gold">
            <h2 className="text-lg sm:text-xl font-bold text-gray-900 mb-4">Join This Game</h2>
            <p className="text-gray-600 text-sm mb-4">
              Choose a seat to join this game. Entry fee of ${lobby.entryFee} will be deducted from your balance.
            </p>
            <div className="grid grid-cols-5 gap-2 mb-4">
              {availableSeats.slice(0, 10).map((seatNumber) => (
                <Button
                  key={seatNumber}
                  onClick={() => handleJoinGame(seatNumber)}
                  disabled={joining}
                  className="bg-casino-gold hover:bg-yellow-500 text-white"
                  size="sm"
                >
                  Seat {seatNumber}
                </Button>
              ))}
            </div>
            {availableSeats.length > 10 && (
              <p className="text-gray-500 text-sm">
                +{availableSeats.length - 10} more seats available
              </p>
            )}
          </div>
        )}

        {/* Current Players */}
        <div className="rounded-xl bg-white p-4 sm:p-6 shadow-lg border border-gray-200">
          <h2 className="text-lg sm:text-xl font-bold text-gray-900 mb-4">Current Players</h2>
          {participants.length === 0 ? (
            <p className="text-gray-600 text-center py-8">No players have joined yet. Be the first!</p>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {participants.map((participant) => (
                <div 
                  key={participant.id} 
                  className={`bg-gray-50 rounded-lg p-3 border ${
                    participant.userId === userInfo.id ? 'border-green-300 bg-green-50' : 'border-gray-200'
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="font-medium text-gray-900">
                        {participant.user?.email?.split('@')[0] || `User ${participant.userId}`}
                        {participant.userId === userInfo.id && ' (You)'}
                      </p>
                      <p className="text-sm text-gray-500">Seat #{participant.seatNumber}</p>
                    </div>
                    <div className="text-xs text-gray-400">
                      {new Date(participant.joinedAt).toLocaleTimeString()}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </SiteLayout>
  );
}