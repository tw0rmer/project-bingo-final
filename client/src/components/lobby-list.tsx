import React, { useState, useEffect } from 'react';
import { Link } from 'wouter';
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

interface Game {
  id: number;
  lobbyId: number;
  name: string;
  gameNumber: number;
  maxSeats: number;
  seatsTaken: number;
  status: 'waiting' | 'active' | 'finished';
  prizePool: number;
}

export function LobbyList() {
  const [lobbies, setLobbies] = useState<Lobby[]>([]);
  const [selectedLobby, setSelectedLobby] = useState<Lobby | null>(null);
  const [games, setGames] = useState<Game[]>([]);
  const [loading, setLoading] = useState(true);
  const [gamesLoading, setGamesLoading] = useState(false);

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

  const fetchGames = async (lobbyId: number) => {
    setGamesLoading(true);
    try {
      const data = await apiRequest(`/lobbies/${lobbyId}/games`);
      setGames(data);
    } catch (error) {
      console.error('Failed to fetch games:', error);
    } finally {
      setGamesLoading(false);
    }
  };

  useEffect(() => {
    fetchLobbies();
  }, []);

  const handleLobbySelect = (lobby: Lobby) => {
    setSelectedLobby(lobby);
    fetchGames(lobby.id);
  };

  const handleBackToLobbies = () => {
    setSelectedLobby(null);
    setGames([]);
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  // Show games within selected lobby
  if (selectedLobby) {
    return (
      <div className="space-y-6">
        {/* Lobby Header */}
        <div className="bg-gradient-to-r from-blue-600 to-purple-600 text-white p-6 rounded-lg">
          <Button 
            variant="outline" 
            size="sm" 
            onClick={handleBackToLobbies}
            className="mb-4 text-white border-white hover:bg-white hover:text-blue-600"
          >
            ← Back to Lobbies
          </Button>
          <h2 className="text-2xl font-bold">{selectedLobby.name}</h2>
          <p className="text-blue-100 mt-2">{selectedLobby.description}</p>
          <div className="flex items-center gap-4 mt-4">
            <Badge variant="secondary" className="bg-white/20 text-white">
              <DollarSign className="w-4 h-4 mr-1" />
              ${selectedLobby.entryFee} per seat
            </Badge>
            <Badge variant="secondary" className="bg-white/20 text-white">
              <Trophy className="w-4 h-4 mr-1" />
              Up to {selectedLobby.maxGames} games
            </Badge>
          </div>
        </div>

        {/* Games List */}
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {gamesLoading ? (
            <div className="col-span-full flex items-center justify-center py-12">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
            </div>
          ) : games.length === 0 ? (
            <div className="col-span-full text-center py-12 text-gray-500">
              No games available in this lobby
            </div>
          ) : (
            games.map((game) => (
              <Card key={game.id} className="hover:shadow-lg transition-shadow">
                <CardHeader className="pb-3">
                  <div className="flex justify-between items-start">
                    <div>
                      <CardTitle className="text-lg">{game.name}</CardTitle>
                      <p className="text-sm text-gray-600">Game #{game.gameNumber}</p>
                    </div>
                    <Badge 
                      variant={game.status === 'waiting' ? 'default' : 
                               game.status === 'active' ? 'destructive' : 'secondary'}
                    >
                      {game.status}
                    </Badge>
                  </div>
                </CardHeader>
                <CardContent className="pt-0">
                  <div className="space-y-3">
                    <div className="flex justify-between items-center">
                      <div className="flex items-center text-sm text-gray-600">
                        <Users className="w-4 h-4 mr-1" />
                        {game.seatsTaken}/{game.maxSeats} players
                      </div>
                      <div className="flex items-center text-sm font-medium text-green-600">
                        <Trophy className="w-4 h-4 mr-1" />
                        ${game.prizePool}
                      </div>
                    </div>
                    
                    <div className="w-full bg-gray-200 rounded-full h-2">
                      <div 
                        className="bg-blue-600 h-2 rounded-full transition-all"
                        style={{ width: `${(game.seatsTaken / game.maxSeats) * 100}%` }}
                      ></div>
                    </div>

                    <Link href={`/lobby/${game.id}`}>
                      <Button 
                        className="w-full" 
                        disabled={game.status !== 'waiting'}
                        data-testid={`button-join-game-${game.id}`}
                      >
                        <Play className="w-4 h-4 mr-2" />
                        {game.status === 'waiting' ? 'Join Game' : 
                         game.status === 'active' ? 'Game In Progress' : 'Game Finished'}
                      </Button>
                    </Link>
                  </div>
                </CardContent>
              </Card>
            ))
          )}
        </div>
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
        {lobbies.map((lobby) => (
          <Card 
            key={lobby.id} 
            className="hover:shadow-lg transition-shadow cursor-pointer border-2 hover:border-blue-500"
            onClick={() => handleLobbySelect(lobby)}
          >
            <CardHeader>
              <div className="flex justify-between items-start">
                <CardTitle className="text-xl">{lobby.name}</CardTitle>
                <Badge variant={lobby.status === 'active' ? 'default' : 'secondary'}>
                  {lobby.status}
                </Badge>
              </div>
              {lobby.description && (
                <p className="text-gray-600 text-sm">{lobby.description}</p>
              )}
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="grid grid-cols-2 gap-4 text-center">
                  <div className="bg-blue-50 rounded-lg p-3">
                    <DollarSign className="w-6 h-6 mx-auto text-blue-600 mb-1" />
                    <div className="text-lg font-bold text-blue-600">${lobby.entryFee}</div>
                    <div className="text-xs text-gray-600">Entry Fee</div>
                  </div>
                  <div className="bg-green-50 rounded-lg p-3">
                    <Trophy className="w-6 h-6 mx-auto text-green-600 mb-1" />
                    <div className="text-lg font-bold text-green-600">{lobby.gamesCount || 0}</div>
                    <div className="text-xs text-gray-600">Games Available</div>
                  </div>
                </div>
                
                <div className="flex items-center justify-center text-gray-600">
                  <Gamepad2 className="w-4 h-4 mr-2" />
                  <span className="text-sm">{lobby.gamesCount || 0} active games</span>
                </div>

                <Button className="w-full" data-testid={`button-enter-lobby-${lobby.id}`}>
                  Enter Lobby
                </Button>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}