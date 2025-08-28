import React, { useState, useEffect } from 'react';
import { useLocation, useParams } from 'wouter';
import { useAuth } from '../contexts/AuthContext';
import { useSocket } from '../contexts/SocketContext';
import { apiRequest } from '../lib/api';
import { Button } from '@/components/ui/button';
import { ArrowLeft, Users, DollarSign, Trophy, Play } from 'lucide-react';
import { BingoCard } from '../components/BingoCard';
import { useIsMobile } from '../hooks/useIsMobile';
import { MobileGameView } from '../components/MobileGameView';

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
  const { socket, isConnected } = useSocket();
  const isMobile = useIsMobile(1024);
  
  const [game, setGame] = useState<Game | null>(null);
  const [lobby, setLobby] = useState<Lobby | null>(null);
  const [participants, setParticipants] = useState<Participant[]>([]);
  const [userInfo, setUserInfo] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [joining, setJoining] = useState(false);
  const [error, setError] = useState('');
  const [calledNumbers, setCalledNumbers] = useState<number[]>([]);
  const [winner, setWinner] = useState<{ seatNumber: number; userId: number } | null>(null);
  const [toastMsg, setToastMsg] = useState<string | null>(null);
  const [gameStatus, setGameStatus] = useState<'waiting' | 'active' | 'finished'>('waiting');
  const [serverCardsBySeat, setServerCardsBySeat] = useState<Record<number, number[]>>({});
  const [isPaused, setIsPaused] = useState(false);

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

  const getBalanceAsNumber = (balance: number | string): number => {
    return typeof balance === 'string' ? parseFloat(balance) || 0 : balance;
  };

  const currentUserParticipations = participants.filter(p => p.userId === userInfo?.id);
  const selectedSeats = currentUserParticipations.map(p => p.seatNumber);
  const canAffordEntry = userInfo ? getBalanceAsNumber(userInfo.balance) >= parseFloat(lobby?.entryFee?.toString() || '0') : false;

  const handleSeatSelection = async (seatNumber: number) => {
    if (!game || !userInfo || joining) return;

    // Check if seat is already selected by this user
    const isAlreadySelected = selectedSeats.includes(seatNumber);
    
    if (isAlreadySelected) {
      // Deselect seat (leave game for this seat)
      try {
        setJoining(true);
        const token = localStorage.getItem('token');
        await apiRequest(`/games/${gameId}/leave`, {
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
        setError(error.message || 'Failed to leave game');
      } finally {
        setJoining(false);
      }
    } else {
      // Select seat (join game)
      await handleJoinGame(seatNumber);
    }
  };

  const renderBingoCard = () => {
    if (!game || !lobby) return null;

    const gamePhase = gameStatus || game.status === 'waiting' ? 'lobby' : game.status === 'active' ? 'playing' : 'finished';

    return (
      <div className="w-full">
        <BingoCard
          onSeatSelect={(seatNumber) => {
            if (gamePhase === 'lobby' && !joining) {
              handleSeatSelection(seatNumber);
            }
          }}
          selectedSeats={selectedSeats}
          participants={participants}
          isJoining={joining}
          gamePhase={gamePhase}
          calledNumbers={calledNumbers}
          onWin={(pattern, rowNumbers) => {
            if (selectedSeats.length === 0) return;
            const token = localStorage.getItem('token');
            const primarySeat = selectedSeats[0];
            apiRequest(`/games/${gameId}/claim`, {
              method: 'POST',
              headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
              body: JSON.stringify({ userId: userInfo!.id, seatNumber: primarySeat, numbers: rowNumbers }),
            }).then(() => setToastMsg('Win validated!')).catch((e) => setToastMsg(e.message));
          }}
          winnerSeatNumber={winner?.seatNumber}
          winnerUserId={winner?.userId}
          myUserId={userInfo?.id}
          lobbyId={game.id}
          serverCardsBySeat={serverCardsBySeat}
        />
      </div>
    );
  };

  // Desktop view
  if (!isMobile) {
    return (
      <div className="min-h-screen bg-gray-900 text-white">
        {/* Header with navigation */}
        <div className="bg-gray-800 border-b border-gray-700 p-4">
          <div className="max-w-7xl mx-auto flex items-center justify-between">
            <div className="flex items-center gap-4">
              <Button 
                onClick={handleBackToLobby} 
                variant="outline" 
                size="sm"
                className="bg-gray-700 hover:bg-gray-600 text-white border-gray-600"
              >
                <ArrowLeft className="w-4 h-4 mr-2" />
                Back to Lobby
              </Button>
              <div>
                <h1 className="text-xl font-bold text-white">{game?.name}</h1>
                <p className="text-gray-400 text-sm">{lobby?.name}</p>
              </div>
            </div>
            <div className="text-right">
              <p className="text-sm text-gray-400">Your Balance</p>
              <p className="text-xl font-bold text-green-400">
                ${typeof userInfo?.balance === 'number' ? userInfo.balance.toFixed(2) : parseFloat(userInfo?.balance?.toString() || '0').toFixed(2)}
              </p>
            </div>
          </div>
        </div>

        {/* Main game content */}
        <div className="max-w-7xl mx-auto p-6">
          {renderBingoCard()}
        </div>
      </div>
    );
  }

  // Mobile view
  return (
    <div className="min-h-screen bg-gray-900 text-white">
      <MobileGameView
        lobby={lobby}
        participants={participants}
        selectedSeats={selectedSeats}
        onSeatSelect={handleSeatSelection}
        isJoining={joining}
        gamePhase={gameStatus || (game?.status === 'waiting' ? 'lobby' : game?.status === 'active' ? 'playing' : 'finished')}
        calledNumbers={calledNumbers}
        onWin={(pattern, rowNumbers) => {
          if (selectedSeats.length === 0) return;
          const token = localStorage.getItem('token');
          const primarySeat = selectedSeats[0];
          apiRequest(`/games/${gameId}/claim`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
            body: JSON.stringify({ userId: userInfo!.id, seatNumber: primarySeat, numbers: rowNumbers }),
          }).then(() => setToastMsg('Win validated!')).catch((e) => setToastMsg(e.message));
        }}
        winnerSeatNumber={winner?.seatNumber}
        winnerUserId={winner?.userId}
        myUserId={userInfo?.id}
        lobbyId={game?.id || 0}
        serverCardsBySeat={serverCardsBySeat}
        onBackToLobby={handleBackToLobby}
        user={userInfo}
        canAffordEntry={canAffordEntry}
      />
    </div>
  );
}