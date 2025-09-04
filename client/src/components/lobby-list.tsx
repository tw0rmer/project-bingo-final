import React, { useState, useEffect } from 'react';
import { Link, useLocation } from 'wouter';
import { apiRequest } from '@/lib/api';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Users, DollarSign, Trophy, Play, Gamepad2 } from 'lucide-react';

interface Lobby {
  id: number;
  name: string;
  description?: string;
  entryFee: number;
  maxGames: number;
  status: 'active' | 'inactive';
  gamesCount: number;
  // Removed totalPlayers as lobbies are containers, not game instances
}

// Game interface removed - handled by lobby-select page

export function LobbyList() {
  const [lobbies, setLobbies] = useState<Lobby[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchLobbies = async () => {
    try {
      const data = await apiRequest('/lobbies');
      setLobbies(data);
    } catch (error) {
      console.error('Failed to fetch lobbies:', error);
    } finally {
      setLoading(false);
    }
  };


  useEffect(() => {
    fetchLobbies();
  }, []);

  const [, setLocation] = useLocation();

  const handleLobbySelect = (lobby: Lobby) => {
    // Navigate to the lobby selection page instead of internal state
    setLocation(`/lobby-select/${lobby.id}`);
  };


  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }


  // Show lobby selection
  return (
    <div className="space-y-6">
      <div className="text-center">
        <h2 className="text-3xl font-bold text-gray-900">Choose Your Lobby</h2>
        <p className="text-gray-600 mt-2">Select a lobby to view available games</p>
      </div>

      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        {lobbies.map((lobby, index) => {
          const isPopular = index === 1; // Make the middle lobby popular
          const isPremium = lobby.entryFee >= 25;
          
          return (
          <Card 
            key={lobby.id} 
              className={`group relative overflow-hidden cursor-pointer border-0 transition-all duration-300 transform hover:scale-105 hover:shadow-2xl ${
                isPopular 
                  ? 'bg-gradient-to-br from-yellow-50 via-orange-50 to-red-50 shadow-lg' 
                  : isPremium 
                    ? 'bg-gradient-to-br from-purple-50 via-blue-50 to-indigo-50 shadow-lg'
                    : 'bg-gradient-to-br from-green-50 via-emerald-50 to-teal-50 shadow-lg'
              }`}
            onClick={() => handleLobbySelect(lobby)}
            data-tutorial="lobby-card"
          >
              {/* Popular badge */}
              {isPopular && (
                <div className="absolute -top-2 -right-2 z-20">
                  <div className="bg-gradient-to-r from-orange-500 to-red-500 text-white px-3 py-1 rounded-full text-xs font-bold shadow-lg transform rotate-12">
                    🔥 POPULAR
                  </div>
              </div>
              )}
              
              {/* Premium badge */}
              {isPremium && !isPopular && (
                <div className="absolute -top-2 -right-2 z-20">
                  <div className="bg-gradient-to-r from-purple-600 to-indigo-600 text-white px-3 py-1 rounded-full text-xs font-bold shadow-lg transform rotate-12">
                    💎 PREMIUM
                  </div>
                </div>
              )}

              {/* Decorative corner elements */}
              <div className="absolute top-0 left-0 w-20 h-20 opacity-10">
                <div className={`absolute top-2 left-2 w-3 h-3 rounded-full ${
                  isPopular ? 'bg-orange-400' : isPremium ? 'bg-purple-400' : 'bg-green-400'
                }`}></div>
                <div className={`absolute top-5 left-5 w-2 h-2 rounded-full ${
                  isPopular ? 'bg-red-400' : isPremium ? 'bg-indigo-400' : 'bg-teal-400'
                }`}></div>
                </div>
                
              <CardHeader className="relative z-10">
                <div className="flex justify-between items-start">
                  <CardTitle className="text-2xl font-bold text-gray-800 group-hover:text-gray-900 transition-colors">
                    {lobby.name}
                  </CardTitle>
                  <Badge 
                    variant={lobby.status === 'active' ? 'default' : 'secondary'}
                    className={`${
                      lobby.status === 'active' 
                        ? isPopular 
                          ? 'bg-green-500 hover:bg-green-600' 
                          : 'bg-green-500 hover:bg-green-600'
                        : 'bg-gray-400'
                    } text-white font-semibold`}
                  >
                    {lobby.status === 'active' ? '🟢 LIVE' : '⚪ OFFLINE'}
                  </Badge>
                </div>
                {lobby.description && (
                  <p className="text-gray-600 text-sm mt-2">{lobby.description}</p>
                )}
              </CardHeader>
              <CardContent className="relative z-10">
                <div className="space-y-6">
                  <div className="grid grid-cols-2 gap-4">
                    <div className={`relative overflow-hidden rounded-xl p-4 text-center transform transition-all duration-200 group-hover:scale-105 ${
                      isPopular 
                        ? 'bg-gradient-to-br from-yellow-100 to-orange-100 border border-orange-200' 
                        : isPremium 
                          ? 'bg-gradient-to-br from-purple-100 to-indigo-100 border border-purple-200'
                          : 'bg-gradient-to-br from-green-100 to-emerald-100 border border-green-200'
                    }`}>
                      <div className="absolute inset-0 bg-white/20 opacity-0 group-hover:opacity-100 transition-opacity"></div>
                      <DollarSign className={`w-8 h-8 mx-auto mb-2 ${
                        isPopular ? 'text-orange-600' : isPremium ? 'text-purple-600' : 'text-green-600'
                      }`} />
                      <div className={`text-2xl font-black ${
                        isPopular ? 'text-orange-700' : isPremium ? 'text-purple-700' : 'text-green-700'
                      }`}>
                        ${lobby.entryFee}
                      </div>
                      <div className="text-xs text-gray-600 font-semibold uppercase tracking-wide">Entry Fee</div>
                    </div>
                    <div className={`relative overflow-hidden rounded-xl p-4 text-center transform transition-all duration-200 group-hover:scale-105 ${
                      isPopular 
                        ? 'bg-gradient-to-br from-amber-100 to-yellow-100 border border-amber-200' 
                        : isPremium 
                          ? 'bg-gradient-to-br from-blue-100 to-cyan-100 border border-blue-200'
                          : 'bg-gradient-to-br from-teal-100 to-cyan-100 border border-teal-200'
                    }`}>
                      <div className="absolute inset-0 bg-white/20 opacity-0 group-hover:opacity-100 transition-opacity"></div>
                      <Trophy className={`w-8 h-8 mx-auto mb-2 ${
                        isPopular ? 'text-amber-600' : isPremium ? 'text-blue-600' : 'text-teal-600'
                      }`} />
                      <div className={`text-2xl font-black ${
                        isPopular ? 'text-amber-700' : isPremium ? 'text-blue-700' : 'text-teal-700'
                      }`}>
                        {lobby.gamesCount || 0}
                      </div>
                      <div className="text-xs text-gray-600 font-semibold uppercase tracking-wide">Games</div>
                    </div>
                </div>

                  <div className="flex items-center justify-center text-gray-600 bg-white/50 rounded-lg py-2 px-4">
                    <Gamepad2 className="w-5 h-5 mr-2 text-gray-500" />
                    <span className="text-sm font-medium">{lobby.gamesCount || 0} active games waiting</span>
                  </div>

                  <Button 
                    className={`w-full py-4 text-lg font-bold rounded-xl transition-all duration-300 transform group-hover:scale-105 shadow-lg ${
                      isPopular 
                        ? 'bg-gradient-to-r from-orange-500 to-red-500 hover:from-orange-600 hover:to-red-600 text-white shadow-orange-200' 
                        : isPremium 
                          ? 'bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-700 hover:to-indigo-700 text-white shadow-purple-200'
                          : 'bg-gradient-to-r from-green-500 to-teal-500 hover:from-green-600 hover:to-teal-600 text-white shadow-green-200'
                    }`}
                    data-testid={`button-enter-lobby-${lobby.id}`}
                  >
                    <Play className="mr-2" size={20} />
                  Enter Lobby
                </Button>
              </div>
            </CardContent>
              
              {/* Hover glow effect */}
              <div className={`absolute inset-0 opacity-0 group-hover:opacity-20 transition-opacity rounded-2xl ${
                isPopular 
                  ? 'bg-gradient-to-br from-orange-400 to-red-400' 
                  : isPremium 
                    ? 'bg-gradient-to-br from-purple-400 to-indigo-400'
                    : 'bg-gradient-to-br from-green-400 to-teal-400'
              }`}></div>
          </Card>
          );
        })}
      </div>
    </div>
  );
}