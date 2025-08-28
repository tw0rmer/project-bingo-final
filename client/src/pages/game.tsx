import React, { useState, useEffect } from 'react';
import { SiteLayout } from '@/components/SiteLayout';
import { useLocation, useParams } from 'wouter';
import { useAuth } from '../contexts/AuthContext';
import { useSocket } from '../contexts/SocketContext';
import { apiRequest } from '../lib/api';
import { Button } from '@/components/ui/button';
import { ArrowLeft, Users, DollarSign, Trophy, Play } from 'lucide-react';
import { BingoCard } from '../components/games/bingo-card';
import { useIsMobile } from '../hooks/useIsMobile';
import { MobileGameView } from '../components/games/mobile-game-view';

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
  const [currentNumber, setCurrentNumber] = useState<number | null>(null);
  const [nextCallIn, setNextCallIn] = useState<number>(5);
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

  // Socket connection for real-time game updates
  useEffect(() => {
    if (!socket || !isConnected || !game?.id) return;

    console.log(`[SOCKET] Game page connected to game ${game.id}`);
    socket.emit('join_lobby', game.lobbyId);

    // Listen for real-time game events
    const handleNumberCalled = (data: any) => {
      console.log('[SOCKET] Number called:', data);
      if (data.gameId === game.id) {
        console.log('[SOCKET] Updating called numbers:', data.drawnNumbers);
        setCalledNumbers(data.drawnNumbers || []);
        setCurrentNumber(data.number);
        setNextCallIn(5); // Reset countdown
        setGameStatus('active');
      }
    };

    const handleGameStarted = (data: any) => {
      console.log('[SOCKET] Game started:', data);
      if (data.gameId === game.id) {
        setGameStatus('active');
        setCalledNumbers([]);
        setWinner(null);
      }
    };

    const handlePlayerWon = (data: any) => {
      console.log('[SOCKET] Player won:', data);
      if (data.gameId === game.id) {
        setWinner({ userId: data.userId, seatNumber: data.seatNumber });
        setGameStatus('finished');
      }
    };

    const handleGameEnded = (data: any) => {
      console.log('[SOCKET] Game ended:', data);
      if (data.gameId === game.id) {
        setGameStatus('finished');
      }
    };

    socket.on('number_called', handleNumberCalled);
    socket.on('gameStarted', handleGameStarted);
    socket.on('player_won', handlePlayerWon);
    socket.on('game_ended', handleGameEnded);

    return () => {
      socket.off('number_called', handleNumberCalled);
      socket.off('gameStarted', handleGameStarted);
      socket.off('player_won', handlePlayerWon);
      socket.off('game_ended', handleGameEnded);
    };
  }, [socket, isConnected, game?.id, game?.lobbyId]);

  // Countdown timer for next number call
  useEffect(() => {
    if (gameStatus !== 'active') return;
    
    const interval = setInterval(() => {
      setNextCallIn(prev => {
        if (prev <= 1) {
          return 5; // Reset to 5 seconds
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(interval);
  }, [gameStatus]);

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

  const handleStartGame = async () => {
    if (!game || !userInfo?.isAdmin) return;
    
    try {
      const token = localStorage.getItem('token');
      await apiRequest(`/admin/games/${gameId}/start`, {
        method: 'POST',
        headers: { 
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });
      
      // Refresh game data
      const gameResponse = await apiRequest<Game>(`/games/${gameId}`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      setGame(gameResponse);
      setGameStatus('active');
      setToastMsg('Game started successfully!');
    } catch (error: any) {
      console.error('Failed to start game:', error);
      setError(error.message || 'Failed to start game');
    }
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

        // Refresh participant data AND game data (for updated seat counts)
        const [participantsResponse, updatedGameResponse] = await Promise.all([
          apiRequest<Participant[]>(`/games/${gameId}/participants`, {
            headers: { 'Authorization': `Bearer ${token}` }
          }),
          apiRequest<Game>(`/games/${gameId}`, {
            headers: { 'Authorization': `Bearer ${token}` }
          })
        ]);
        setParticipants(participantsResponse);
        setGame(updatedGameResponse);
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
          participants={participants.map(p => ({ ...p, user: p.user || null }))}
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

  // Both desktop and mobile use the same tabbed interface now
  // Desktop gets a header, mobile doesn't

  // Unified view with optional desktop header
  return (
    <div className="min-h-screen bg-gray-900 text-white">
      {/* Desktop header (only show on desktop) */}
      {!isMobile && (
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
            <div className="flex items-center gap-4">
              {/* Admin Start Game Button */}
              {userInfo?.isAdmin && game?.status === 'waiting' && (
                <Button 
                  onClick={handleStartGame}
                  className="bg-green-600 hover:bg-green-700 text-white"
                  size="sm"
                >
                  🚀 Start Game
                </Button>
              )}
              <div className="text-right">
                <p className="text-sm text-gray-400">Your Balance</p>
                <p className="text-xl font-bold text-green-400">
                  ${typeof userInfo?.balance === 'number' ? userInfo.balance.toFixed(2) : parseFloat(userInfo?.balance?.toString() || '0').toFixed(2)}
                </p>
              </div>
            </div>
          </div>
        </div>
      )}
      
      {/* Tabbed game interface for both desktop and mobile */}
      <div className={!isMobile ? "max-w-7xl mx-auto" : "h-full"}>
        <MobileGameView
          currentNumber={currentNumber}
          nextCallIn={nextCallIn}
          lobby={lobby}
          participants={participants}
          selectedSeats={selectedSeats}
          onSeatSelect={handleSeatSelection}
          isJoining={joining}
          gamePhase={gameStatus === 'waiting' ? 'lobby' : gameStatus === 'active' ? 'playing' : 'finished'}
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
          user={userInfo}
          currentUserParticipation={participants.find(p => p.userId === userInfo?.id) || null}
          canAffordEntry={canAffordEntry}
          isConnected={isConnected}
          isPaused={isPaused}
          gameStatus={gameStatus}
          onLeaveLobby={handleBackToLobby}
          onStartGame={userInfo?.isAdmin ? handleStartGame : undefined}
          gameData={game}
        />
      </div>
    </div>
  );
}