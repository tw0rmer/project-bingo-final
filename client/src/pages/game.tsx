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

        {/* Game Status Banner */}
        <div className="mb-6 relative overflow-hidden rounded-2xl bg-gradient-to-r from-purple-900 via-casino-red to-red-900 p-8 shadow-2xl">
          <div className="absolute inset-0 bg-black/20"></div>
          <div className="relative z-10">
            <div className="grid grid-cols-1 lg:grid-cols-4 gap-6 items-center">
              {/* Game Info */}
              <div className="lg:col-span-2">
                <div className="flex items-center gap-3 mb-4">
                  <div className="w-3 h-3 bg-green-400 rounded-full animate-pulse"></div>
                  <span className="text-green-300 font-medium">LIVE GAME</span>
                </div>
                <h2 className="text-2xl sm:text-3xl font-bold text-white mb-2">{game.name}</h2>
                <p className="text-purple-200 text-lg">{lobby.description}</p>
              </div>
              
              {/* Stats Grid */}
              <div className="grid grid-cols-2 gap-4">
                <div className="bg-black/30 rounded-xl p-4 text-center border border-white/10">
                  <div className="text-2xl font-bold text-casino-gold">${lobby.entryFee}</div>
                  <div className="text-purple-200 text-sm">Entry Fee</div>
                </div>
                <div className="bg-black/30 rounded-xl p-4 text-center border border-white/10">
                  <div className="text-2xl font-bold text-green-400">{game.seatsTaken}/{game.maxSeats}</div>
                  <div className="text-purple-200 text-sm">Players</div>
                </div>
              </div>
              
              {/* Prize Pool */}
              <div className="bg-gradient-to-br from-casino-gold/20 to-yellow-500/20 rounded-xl p-6 text-center border border-casino-gold/30">
                <div className="text-casino-gold text-sm font-medium mb-1">PRIZE POOL</div>
                <div className="text-3xl font-bold text-white">${(game.prizePool || 0).toFixed(2)}</div>
                <div className="flex items-center justify-center gap-1 mt-2">
                  <Trophy className="w-4 h-4 text-casino-gold" />
                  <span className="text-casino-gold text-xs">Winner Takes All</span>
                </div>
              </div>
            </div>
            
            {/* Status Badge */}
            <div className="absolute top-4 right-4">
              <span className={`px-4 py-2 rounded-full text-sm font-bold shadow-lg ${
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
          <div className="mb-8 relative overflow-hidden rounded-2xl bg-gradient-to-br from-casino-gold via-yellow-500 to-orange-500 p-8 shadow-2xl">
            <div className="absolute inset-0 bg-black/10"></div>
            <div className="relative z-10">
              <div className="text-center mb-6">
                <h2 className="text-2xl sm:text-3xl font-bold text-white mb-2">🎯 Join This Game</h2>
                <p className="text-yellow-100 text-lg">
                  Select your lucky seat • Entry fee: <span className="font-bold">${lobby.entryFee}</span>
                </p>
              </div>
              
              <div className="grid grid-cols-5 gap-3 mb-6">
                {availableSeats.slice(0, 10).map((seatNumber) => (
                  <button
                    key={seatNumber}
                    onClick={() => handleJoinGame(seatNumber)}
                    disabled={joining}
                    className="group relative bg-white/20 hover:bg-white/30 backdrop-blur-sm border-2 border-white/30 hover:border-white/50 rounded-xl p-4 text-white font-bold transition-all duration-200 hover:scale-105 disabled:opacity-50"
                  >
                    <div className="text-lg">{seatNumber}</div>
                    <div className="text-xs opacity-80">SEAT</div>
                    <div className="absolute inset-0 rounded-xl bg-gradient-to-t from-white/0 to-white/10 opacity-0 group-hover:opacity-100 transition-opacity"></div>
                  </button>
                ))}
              </div>
              
              {availableSeats.length > 10 && (
                <div className="text-center">
                  <p className="text-yellow-100 text-sm bg-black/20 rounded-full px-4 py-2 inline-block">
                    +{availableSeats.length - 10} more seats available
                  </p>
                </div>
              )}
              
              {joining && (
                <div className="text-center">
                  <div className="inline-flex items-center gap-2 bg-black/30 rounded-full px-4 py-2 text-white">
                    <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                    Joining game...
                  </div>
                </div>
              )}
            </div>
          </div>
        )}

        {/* Current Players */}
        <div className="rounded-2xl bg-gradient-to-br from-gray-900 via-gray-800 to-black p-8 shadow-2xl border border-gray-700">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-2xl font-bold text-white flex items-center gap-3">
              <Users className="w-6 h-6 text-casino-gold" />
              Players in Game
            </h2>
            <div className="bg-casino-gold/20 rounded-full px-4 py-2">
              <span className="text-casino-gold font-bold">{participants.length}/{game.maxSeats}</span>
            </div>
          </div>
          
          {participants.length === 0 ? (
            <div className="text-center py-12">
              <div className="w-16 h-16 bg-gray-700 rounded-full mx-auto mb-4 flex items-center justify-center">
                <Users className="w-8 h-8 text-gray-400" />
              </div>
              <p className="text-gray-400 text-lg mb-2">No players yet</p>
              <p className="text-gray-500">Be the first to join this exciting game!</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {participants.map((participant) => (
                <div 
                  key={participant.id} 
                  className={`relative overflow-hidden rounded-xl p-4 border transition-all duration-200 hover:scale-105 ${
                    participant.userId === userInfo.id 
                      ? 'bg-gradient-to-br from-casino-gold/20 to-yellow-500/20 border-casino-gold/50' 
                      : 'bg-gradient-to-br from-gray-700/50 to-gray-800/50 border-gray-600/50'
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <div>
                      <div className="flex items-center gap-2">
                        <div className={`w-3 h-3 rounded-full ${
                          participant.userId === userInfo.id ? 'bg-casino-gold' : 'bg-green-400'
                        }`}></div>
                        <p className={`font-bold ${
                          participant.userId === userInfo.id ? 'text-casino-gold' : 'text-white'
                        }`}>
                          {participant.user?.email?.split('@')[0] || `Player ${participant.userId}`}
                          {participant.userId === userInfo.id && ' (You)'}
                        </p>
                      </div>
                      <p className="text-gray-400 text-sm mt-1">Seat #{participant.seatNumber}</p>
                    </div>
                    <div className="text-xs text-gray-500">
                      {new Date(participant.joinedAt).toLocaleTimeString()}
                    </div>
                  </div>
                  
                  {participant.userId === userInfo.id && (
                    <div className="absolute top-2 right-2">
                      <span className="bg-casino-gold text-black text-xs font-bold px-2 py-1 rounded-full">
                        YOU
                      </span>
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </SiteLayout>
  );
}