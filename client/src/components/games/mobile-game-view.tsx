import React, { useState } from 'react';
import { cn } from '@/lib/utils';
import { CompactMobileBingo } from './compact-mobile-bingo';
import { MobileMasterCard } from './mobile-master-card';
import { MobilePlayersView } from './mobile-players-view';
import { MobileInfoView } from './mobile-info-view';
import { Eye, Grid3X3, Users, Info } from 'lucide-react';

interface MobileGameViewProps {
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
  lobby,
  user,
  currentUserParticipation,
  canAffordEntry,
  isConnected,
  isPaused,
  gameStatus,
  onLeaveLobby,
  onStartGame,
  gameData
}: MobileGameViewProps) {
  const [activeTab, setActiveTab] = useState<MobileTab>('card');

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
              
              {/* Admin Start Game Button for Mobile */}
              {user?.isAdmin && gameData?.status === 'waiting' && (
                <div className="mt-2 pt-2 border-t border-gray-300">
                  <button
                    onClick={onStartGame}
                    className="w-full bg-green-600 hover:bg-green-700 text-white py-2 px-3 rounded text-sm font-medium"
                  >
                    🚀 Start Game
                  </button>
                </div>
              )}
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
              />
            </div>
          </div>
        );
      
      case 'master':
        return (
          <MobileMasterCard 
            calledNumbers={calledNumbers}
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
            isConnected={isConnected}
            isPaused={isPaused}
            calledNumbers={calledNumbers}
            currentUserParticipation={currentUserParticipation}
            onLeaveLobby={onLeaveLobby}
          />
        );
    }
  };

  return (
    <div className="w-full h-full flex flex-col bg-white min-h-[600px]">
      {/* Tab Navigation - compact */}
      <div className="flex-shrink-0 flex border-b border-gray-200 bg-gray-50">
        {tabs.map((tab) => {
          const Icon = tab.icon;
          return (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={cn(
                "flex-1 flex flex-col items-center justify-center py-2 px-1 transition-colors",
                "focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-inset",
                activeTab === tab.id 
                  ? "bg-white border-b-2 border-blue-600 text-blue-600" 
                  : "text-gray-600 hover:text-gray-800 hover:bg-gray-100"
              )}
            >
              <Icon size={16} className="mb-1" />
              <span className="text-xs font-medium">{tab.label}</span>
            </button>
          );
        })}
      </div>
      
      {/* Tab Content - uses all remaining space */}
      <div className="flex-1 overflow-auto w-full">
        {renderTabContent()}
      </div>
    </div>
  );
}