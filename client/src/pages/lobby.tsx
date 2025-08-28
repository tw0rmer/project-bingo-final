import React, { useState, useEffect } from 'react';
import { useLocation } from 'wouter';
import { useParams } from 'wouter';
import { apiRequest } from '../lib/api';
import { useSocket } from '../contexts/SocketContext';
import ConnectionStatus from '../components/ConnectionStatus';
import { SiteLayout } from '@/components/SiteLayout';
import { BingoCard } from '../components/games/bingo-card';
import { MasterCard } from '../components/games/master-card';
import { MobileGameView } from '../components/games/mobile-game-view';
import { useIsMobile } from '../hooks/useIsMobile';
import { cn } from '@/lib/utils';

interface Lobby {
  id: number;
  name: string;
  entryFee: string;
  maxSeats: number;
  seatsTaken: number;
  status: 'waiting' | 'active' | 'finished';
  createdAt: string;
}

interface Participant {
  id: number;
  lobbyId: number;
  userId: number;
  seatNumber: number;
  joinedAt: string;
  user: {
    id: number;
    email: string;
  } | null;
}

interface User {
  id: number;
  email: string;
  balance: number | string; // Handle both string and number types from API
  isAdmin?: boolean;
}

const LobbyPage: React.FC = () => {
  const params = useParams();
  const lobbyId = parseInt(params.id || '0');
  const [, setLocation] = useLocation();
  
  const [lobby, setLobby] = useState<Lobby | null>(null);
  const [participants, setParticipants] = useState<Participant[]>([]);
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [joining, setJoining] = useState(false);
  const [error, setError] = useState('');
  // keep full backlog of numbers for Recent
  const [calledNumbers, setCalledNumbers] = useState<number[]>([]);
  const [winner, setWinner] = useState<{ seatNumber: number; userId: number } | null>(null);
  const [toastMsg, setToastMsg] = useState<string | null>(null);
  const [gameStatus, setGameStatus] = useState<'waiting' | 'active' | 'finished'>('waiting');
  const [serverCardsBySeat, setServerCardsBySeat] = useState<Record<number, number[]>>({});
  const [isPaused, setIsPaused] = useState(false);
  const [callMs, setCallMs] = useState(3000);

  const { socket, isConnected } = useSocket();
  const isMobile = useIsMobile(1024); // Use 1024px as breakpoint (lg in Tailwind)

  // Load deterministic lobby cards for waiting phase
  useEffect(() => {
    if (!lobbyId) return;
    (async () => {
      try {
        const token = localStorage.getItem('token');
        const data = await apiRequest<any>(`/lobbies/${lobbyId}/cards`, { headers: { Authorization: `Bearer ${token}` } });
        if (data?.cards) setServerCardsBySeat(data.cards);
      } catch (e) {
        // ignore
      }
    })();
  }, [lobbyId]);

  // Helper function to safely get balance as number
  const getBalanceAsNumber = (balance: number | string): number => {
    return typeof balance === 'string' ? parseFloat(balance) || 0 : balance;
  };

  // Fetch initial data
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

        // Fetch lobby, participants, and user data in parallel
        const [lobbyResponse, participantsResponse, userResponse] = await Promise.all([
          apiRequest<Lobby>(`/lobbies/${lobbyId}`, {
            headers: { 'Authorization': `Bearer ${token}` }
          }),
          apiRequest<Participant[]>(`/lobbies/${lobbyId}/participants`, {
            headers: { 'Authorization': `Bearer ${token}` }
          }),
          apiRequest<{ user: User }>('/dashboard', {
            headers: { 'Authorization': `Bearer ${token}` }
          }).then(data => data.user)
        ]);

        setLobby(lobbyResponse);
        setParticipants(participantsResponse);
        setUser(userResponse);
        setGameStatus(lobbyResponse.status);

        console.log('[LOBBY PAGE] Initial data loaded:', {
          lobby: lobbyResponse.name,
          participantCount: participantsResponse.length,
          userEmail: userResponse.email
        });

      } catch (err: any) {
        console.error('[LOBBY PAGE] Error fetching data:', err);
        if (err.message?.includes('404')) {
          setError('Lobby not found');
        } else if (err.message?.includes('401')) {
          setLocation('/login');
        } else {
          setError(err.message || 'Failed to load lobby data');
        }
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

  // Socket.io event listeners for real-time updates
  useEffect(() => {
    if (!socket || !lobby) return;

    console.log('[LOBBY PAGE] Setting up Socket.io listeners for lobby:', lobby.id);

    // Join the lobby room for real-time updates
    socket.emit('join_lobby', lobby.id);

    // On join, attempt to get a snapshot if a game is already running
    (async () => {
      try {
        const token = localStorage.getItem('token');
        const snapshot = await apiRequest<any>(`/games/${lobby.id}/snapshot`, {
          headers: { Authorization: `Bearer ${token}` }
        });
        if (snapshot) {
          console.log('[GAME] Snapshot on join:', snapshot);
          if (Array.isArray(snapshot.drawnNumbers)) {
            setCalledNumbers(snapshot.drawnNumbers);
          }
          if (snapshot.status === 'active' || snapshot.status === 'finished') {
            setGameStatus(snapshot.status);
          }
          if (snapshot.cards) setServerCardsBySeat(snapshot.cards);
          if (typeof snapshot.isPaused === 'boolean') setIsPaused(snapshot.isPaused);
          if (typeof snapshot.callIntervalMs === 'number') setCallMs(snapshot.callIntervalMs);
        }
      } catch (e: any) {
        // No active game -> 404; ignore
      }
    })();

    // Game events (7A minimal)
    const handleGameStarted = (data: any) => {
      console.log('[GAME] Started:', data);
      setCalledNumbers([]);
      setWinner(null);
      setGameStatus('active');
      if (data?.cards) setServerCardsBySeat(data.cards);
      setIsPaused(false);
    };
    const handleNumberCalled = (data: any) => {
      console.log('[GAME] Number called:', data.number);
      setCalledNumbers(prev => [...prev, data.number]);
      const el = document.getElementById('called-numbers');
      if (el) {
        const last = data.drawnNumbers.slice(-5).join(', ');
        el.textContent = `Last: ${data.number}  |  Recent: ${last}`;
      }
    };
    const handleGameEnded = (data: any) => {
      console.log('[GAME] Ended:', data);
      setToastMsg('Game ended');
      setGameStatus('finished');
      setIsPaused(false);
    };

    // Listen for seat taken events
    const handleSeatTaken = (data: any) => {
      console.log('[LOBBY PAGE] Seat taken event received:', data);
      console.log('[LOBBY PAGE] Current lobby ID:', lobby.id, 'Event lobby ID:', data.lobbyId);
      console.log('[LOBBY PAGE] Current participants before update:', participants);
      
      if (data.lobbyId === lobby.id) {
        console.log('[LOBBY PAGE] Processing seat taken event for our lobby');
        console.log('[LOBBY PAGE] User joined:', data.userEmail, 'Seat:', data.seatNumber);
        
        // Update lobby seat count
        setLobby(prev => prev ? { ...prev, seatsTaken: data.newSeatsTaken } : prev);
        
        // Refresh participants list to get updated usernames
        console.log('[LOBBY PAGE] Refreshing participants list for username updates');
        fetchParticipants();
      } else {
        console.log('[LOBBY PAGE] Ignoring seat taken event for different lobby');
      }
    };

    // Listen for seat freed events
    const handleSeatFreed = (data: any) => {
      console.log('[LOBBY PAGE] Seat freed event:', data);
      console.log('[LOBBY PAGE] User left:', data.userEmail || 'Unknown', 'Seat:', data.seatNumber);
      
      if (data.lobbyId === lobby.id) {
        // Update lobby seat count
        setLobby(prev => prev ? { ...prev, seatsTaken: data.newSeatsTaken } : prev);
        
        // Refresh participants list to update seat grid usernames
        console.log('[LOBBY PAGE] Refreshing participants list for username removal');
        fetchParticipants();
      }
    };

    socket.on('game_started', handleGameStarted);
    socket.on('number_called', handleNumberCalled);
    socket.on('game_ended', handleGameEnded);
    socket.on('player_won', (data: any) => {
      console.log('[GAME] Player won:', data);
      // find seatNumber for winner from participants
      const p = participants.find(p => p.userId === data.userId);
      if (p) setWinner({ seatNumber: p.seatNumber, userId: data.userId });
    });

    socket.on('game_paused', () => setIsPaused(true));
    socket.on('game_resumed', () => setIsPaused(false));
    socket.on('call_speed_changed', (d: any) => setCallMs(d?.ms || 3000));

    // Personal and lobby events
    const handleLobbyJoined = (data: any) => {
      console.log('[LOBBY PAGE] Personal lobby joined event:', data);
      if (data.lobbyId === lobby.id && user) {
        setUser(prev => prev ? { ...prev, balance: data.newBalance } : prev);
      }
    };

    const handleLobbyLeft = (data: any) => {
      console.log('[LOBBY PAGE] Personal lobby left event:', data);
      if (data.lobbyId === lobby.id && user) {
        setUser(prev => prev ? { ...prev, balance: data.newBalance || prev.balance } : prev);
      }
    };

    // Register event listeners
    socket.on('seat_taken', handleSeatTaken);
    socket.on('seat_freed', handleSeatFreed);
    socket.on('lobby_joined', handleLobbyJoined);
    socket.on('lobby_left', handleLobbyLeft);

    // Cleanup function
    return () => {
      console.log('[LOBBY PAGE] Cleaning up Socket.io listeners');
      socket.off('game_started', handleGameStarted);
      socket.off('number_called', handleNumberCalled);
      socket.off('game_ended', handleGameEnded);
      socket.off('seat_taken', handleSeatTaken);
      socket.off('seat_freed', handleSeatFreed);
      socket.off('lobby_joined', handleLobbyJoined);
      socket.off('lobby_left', handleLobbyLeft);
      socket.off('game_paused');
      socket.off('game_resumed');
      socket.off('call_speed_changed');
      socket.emit('leave_lobby', lobby.id);
    };
  }, [socket, lobby?.id, user?.id, participants]);

  const fetchParticipants = async () => {
    try {
      console.log('[LOBBY PAGE] Fetching participants for lobby:', lobbyId);
      const token = localStorage.getItem('token');
      const participantsResponse = await apiRequest<Participant[]>(`/lobbies/${lobbyId}/participants`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      console.log('[LOBBY PAGE] Received participants:', participantsResponse);
      setParticipants(participantsResponse);
      console.log('[LOBBY PAGE] Updated participants state');
      console.log('[LOBBY PAGE] Participants state after update:', participantsResponse.length, 'participants');
    } catch (err) {
      console.error('[LOBBY PAGE] Error fetching participants:', err);
    }
  };

  const handleSeatSelection = async (seatNumber: number) => {
    if (!user || joining) return;

    const userParticipations = participants.filter(p => p.userId === user.id);
    const isAlreadySelected = userParticipations.some(p => p.seatNumber === seatNumber);

    try {
      setJoining(true);
      setError('');

      const token = localStorage.getItem('token');

      if (isAlreadySelected) {
        // Leave this specific seat
        await apiRequest(`/lobbies/${lobbyId}/leave`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`
          },
          body: JSON.stringify({ seatNumber })
        });
        console.log('[LOBBY PAGE] Successfully left seat', seatNumber);
      } else {
        // Check if user can select more seats (max 2)
        if (userParticipations.length >= 2) {
          setError('You can only select up to 2 seats');
          return;
        }

        // Join this seat
        await apiRequest(`/lobbies/${lobbyId}/join`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`
          },
          body: JSON.stringify({ seatNumber })
        });
        console.log('[LOBBY PAGE] Successfully joined lobby at seat', seatNumber);
      }

      // Real-time updates will handle the UI refresh via Socket.io events
      
    } catch (err: any) {
      console.error('[LOBBY PAGE] Error with seat selection:', err);
      setError(err.message || 'Failed to update seat selection');
    } finally {
      setJoining(false);
    }
  };

  const handleLeaveLobby = async () => {
    console.log('[DEBUG BUTTON] Leave lobby button clicked!');
    console.log('[DEBUG BUTTON] Current user:', user);
    console.log('[DEBUG BUTTON] Current lobby ID:', lobbyId);
    console.log('[DEBUG BUTTON] Current participation:', currentUserParticipation);
    console.log('[DEBUG BUTTON] Joining state:', joining);
    
    if (!user || joining) {
      console.log('[DEBUG BUTTON] Cannot leave - no user or currently joining');
      return;
    }

    try {
      setJoining(true);
      setError('');
      console.log('[DEBUG BUTTON] Making leave lobby API request...');
      console.log('[DEBUG BUTTON] API endpoint: /lobbies/' + lobbyId + '/leave');

      const token = localStorage.getItem('token');
      console.log('[DEBUG BUTTON] Token exists:', !!token);
      
      const response = await apiRequest(`/lobbies/${lobbyId}/leave`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      console.log('[DEBUG BUTTON] Leave lobby API response:', response);
      console.log('[DEBUG BUTTON] Successfully left lobby');

      // Real-time updates will handle the UI refresh via Socket.io events

    } catch (err: any) {
      console.error('[DEBUG BUTTON] Error leaving lobby:', err);
      console.error('[DEBUG BUTTON] Error details:', JSON.stringify(err, null, 2));
      setError(err.message || 'Failed to leave lobby');
    } finally {
      setJoining(false);
      console.log('[DEBUG BUTTON] Leave lobby process completed');
    }
  };

  const renderBingoCard = () => {
    if (!lobby) return null;

    console.log('[BINGO CARD] Rendering with participants:', participants);

    // Enhanced game phase mapping with better logic
    const getGamePhase = () => {
      const status = gameStatus || lobby.status;
      switch (status) {
        case 'waiting': return 'lobby';
        case 'active': return 'playing';
        case 'finished': return 'finished';
        default: return 'lobby';
      }
    };

    const gamePhase = getGamePhase();
    console.log('[BINGO CARD] Game phase:', gamePhase, 'Lobby status:', lobby.status);

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
              // For now, use the first selected seat for win claims
              const primarySeat = selectedSeats[0];
              apiRequest(`/games/${lobby.id}/claim`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
                body: JSON.stringify({ userId: user!.id, seatNumber: primarySeat, numbers: rowNumbers }),
              }).then(() => setToastMsg('Win validated!')).catch((e) => setToastMsg(e.message));
            }}
            winnerSeatNumber={winner?.seatNumber}
            winnerUserId={winner?.userId}
            myUserId={user?.id}
            lobbyId={lobby.id}
            // When server cards exist for selected seats, provide them
            serverCardsBySeat={serverCardsBySeat}
          />
      </div>
    );
  };



  // Early returns for loading and error states
  if (loading) {
    return (
      <div className="min-h-screen bg-gray-900 text-white flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-white mx-auto mb-4"></div>
          <p className="text-xl">Loading lobby...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gray-900 text-white flex items-center justify-center">
        <div className="text-center">
          <p className="text-red-400 text-xl mb-4">{error}</p>
          <button
            onClick={() => setLocation('/dashboard')}
            className="bg-blue-600 hover:bg-blue-700 px-6 py-2 rounded"
          >
            Back to Dashboard
          </button>
        </div>
      </div>
    );
  }

  if (!lobby || !user) {
    return (
      <div className="min-h-screen bg-gray-900 text-white flex items-center justify-center">
        <div className="text-center">
          <p className="text-gray-300">Unable to load lobby data</p>
        </div>
      </div>
    );
  }

  const currentUserParticipations = participants.filter(p => p.userId === user.id);
  const selectedSeats = currentUserParticipations.map(p => p.seatNumber);
  const canAffordEntry = getBalanceAsNumber(user.balance) >= parseFloat(lobby.entryFee);
  
  // Debug function to fix seat count
  const fixSeatCount = async () => {
    console.log('[DEBUG BUTTON] Fix Seat Count button clicked');
    console.log('[DEBUG BUTTON] Current lobby ID:', lobbyId);
    console.log('[DEBUG BUTTON] Current lobby data:', lobby);
    console.log('[DEBUG BUTTON] Current participants:', participants);
    
    try {
      const token = localStorage.getItem('token');
      console.log('[DEBUG BUTTON] Making fix-seats API request...');
      
      const response = await apiRequest(`/lobbies/${lobbyId}/fix-seats`, {
        method: 'POST',
        headers: { 'Authorization': `Bearer ${token}` }
      });
      
      console.log('[DEBUG BUTTON] Fix seats API response:', response);
      console.log('[DEBUG BUTTON] Reloading page to see updated count...');
      window.location.reload(); // Refresh page to see updated count
    } catch (err) {
      console.error('[DEBUG BUTTON] Failed to fix seat count:', err);
      console.error('[DEBUG BUTTON] Error details:', JSON.stringify(err, null, 2));
    }
  };

  return (
    <SiteLayout>
      {/* Top Header */}
      <div className="bg-white border-b border-gray-200">
        <div className={cn(
          "container mx-auto py-2",
          isMobile ? "px-2" : "px-4"
        )}>
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-2 sm:space-x-4 flex-1 min-w-0">
              <button
                onClick={() => setLocation('/dashboard')}
                className="text-casino-red hover:opacity-80 transition-colors text-sm flex-shrink-0 touch-manipulation"
              >
                ← Back
              </button>
              <h1 className={cn(
                "font-bold text-gray-900 truncate",
                isMobile ? "text-lg" : "text-xl"
              )}>{lobby.name}</h1>
            </div>
            <div className="flex items-center space-x-2 sm:space-x-4 flex-shrink-0">
              {!isMobile && <ConnectionStatus showDetails={false} className="text-xs" />}
              <div className="text-xs text-gray-700">
                {!isMobile && <span>Balance: </span>}${getBalanceAsNumber(user.balance).toFixed(2)}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Game Container */}
      <div className={cn(
        "container mx-auto py-2",
        isMobile ? "px-0" : "px-4"
      )}>
        <div className={cn(
          "mx-auto",
          isMobile ? "w-full" : "max-w-7xl"
        )}>
          {isMobile ? (
            /* Mobile View - Full height tabbed interface */
            <div className="h-[calc(100vh-4rem)] bg-white border-t border-gray-200">
              <MobileGameView
                onSeatSelect={(seatNumber) => {
                  const currentGamePhase = (() => {
                    const status = gameStatus || lobby.status;
                    switch (status) {
                      case 'waiting': return 'lobby';
                      case 'active': return 'playing';
                      case 'finished': return 'finished';
                      default: return 'lobby';
                    }
                  })();
                  if (currentGamePhase === 'lobby' && !joining) {
                    handleSeatSelection(seatNumber);
                  }
                }}
                selectedSeats={selectedSeats}
                participants={participants}
                isJoining={joining}
                gamePhase={(() => {
                  const status = gameStatus || lobby.status;
                  switch (status) {
                    case 'waiting': return 'lobby';
                    case 'active': return 'playing';
                    case 'finished': return 'finished';
                    default: return 'lobby';
                  }
                })()}
                calledNumbers={calledNumbers}
                onWin={(pattern, rowNumbers) => {
                  if (selectedSeats.length === 0) return;
                  const token = localStorage.getItem('token');
                  // For now, use the first selected seat for win claims
                  const primarySeat = selectedSeats[0];
                  apiRequest(`/games/${lobby.id}/claim`, {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
                    body: JSON.stringify({ userId: user!.id, seatNumber: primarySeat, numbers: rowNumbers }),
                  }).then(() => setToastMsg('Win validated!')).catch((e) => setToastMsg(e.message));
                }}
                winnerSeatNumber={winner?.seatNumber}
                winnerUserId={winner?.userId}
                myUserId={user?.id}
                lobbyId={lobby.id}
                serverCardsBySeat={serverCardsBySeat}
                lobby={lobby}
                user={user}
                currentUserParticipation={currentUserParticipations[0]} // Use first participation for compatibility
                canAffordEntry={canAffordEntry}
                isConnected={isConnected}
                isPaused={isPaused}
                gameStatus={gameStatus}
                onLeaveLobby={handleLeaveLobby}
              />
            </div>
          ) : (
            /* Desktop View - Original layout */
            <div className="bg-white rounded-lg p-3 min-h-[calc(100vh-12rem)] lg:h-[780px] flex flex-col gap-2 border border-gray-200">
              {/* Desktop HUD Row - Enhanced with Pool Size */}
              <div className="grid grid-cols-5 gap-2 text-center">
                <div className="bg-gray-100 rounded p-2">
                  <div className="text-[11px] text-gray-600">Entry Fee</div>
                  <div className="text-base font-bold text-casino-red">${lobby.entryFee}</div>
                </div>
                <div className="bg-gray-100 rounded p-2">
                  <div className="text-[11px] text-gray-600">Players</div>
                  <div className="text-base font-bold text-gray-900">{lobby.seatsTaken}/{lobby.maxSeats}</div>
                </div>
                <div className="bg-gradient-to-r from-yellow-50 to-amber-50 rounded p-2 border border-yellow-200">
                  <div className="text-[11px] text-yellow-800">Prize Pool</div>
                  <div className="text-base font-bold text-yellow-600">${(lobby.entryFee * lobby.seatsTaken * 0.9).toFixed(0)}</div>
                </div>
                <div className="bg-gray-100 rounded p-2">
                  <div className="text-[11px] text-gray-600">Game Phase</div>
                  <div className={`text-base font-bold flex items-center justify-center gap-1 ${
                    gameStatus === 'waiting' ? 'text-yellow-600' :
                    gameStatus === 'active' ? 'text-green-600' : 'text-purple-600'
                  }`}>
                    <span className="text-sm">
                      {gameStatus === 'waiting' && '🪑'}
                      {gameStatus === 'active' && '🎯'}
                      {gameStatus === 'finished' && '🏆'}
                    </span>
                    <span className="text-xs">
                      {gameStatus === 'waiting' && 'Lobby'}
                      {gameStatus === 'active' && 'Playing'}
                      {gameStatus === 'finished' && 'Finished'}
                    </span>
                  </div>
                </div>
                <div className="bg-gray-100 rounded p-2">
                  <div className="text-[11px] text-gray-600">Connection</div>
                  <div className={`text-xs font-medium ${isConnected ? 'text-green-600' : 'text-red-600'}`}>
                    {isConnected ? '🟢 Live' : '🔴 Offline'}
                  </div>
                </div>
                {/* Prominent Leave Lobby Button */}
                {currentUserParticipation && (
                  <div className="bg-red-50 rounded p-2 border border-red-200 flex items-center justify-center">
                    <button
                      onClick={handleLeaveLobby}
                      disabled={joining || gameStatus === 'active'}
                      className={`px-4 py-2 rounded-lg font-bold text-sm transition-all border-2 ${
                        gameStatus === 'active' 
                          ? 'bg-gray-200 text-gray-500 border-gray-300 cursor-not-allowed' 
                          : 'bg-casino-red hover:bg-red-600 text-white border-casino-red hover:border-red-600 shadow-md hover:shadow-lg'
                      }`}
                      title={gameStatus === 'active' ? 'Cannot leave during game' : 'Leave Lobby'}
                    >
                      🚪 Leave Lobby
                    </button>
                  </div>
                )}
              </div>

              {/* Desktop Main Content */}
              <div className="grid grid-cols-[1fr,260px] gap-2 flex-1 min-h-0">
                {/* Card */}
                <div className="bg-white rounded p-2 overflow-hidden border border-gray-200">
                  {renderBingoCard()}
                </div>

                {/* Desktop Sidebar */}
                <div className="bg-white rounded p-2 flex flex-col min-h-0 border border-gray-200">
                  {/* Admin controls */}
                  {user?.isAdmin && (
                    <div className="mb-2 flex flex-wrap items-center gap-2">
                      {gameStatus !== 'active' && (
                        <button
                          onClick={async () => {
                            try {
                              const token = localStorage.getItem('token');
                              await apiRequest(`/games/${lobby.id}/start`, { method: 'POST', headers: { Authorization: `Bearer ${token}` } });
                            } catch (e) {
                              setToastMsg((e as Error).message);
                            }
                          }}
                          className="bg-green-600 hover:bg-green-700 px-2.5 py-1 rounded text-xs font-semibold text-white"
                        >Start</button>
                      )}
                      {gameStatus === 'active' && (
                        <>
                          <button
                            onClick={async () => {
                              try {
                                const token = localStorage.getItem('token');
                                const endpoint = isPaused ? 'resume' : 'pause';
                                await apiRequest(`/games/${lobby.id}/${endpoint}`, { method: 'POST', headers: { Authorization: `Bearer ${token}` } });
                                setIsPaused(!isPaused);
                              } catch (e) {
                                setToastMsg((e as Error).message);
                              }
                            }}
                            className="bg-indigo-600 hover:bg-indigo-700 px-2.5 py-1 rounded text-xs font-semibold text-white"
                          >{isPaused ? 'Resume' : 'Pause'}</button>
                          <select
                            className="bg-white border border-gray-300 rounded text-xs px-1 py-1"
                            value={callMs}
                            onChange={async (e) => {
                              const ms = parseInt(e.target.value, 10);
                              setCallMs(ms);
                              try {
                                const token = localStorage.getItem('token');
                                await apiRequest(`/games/${lobby.id}/speed`, { method: 'POST', headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` }, body: JSON.stringify({ ms }) });
                              } catch (err) {
                                setToastMsg((err as Error).message);
                              }
                            }}
                          >
                            <option value={1000}>Speed: 1s</option>
                            <option value={2000}>Speed: 2s</option>
                            <option value={3000}>Speed: 3s</option>
                            <option value={5000}>Speed: 5s</option>
                          </select>
                          <button
                            onClick={async () => {
                              try {
                                const token = localStorage.getItem('token');
                                await apiRequest(`/games/${lobby.id}/stop`, { method: 'POST', headers: { Authorization: `Bearer ${token}` } });
                              } catch (e) {
                                if ((e as Error).message?.includes('No active game')) {
                                  setToastMsg('No active game');
                                } else {
                                  setToastMsg((e as Error).message);
                                }
                              }
                            }}
                            className="bg-yellow-600 hover:bg-yellow-700 px-2.5 py-1 rounded text-xs font-semibold text-white"
                          >Stop</button>
                        </>
                      )}
                    </div>
                  )}

                  {/* Called numbers panel */}
                  <div className="mb-2 bg-gray-50 rounded p-2 border border-gray-200">
                    <div className="text-xs font-bold mb-1 text-gray-900">Called Numbers</div>
                    <div className="flex items-center gap-2 mb-1">
                      <span className="text-[11px] text-gray-600 flex-shrink-0">Last:</span>
                      <div className="inline-flex gap-1">
                        {calledNumbers.length > 0 && (
                          <span className="px-1.5 py-0.5 rounded bg-blue-600 text-white text-[11px] font-semibold">
                            {calledNumbers[calledNumbers.length - 1]}
                          </span>
                        )}
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="text-[11px] text-gray-600 flex-shrink-0">Recent:</span>
                      <div className="flex flex-wrap gap-1">
                        {calledNumbers.slice(-6).reverse().map((n, idx) => (
                          <span key={idx} className="px-1.5 py-0.5 rounded bg-blue-600 text-white text-[11px] font-semibold">
                            {n}
                          </span>
                        ))}
                      </div>
                    </div>
                  </div>

                  {/* Master Card - Always visible on desktop */}
                  <div className="mb-2">
                    <div className="flex items-center justify-between mb-1">
                      <div className="text-xs text-gray-700">Master (1–75)</div>
                      <div className="text-[11px] text-gray-500">Yellow = called</div>
                    </div>
                    <MasterCard calledNumbers={calledNumbers} compact={true} showHeaders={false} />
                  </div>

                  {/* Join/Seat area */}
                  <div className="mb-2">
                    {currentUserParticipation ? (
                      <div className="bg-green-50 rounded p-2 text-center border border-green-200">
                        <p className="text-green-700 text-sm font-medium">You are in seat {currentUserParticipation.seatNumber}</p>
                      </div>
                    ) : (
                      <div className="bg-gray-50 rounded p-2 text-center text-gray-700 text-sm border border-gray-200">
                        {lobby.status === 'waiting' 
                          ? (canAffordEntry ? 'Click an available seat to join' : 'Insufficient balance to join')
                          : 'Lobby not accepting players'}
                      </div>
                    )}
                  </div>

                  {/* Participants */}
                  <div className="flex-1 min-h-0">
                    <div className="flex items-center justify-between mb-1">
                      <h2 className="text-sm font-bold text-gray-900">Players ({participants.length}/{lobby.maxSeats})</h2>
                    </div>
                    <div className="space-y-2 overflow-y-auto pr-1 h-full">
                      {participants.length > 0 ? (
                        participants.map((participant) => (
                          <div key={participant.id} className="flex items-center justify-between bg-gray-50 rounded p-2 border border-gray-200">
                            <div>
                              <div className="text-xs font-medium text-gray-900">
                                {participant.user?.email?.split('@')[0] || 'Unknown'}
                                {participant.userId === user.id && <span className="text-green-700 ml-1">(You)</span>}
                              </div>
                              <div className="text-[11px] text-gray-500">Seat {participant.seatNumber}</div>
                            </div>
                            <div className="text-[11px] text-gray-500">
                              {new Date(participant.joinedAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                            </div>
                          </div>
                        ))
                      ) : (
                        <p className="text-gray-500 text-center py-4 text-sm">No players yet. Be the first to join!</p>
                      )}
                    </div>
                  </div>
                </div>
              </div>

              {/* Desktop Footer */}
              <div className="flex items-center justify-between text-[11px] text-gray-500">
                <div>Tip: Use the left table to pick a seat.</div>
              </div>
            </div>
          )}
        </div>
      </div>
      {toastMsg && (
        <div className="fixed bottom-3 left-1/2 -translate-x-1/2 bg-gray-900 text-white text-sm px-3 py-1.5 rounded shadow-lg border border-gray-700">
          {toastMsg}
        </div>
      )}
    </SiteLayout>
  );
};

export default LobbyPage;