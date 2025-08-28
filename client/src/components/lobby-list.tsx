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