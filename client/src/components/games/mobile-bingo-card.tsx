import React, { useState, useEffect, useRef } from 'react';
import { cn } from '@/lib/utils';

export interface BingoNumber {
  value: number;
  isMarked: boolean;
}

interface MobileBingoCardProps {
  onSeatSelect: (seatNumber: number) => void;
  selectedSeat?: number;
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
}

// Generate a bingo card
const generateNewBingoCard = (): BingoNumber[][] => {
  const getRandomNumbersInRange = (start: number, end: number, count: number): number[] => {
    const numbers = Array.from({ length: end - start + 1 }, (_, i) => start + i);
    for (let i = numbers.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [numbers[i], numbers[j]] = [numbers[j], numbers[i]];
    }
    return numbers.slice(0, count);
  };

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

export function MobileBingoCard({
  onSeatSelect,
  selectedSeat,
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
  serverCardsBySeat
}: MobileBingoCardProps) {
  const [bingoCard, setBingoCard] = useState<BingoNumber[][]>(() => generateNewBingoCard());
  const winnerFiredRef = useRef(false);

  // Restore persisted card
  useEffect(() => {
    if (!selectedSeat || !lobbyId) return;
    const key = `bingoCard_lobby_${lobbyId}_seat_${selectedSeat}`;
    
    if (serverCardsBySeat && Object.keys(serverCardsBySeat).length === 15) {
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
      const fresh = generateNewBingoCard();
      setBingoCard(fresh);
      localStorage.setItem(key, JSON.stringify(fresh));
    }
  }, [selectedSeat, lobbyId, serverRow?.join(','), serverCardsBySeat ? JSON.stringify(serverCardsBySeat) : undefined]);

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

  // Persist changes
  useEffect(() => {
    if (!selectedSeat || !lobbyId) return;
    const key = `bingoCard_lobby_${lobbyId}_seat_${selectedSeat}`;
    try { localStorage.setItem(key, JSON.stringify(bingoCard)); } catch {}
  }, [bingoCard, selectedSeat, lobbyId]);

  // Check for wins
  useEffect(() => {
    if (gamePhase !== 'playing' || !selectedSeat || winnerFiredRef.current) return;

    const checkWin = () => {
      const targetRowIndex = selectedSeat - 1;
      if (!bingoCard[targetRowIndex]) return;

      const row = bingoCard[targetRowIndex];
      if (row.every(cell => cell.isMarked)) {
        console.log('[MOBILE BINGO CARD] BINGO! Row win detected for seat', selectedSeat);
        winnerFiredRef.current = true;
        const rowNumbers = row.map(cell => cell.value);
        onWin('row', rowNumbers);
      }
    };

    checkWin();
  }, [bingoCard, gamePhase, selectedSeat, onWin]);

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

  return (
    <div className="h-full flex flex-col p-4 space-y-4">
      {/* Header */}
      <div className="text-center">
        <h2 className="text-xl font-bold text-gray-900 mb-2">Bingo Card</h2>
        {selectedSeat ? (
          <div className="inline-flex items-center bg-green-100 text-green-800 px-3 py-1 rounded-full text-sm font-medium">
            🪑 Seat {selectedSeat}
          </div>
        ) : (
          <p className="text-gray-600 text-sm">Select a seat to join the game</p>
        )}
      </div>

      {/* Mobile-optimized bingo grid */}
      <div className="flex-1 flex flex-col space-y-3">
        {/* Column headers */}
        <div className="grid grid-cols-6 gap-2">
          <div className="flex items-center justify-center bg-indigo-600 text-white rounded-lg h-10 text-sm font-bold">
            SEAT
          </div>
          {['B', 'I', 'N', 'G', 'O'].map((letter, index) => (
            <div key={letter} className="flex flex-col items-center justify-center bg-blue-600 text-white rounded-lg h-10 text-sm font-bold">
              <div>{letter}</div>
              <div className="text-[10px] opacity-75">
                {index === 0 && "1-15"}
                {index === 1 && "16-30"}
                {index === 2 && "31-45"}
                {index === 3 && "46-60"}
                {index === 4 && "61-75"}
              </div>
            </div>
          ))}
        </div>

        {/* Scrollable rows */}
        <div className="flex-1 overflow-y-auto space-y-2">
          {Array.from({ length: 15 }, (_, rowIndex) => {
            const seatNumber = rowIndex + 1;
            const participant = participants.find(p => p.seatNumber === seatNumber);
            const isOccupied = !!participant;
            const isSelected = selectedSeat === seatNumber;
            const isMyRow = selectedSeat === seatNumber;

            return (
              <div key={rowIndex} className="grid grid-cols-6 gap-2">
                {/* Seat button */}
                <button
                  onClick={() => !isOccupied && !isJoining && onSeatSelect(seatNumber)}
                  disabled={isOccupied || isJoining}
                  className={cn(
                    "flex flex-col items-center justify-center rounded-lg h-12 text-xs font-bold transition-all",
                    "focus:outline-none focus:ring-2 focus:ring-blue-500",
                    "active:scale-95 transition-transform duration-100",
                    isSelected && "bg-emerald-600 text-white shadow-lg",
                    isOccupied && !isSelected && "bg-red-500 text-white cursor-not-allowed",
                    !isSelected && !isOccupied && "bg-gray-200 text-gray-800 hover:bg-blue-500 hover:text-white",
                    winnerSeatNumber === seatNumber && "ring-4 ring-yellow-400 animate-pulse"
                  )}
                >
                  <div className="text-xs font-bold">#{seatNumber}</div>
                  <div className="text-[10px] opacity-90 truncate max-w-full">
                    {isOccupied ? (
                      participant?.user?.email?.split('@')[0] || 'User'
                    ) : (
                      'Open'
                    )}
                  </div>
                </button>

                {/* Bingo numbers - larger touch targets */}
                {bingoCard && bingoCard[rowIndex]?.map((number, colIndex) => (
                  <button
                    key={colIndex}
                    onClick={gamePhase === 'playing' && isMyRow ? () => handleNumberClick(rowIndex, colIndex) : undefined}
                    disabled={gamePhase !== 'playing' || !isMyRow}
                    className={cn(
                      "flex items-center justify-center rounded-lg h-12 text-sm font-bold transition-all",
                      "focus:outline-none focus:ring-2 focus:ring-blue-500",
                      gamePhase === 'playing' && isMyRow && "active:scale-95 transition-transform duration-100",
                      gamePhase === 'playing' && isMyRow ? "cursor-pointer" : "cursor-default",
                      number.isMarked 
                        ? "bg-blue-600 text-white shadow-lg" 
                        : isMyRow 
                          ? "bg-white border-2 border-gray-300 text-gray-900 hover:border-blue-400" 
                          : "bg-gray-100 border border-gray-200 text-gray-600",
                      !isMyRow && "opacity-60",
                      winnerSeatNumber === seatNumber && "ring-2 ring-yellow-400"
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

      {/* Instructions */}
      <div className="text-center text-sm text-gray-600 bg-gray-50 rounded-lg p-3">
        {gamePhase === 'lobby' && !selectedSeat && "Tap a seat number to join"}
        {gamePhase === 'lobby' && selectedSeat && "Waiting for game to start..."}
        {gamePhase === 'playing' && selectedSeat && "Tap numbers on your row when called"}
        {gamePhase === 'playing' && !selectedSeat && "You're not in this game"}
        {gamePhase === 'finished' && "Game finished"}
      </div>
    </div>
  );
}