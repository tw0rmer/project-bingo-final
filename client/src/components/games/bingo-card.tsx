import React, { useState, useEffect, useRef } from 'react';
import { cn } from "@/lib/utils";
import { detectRowPatternProgress } from '../../utils/patternDetection';

interface BingoCardProps {
  onSeatSelect: (seatNumber: number) => void;
  selectedSeats?: number[];
  participants: Array<{
    seatNumber: number;
    user: {
      email: string;
    } | null;
  }>;
  isJoining: boolean;
  gamePhase?: 'lobby' | 'playing' | 'finished';
  calledNumbers?: number[]; // numbers already called
  onWin?: (pattern: string, rowNumbers: number[]) => void; // notify parent with row values
  winnerSeatNumber?: number; // seatNumber of winner
  winnerUserId?: number; // userId of winner
  myUserId?: number; // current user id for coloring
  lobbyId?: number; // used to persist card per lobby/seat
  serverCardsBySeat?: Record<number, number[]>; // optional full mapping when available
  masterCard?: number[][] | null; // The single 5x15 master card from server that ALL players see
}

interface BingoNumber {
  value: number;
  isMarked: boolean;
}

const getRandomNumbersInRange = (start: number, end: number, count: number): number[] => {
  const numbers = Array.from({ length: end - start + 1 }, (_, i) => start + i);
  for (let i = numbers.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [numbers[i], numbers[j]] = [numbers[j], numbers[i]];
  }
  return numbers.slice(0, count);
};

const generateNewBingoCard = (): BingoNumber[][] => {
  const bColumn = getRandomNumbersInRange(1, 15, 15);
  const iColumn = getRandomNumbersInRange(16, 30, 15);
  const nColumn = getRandomNumbersInRange(31, 45, 15);
  const gColumn = getRandomNumbersInRange(46, 60, 15);
  const oColumn = getRandomNumbersInRange(61, 75, 15);

  const newCard: BingoNumber[][] = [];
  for (let row = 0; row < 15; row++) {
    newCard.push([
      { value: bColumn[row], isMarked: false },
      { value: iColumn[row], isMarked: false },
      { value: nColumn[row], isMarked: false },
      { value: gColumn[row], isMarked: false },
      { value: oColumn[row], isMarked: false }
    ]);
  }
  return newCard;
};

export function BingoCard({ onSeatSelect, selectedSeats = [], participants, isJoining, gamePhase = 'lobby', calledNumbers, onWin, winnerSeatNumber, winnerUserId, myUserId, lobbyId, serverCardsBySeat, masterCard }: BingoCardProps) {
  // Initialize with empty card - will be populated from server's master card
  const [bingoCard, setBingoCard] = useState<BingoNumber[][]>([]);
  const winnerFiredRef = useRef(false);

  // Use the master card from server ONLY - no fallbacks
  useEffect(() => {
    console.log('[BINGO CARD] Master card update:', masterCard ? `${masterCard.length} rows` : 'null');
    console.log('[BINGO CARD] CRITICAL DEBUG - Full master card received:', masterCard);
    
    if (masterCard && masterCard.length === 15) {
      // Use the server's master card - this ensures ALL players see the same card
      const formattedCard = masterCard.map(row => 
        row.map(value => ({ value, isMarked: false }))
      );
      setBingoCard(formattedCard);
      console.log('[BINGO CARD] SUCCESS - Using master card from server');
      console.log('[BINGO CARD] First row should be [2, 30, 43, 53, 71]:', masterCard[0]);
      console.log('[BINGO CARD] Full first 3 rows:', masterCard.slice(0, 3));
      return;
    }
    
    // Do NOT use serverCardsBySeat or any other fallback
    // Only use the master card to ensure consistency
    console.log('[BINGO CARD] ERROR - No master card received, waiting...');
  }, [masterCard]);

  // Remove localStorage persistence as we always use server master card
  // This prevents confusion from cached random cards

  // Calculate which rows are close to winning (for visual effects)
  const getRowWinningProgress = (rowIndex: number): { isCloseToWin: boolean; isVeryClose: boolean; numbersNeeded: number; missingNumbers: number[] } => {
    if (!calledNumbers || bingoCard.length === 0 || !bingoCard[rowIndex]) {
      return { isCloseToWin: false, isVeryClose: false, numbersNeeded: 5, missingNumbers: [] };
    }
    
    const row = bingoCard[rowIndex].map(cell => cell.value);
    const progress = detectRowPatternProgress(row, calledNumbers);
    const numbersNeeded = progress.numbersNeeded.length;
    
    return {
      isCloseToWin: numbersNeeded <= 2 && numbersNeeded > 0, // 1-2 numbers away
      isVeryClose: numbersNeeded === 1, // 1 number away
      numbersNeeded,
      missingNumbers: progress.numbersNeeded
    };
  };

  // Check if a specific number is needed for winning (for individual cell effects)
  const isNumberNeededForWin = (rowIndex: number, numberValue: number): boolean => {
    if (!selectedSeats.includes(rowIndex + 1)) return false;
    const winProgress = getRowWinningProgress(rowIndex);
    return winProgress.missingNumbers.includes(numberValue);
  };

  // Auto-mark numbers when calledNumbers prop changes
  useEffect(() => {
    if (!calledNumbers || calledNumbers.length === 0) return;
    setBingoCard(prev => prev.map((row) =>
      row.map(cell => ({ ...cell, isMarked: calledNumbers.includes(cell.value) }))
    ));

    // Winner detection for any selected seat (simple line across BINGO)
    if (selectedSeats.length > 0 && !winnerFiredRef.current) {
      for (const seatNumber of selectedSeats) {
        const rowIdx = seatNumber - 1;
        const row = bingoCard[rowIdx];
        if (row && row.every(c => calledNumbers.includes(c.value))) {
          winnerFiredRef.current = true;
          const rowNumbers = row.map(c => c.value);
          onWin?.('line', rowNumbers);
          break; // Only trigger once
        }
      }
    }
  }, [calledNumbers]);

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

  const getPhaseStyles = () => {
    switch (gamePhase) {
      case 'lobby': return 'border-amber-400/50 bg-gradient-to-br from-amber-500/20 to-yellow-500/20 shadow-amber-500/20';
      case 'playing': return 'border-emerald-400/50 bg-gradient-to-br from-emerald-500/20 to-green-500/20 shadow-emerald-500/20';
      case 'finished': return 'border-purple-400/50 bg-gradient-to-br from-purple-500/20 to-pink-500/20 shadow-purple-500/20';
      default: return 'border-blue-400/50 bg-gradient-to-br from-blue-500/20 to-indigo-500/20 shadow-blue-500/20';
    }
  };

  // Enhanced loading state if card hasn't loaded yet
  if (bingoCard.length === 0) {
    return (
      <div className={cn(
        "relative rounded-3xl border-2 p-8",
        "bg-gray-800/95 backdrop-blur-sm border-gray-600/50",
        getPhaseStyles(),
        "w-full flex items-center justify-center min-h-[400px] shadow-2xl"
      )}>
        <div className="text-center">
          <div className="w-16 h-16 bg-gradient-to-br from-blue-500 to-purple-600 rounded-2xl flex items-center justify-center mx-auto mb-6 shadow-lg">
            <div className="animate-spin rounded-full h-10 w-10 border-4 border-white border-t-transparent"></div>
          </div>
          <div className="text-xl font-bold text-white mb-2">Loading Bingo Card...</div>
          <div className="text-gray-300">Waiting for server data</div>
        </div>
      </div>
    );
  }

  return (
    <div className={cn(
      "relative rounded-3xl border-2 p-3 sm:p-4",
      "bg-gray-900/95 backdrop-blur-sm border-gray-500/50",
      getPhaseStyles(),
      "w-full shadow-2xl"
    )}>
      {/* Floating Win Anticipation Banner */}
      {gamePhase === 'playing' && selectedSeats.length > 0 && (() => {
        const closestSeat = selectedSeats[0];
        const winProgress = getRowWinningProgress(closestSeat - 1);
        if (winProgress.isVeryClose) {
          return (
            <div className="absolute -top-12 left-1/2 -translate-x-1/2 z-20 animate-bounce">
              <div className="bg-gradient-to-r from-red-500 via-orange-500 to-red-500 text-white px-4 py-2 rounded-full shadow-lg border-2 border-yellow-300 animate-pulse">
                <div className="flex items-center gap-2 text-sm font-bold">
                  <span className="animate-spin">🎯</span>
                  <span>ALMOST THERE! Need: {winProgress.missingNumbers.join(', ')}</span>
                  <span className="animate-spin">🎯</span>
                </div>
              </div>
            </div>
          );
        } else if (winProgress.isCloseToWin) {
          return (
            <div className="absolute -top-12 left-1/2 -translate-x-1/2 z-20">
              <div className="bg-gradient-to-r from-yellow-500 to-orange-500 text-white px-4 py-2 rounded-full shadow-lg border border-yellow-300">
                <div className="flex items-center gap-2 text-sm font-bold">
                  <span>⚡</span>
                  <span>Getting Close! {winProgress.numbersNeeded} numbers away</span>
                  <span>⚡</span>
                </div>
              </div>
            </div>
          );
        }
        return null;
      })()}
      
      {/* Enhanced Mobile-Responsive Grid Container */}
      <div className="overflow-x-auto">
        <div className="min-w-[350px] grid grid-cols-6 gap-[2px] sm:gap-[3px] select-none">
          {/* Enhanced Headers Row */}
          <div className="bg-gradient-to-br from-indigo-500 to-purple-600 text-white font-bold text-center h-8 sm:h-9 rounded-2xl text-[10px] sm:text-[12px] flex flex-col items-center justify-center leading-none shadow-lg border border-indigo-400/30">
            <span className="text-[12px] sm:text-[14px]">🪑</span>
            <span className="text-[9px] sm:text-[11px] font-medium">Seats</span>
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
              <div key={letter} className={`bg-gradient-to-br ${gradients[index]} text-white font-bold text-center h-8 sm:h-9 rounded-2xl text-[10px] sm:text-[12px] flex flex-col items-center justify-center leading-none shadow-lg border border-white/20`}>
                <span className="text-[12px] sm:text-[14px] font-black">{letter}</span>
                <span className="text-[8px] sm:text-[10px] opacity-90 font-medium">
                {index === 0 && "1-15"}
                {index === 1 && "16-30"}
                {index === 2 && "31-45"}
                {index === 3 && "46-60"}
                {index === 4 && "61-75"}
              </span>
            </div>
            );
          })}

          {/* 15 rows - only render if we have card data */}
          {bingoCard.length > 0 && Array.from({ length: 15 }, (_, rowIndex) => {
            const seatNumber = rowIndex + 1;
            const participant = participants.find(p => p.seatNumber === seatNumber);
            const isOccupied = !!participant;
            const isSelected = selectedSeats.includes(seatNumber);
            const winProgress = getRowWinningProgress(rowIndex);

            return (
              <div key={rowIndex} className="contents">
                {/* Enhanced Mobile-Responsive Seat Cell */}
                <button
                  onClick={() => {
                    if (isJoining) return;
                    if (isSelected || (!isOccupied && !isSelected)) {
                      onSeatSelect(seatNumber);
                    }
                  }}
                  disabled={(isOccupied && !isSelected) || isJoining}
                  title={isOccupied ? `Seat ${seatNumber}: ${participant?.user?.email || 'Unknown User'}` : `Seat ${seatNumber}: Available`}
                  className={cn(
                    "relative text-left px-1 sm:px-2 h-10 sm:h-9 rounded-2xl font-bold text-[10px] sm:text-[11px] transition-all duration-300 touch-manipulation shadow-lg border",
                    "focus:outline-none focus:ring-2 focus:ring-blue-400/50",
                    "active:scale-95 transition-transform duration-100", // Touch feedback
                    isSelected && "bg-gradient-to-br from-emerald-500 to-green-600 text-white border-emerald-400/50 shadow-emerald-500/30",
                    (isOccupied && !isSelected) && "bg-gradient-to-br from-red-500 to-red-600 text-white cursor-not-allowed border-red-400/50 shadow-red-500/30",
                    !isSelected && !isOccupied && "bg-gradient-to-br from-gray-600 to-gray-700 text-gray-200 cursor-pointer border-gray-500/50",
                    winnerSeatNumber === seatNumber && (winnerUserId && myUserId && winnerUserId === myUserId
                      ? "ring-4 ring-yellow-400 shadow-[0_0_20px_#facc15] bg-gradient-to-br from-yellow-400 to-amber-500 text-black animate-pulse border-yellow-300"
                      : "ring-4 ring-red-500 shadow-[0_0_20px_#ef4444] bg-gradient-to-br from-red-500 to-red-600 text-white animate-pulse border-red-400"),
                    // Winner prediction visual effects - only for selected seats during gameplay
                    gamePhase === 'playing' && isSelected && winProgress.isVeryClose && "ring-4 ring-orange-400 shadow-[0_0_25px_#fb923c] animate-pulse scale-105",
                    gamePhase === 'playing' && isSelected && winProgress.isCloseToWin && !winProgress.isVeryClose && "ring-2 ring-amber-300 shadow-[0_0_15px_#fbbf24]"
                  )}
                >
                  <div className="flex items-center justify-between leading-none">
                    <span className="font-bold text-[8px] sm:text-[10px]">#{seatNumber}</span>
                    <div className="flex items-center gap-0.5 sm:gap-1">
                      {isSelected && <span className="text-[8px] sm:text-[10px] bg-white/20 rounded px-0.5 sm:px-1">✓</span>}
                      {isOccupied && !isSelected && <span className="text-[8px] sm:text-[10px]">👤</span>}
                      {!isOccupied && !isSelected && <span className="text-[8px] sm:text-[10px] opacity-50">○</span>}
                      {/* Winner prediction indicator */}
                      {gamePhase === 'playing' && isSelected && winProgress.isCloseToWin && (
                        <span className={cn(
                          "text-[7px] sm:text-[8px] px-0.5 rounded font-bold",
                          winProgress.isVeryClose 
                            ? "bg-orange-400 text-white animate-pulse" 
                            : "bg-amber-300 text-amber-900"
                        )}>
                          {winProgress.numbersNeeded}!
                        </span>
                      )}
                    </div>
                  </div>
                  <div className="truncate opacity-90 leading-none text-[7px] sm:text-[9px]">
                    {isOccupied ? (
                      participant?.user?.email?.split('@')[0] || 'Unknown'
                    ) : (
                      'Available'
                    )}
                  </div>
                </button>

                {/* Enhanced Mobile-Responsive Bingo Numbers */}
                {bingoCard.length > 0 && bingoCard[rowIndex]?.map((number, colIndex) => (
                  <button
                    key={colIndex}
                    onClick={gamePhase === 'playing' ? () => handleNumberClick(rowIndex, colIndex) : undefined}
                    disabled={gamePhase !== 'playing'}
                    className={cn(
                      "text-center h-10 sm:h-9 rounded-2xl font-bold text-[10px] sm:text-[12px] transition-all duration-300 leading-none touch-manipulation shadow-lg border",
                      "focus:outline-none focus:ring-2 focus:ring-blue-400/50",
                      gamePhase === 'playing' && "cursor-pointer active:scale-95",
                      gamePhase !== 'playing' && "cursor-default opacity-90",
                        // Winner row - all cells get full golden treatment
                      winnerSeatNumber === seatNumber && winnerUserId && myUserId && winnerUserId === myUserId
                        ? "!bg-gradient-to-br from-yellow-300 via-amber-400 to-yellow-500 text-black font-extrabold shadow-[0_0_30px_#facc15] ring-4 ring-yellow-400 animate-pulse scale-110 z-10 border-yellow-300"
                        : winnerSeatNumber === seatNumber
                        ? "!bg-gradient-to-br from-red-400 via-red-500 to-red-600 text-white font-bold shadow-[0_0_25px_#ef4444] ring-4 ring-red-400 animate-pulse border-red-300"
                        : number.isMarked 
                        ? "bg-gradient-to-br from-blue-500 to-blue-600 text-white font-bold border-blue-400/50 shadow-blue-500/30" 
                        : "bg-gradient-to-br from-gray-700 to-gray-800 text-gray-200 border-gray-600/50",
                        // Winner prediction for individual numbers - add subtle glow to missing numbers in close-to-win rows
                        gamePhase === 'playing' && isSelected && !number.isMarked && winProgress.isVeryClose && 
                          "ring-4 ring-orange-400 shadow-[0_0_20px_#fb923c] bg-gradient-to-br from-orange-400/50 to-orange-500/50 animate-pulse scale-105 border-orange-400",
                        gamePhase === 'playing' && isSelected && !number.isMarked && winProgress.isCloseToWin && !winProgress.isVeryClose &&
                          "ring-2 ring-amber-300 shadow-[0_0_15px_#fbbf24] bg-gradient-to-br from-amber-400/30 to-amber-500/30 border-amber-400",
                        // Enhanced effect for numbers specifically needed for winning
                        gamePhase === 'playing' && isSelected && !number.isMarked && isNumberNeededForWin(rowIndex, number.value) &&
                          "ring-4 ring-purple-400 shadow-[0_0_25px_#a855f7] bg-gradient-to-br from-purple-400/50 to-purple-500/50 animate-pulse scale-105 border-purple-400"
                    )}
                  >
                    {number.value}
                  </button>
                ))}
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}