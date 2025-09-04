import React, { useState, useEffect } from 'react';
import { SiteLayout } from '@/components/SiteLayout';
import { useLocation, useParams } from 'wouter';
import { useAuth } from '../contexts/AuthContext';
import { apiRequest } from '../lib/api';
import { Button } from '@/components/ui/button';
import { ArrowLeft, Play, Users, DollarSign, Trophy, Sparkles, Star, Crown, Gamepad2, Timer, RefreshCw, Target } from 'lucide-react';

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
        <div className="min-h-screen bg-gradient-to-br from-purple-50 via-pink-50 to-orange-50 flex items-center justify-center relative overflow-hidden">
          {/* Background decorations */}
          <div className="absolute inset-0">
            <div className="absolute top-20 left-10 w-20 h-20 bg-gradient-to-br from-purple-300 to-pink-400 rounded-full opacity-20 animate-bounce-soft"></div>
            <div className="absolute top-40 right-20 w-16 h-16 bg-gradient-to-br from-pink-300 to-orange-400 rounded-full opacity-20 animate-pulse"></div>
            <div className="absolute bottom-32 left-1/4 w-24 h-24 bg-gradient-to-br from-orange-300 to-red-400 rounded-full opacity-15 animate-bounce-soft" style={{ animationDelay: '1s' }}></div>
          </div>
          
          <div className="text-center relative z-10">
            <div className="bg-white/95 backdrop-blur-sm rounded-3xl p-12 shadow-2xl border-2 border-gradient-to-r from-purple-200 to-pink-200">
              <div className="w-20 h-20 bg-gradient-to-br from-purple-500 to-pink-600 rounded-2xl flex items-center justify-center mx-auto mb-6 shadow-lg">
                <div className="animate-spin rounded-full h-12 w-12 border-4 border-white border-t-transparent"></div>
              </div>
              <h2 className="text-2xl font-black text-transparent bg-clip-text bg-gradient-to-r from-purple-600 to-pink-600 mb-2">Loading Lobby</h2>
              <p className="text-gray-700 font-medium">Preparing your gaming experience...</p>
            </div>
          </div>
        </div>
      </SiteLayout>
    );
  }

  if (error) {
    return (
      <SiteLayout hideAuthButtons>
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
              <Button 
                onClick={handleBackToDashboard} 
                className="bg-gradient-to-r from-blue-500 to-indigo-600 hover:from-blue-600 hover:to-indigo-700 text-white px-8 py-3 rounded-2xl font-bold shadow-lg transition-all duration-300 transform hover:scale-105"
              >
              <ArrowLeft className="w-4 h-4 mr-2" />
              Back to Dashboard
            </Button>
            </div>
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
      <div className="min-h-screen bg-gradient-to-br from-indigo-50 via-purple-50 to-pink-50 relative overflow-hidden">
        {/* Background decorations */}
        <div className="absolute inset-0">
          <div className="absolute top-20 left-10 w-20 h-20 bg-gradient-to-br from-indigo-300 to-purple-400 rounded-full opacity-20 animate-bounce-soft"></div>
          <div className="absolute top-40 right-20 w-16 h-16 bg-gradient-to-br from-purple-300 to-pink-400 rounded-full opacity-20 animate-pulse"></div>
          <div className="absolute bottom-32 left-1/4 w-24 h-24 bg-gradient-to-br from-pink-300 to-red-400 rounded-full opacity-15 animate-bounce-soft" style={{ animationDelay: '1s' }}></div>
          
          {/* Floating sparkles */}
          <div className="absolute top-32 right-1/4 opacity-20">
            <Sparkles className="text-purple-400 animate-pulse" size={20} />
          </div>
          <div className="absolute bottom-40 left-1/3 opacity-15">
            <Star className="text-indigo-400 animate-bounce-soft" size={16} />
          </div>
        </div>
        
        <div className="max-w-6xl mx-auto p-3 sm:p-6 relative z-10">
          {/* Compact Grid Layout */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
            
            {/* Left Column - Header Info */}
            <div className="lg:col-span-2">
              <div className="bg-white/95 backdrop-blur-sm rounded-2xl p-4 shadow-xl border-2 border-gradient-to-r from-indigo-200 to-purple-200 relative overflow-hidden">
                <div className="absolute inset-0 bg-gradient-to-br from-indigo-50/30 to-purple-50/30"></div>
                <div className="absolute top-2 right-2">
                  <Gamepad2 className="text-purple-400 animate-pulse" size={20} />
                </div>
                
                <div className="flex items-center justify-between gap-4 relative z-10">
                  <div className="flex items-center space-x-3">
            <Button 
              onClick={handleBackToDashboard} 
                      className="bg-gradient-to-r from-gray-500 to-gray-600 hover:from-gray-600 hover:to-gray-700 text-white px-3 py-2 rounded-xl font-bold shadow-lg transition-all duration-300 transform hover:scale-105"
            >
                      <ArrowLeft className="w-4 h-4 mr-1" />
              Back
            </Button>
                    <div className="flex items-center">
                      <div className="w-10 h-10 bg-gradient-to-br from-purple-500 to-indigo-600 rounded-xl flex items-center justify-center shadow-lg mr-2">
                        <Crown className="text-white" size={20} />
                      </div>
            <div>
                        <h1 className="text-xl font-black text-transparent bg-clip-text bg-gradient-to-r from-purple-600 to-indigo-600">
                          {lobby.name}
                        </h1>
                        <p className="text-xs text-gray-700 font-medium">{lobby.description}</p>
                      </div>
                    </div>
                  </div>
                  
                  <div className="bg-white/70 rounded-xl px-3 py-2 shadow-lg">
                    <div className="text-center">
                      <div className="flex items-center justify-center mb-1">
                        <DollarSign className="w-3 h-3 text-green-600 mr-1" />
                        <p className="text-xs text-gray-600 font-bold uppercase tracking-wider">Balance</p>
                      </div>
                      <p className="text-lg font-black text-transparent bg-clip-text bg-gradient-to-r from-green-600 to-emerald-600">
                        ${userInfo.balance.toFixed(2)}
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Right Column - Lobby Stats */}
            <div className="lg:col-span-1">
              <div className="bg-white/95 backdrop-blur-sm rounded-2xl p-4 shadow-xl border-2 border-gray-200 relative overflow-hidden">
                {/* Subtle background pattern */}
                <div className="absolute inset-0 bg-gradient-to-br from-blue-50/30 to-purple-50/30"></div>
                
                <div className="relative z-10">
                  <div className="flex items-center justify-between mb-4">
                    <div className="flex items-center">
                      <div className="w-8 h-8 bg-gradient-to-br from-blue-500 to-purple-600 rounded-lg flex items-center justify-center mr-2 shadow-sm">
                        <Gamepad2 className="text-white" size={16} />
                      </div>
                      <h2 className="text-lg font-bold text-gray-800">Lobby Details</h2>
                    </div>
                    <div className="w-6 h-6 bg-gradient-to-br from-emerald-400 to-teal-500 rounded-full flex items-center justify-center">
                      <span className="text-white text-xs font-bold">i</span>
                    </div>
                  </div>
                  
                  <div className="space-y-3">
                    {/* Entry Fee */}
                    <div className="bg-gradient-to-r from-emerald-50 to-teal-50 rounded-xl p-3 border border-emerald-200">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center">
                          <div className="w-6 h-6 bg-gradient-to-br from-emerald-500 to-teal-600 rounded-md flex items-center justify-center mr-2">
                            <DollarSign className="w-3 h-3 text-white" />
                          </div>
                          <div>
                            <p className="text-xs text-gray-600 font-medium">Entry Fee</p>
                            <p className="text-lg font-bold text-gray-800">${lobby.entryFee}</p>
            </div>
          </div>
          <div className="text-right">
                          <p className="text-xs text-emerald-600 font-medium">Per Game</p>
                        </div>
          </div>
        </div>

                    {/* Games Count */}
                    <div className="bg-gradient-to-r from-blue-50 to-indigo-50 rounded-xl p-3 border border-blue-200">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center">
                          <div className="w-6 h-6 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-md flex items-center justify-center mr-2">
                            <Play className="w-3 h-3 text-white" />
                          </div>
            <div>
                            <p className="text-xs text-gray-600 font-medium">Available Games</p>
                            <p className="text-lg font-bold text-gray-800">{lobby.maxGames}</p>
                          </div>
                        </div>
                        <div className="text-right">
                          <p className="text-xs text-blue-600 font-medium">Max</p>
                        </div>
                      </div>
                    </div>
                </div>
                </div>
              </div>
            </div>
          </div>

          {/* Games Grid */}
          <div className="mt-4">
            <div className="bg-white/95 backdrop-blur-sm rounded-2xl p-4 shadow-xl border-2 border-gradient-to-r from-cyan-200 to-blue-200 relative overflow-hidden">
              <div className="absolute top-2 right-2">
                <Gamepad2 className="text-cyan-400 animate-pulse" size={20} />
        </div>

              <div className="flex items-center mb-4">
                <div className="w-8 h-8 bg-gradient-to-br from-cyan-500 to-blue-600 rounded-lg flex items-center justify-center mr-2">
                  <Play className="text-white" size={16} />
                </div>
                <div>
                  <h2 className="text-lg font-black text-transparent bg-clip-text bg-gradient-to-r from-cyan-600 to-blue-600">Select Games</h2>
                  <p className="text-xs text-gray-700 font-medium">
                    Join up to 4 games simultaneously • ${lobby.entryFee} per seat
                  </p>
                </div>
              </div>

          {games.length === 0 ? (
                <div className="text-center py-8">
                  <div className="w-16 h-16 bg-gradient-to-br from-gray-300 to-gray-400 rounded-xl flex items-center justify-center mx-auto mb-4">
                    <Gamepad2 className="text-white" size={32} />
                  </div>
                  <p className="text-lg font-bold text-gray-700 mb-2">No games available</p>
                  <p className="text-sm text-gray-600">Check back soon for new games!</p>
                </div>
              ) : (
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
                  {games.map((game, index) => {
                    const statusConfig = {
                      waiting: {
                        gradient: 'from-green-50 via-emerald-50 to-teal-50',
                        border: 'from-green-200 to-teal-200',
                        badge: 'bg-green-100 text-green-700',
                        buttonGradient: 'from-green-500 to-emerald-600 hover:from-green-600 hover:to-emerald-700',
                        buttonText: 'Join'
                      },
                      active: {
                        gradient: 'from-blue-50 via-indigo-50 to-purple-50',
                        border: 'from-blue-200 to-purple-200',
                        badge: 'bg-blue-100 text-blue-700',
                        buttonGradient: 'from-blue-500 to-indigo-600 hover:from-blue-600 hover:to-indigo-700',
                        buttonText: 'Join'
                      },
                      finished: {
                        gradient: 'from-gray-50 to-gray-100',
                        border: 'from-gray-200 to-gray-300',
                        badge: 'bg-gray-100 text-gray-700',
                        buttonGradient: 'from-gray-400 to-gray-500',
                        buttonText: 'Finished'
                      }
                    };
                    
                    const config = statusConfig[game.status as keyof typeof statusConfig] || statusConfig.waiting;
                    
                    return (
                <div 
                  key={game.id} 
                        className={`group relative overflow-hidden rounded-xl p-3 shadow-lg border-2 border-gradient-to-r ${config.border} transition-all duration-300 transform hover:scale-105 hover:shadow-xl bg-gradient-to-br ${config.gradient}`}
                >
                        <div className={`absolute inset-0 bg-gradient-to-br ${config.gradient.replace('50', '50/30')}`}></div>
                        
                        <div className="relative z-10">
                          {/* Compact Game Header */}
                  <div className="flex justify-between items-start mb-3">
                            <div className="flex items-center">
                              <div className="w-8 h-8 bg-gradient-to-br from-purple-500 to-indigo-600 rounded-lg flex items-center justify-center mr-2 shadow-lg">
                                <span className="text-white font-black text-sm">{game.gameNumber}</span>
                              </div>
                    <div>
                                <h3 className="text-sm font-black text-gray-800 group-hover:text-gray-900 transition-colors">
                        Game {game.gameNumber}
                      </h3>
                              </div>
                    </div>
                            <span className={`px-2 py-1 rounded-full text-xs font-bold shadow-sm ${config.badge}`}>
                              {game.status === 'waiting' ? '🟢' : 
                               game.status === 'active' ? '🔵' : 
                               '⚫'}
                    </span>
                  </div>
                  
                          {/* Compact Game Stats */}
                          <div className="space-y-2 mb-3">
                            <div className="flex justify-between items-center bg-white/70 rounded-lg p-2">
                              <div className="flex items-center">
                                <Users className="w-3 h-3 text-gray-600 mr-1" />
                                <span className="text-gray-700 font-medium text-xs">Players</span>
                              </div>
                              <span className="font-black text-gray-800 text-xs">{game.seatsTaken}/{game.maxSeats}</span>
                    </div>
                            <div className="flex justify-between items-center bg-white/70 rounded-lg p-2">
                              <div className="flex items-center">
                                <Trophy className="w-3 h-3 text-gray-600 mr-1" />
                                <span className="text-gray-700 font-medium text-xs">Prize</span>
                    </div>
                              <span className="font-black text-green-600 text-xs">${game.prizePool.toFixed(2)}</span>
                    </div>
                  </div>
                  
                          {/* Compact Join Button */}
                  <Button 
                    onClick={() => handleJoinGame(game.id)} 
                            className={`w-full py-2 px-3 rounded-lg font-bold text-sm transition-all duration-300 transform group-hover:scale-105 shadow-lg bg-gradient-to-r ${config.buttonGradient} text-white`}
                    disabled={game.status === 'finished'}
                  >
                            <Play className="mr-1 inline" size={14} />
                            {config.buttonText}
                  </Button>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </SiteLayout>
  );
}