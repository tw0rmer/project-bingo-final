import React, { useState, useEffect, useRef } from 'react';
import { cn } from "@/lib/utils";

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

  // Use the master card from server or generate a local one
  useEffect(() => {
    if (masterCard && masterCard.length === 15) {
      // Use the server's master card - this ensures ALL players see the same card
      const formattedCard = masterCard.map(row => 
        row.map(value => ({ value, isMarked: false }))
      );
      setBingoCard(formattedCard);
      console.log('[BINGO CARD] Using master card from server');
      return;
    }
    
    if (serverCardsBySeat && Object.keys(serverCardsBySeat).length === 15) {
      // Build entire card from server mapping (legacy support)
      const full = Array.from({ length: 15 }, (_, idx) => {
        const seat = idx + 1;
        const row = serverCardsBySeat[seat] || [];
        return row.length === 5 ? row.map(v => ({ value: v, isMarked: false })) : generateNewBingoCard()[idx];
      });
      setBingoCard(full);
      return;
    }
    
    // Never generate a card on frontend - always wait for server master card
    // This ensures all players see the exact same card
  }, [masterCard, serverCardsBySeat, gamePhase]);

  // Persist on change (in case of manual toggles)
  useEffect(() => {
    if (selectedSeats.length === 0 || !lobbyId) return;
    selectedSeats.forEach(seatNum => {
      const key = `bingoCard_lobby_${lobbyId}_seat_${seatNum}`;
      try { localStorage.setItem(key, JSON.stringify(bingoCard)); } catch {}
    });
  }, [bingoCard, selectedSeats.join(','), lobbyId]);

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

          {/* 15 rows */}
          {Array.from({ length: 15 }, (_, rowIndex) => {
            const seatNumber = rowIndex + 1;
            const participant = participants.find(p => p.seatNumber === seatNumber);
            const isOccupied = !!participant;
            const isSelected = selectedSeats.includes(seatNumber);

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
                      : "ring-2 ring-red-500 shadow-[0_0_10px_#ef4444] bg-red-600 text-white animate-pulse")
                  )}
                >
                  <div className="flex items-center justify-between leading-none">
                    <span className="font-bold text-[8px] sm:text-[10px]">#{seatNumber}</span>
                    <div className="flex items-center gap-0.5 sm:gap-1">
                      {isSelected && <span className="text-[8px] sm:text-[10px] bg-white/20 rounded px-0.5 sm:px-1">✓</span>}
                      {isOccupied && !isSelected && <span className="text-[8px] sm:text-[10px]">👤</span>}
                      {!isOccupied && !isSelected && <span className="text-[8px] sm:text-[10px] opacity-50">○</span>}
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
                {bingoCard && bingoCard[rowIndex]?.map((number, colIndex) => (
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
                        : "bg-gray-100 text-gray-900"
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