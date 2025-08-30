import React, { useState, useEffect } from 'react';
import { flushSync } from 'react-dom';
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
import { WinnerCelebrationModal } from '../components/games/winner-celebration-modal';
import { WinnerCelebrationModalEnhanced } from '../components/games/winner-celebration-modal-enhanced';
import { EmojiReactions } from '../components/games/EmojiReactions';
import { PatternIndicator } from '../components/games/PatternIndicator';
import { detectRowPatternProgress } from '../utils/patternDetection';
import { GameCardSkeleton } from '../components/GameCardSkeleton';
import { useToast } from '../hooks/use-toast';

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
  masterCard?: number[][] | null;
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

interface ParticipantsResponse {
  participants: Participant[];
  masterCard: number[][] | null;
}

export default function GamePage() {
  const params = useParams();
  const gameId = parseInt(params.id || '0');
  const [, setLocation] = useLocation();
  const { user } = useAuth();
  const { socket, isConnected } = useSocket();
  const isMobile = useIsMobile(1024);
  const { toast } = useToast();
  
  const [game, setGame] = useState<Game | null>(null);
  const [lobby, setLobby] = useState<Lobby | null>(null);
  const [participants, setParticipants] = useState<Participant[]>([]);
  const [masterCard, setMasterCard] = useState<number[][] | null>(null);
  const [userInfo, setUserInfo] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [joining, setJoining] = useState(false);
  const [error, setError] = useState('');
  const [calledNumbers, setCalledNumbers] = useState<number[]>([]);
  const [currentNumber, setCurrentNumber] = useState<number | null>(null);
  const [nextCallIn, setNextCallIn] = useState<number>(5);
  const [currentCallSpeed, setCurrentCallSpeed] = useState<number>(5);
  const [winner, setWinner] = useState<{ seatNumber: number; userId: number } | null>(null);
  const [showCelebration, setShowCelebration] = useState(false);
  const [gameResetLobbyId, setGameResetLobbyId] = useState<number | null>(null);
  const [celebrationData, setCelebrationData] = useState<{
    prizeAmount: number;
    winningSeats: number[];
    winningRow: number[];
    totalPrizePool?: number;
    houseFee?: number;
  } | null>(null);
  const [toastMsg, setToastMsg] = useState<string | null>(null);
  const [gameStatus, setGameStatus] = useState<'waiting' | 'active' | 'finished'>('waiting');
  const [serverCardsBySeat, setServerCardsBySeat] = useState<Record<number, number[]>>({});
  const [isPaused, setIsPaused] = useState(false);
  const [patternProgress, setPatternProgress] = useState<any[]>([]);

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
        const [participantsData, userResponse] = await Promise.all([
          apiRequest<ParticipantsResponse>(`/games/${gameId}/participants`, {
            headers: { 'Authorization': `Bearer ${token}` }
          }),
          apiRequest<{ user: User }>('/dashboard', {
            headers: { 'Authorization': `Bearer ${token}` }
          }).then(data => data.user)
        ]);

        setParticipants(participantsData.participants || []);
        // Set master card from game data (added in games API) or participants data
        const receivedMasterCard = gameResponse.masterCard || participantsData.masterCard;
        setMasterCard(receivedMasterCard);
        setUserInfo(userResponse);

        // Convert master card to serverCardsBySeat format for pattern detection
        console.log('[GAME PAGE] DEBUG - Master card conversion attempt:', {
          hasMasterCard: !!receivedMasterCard,
          masterCardLength: receivedMasterCard?.length,
          participantsCount: participantsData.participants?.length,
          participants: participantsData.participants
        });
        
        if (receivedMasterCard && participantsData.participants) {
          const cardsBySeat: Record<number, number[]> = {};
          participantsData.participants.forEach(participant => {
            const seatIndex = participant.seatNumber - 1; // Convert 1-based to 0-based
            if (seatIndex >= 0 && seatIndex < receivedMasterCard.length) {
              cardsBySeat[participant.seatNumber] = receivedMasterCard[seatIndex];
              console.log(`[GAME PAGE] Added seat ${participant.seatNumber}: ${receivedMasterCard[seatIndex]}`);
            }
          });
          setServerCardsBySeat(cardsBySeat);
          console.log('[GAME PAGE] Server cards by seat populated:', cardsBySeat);
          
          // Force immediate pattern calculation test
          setTimeout(() => {
            console.log('[FORCE TEST] Checking pattern calculation after 100ms delay...');
            console.log('[FORCE TEST] serverCardsBySeat keys:', Object.keys(cardsBySeat));
            console.log('[FORCE TEST] calledNumbers length:', calledNumbers.length);
            
            if (Object.keys(cardsBySeat).length > 0) {
              // Force calculation manually to test
              const testPatterns = Object.entries(cardsBySeat).map(([seat, card]) => {
                const progress = calledNumbers.length > 0 ? 
                  card.filter(n => calledNumbers.includes(n)).length / card.length : 0;
                return { seat: parseInt(seat), progress, test: true };
              });
              console.log('[FORCE TEST] Manual pattern calculation result:', testPatterns);
              
              // Try setting pattern progress directly
              setPatternProgress(testPatterns);
            }
          }, 100);
        } else {
          console.log('[GAME PAGE] Cannot convert master card - missing data');
        }

        console.log('[GAME PAGE] Data loaded:', {
          game: gameResponse.name,
          lobby: lobbyResponse.name,
          participants: participantsData.participants?.length || 0,
          userEmail: userResponse.email,
          hasMasterCard: !!participantsData.masterCard
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
    console.log('[GAME] ===== SOCKET USEEFFECT MOUNTING =====');
    console.log('[GAME] Socket available:', !!socket);
    console.log('[GAME] Socket connected:', isConnected);
    console.log('[GAME] Game ID available:', !!game?.id);
    if (!socket || !isConnected || !game?.id) return;

    console.log(`[SOCKET] Game page connected to game ${game.id}`);
    console.log(`[SOCKET] Attempting to join lobby room: lobby_${game.lobbyId}`);
    console.log(`[SOCKET] Socket connected:`, socket.connected);
    console.log(`[SOCKET] Game lobbyId:`, game.lobbyId);
    
    if (game.lobbyId) {
      socket.emit('join_lobby', game.lobbyId);
      console.log(`[SOCKET] ✅ Emitted join_lobby for lobby ${game.lobbyId}`);
    } else {
      console.error(`[SOCKET] ❌ No lobbyId available, cannot join lobby!`);
    }

    // Listen for real-time game events
    const handleNumberCalled = (data: any) => {
      console.log('[SOCKET] Number called:', data);
      if (data.gameId === game.id) {
        console.log('[SOCKET] Updating called numbers:', data.drawnNumbers);
        setCalledNumbers(data.drawnNumbers || []);
        console.log('[STATE DEBUG] Immediately after setCalledNumbers - current calledNumbers:', calledNumbers);
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
        // Set the master card from server so all players see the same card
        if (data.masterCard) {
          console.log('[SOCKET] Received master card from server');
          setMasterCard(data.masterCard);
          
          // Update serverCardsBySeat for pattern detection
          const cardsBySeat: Record<number, number[]> = {};
          participants.forEach(participant => {
            const seatIndex = participant.seatNumber - 1; // Convert 1-based to 0-based
            if (seatIndex >= 0 && seatIndex < data.masterCard.length) {
              cardsBySeat[participant.seatNumber] = data.masterCard[seatIndex];
            }
          });
          setServerCardsBySeat(cardsBySeat);
          console.log('[SOCKET] Updated server cards by seat from game started:', cardsBySeat);
        }
      }
    };

    const handlePlayerWon = (data: any) => {
      const timestamp = Date.now();
      console.log(`[SOCKET] ===== PLAYER WON EVENT @ ${timestamp} =====`);
      console.log('[SOCKET] Player won data:', data);
      console.log('[SOCKET] Current user info (userInfo):', userInfo);
      console.log('[SOCKET] Current user info (auth context):', user);
      console.log('[SOCKET] Winner user ID:', data.userId, 'Current user ID:', user?.id || userInfo?.id);
      console.log('[SOCKET] Is current user the winner?', data.userId === (user?.id || userInfo?.id));
      console.log('[SOCKET] Game ID match?', data.gameId, 'vs', game.id, '=', data.gameId === game.id);
      console.log(`[STATE] BEFORE handlePlayerWon - showCelebration: ${showCelebration}, gameStatus: ${gameStatus}`);
      
      if (data.gameId === game.id) {
        setWinner({ userId: data.userId, seatNumber: data.winningSeat || data.seatNumber });
        setGameStatus('finished');
        
        // Save celebration data to sessionStorage to show in lobby
        const currentUserId = user?.id || userInfo?.id;
        if (data.userId === currentUserId) {
          console.log('[GAME] Current user IS the winner, saving winner data');
          
          // Use server-calculated prize amounts (authoritative source)
          const totalPrize = data.prizeAmount || 0;
          const totalPool = data.totalPrizePool || 0;
          const houseAmount = data.houseFee || 0;
          
          console.log('[CELEBRATION] Using server-calculated prize data:', {
            prizeAmount: totalPrize,
            totalPrizePool: totalPool,
            houseFee: houseAmount,
            winningSeats: data.userSeats || selectedSeats,
            winningRow: data.winningNumbers || []
          });
          
          // Show celebration modal immediately in game page
          setCelebrationData({
            prizeAmount: totalPrize,
            winningSeats: data.userSeats || selectedSeats,
            winningRow: data.winningNumbers || [],
            totalPrizePool: totalPool,
            houseFee: houseAmount
          });
          console.log('[GAME] ===== SETTING UP WINNER CELEBRATION =====');
          console.log('[GAME] Setting showCelebration to TRUE');
          console.log('[GAME] Celebration data being set:', {
            prizeAmount: totalPrize,
            winningSeats: data.userSeats || selectedSeats,
            winningRow: data.winningNumbers || [],
            totalPrizePool: totalPool,
            houseFee: houseAmount
          });
          console.log(`[STATE] SETTING showCelebration to TRUE @ ${Date.now()}`);
          console.log(`[DEBUG] TESTING REACT BATCHING - Using flushSync to force immediate render`);
          flushSync(() => {
            setShowCelebration(true);
          });
          console.log(`[STATE] AFTER flushSync setShowCelebration(true) - showCelebration should be: true`);
          
          // CRITICAL: Refresh user balance after winning
          const token = localStorage.getItem('token');
          if (token) {
            console.log('[WIN] Refreshing user balance after winning...');
            apiRequest<User>('/auth/me', {
              headers: { 'Authorization': `Bearer ${token}` }
            }).then(updatedUser => {
              console.log('[WIN] Balance updated:', updatedUser.balance);
              setUserInfo(updatedUser);
              toast({
                title: "🎉 Congratulations! You Won!",
                description: `Prize: $${totalPrize.toFixed(2)} added to your balance!`,
                duration: 8000,
              });
            }).catch(console.error);
          }
          
          // Note: Modal handles its own 45-second auto-close timer
          // We'll redirect to lobby when the modal closes itself
        } else {
          console.log('[GAME] Current user is NOT the winner, saving loser data');
          // Save loser data for other players
          const winnerParticipant = participants.find(p => p.userId === data.userId);
          const winnerEmail = winnerParticipant?.user?.email || 'Unknown Player';
          const winnerDisplay = winnerEmail.split('@')[0];
          console.log('[GAME] Winner participant:', winnerParticipant, 'Winner display name:', winnerDisplay);
          
          // Show toast for losers and redirect after delay
          toast({
            title: "Game Over",
            description: `${winnerDisplay} won this game! Better luck next time.`,
            duration: 5000,
          });
          console.log('[GAME] ===== SETTING UP LOSER TOAST =====');
          console.log('[GAME] Current user is LOSER. Winner:', winnerDisplay);
          console.log('[GAME] Toast data:', {
            title: "Game Over",
            description: `${winnerDisplay} won this game! Better luck next time.`
          });
          
          // Redirect losers after 3 seconds
          setTimeout(() => {
            console.log('[GAME] Redirecting loser to lobby after toast...');
            setLocation(`/lobby/${game.lobbyId}`);
          }, 3000);
        }
      }
      console.log(`[STATE] END handlePlayerWon - showCelebration: ${showCelebration}, gameStatus: ${gameStatus}`);
    };

    const handleGameEnded = (data: any) => {
      const timestamp = Date.now();
      console.log(`[SOCKET] ===== GAME ENDED EVENT @ ${timestamp} =====`);
      console.log(`[DEBUG] RE-ENABLED handleGameEnded to test with flushSync fix`);
      console.log('[SOCKET] Game ended data:', data);
      console.log('[SOCKET] Current game ID:', game.id);
      console.log('[SOCKET] Game ID match?', data.gameId === game.id);
      console.log(`[STATE] BEFORE handleGameEnded - showCelebration: ${showCelebration}, gameStatus: ${gameStatus}`);
      
      if (data.gameId === game.id) {
        setGameStatus('finished');
        
        // Don't redirect immediately - let modals show first
        // Redirect will happen when modal closes or after timeout
        console.log('[GAME] ===== GAME STATUS SET TO FINISHED =====');
        console.log(`[STATE] SETTING gameStatus to finished @ ${Date.now()}`);
        console.log('[GAME] Current showCelebration state:', showCelebration);
        console.log('[GAME] Current celebrationData state:', celebrationData);
        console.log(`[STATE] AFTER setGameStatus - gameStatus should be: finished`);
      }
      
      console.log(`[STATE] END handleGameEnded - showCelebration: ${showCelebration}, gameStatus: ${gameStatus}`);
    };

    const handleCallSpeedChanged = (data: any) => {
      console.log('[SOCKET] Call speed changed:', data);
      if (data.lobbyId === game.lobbyId) {
        setCurrentCallSpeed(data.intervalSeconds);
        setNextCallIn(data.intervalSeconds); // Reset countdown with new interval
      }
    };

    const handleSeatTaken = (data: any) => {
      console.log('[SOCKET] Seat taken:', data);
      if (data.gameId === game.id) {
        // Refresh participant data in real-time
        const token = localStorage.getItem('token');
        if (token) {
          apiRequest<ParticipantsResponse>(`/games/${gameId}/participants`, {
            headers: { 'Authorization': `Bearer ${token}` }
          }).then(participantsResponse => {
            setParticipants(participantsResponse.participants || []);
            
            // Update serverCardsBySeat if we have master card
            if (participantsResponse.masterCard) {
              const cardsBySeat: Record<number, number[]> = {};
              participantsResponse.participants?.forEach(participant => {
                const seatIndex = participant.seatNumber - 1; // Convert 1-based to 0-based
                if (seatIndex >= 0 && seatIndex < participantsResponse.masterCard!.length) {
                  cardsBySeat[participant.seatNumber] = participantsResponse.masterCard![seatIndex];
                }
              });
              setServerCardsBySeat(cardsBySeat);
              console.log('[SOCKET] Updated server cards by seat from seat taken:', cardsBySeat);
            }
          }).catch(console.error);
        }
      }
    };

    const handleSeatLeft = (data: any) => {
      console.log('[SOCKET] Seat left:', data);
      if (data.gameId === game.id) {
        // Refresh participant data in real-time
        const token = localStorage.getItem('token');
        if (token) {
          apiRequest<ParticipantsResponse>(`/games/${gameId}/participants`, {
            headers: { 'Authorization': `Bearer ${token}` }
          }).then(participantsResponse => {
            setParticipants(participantsResponse.participants || []);
            
            // Update serverCardsBySeat if we have master card
            if (participantsResponse.masterCard) {
              const cardsBySeat: Record<number, number[]> = {};
              participantsResponse.participants?.forEach(participant => {
                const seatIndex = participant.seatNumber - 1; // Convert 1-based to 0-based
                if (seatIndex >= 0 && seatIndex < participantsResponse.masterCard!.length) {
                  cardsBySeat[participant.seatNumber] = participantsResponse.masterCard![seatIndex];
                }
              });
              setServerCardsBySeat(cardsBySeat);
              console.log('[SOCKET] Updated server cards by seat from seat left:', cardsBySeat);
            }
          }).catch(console.error);
        }
      }
    };

    // Handle game reset - redirect back to lobby AFTER modal closes
    const handleGameReset = (data: any) => {
      console.log('[GAME] Game reset received:', data);
      
      // Store the lobby ID for redirect after modal closes
      setGameResetLobbyId(data.lobbyId);
      
      // Don't close the modal immediately - let it run its course
      // The modal will handle the redirect when it closes
    };

    console.log('[SOCKET] Setting up event listeners...');
    socket.on('number_called', handleNumberCalled);
    socket.on('gameStarted', handleGameStarted);
    socket.on('player_won', (data) => {
      console.log('[SOCKET] ===== RAW PLAYER_WON EVENT RECEIVED =====');
      console.log('[SOCKET] Raw data:', JSON.stringify(data));
      handlePlayerWon(data);
    });
    socket.on('game_ended', (data) => {
      console.log('[SOCKET] ===== RAW GAME_ENDED EVENT RECEIVED =====');
      console.log('[SOCKET] Raw data:', JSON.stringify(data));
      handleGameEnded(data);
    });
    socket.on('call_speed_changed', handleCallSpeedChanged);
    socket.on('seat_taken', handleSeatTaken);
    socket.on('seat_left', handleSeatLeft);
    socket.on('game_reset', handleGameReset);
    
    // Test socket connection
    console.log('[SOCKET] Testing socket connection...');
    socket.emit('ping', { gameId: game.id, test: 'connection_test' });
    
    return () => {
      console.log('[GAME] ===== SOCKET USEEFFECT UNMOUNTING =====');
      console.log('[GAME] Current showCelebration state on unmount:', showCelebration);
      console.log('[GAME] Current celebrationData on unmount:', celebrationData);
      console.log('[GAME] Cleaning up socket listeners...');
      socket.off('number_called', handleNumberCalled);
      socket.off('gameStarted', handleGameStarted);
      socket.off('player_won', handlePlayerWon);
      socket.off('game_ended', handleGameEnded);
      socket.off('call_speed_changed', handleCallSpeedChanged);
      socket.off('seat_taken', handleSeatTaken);
      socket.off('seat_left', handleSeatLeft);
      socket.off('game_reset', handleGameReset);
    };
  }, [socket, isConnected, game?.id, game?.lobbyId]);

  // Update pattern progress when numbers are called or cards change
  useEffect(() => {
    console.log('[PATTERN CALCULATION] ===== useEffect TRIGGERED =====');
    console.log('[PATTERN CALCULATION] useEffect dependencies changed:', {
      hasServerCards: !!serverCardsBySeat,
      serverCardsCount: serverCardsBySeat ? Object.keys(serverCardsBySeat).length : 0,
      calledNumbersCount: calledNumbers.length,
      serverCardsBySeat: serverCardsBySeat,
      calledNumbers: calledNumbers.slice(0, 10) // First 10 numbers
    });
    
    if (serverCardsBySeat && Object.keys(serverCardsBySeat).length > 0 && calledNumbers.length > 0) {
      console.log('[PATTERN CALCULATION] Computing patterns...');
      const patterns = Object.entries(serverCardsBySeat).map(([seat, card]) => {
        const progress = detectRowPatternProgress(card, calledNumbers);
        console.log(`[PATTERN CALCULATION] Seat ${seat}:`, {
          card,
          progress: progress.progress,
          matched: progress.numbersMatched.length,
          needed: progress.numbersNeeded.length
        });
        return { seat: parseInt(seat), ...progress };
      });
      console.log('[PATTERN CALCULATION] Setting pattern progress:', patterns);
      setPatternProgress(patterns);
    } else {
      console.log('[PATTERN CALCULATION] Conditions not met - not computing patterns');
    }
  }, [serverCardsBySeat, calledNumbers]);

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
      const participantsResponse = await apiRequest<ParticipantsResponse>(`/games/${gameId}/participants`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      setParticipants(participantsResponse.participants || []);

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
          apiRequest<ParticipantsResponse>(`/games/${gameId}/participants`, {
            headers: { 'Authorization': `Bearer ${token}` }
          }),
          apiRequest<Game>(`/games/${gameId}`, {
            headers: { 'Authorization': `Bearer ${token}` }
          })
        ]);
        setParticipants(participantsResponse.participants || []);
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
          masterCard={masterCard}
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
          currentCallSpeed={currentCallSpeed}
          gameId={gameId}
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
          masterCard={masterCard}
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

      {/* Winner Celebration Modal */}
      {showCelebration && celebrationData && (
        <WinnerCelebrationModalEnhanced
          isOpen={showCelebration}
          onClose={() => {
            setShowCelebration(false);
            setCelebrationData(null);
            console.log('[GAME] Celebration modal closed (45s timer or manual), redirecting to lobby...');
            setTimeout(() => {
              setLocation(`/lobby/${game.lobbyId}`);
            }, 500);
          }}
          prizeAmount={celebrationData.prizeAmount}
          winningSeats={celebrationData.winningSeats}
          winningRow={celebrationData.winningRow}
          totalPrizePool={celebrationData.totalPrizePool}
          houseFee={celebrationData.houseFee}
        />
      )}
      
      {/* Emoji Reactions - Only show during active games and when authenticated */}
      {gameStatus === 'active' && game && lobby && userInfo && isConnected && (
        <EmojiReactions
          gameId={gameId}
          lobbyId={lobby.id}
          userId={userInfo.id}
        />
      )}
      
      {/* Pattern Indicator - Show for selected seats when authenticated */}
      {selectedSeats.length > 0 && patternProgress.length > 0 && userInfo && (
        <div className="fixed bottom-20 right-4 z-30 max-w-xs">
          <PatternIndicator
            patterns={patternProgress.filter(p => selectedSeats.includes(p.seat))}
            compact={isMobile}
          />
        </div>
      )}
      
      {/* Debug Info - Remove this after testing */}
      {userInfo && (
        <div className="fixed top-20 right-4 z-30 bg-black/80 text-white p-3 rounded text-xs max-w-xs">
          <div>Selected Seats: {selectedSeats.join(', ') || 'None'}</div>
          <div>Pattern Progress: {patternProgress.length} patterns</div>
          <div>Called Numbers: {calledNumbers.length} numbers</div>
          <div>Server Cards: {Object.keys(serverCardsBySeat).length} seats</div>
          <div>Master Card: {masterCard ? 'YES' : 'NO'}</div>
          <div>Participants: {participants.length} total</div>
          <div>Game Status: {gameStatus}</div>
          <div>Show Celebration: {showCelebration ? 'YES' : 'NO'}</div>
          <div>Celebration Data: {celebrationData ? 'YES' : 'NO'}</div>
          <div>Winner: {winner ? `User ${winner.userId}, Seat ${winner.seatNumber}` : 'None'}</div>
          {celebrationData && (
            <div className="mt-1 text-xs">
              <div>Prize: ${celebrationData.prizeAmount}</div>
              <div>Seats: {celebrationData.winningSeats?.join(',') || 'None'}</div>
            </div>
          )}
          {patternProgress.length > 0 && (
            <div className="mt-2">
              <div className="font-bold">Pattern Details:</div>
              {patternProgress.slice(0, 3).map((p, i) => (
                <div key={i} className="text-xs">
                  Seat {p.seat}: {Math.round(p.progress * 100)}% ({p.numbersNeeded.length} needed)
                </div>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
}
