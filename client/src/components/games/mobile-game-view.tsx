import React, { useState, useEffect } from 'react';
import { cn } from '@/lib/utils';
import { CompactMobileBingo } from './compact-mobile-bingo';
import { MobileMasterCard } from './mobile-master-card';
import { MobilePlayersView } from './mobile-players-view';
import { MobileInfoView } from './mobile-info-view';
import { IntegratedMasterCard } from './integrated-master-card';
import { GameInfoCard } from './game-info-card';
import { Eye, Grid3X3, Users, Info } from 'lucide-react';
import { apiRequest } from '@/lib/api';

interface MobileGameViewProps {
  currentNumber?: number | null;
  nextCallIn?: number;
  currentCallSpeed?: number;
  gameId?: number;
  // BingoCard props
  onSeatSelect: (seatNumber: number) => void;
  selectedSeats?: number[];
  participants: any[];
  isJoining: boolean;
  gamePhase: 'lobby' | 'playing' | 'finished';
  calledNumbers: number[];
  onWin: (pattern: string, rowNumbers: number[]) => void;
  winnerSeatNumber?: number;
  winnerUserId?: number;
  myUserId?: number;
  lobbyId: number;
  serverRow?: number[];
  serverCardsBySeat?: Record<number, number[]>;
  masterCard?: number[][] | null; // Server master card that ALL players see
  patternProgress?: any[]; // Pattern progress for visual effects
  
  // Additional lobby info
  lobby: any;
  user: any;
  currentUserParticipation: any;
  canAffordEntry: boolean;
  isConnected: boolean;
  isPaused: boolean;
  gameStatus: string;
  onLeaveLobby?: () => void;
  
  // Admin functionality
  onStartGame?: () => void;
  gameData?: any;
}

type MobileTab = 'card' | 'master' | 'players' | 'info';

export function MobileGameView({
  currentNumber,
  nextCallIn,
  currentCallSpeed = 5,
  gameId,
  onSeatSelect,
  selectedSeats = [],
  participants,
  isJoining,
  gamePhase,
  calledNumbers,
  onWin,
  winnerSeatNumber,
  winnerUserId,
  myUserId,
  lobbyId,
  serverRow,
  serverCardsBySeat,
  masterCard,
  lobby,
  user,
  currentUserParticipation,
  canAffordEntry,
  isConnected,
  isPaused,
  gameStatus,
  onLeaveLobby,
  onStartGame,
  gameData,
  participants: gameParticipants,
  patternProgress = []
}: MobileGameViewProps) {
  const [activeTab, setActiveTab] = useState<MobileTab>('card');
  const [availableGames, setAvailableGames] = useState<any[]>([]);

  // Fetch available games for this lobby
  useEffect(() => {
    const fetchAvailableGames = async () => {
      try {
        const token = localStorage.getItem('token');
        if (!token || !lobbyId) return;

        const games = await apiRequest<any[]>(`/lobbies/${lobbyId}/games`, {
          headers: { 'Authorization': `Bearer ${token}` }
        });
        setAvailableGames(games);
      } catch (error) {
        console.error('Failed to fetch available games:', error);
        setAvailableGames([]);
      }
    };

    fetchAvailableGames();
  }, [lobbyId]);

  const tabs = [
    { id: 'card' as MobileTab, label: 'My Card', icon: Grid3X3 },
    { id: 'master' as MobileTab, label: 'Master', icon: Eye },
    { id: 'players' as MobileTab, label: 'Players', icon: Users },
    { id: 'info' as MobileTab, label: 'Info', icon: Info }
  ];

  const renderTabContent = () => {
    switch (activeTab) {
      case 'card':
        return (
          <div className="w-full h-full flex flex-col overflow-hidden">
            {/* User Status Bar at top */}
            <div className="flex-shrink-0 bg-gradient-to-r from-blue-50 to-green-50 border-b border-gray-200 px-3 py-2">
              <div className="flex justify-between items-center">
                <div className="flex items-center gap-3">
                  <div>
                    <div className="text-xs text-gray-600">Balance</div>
                    <div className="text-sm font-bold text-gray-900">
                      ${parseFloat(user.balance).toFixed(2)}
                    </div>
                  </div>
                  {selectedSeats.length > 0 && (
                    <div className="bg-green-100 rounded px-2 py-1 border border-green-300">
                      <div className="text-xs font-medium text-green-800">
                        Seats: {selectedSeats.join(', ')} ({selectedSeats.length}/2)
                      </div>
                    </div>
                  )}
                </div>
                <div className="text-right">
                  <div className="text-xs text-gray-600">Status</div>
                  <div className={cn(
                    "text-sm font-bold",
                    selectedSeats.length > 0 ? "text-green-600" : "text-blue-600"
                  )}>
                    {selectedSeats.length > 0 ? "Playing" : 
                     (canAffordEntry ? "Ready" : "Low Balance")}
                  </div>
                </div>
              </div>
            </div>
            
            {/* Compact Two-Column Layout: Master Card + Game Info */}
            <div className="flex-shrink-0 px-3 py-2">
              <div className="flex gap-3">
                {/* Left Column - Compact Master Card */}
                <div className="w-1/2">
                  <IntegratedMasterCard 
                    calledNumbers={calledNumbers}
                    currentNumber={currentNumber || undefined}
                    nextCallIn={nextCallIn}
                  />
                </div>
                
                {/* Right Column - Game Information */}
                <div className="w-1/2">
                  <GameInfoCard 
                    lobby={lobby}
                    participants={participants}
                    selectedSeats={selectedSeats}
                    gamePhase={gamePhase}
                    currentNumber={currentNumber || undefined}
                    nextCallIn={nextCallIn}
                    onGameSwitch={(gameId) => {
                      // Find the actual game from available games
                      const targetGame = availableGames.find(game => game.gameNumber === gameId);
                      if (targetGame) {
                        // Navigate to the specific game using the actual game ID
                        window.location.href = `/games/${targetGame.id}`;
                      } else {
                        console.error(`Game ${gameId} not found in available games`);
                      }
                    }}
                    availableGames={availableGames}
                  />
                </div>
              </div>
            </div>
            
            {/* Compact Mobile Bingo Card */}
            <div className="flex-1 overflow-hidden">
              <CompactMobileBingo
                onSeatSelect={onSeatSelect}
                selectedSeats={selectedSeats}
                participants={participants}
                isJoining={isJoining}
                gamePhase={gamePhase}
                calledNumbers={calledNumbers}
                onWin={onWin}
                winnerSeatNumber={winnerSeatNumber}
                winnerUserId={winnerUserId}
                myUserId={myUserId}
                lobbyId={lobbyId}
                serverRow={serverRow}
                serverCardsBySeat={serverCardsBySeat}
                masterCard={masterCard}
                patternProgress={patternProgress}
              />
            </div>
          </div>
        );
      
      case 'master':
        return (
          <MobileMasterCard 
            calledNumbers={calledNumbers}
            currentNumber={currentNumber || undefined}
            nextCallIn={nextCallIn}
          />
        );
      
      case 'players':
        return (
          <MobilePlayersView
            participants={participants}
            maxSeats={lobby.maxSeats}
            currentUserId={user.id}
            winnerSeatNumber={winnerSeatNumber}
          />
        );
      
      case 'info':
        return (
          <MobileInfoView
            lobby={lobby}
            gameStatus={gameStatus}
            participants={gameParticipants}
            isConnected={isConnected}
            isPaused={isPaused}
            calledNumbers={calledNumbers}
            currentUserParticipation={currentUserParticipation}
            onLeaveLobby={onLeaveLobby}
            user={user}
            gameId={gameId}
            currentCallSpeed={currentCallSpeed}
          />
        );
    }
  };

  return (
    <div className="w-full h-full flex flex-col bg-white/95 backdrop-blur-sm min-h-[600px] rounded-t-3xl border-2 border-gray-200/50 shadow-2xl">
      {/* Enhanced Tab Navigation */}
      <div className="flex-shrink-0 flex border-b border-gray-300/50 bg-gradient-to-r from-gray-100 to-gray-200 rounded-t-3xl">
        {tabs.map((tab) => {
          const Icon = tab.icon;
          return (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={cn(
                "flex-1 flex flex-col items-center justify-center py-3 px-2 transition-all duration-300",
                "focus:outline-none focus:ring-2 focus:ring-blue-400 focus:ring-inset",
                "first:rounded-tl-3xl last:rounded-tr-3xl",
                activeTab === tab.id 
                  ? "bg-white border-b-2 border-blue-500 text-blue-600 shadow-lg transform scale-105" 
                  : "text-gray-600 hover:text-gray-800 hover:bg-white/50 hover:scale-102"
              )}
            >
              <Icon size={18} className="mb-1" />
              <span className="text-sm font-medium">{tab.label}</span>
            </button>
          );
        })}
      </div>
      
      {/* Tab Content - uses all remaining space with light theme */}
      <div className="flex-1 overflow-auto w-full bg-white/50 backdrop-blur-sm">
        {renderTabContent()}
      </div>
    </div>
  );
}