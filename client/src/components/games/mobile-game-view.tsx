import React, { useState } from 'react';
import { cn } from '@/lib/utils';
import { BingoCard } from './bingo-card';
import { MasterCard } from './master-card';
import { Eye, Grid3X3, Users, Info } from 'lucide-react';

interface MobileGameViewProps {
  // BingoCard props
  onSeatSelect: (seatNumber: number) => void;
  selectedSeat?: number;
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
}

type MobileTab = 'card' | 'master' | 'players' | 'info';

export function MobileGameView({
  onSeatSelect,
  selectedSeat,
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
  gameStatus
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
          <div className="h-full overflow-hidden">
            <BingoCard
              onSeatSelect={onSeatSelect}
              selectedSeat={selectedSeat}
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
        );
      
      case 'master':
        return (
          <div className="h-full flex flex-col p-4 space-y-4">
            <div className="text-center">
              <h3 className="text-lg font-bold text-gray-900 mb-2">Master Card (1-75)</h3>
              <p className="text-sm text-gray-600">Yellow = Called Numbers</p>
            </div>
            
            {/* Large, touch-friendly master card */}
            <div className="flex-1 flex items-center justify-center">
              <div className="w-full max-w-sm">
                <MasterCard 
                  calledNumbers={calledNumbers} 
                  compact={false} 
                  showHeaders={true}
                  className="border-2 border-gray-300" 
                />
              </div>
            </div>
            
            {/* Called numbers summary */}
            <div className="bg-blue-50 rounded-lg p-4 border border-blue-200">
              <div className="text-center">
                <div className="text-sm font-semibold text-blue-800 mb-2">
                  Recent Called Numbers
                </div>
                <div className="flex flex-wrap justify-center gap-2">
                  {calledNumbers.slice(-8).reverse().map((num, idx) => (
                    <span 
                      key={idx} 
                      className="px-3 py-1 bg-blue-600 text-white rounded-full text-sm font-bold"
                    >
                      {num}
                    </span>
                  ))}
                </div>
                {calledNumbers.length === 0 && (
                  <p className="text-blue-600 text-sm">No numbers called yet</p>
                )}
              </div>
            </div>
          </div>
        );
      
      case 'players':
        return (
          <div className="h-full flex flex-col p-4">
            <div className="text-center mb-4">
              <h3 className="text-lg font-bold text-gray-900">Players ({participants.length}/{lobby.maxSeats})</h3>
            </div>
            
            <div className="flex-1 overflow-y-auto space-y-3">
              {participants.length > 0 ? (
                participants.map((participant) => (
                  <div 
                    key={participant.id} 
                    className={cn(
                      "flex items-center justify-between bg-gray-50 rounded-lg p-4 border-2",
                      participant.userId === user.id 
                        ? "border-green-300 bg-green-50" 
                        : "border-gray-200",
                      winnerSeatNumber === participant.seatNumber && 
                        "ring-2 ring-yellow-400 bg-yellow-50"
                    )}
                  >
                    <div className="flex items-center space-x-3">
                      <div className={cn(
                        "w-10 h-10 rounded-full flex items-center justify-center text-white font-bold",
                        participant.userId === user.id ? "bg-green-600" : "bg-gray-600"
                      )}>
                        {participant.seatNumber}
                      </div>
                      <div>
                        <div className="font-medium text-gray-900">
                          {participant.user?.email?.split('@')[0] || 'Unknown'}
                          {participant.userId === user.id && (
                            <span className="text-green-700 text-sm ml-2">(You)</span>
                          )}
                        </div>
                        <div className="text-sm text-gray-500">
                          Seat {participant.seatNumber}
                        </div>
                      </div>
                    </div>
                    <div className="text-xs text-gray-500">
                      {new Date(participant.joinedAt).toLocaleTimeString([], { 
                        hour: '2-digit', 
                        minute: '2-digit' 
                      })}
                    </div>
                  </div>
                ))
              ) : (
                <div className="text-center py-8">
                  <p className="text-gray-500 text-lg">No players yet</p>
                  <p className="text-gray-400 text-sm mt-2">Be the first to join!</p>
                </div>
              )}
            </div>
          </div>
        );
      
      case 'info':
        return (
          <div className="h-full flex flex-col p-4 space-y-4">
            <div className="text-center">
              <h3 className="text-lg font-bold text-gray-900">{lobby.name}</h3>
              <p className="text-sm text-gray-600">Lobby #{lobby.id}</p>
            </div>
            
            {/* Game Status */}
            <div className="bg-gray-50 rounded-lg p-4 border border-gray-200">
              <div className="grid grid-cols-2 gap-4">
                <div className="text-center">
                  <div className="text-2xl font-bold text-casino-red">${lobby.entryFee}</div>
                  <div className="text-sm text-gray-600">Entry Fee</div>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold text-gray-900">{lobby.seatsTaken}/{lobby.maxSeats}</div>
                  <div className="text-sm text-gray-600">Players</div>
                </div>
              </div>
            </div>
            
            {/* Connection & Game Phase */}
            <div className="bg-gray-50 rounded-lg p-4 border border-gray-200">
              <div className="grid grid-cols-2 gap-4">
                <div className="text-center">
                  <div className={cn(
                    "text-lg font-bold",
                    gameStatus === 'waiting' ? 'text-yellow-600' :
                    gameStatus === 'active' ? 'text-green-600' : 'text-purple-600'
                  )}>
                    {gameStatus === 'waiting' && '🪑 Lobby'}
                    {gameStatus === 'active' && '🎯 Playing'}
                    {gameStatus === 'finished' && '🏆 Finished'}
                  </div>
                  <div className="text-sm text-gray-600">Game Phase</div>
                </div>
                <div className="text-center">
                  <div className={cn(
                    "text-lg font-bold",
                    isConnected ? 'text-green-600' : 'text-red-600'
                  )}>
                    {isConnected ? '🟢 Live' : '🔴 Offline'}
                  </div>
                  <div className="text-sm text-gray-600">Connection</div>
                </div>
              </div>
            </div>
            
            {/* User Status */}
            <div className="bg-gray-50 rounded-lg p-4 border border-gray-200">
              <div className="text-center">
                <div className="text-lg font-bold text-gray-900 mb-2">Your Status</div>
                {currentUserParticipation ? (
                  <div className="bg-green-100 rounded-lg p-3 border border-green-200">
                    <p className="text-green-800 font-medium">
                      You are in seat {currentUserParticipation.seatNumber}
                    </p>
                  </div>
                ) : (
                  <div className="bg-blue-100 rounded-lg p-3 border border-blue-200">
                    <p className="text-blue-800 font-medium">
                      {lobby.status === 'waiting' 
                        ? (canAffordEntry ? 'Tap a seat in "My Card" to join' : 'Insufficient balance to join')
                        : 'Lobby not accepting players'}
                    </p>
                  </div>
                )}
                <div className="mt-3 text-sm text-gray-600">
                  Balance: <span className="font-semibold">${parseFloat(user.balance).toFixed(2)}</span>
                </div>
              </div>
            </div>
            
            {/* Last Called Number */}
            {calledNumbers.length > 0 && (
              <div className="bg-blue-50 rounded-lg p-4 border border-blue-200">
                <div className="text-center">
                  <div className="text-sm font-semibold text-blue-800 mb-2">Last Called</div>
                  <div className="text-3xl font-bold text-blue-600">
                    {calledNumbers[calledNumbers.length - 1]}
                  </div>
                </div>
              </div>
            )}
          </div>
        );
    }
  };

  return (
    <div className="h-full flex flex-col bg-white">
      {/* Tab Navigation */}
      <div className="flex border-b border-gray-200 bg-gray-50">
        {tabs.map((tab) => {
          const Icon = tab.icon;
          return (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={cn(
                "flex-1 flex flex-col items-center justify-center py-3 px-2 transition-colors",
                "focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-inset",
                activeTab === tab.id 
                  ? "bg-white border-b-2 border-blue-600 text-blue-600" 
                  : "text-gray-600 hover:text-gray-800 hover:bg-gray-100"
              )}
            >
              <Icon size={20} className="mb-1" />
              <span className="text-xs font-medium">{tab.label}</span>
            </button>
          );
        })}
      </div>
      
      {/* Tab Content */}
      <div className="flex-1 overflow-hidden">
        {renderTabContent()}
      </div>
    </div>
  );
}