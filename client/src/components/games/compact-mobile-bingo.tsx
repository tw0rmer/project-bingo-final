import React, { useState, useEffect, useRef } from 'react';
import { cn } from '@/lib/utils';
import { ChevronLeft, ChevronRight } from 'lucide-react';

export interface BingoNumber {
  value: number;
  isMarked: boolean;
}

interface CompactMobileBingoProps {
  onSeatSelect: (seatNumber: number) => void;
  selectedSeats?: number[];
  participants: any[];
  isJoining: boolean;
  gamePhase?: 'lobby' | 'playing' | 'finished';
  calledNumbers: number[];
  onWin: (pattern: string, rowNumbers: number[]) => void;
  winnerSeatNumber?: number;
  winnerUserId?: number;
  myUserId?: number;
  lobbyId: number;
  serverRow?: number[];
  serverCardsBySeat?: Record<number, number[]>;
  masterCard?: number[][] | null; // Server master card that ALL players see
  patternProgress?: any[]; // Pattern progress for row highlighting
}

// REMOVED: Random card generation - All cards must come from server to ensure consistency

export function CompactMobileBingo({
  onSeatSelect,
  selectedSeats = [],
  participants,
  isJoining,
  gamePhase = 'lobby',
  calledNumbers,
  onWin,
  winnerSeatNumber,
  winnerUserId,
  myUserId,
  lobbyId,
  serverRow,
  serverCardsBySeat,
  masterCard,
  patternProgress = []
}: CompactMobileBingoProps) {
  const [bingoCard, setBingoCard] = useState<BingoNumber[][]>([]);
  const scrollContainerRef = useRef<HTMLDivElement>(null);
  const winnerFiredRef = useRef(false);

  // Use ONLY server master card to ensure consistency
  useEffect(() => {
    console.log('[COMPACT MOBILE] Master card received:', masterCard ? `${masterCard.length} rows` : 'null');
    
    if (masterCard && masterCard.length === 15) {
      const formattedCard = masterCard.map(row => 
        row.map(value => ({ value, isMarked: false }))
      );
      setBingoCard(formattedCard);
      console.log('[COMPACT MOBILE] SUCCESS - Using server master card');
      console.log('[COMPACT MOBILE] First row should be [2, 30, 43, 53, 71]:', masterCard[0]);
      return;
    }
    
    console.log('[COMPACT MOBILE] ERROR - No master card received, waiting...');
  }, [masterCard]);

  // Auto-mark numbers
  useEffect(() => {
    if (!calledNumbers.length) return;
    setBingoCard(prevCard => {
      let hasChanges = false;
      const newCard = prevCard.map(row =>
        row.map(cell => {
          if (calledNumbers.includes(cell.value) && !cell.isMarked) {
            hasChanges = true;
            return { ...cell, isMarked: true };
          }
          return cell;
        })
      );
      return hasChanges ? newCard : prevCard;
    });
  }, [calledNumbers]);

  // Check for win on any selected seat
  useEffect(() => {
    if (gamePhase !== 'playing' || selectedSeats.length === 0 || winnerFiredRef.current) return;
    
    for (const seatNumber of selectedSeats) {
      const myRow = bingoCard[seatNumber - 1];
      if (!myRow) continue;
      
      const allMarked = myRow.every(cell => cell.isMarked);
      if (allMarked && !winnerFiredRef.current) {
        winnerFiredRef.current = true;
        const rowNumbers = myRow.map(cell => cell.value);
        onWin('bingo', rowNumbers);
        break; // Only trigger once
      }
    }
  }, [bingoCard, selectedSeats.join(','), gamePhase, onWin]);

  const handleNumberClick = (rowIndex: number, colIndex: number) => {
    if (gamePhase !== 'playing') return;
    setBingoCard(prevCard => {
      const newCard = [...prevCard];
      newCard[rowIndex] = [...newCard[rowIndex]];
      newCard[rowIndex][colIndex] = {
        ...newCard[rowIndex][colIndex],
        isMarked: !newCard[rowIndex][colIndex].isMarked
      };
      return newCard;
    });
  };

  // Helper function to check if a seat is occupied by another user
  const isSeatOccupiedByOther = (seatNumber: number) => {
    const participant = participants.find(p => p.seatNumber === seatNumber);
    return participant && participant.userId !== myUserId;
  };

  // Helper function to get row visual effects based on pattern progress
  const getRowEffects = (seatNumber: number) => {
    // Only apply effects to rows the current user has selected
    if (!selectedSeats.includes(seatNumber)) return '';
    
    const seatProgress = patternProgress.find(p => p.seat === seatNumber);
    if (!seatProgress) return '';
    
    const { progress } = seatProgress;
    
    // "On Fire" effects based on completion percentage
    if (progress >= 0.8) {
      return 'ring-4 ring-red-500 shadow-[0_0_20px_#ef4444] animate-pulse bg-gradient-to-br from-red-50 to-orange-100';
    }
    if (progress >= 0.6) {
      return 'ring-2 ring-orange-400 shadow-[0_0_10px_#fb923c] bg-gradient-to-br from-orange-50 to-yellow-100';
    }
    if (progress >= 0.4) {
      return 'ring-1 ring-yellow-400 bg-gradient-to-br from-yellow-50 to-amber-50';
    }
    return '';
  };

  return (
    <div className="w-full h-full flex flex-col bg-white/95 backdrop-blur-sm rounded-3xl border-2 border-gray-200/50 shadow-2xl p-4">
      {/* Enhanced Header */}
      <div className="flex-shrink-0 text-center mb-4 bg-gradient-to-r from-indigo-100 to-purple-100 rounded-2xl p-4 border border-indigo-200/50">
        <div className="text-lg font-bold text-gray-800 mb-2">All 15 Seats</div>
        <div className="text-sm text-gray-600 mb-2">Select up to 2 seats to play</div>
        {selectedSeats.length > 0 && (
          <div className="text-sm text-blue-600 font-bold bg-blue-100 rounded-xl px-3 py-2 border border-blue-200 mb-3">
            Selected: {selectedSeats.join(', ')} ({selectedSeats.length}/2)
          </div>
        )}
        
        {/* Called Numbers - RIGHT UNDER "All 15 Seats" */}
        {calledNumbers.length > 0 && (
          <div className="mt-3 bg-gradient-to-r from-yellow-50 to-orange-50 rounded-xl p-3 border border-yellow-200/50">
            <div className="text-sm font-bold text-gray-700 mb-2 flex items-center gap-2 justify-center">
              🔥 Called Numbers ({calledNumbers.length}/75)
            </div>
            <div className="flex flex-wrap gap-1 justify-center max-h-16 overflow-y-auto">
              {calledNumbers.slice(-15).map((num, idx) => (
                <span 
                  key={idx} 
                  className={cn(
                    "px-2 py-1 rounded-lg text-xs font-bold border transition-all duration-300 flex items-center justify-center min-w-7",
                    idx === calledNumbers.slice(-15).length - 1 
                      ? "bg-gradient-to-br from-red-500 to-red-600 text-white border-red-400 shadow-lg animate-pulse scale-110" 
                      : "bg-gradient-to-br from-yellow-300 to-yellow-400 text-black border-yellow-500 shadow-sm"
                  )}
                  data-testid={`called-number-${num}`}
                >
                  {num}
                </span>
              ))}
            </div>
            {calledNumbers.length > 15 && (
              <div className="text-xs text-gray-600 text-center mt-1">
                Showing last 15 numbers
              </div>
            )}
          </div>
        )}
      </div>


      {/* Enhanced Scrollable Bingo Grid */}
      <div className="flex-1 overflow-auto" ref={scrollContainerRef}>
        <div className="space-y-2">
          {/* Enhanced Sticky Header Row */}
          <div className="sticky top-0 z-10 grid grid-cols-6 gap-2 pb-2">
            <div className="bg-gradient-to-br from-indigo-500 to-purple-600 text-white font-bold text-center rounded-2xl flex items-center justify-center text-sm h-10 shadow-lg border border-indigo-400/30">
              Seat
            </div>
            {['B', 'I', 'N', 'G', 'O'].map((letter, index) => {
              const gradients = [
                'from-red-500 to-red-600',      // B
                'from-orange-500 to-orange-600', // I  
                'from-yellow-500 to-yellow-600', // N
                'from-green-500 to-green-600',   // G
                'from-blue-500 to-blue-600'     // O
              ];
              return (
              <div 
                key={letter} 
                  className={`bg-gradient-to-br ${gradients[index]} text-white font-bold text-center rounded-2xl flex items-center justify-center text-sm h-10 shadow-lg border border-white/20`}
              >
                {letter}
              </div>
              );
            })}
          </div>

          {/* Enhanced All 15 Seat Rows */}
          {Array.from({ length: 15 }, (_, i) => i + 1).map((seatNumber) => {
            const rowIndex = seatNumber - 1;
            const participant = participants.find(p => p.seatNumber === seatNumber);
            const isOccupiedByOther = participant && participant.userId !== myUserId;
            const isMySelection = selectedSeats.includes(seatNumber);
            const canSelect = !isOccupiedByOther && !isJoining && selectedSeats.length < 2;
            const canDeselect = isMySelection && !isJoining;

            // Add row effects for selected seats
            const rowEffectsClass = getRowEffects(seatNumber);
            
            return (
              <div key={seatNumber} className={cn(
                "grid grid-cols-6 gap-2 transition-all duration-300",
                rowEffectsClass && `p-2 rounded-2xl ${rowEffectsClass}`
              )}>
                {/* Enhanced Seat Cell */}
                <button
                  onClick={() => (canSelect || canDeselect) && gamePhase !== 'playing' && onSeatSelect(seatNumber)}
                  disabled={isOccupiedByOther || (isJoining && !isMySelection) || (!canSelect && !canDeselect) || gamePhase === 'playing'}
                  className={cn(
                    "rounded-2xl p-2 font-bold text-sm transition-all touch-manipulation h-12 shadow-lg border",
                    "focus:outline-none focus:ring-2 focus:ring-blue-400/50",
                    "active:scale-95",
                    isMySelection && "bg-gradient-to-br from-emerald-500 to-green-600 text-white ring-2 ring-emerald-400 shadow-emerald-500/30",
                    isOccupiedByOther && "bg-gradient-to-br from-red-500 to-red-600 text-white cursor-not-allowed ring-2 ring-red-400 shadow-red-500/30",
                    !isMySelection && !isOccupiedByOther && canSelect && "bg-gradient-to-br from-gray-100 to-gray-200 text-gray-800 border-gray-300/50",
                    !isMySelection && !isOccupiedByOther && !canSelect && "bg-gradient-to-br from-gray-200 to-gray-300 text-gray-500 cursor-not-allowed border-gray-400/50",
                    winnerSeatNumber === seatNumber && "animate-pulse ring-4 ring-yellow-400 shadow-[0_0_20px_#facc15]"
                  )}
                  data-testid={`button-seat-${seatNumber}`}
                >
                  <div className="font-bold">#{seatNumber}</div>
                  <div className="text-xs truncate opacity-90">
                    {participant ? participant?.user?.email?.split('@')[0] : 'Open'}
                  </div>
                  {/* Progress indicator on seat button */}
                  {rowEffectsClass && (
                    <div className="absolute -top-1 -right-1 text-xs z-10">
                      {patternProgress.find(p => p.seat === seatNumber)?.progress >= 0.8 ? '🔥' : 
                       patternProgress.find(p => p.seat === seatNumber)?.progress >= 0.6 ? '⚡' : '✨'}
                    </div>
                  )}
                </button>

                {/* Enhanced Number Cells with Progressive Effects */}
                {bingoCard[rowIndex]?.map((number, colIndex) => {
                  // Get enhanced styling for marked numbers based on pattern progress
                  const seatProgress = patternProgress.find(p => p.seat === seatNumber);
                  const isUserSeat = selectedSeats.includes(seatNumber);
                  const progress = seatProgress?.progress || 0;
                  
                  // Enhanced marked number styling based on row progress
                  const getMarkedNumberStyle = () => {
                    if (!number.isMarked) return "bg-gradient-to-br from-gray-50 to-gray-100 text-gray-800 border-gray-300/50";
                    
                    // Winner styling takes priority
                    if (winnerSeatNumber === seatNumber) {
                      return "bg-gradient-to-br from-yellow-400 to-amber-500 text-black ring-4 ring-yellow-400 shadow-[0_0_20px_#facc15] animate-pulse";
                    }
                    
                    // Progressive intensity for user's seats based on pattern progress
                    if (isUserSeat && progress >= 0.8) {
                      return "bg-gradient-to-br from-red-500 to-red-600 text-white ring-2 ring-red-400 shadow-red-500/50 animate-pulse";
                    }
                    if (isUserSeat && progress >= 0.6) {
                      return "bg-gradient-to-br from-orange-500 to-orange-600 text-white ring-2 ring-orange-400 shadow-orange-500/30";
                    }
                    if (isUserSeat && progress >= 0.4) {
                      return "bg-gradient-to-br from-yellow-500 to-yellow-600 text-black ring-1 ring-yellow-400 shadow-yellow-500/20";
                    }
                    
                    // Default marked styling
                    return "bg-gradient-to-br from-blue-500 to-blue-600 text-white ring-2 ring-blue-400 shadow-blue-500/30";
                  };
                  
                  return (
                    <button
                      key={colIndex}
                      onClick={() => handleNumberClick(rowIndex, colIndex)}
                      disabled={gamePhase !== 'playing'}
                      className={cn(
                        "rounded-2xl font-bold text-sm transition-all touch-manipulation h-12 shadow-lg border",
                        "focus:outline-none focus:ring-2 focus:ring-blue-400/50",
                        "flex items-center justify-center",
                        gamePhase === 'playing' && "cursor-pointer active:scale-95",
                        gamePhase !== 'playing' && "cursor-default",
                        getMarkedNumberStyle()
                      )}
                      data-testid={`button-number-${seatNumber}-${colIndex}`}
                    >
                      {number.value}
                    </button>
                  );
                })}
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}