import React, { useState, useEffect, useRef } from 'react';
import { cn } from "@/lib/utils";

interface BingoCardProps {
  onSeatSelect: (seatNumber: number) => void;
  selectedSeat?: number;
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
  serverRow?: number[]; // authoritative row from server for this seat
  serverCardsBySeat?: Record<number, number[]>; // optional full mapping when available
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

export function BingoCard({ onSeatSelect, selectedSeat, participants, isJoining, gamePhase = 'lobby', calledNumbers, onWin, winnerSeatNumber, winnerUserId, myUserId, lobbyId, serverRow, serverCardsBySeat }: BingoCardProps) {
  const [bingoCard, setBingoCard] = useState<BingoNumber[][]>(() => generateNewBingoCard());
  const winnerFiredRef = useRef(false);

  // Restore persisted card on mount when we know seat + lobby
  useEffect(() => {
    if (!selectedSeat || !lobbyId) return;
    const key = `bingoCard_lobby_${lobbyId}_seat_${selectedSeat}`;
    if (serverCardsBySeat && Object.keys(serverCardsBySeat).length === 15) {
      // Build entire card from server mapping
      const full = Array.from({ length: 15 }, (_, idx) => {
        const seat = idx + 1;
        const row = serverCardsBySeat[seat] || [];
        return row.length === 5 ? row.map(v => ({ value: v, isMarked: false })) : generateNewBingoCard()[idx];
      });
      setBingoCard(full);
      try { localStorage.setItem(key, JSON.stringify(full)); } catch {}
      return;
    }
    if (serverRow && serverRow.length === 5) {
      // Build a card that uses serverRow at the selected seat index
      setBingoCard(prev => {
        const base = prev.length ? prev : generateNewBingoCard();
        const updated = base.map((r, idx) =>
          idx === selectedSeat - 1 ? serverRow.map(v => ({ value: v, isMarked: false })) : r
        );
        try { localStorage.setItem(key, JSON.stringify(updated)); } catch {}
        return updated;
      });
      return;
    }
    const saved = localStorage.getItem(key);
    if (saved) {
      try {
        const parsed: BingoNumber[][] = JSON.parse(saved);
        if (Array.isArray(parsed) && parsed.length === 15) {
          setBingoCard(parsed);
        }
      } catch {}
    } else {
      // Save freshly generated card so it persists across reloads
      const fresh = generateNewBingoCard();
      setBingoCard(fresh);
      localStorage.setItem(key, JSON.stringify(fresh));
    }
  }, [selectedSeat, lobbyId, serverRow?.join(','), serverCardsBySeat ? JSON.stringify(serverCardsBySeat) : undefined]);

  // Persist on change (in case of manual toggles)
  useEffect(() => {
    if (!selectedSeat || !lobbyId) return;
    const key = `bingoCard_lobby_${lobbyId}_seat_${selectedSeat}`;
    try { localStorage.setItem(key, JSON.stringify(bingoCard)); } catch {}
  }, [bingoCard, selectedSeat, lobbyId]);

  // Auto-mark numbers when calledNumbers prop changes
  useEffect(() => {
    if (!calledNumbers || calledNumbers.length === 0) return;
    setBingoCard(prev => prev.map((row) =>
      row.map(cell => ({ ...cell, isMarked: calledNumbers.includes(cell.value) }))
    ));

    // Winner detection for selected seat (simple line across BINGO)
    if (selectedSeat && !winnerFiredRef.current) {
      const rowIdx = selectedSeat - 1;
      const row = bingoCard[rowIdx];
      if (row && row.every(c => calledNumbers.includes(c.value))) {
        winnerFiredRef.current = true;
        const rowNumbers = row.map(c => c.value);
        onWin?.('line', rowNumbers);
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

  return (
    <div className={cn(
      "relative rounded-md border p-2",
      "bg-white border-gray-200",
      getPhaseStyles(),
      "w-full max-w-[995px]"
    )}>
      {/* Grid Container - Compact, no vertical scroll */}
      <div className="overflow-hidden">
        <div className="w-full grid grid-cols-6 gap-[2px] select-none">
          {/* Headers Row */}
          <div className="bg-indigo-600 text-white font-semibold text-center h-7 rounded text-[11px] flex flex-col items-center justify-center leading-none">
            <span className="text-[12px]">🪑</span>
            <span className="text-[10px]">Seats</span>
          </div>
          {['B', 'I', 'N', 'G', 'O'].map((letter, index) => (
            <div key={letter} className="bg-blue-600 text-white font-semibold text-center h-7 rounded text-[11px] flex flex-col items-center justify-center leading-none">
              <span className="text-[12px] font-bold">{letter}</span>
              <span className="text-[9px] opacity-75">
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
            const isSelected = selectedSeat === seatNumber;

            return (
              <React.Fragment key={rowIndex}>
                {/* Seat Cell */}
                <button
                  onClick={() => !isOccupied && !isJoining && onSeatSelect(seatNumber)}
                  disabled={isOccupied || isJoining}
                  title={isOccupied ? `Seat ${seatNumber}: ${participant?.user?.email || 'Unknown User'}` : `Seat ${seatNumber}: Available`}
                  className={cn(
                    "relative text-left px-1 h-8 rounded font-medium text-[10.5px] transition-colors",
                    "focus:outline-none focus:ring-1 focus:ring-blue-500/40",
                    isSelected && "bg-emerald-600 text-white",
                    isOccupied && !isSelected && "bg-red-600 text-white cursor-not-allowed",
                    !isSelected && !isOccupied && "bg-gray-100 text-gray-900 hover:bg-blue-600 hover:text-white cursor-pointer",
                    winnerSeatNumber === seatNumber && (winnerUserId && myUserId && winnerUserId === myUserId
                      ? "ring-2 ring-yellow-400 shadow-[0_0_10px_#facc15] bg-yellow-400 text-black animate-pulse"
                      : "ring-2 ring-red-500 shadow-[0_0_10px_#ef4444] bg-red-600 text-white animate-pulse")
                  )}
                >
                  <div className="flex items-center justify-between leading-none">
                    <span className="font-bold">#{seatNumber}</span>
                    <div className="flex items-center gap-1">
                      {isSelected && <span className="text-[10px] bg-white/20 rounded px-1">✓</span>}
                      {isOccupied && !isSelected && <span className="text-[10px]">👤</span>}
                      {!isOccupied && !isSelected && <span className="text-[10px] opacity-50">○</span>}
                    </div>
                  </div>
                  <div className="truncate opacity-90 leading-none">
                    {isOccupied ? (
                      participant?.user?.email?.split('@')[0] || 'Unknown'
                    ) : (
                      'Available'
                    )}
                  </div>
                </button>

                {/* Bingo Numbers */}
                {bingoCard && bingoCard[rowIndex]?.map((number, colIndex) => (
                  <button
                    key={colIndex}
                    onClick={gamePhase === 'playing' ? () => handleNumberClick(rowIndex, colIndex) : undefined}
                    disabled={gamePhase !== 'playing'}
                    className={cn(
                      "text-center h-8 rounded font-medium text-[11px] transition-colors leading-none",
                      "focus:outline-none focus:ring-1 focus:ring-blue-500/40",
                      gamePhase === 'playing' && "cursor-pointer",
                      gamePhase !== 'playing' && "cursor-default opacity-90",
                      number.isMarked ? "bg-blue-600 text-white font-bold" : "bg-gray-100 text-gray-900",
                      winnerSeatNumber === seatNumber && (winnerUserId && myUserId && winnerUserId === myUserId
                        ? "ring-2 ring-yellow-400 shadow-[0_0_10px_#facc15] bg-yellow-300 text-black animate-pulse"
                        : "ring-2 ring-red-500 shadow-[0_0_10px_#ef4444] bg-red-600 text-white animate-pulse")
                    )}
                  >
                    {number.value}
                  </button>
                ))}
              </React.Fragment>
            );
          })}
        </div>
      </div>
    </div>
  );
}