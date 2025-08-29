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
  const getRowWinningProgress = (rowIndex: number): { isCloseToWin: boolean; isVeryClose: boolean; numbersNeeded: number } => {
    if (!calledNumbers || bingoCard.length === 0 || !bingoCard[rowIndex]) {
      return { isCloseToWin: false, isVeryClose: false, numbersNeeded: 5 };
    }
    
    const row = bingoCard[rowIndex].map(cell => cell.value);
    const progress = detectRowPatternProgress(row, calledNumbers);
    const numbersNeeded = progress.numbersNeeded.length;
    
    return {
      isCloseToWin: numbersNeeded <= 2 && numbersNeeded > 0, // 1-2 numbers away
      isVeryClose: numbersNeeded === 1, // 1 number away
      numbersNeeded
    };
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
      case 'lobby': return 'border-amber-500/40 bg-amber-500/5';
      case 'playing': return 'border-emerald-500/40 bg-emerald-500/5';
      case 'finished': return 'border-purple-500/40 bg-purple-500/5';
      default: return 'border-blue-500/40 bg-blue-500/5';
    }
  };

  // Show loading state if card hasn't loaded yet
  if (bingoCard.length === 0) {
    return (
      <div className={cn(
        "relative rounded-md border p-4",
        "bg-white border-gray-200",
        getPhaseStyles(),
        "w-full flex items-center justify-center min-h-[400px]"
      )}>
        <div className="text-gray-500 text-center">
          <div className="mb-2">Loading bingo card...</div>
          <div className="text-sm text-gray-400">Waiting for server data</div>
        </div>
      </div>
    );
  }

  return (
    <div className={cn(
      "relative rounded-md border p-1 sm:p-2",
      "bg-white border-gray-200",
      getPhaseStyles(),
      "w-full"
    )}>
      {/* Mobile-Responsive Grid Container */}
      <div className="overflow-x-auto">
        <div className="min-w-[300px] grid grid-cols-6 gap-[1px] sm:gap-[2px] select-none">
          {/* Headers Row */}
          <div className="bg-indigo-600 text-white font-semibold text-center h-6 sm:h-7 rounded text-[9px] sm:text-[11px] flex flex-col items-center justify-center leading-none">
            <span className="text-[10px] sm:text-[12px]">🪑</span>
            <span className="text-[8px] sm:text-[10px]">Seats</span>
          </div>
          {['B', 'I', 'N', 'G', 'O'].map((letter, index) => (
            <div key={letter} className="bg-blue-600 text-white font-semibold text-center h-6 sm:h-7 rounded text-[9px] sm:text-[11px] flex flex-col items-center justify-center leading-none">
              <span className="text-[10px] sm:text-[12px] font-bold">{letter}</span>
              <span className="text-[7px] sm:text-[9px] opacity-75">
                {index === 0 && "1-15"}
                {index === 1 && "16-30"}
                {index === 2 && "31-45"}
                {index === 3 && "46-60"}
                {index === 4 && "61-75"}
              </span>
            </div>
          ))}

          {/* 15 rows - only render if we have card data */}
          {bingoCard.length > 0 && Array.from({ length: 15 }, (_, rowIndex) => {
            const seatNumber = rowIndex + 1;
            const participant = participants.find(p => p.seatNumber === seatNumber);
            const isOccupied = !!participant;
            const isSelected = selectedSeats.includes(seatNumber);
            const winProgress = getRowWinningProgress(rowIndex);

            return (
              <div key={rowIndex} className="contents">
                {/* Mobile-Responsive Seat Cell */}
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
                    "relative text-left px-0.5 sm:px-1 h-9 sm:h-8 rounded font-medium text-[9px] sm:text-[10.5px] transition-colors touch-manipulation",
                    "focus:outline-none focus:ring-1 focus:ring-blue-500/40",
                    "active:scale-95 transition-transform duration-100", // Touch feedback
                    isSelected && "bg-emerald-600 text-white",
                    (isOccupied && !isSelected) && "bg-red-600 text-white cursor-not-allowed",
                    !isSelected && !isOccupied && "bg-gray-100 text-gray-900 hover:bg-blue-600 hover:text-white cursor-pointer",
                    winnerSeatNumber === seatNumber && (winnerUserId && myUserId && winnerUserId === myUserId
                      ? "ring-2 ring-yellow-400 shadow-[0_0_10px_#facc15] bg-yellow-400 text-black animate-pulse"
                      : "ring-2 ring-red-500 shadow-[0_0_10px_#ef4444] bg-red-600 text-white animate-pulse"),
                    // Winner prediction visual effects - only for selected seats during gameplay
                    gamePhase === 'playing' && isSelected && winProgress.isVeryClose && "ring-2 ring-orange-400 shadow-[0_0_15px_#fb923c] animate-pulse",
                    gamePhase === 'playing' && isSelected && winProgress.isCloseToWin && !winProgress.isVeryClose && "ring-1 ring-amber-300 shadow-[0_0_8px_#fbbf24]"
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

                {/* Mobile-Responsive Bingo Numbers */}
                {bingoCard.length > 0 && bingoCard[rowIndex]?.map((number, colIndex) => (
                  <button
                    key={colIndex}
                    onClick={gamePhase === 'playing' ? () => handleNumberClick(rowIndex, colIndex) : undefined}
                    disabled={gamePhase !== 'playing'}
                    className={cn(
                      "text-center h-9 sm:h-8 rounded font-medium text-[9px] sm:text-[11px] transition-colors leading-none touch-manipulation",
                      "focus:outline-none focus:ring-1 focus:ring-blue-500/40",
                      gamePhase === 'playing' && "cursor-pointer active:scale-95 transition-transform duration-100",
                      gamePhase !== 'playing' && "cursor-default opacity-90",
                        // Winner row - all cells get full golden treatment
                      winnerSeatNumber === seatNumber && winnerUserId && myUserId && winnerUserId === myUserId
                        ? "!bg-gradient-to-br from-yellow-300 via-amber-400 to-yellow-500 text-black font-extrabold shadow-[0_0_20px_#facc15] ring-4 ring-yellow-400 animate-glow scale-105 z-10"
                        : winnerSeatNumber === seatNumber
                        ? "!bg-gradient-to-br from-red-400 via-red-500 to-red-600 text-white font-bold shadow-[0_0_15px_#ef4444] ring-2 ring-red-400 animate-pulse"
                        : number.isMarked 
                        ? "bg-blue-600 text-white font-bold" 
                        : "bg-gray-100 text-gray-900",
                        // Winner prediction for individual numbers - add subtle glow to missing numbers in close-to-win rows
                        gamePhase === 'playing' && isSelected && !number.isMarked && winProgress.isVeryClose && 
                          "ring-1 ring-orange-300 shadow-[0_0_8px_#fed7aa] bg-orange-50 animate-pulse",
                        gamePhase === 'playing' && isSelected && !number.isMarked && winProgress.isCloseToWin && !winProgress.isVeryClose &&
                          "ring-1 ring-amber-200 shadow-[0_0_4px_#fef3c7] bg-amber-50"
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