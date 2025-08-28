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
  serverCardsBySeat
}: CompactMobileBingoProps) {
  const [bingoCard, setBingoCard] = useState<BingoNumber[][]>(() => generateNewBingoCard());
  const scrollContainerRef = useRef<HTMLDivElement>(null);
  const winnerFiredRef = useRef(false);

  // Restore persisted card for all seats
  useEffect(() => {
    if (!lobbyId) return;
    
    if (serverCardsBySeat && Object.keys(serverCardsBySeat).length === 15) {
      const full = Array.from({ length: 15 }, (_, idx) => {
        const seat = idx + 1;
        const row = serverCardsBySeat[seat] || [];
        return row.length === 5 ? row.map(v => ({ value: v, isMarked: false })) : generateNewBingoCard()[idx];
      });
      setBingoCard(full);
      // Store for each selected seat
      selectedSeats.forEach(seatNum => {
        const key = `bingoCard_lobby_${lobbyId}_seat_${seatNum}`;
        try { localStorage.setItem(key, JSON.stringify(full)); } catch {}
      });
      return;
    }
    
    // Load existing card or generate new one
    const fresh = generateNewBingoCard();
    setBingoCard(fresh);
    selectedSeats.forEach(seatNum => {
      const key = `bingoCard_lobby_${lobbyId}_seat_${seatNum}`;
      localStorage.setItem(key, JSON.stringify(fresh));
    });
  }, [selectedSeats.join(','), lobbyId, serverCardsBySeat ? JSON.stringify(serverCardsBySeat) : undefined]);

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

  return (
    <div className="w-full h-full flex flex-col bg-white p-2">
      {/* Header */}
      <div className="flex-shrink-0 text-center mb-2 bg-gray-50 rounded-lg p-2">
        <div className="text-sm font-bold text-gray-900">All 15 Seats</div>
        <div className="text-xs text-gray-600">Select up to 2 seats to play</div>
        {selectedSeats.length > 0 && (
          <div className="text-xs text-blue-600 font-medium mt-1">
            Selected: {selectedSeats.join(', ')} ({selectedSeats.length}/2)
          </div>
        )}
      </div>

      {/* Scrollable Bingo Grid */}
      <div className="flex-1 overflow-auto" ref={scrollContainerRef}>
        <div className="space-y-1">
          {/* Sticky Header Row */}
          <div className="sticky top-0 bg-white z-10 grid grid-cols-6 gap-1 pb-1">
            <div className="bg-indigo-600 text-white font-bold text-center rounded flex items-center justify-center text-xs h-8">
              Seat
            </div>
            {['B', 'I', 'N', 'G', 'O'].map((letter) => (
              <div 
                key={letter} 
                className="bg-blue-600 text-white font-bold text-center rounded flex items-center justify-center text-xs h-8"
              >
                {letter}
              </div>
            ))}
          </div>

          {/* All 15 Seat Rows */}
          {Array.from({ length: 15 }, (_, i) => i + 1).map((seatNumber) => {
            const rowIndex = seatNumber - 1;
            const participant = participants.find(p => p.seatNumber === seatNumber);
            const isOccupiedByOther = participant && participant.userId !== myUserId;
            const isMySelection = selectedSeats.includes(seatNumber);
            const canSelect = !isOccupiedByOther && !isJoining && selectedSeats.length < 2;
            const canDeselect = isMySelection && !isJoining;

            return (
              <div key={seatNumber} className="grid grid-cols-6 gap-1">
                {/* Seat Cell */}
                <button
                  onClick={() => (canSelect || canDeselect) && gamePhase !== 'playing' && onSeatSelect(seatNumber)}
                  disabled={isOccupiedByOther || (isJoining && !isMySelection) || (!canSelect && !canDeselect) || gamePhase === 'playing'}
                  className={cn(
                    "rounded p-1 font-medium text-xs transition-all touch-manipulation h-12",
                    "focus:outline-none focus:ring-2 focus:ring-blue-500",
                    "active:scale-95",
                    isMySelection && "bg-emerald-600 text-white ring-2 ring-emerald-400",
                    isOccupiedByOther && "bg-red-600 text-white cursor-not-allowed",
                    !isMySelection && !isOccupiedByOther && canSelect && "bg-gray-100 text-gray-900 hover:bg-blue-100",
                    !isMySelection && !isOccupiedByOther && !canSelect && "bg-gray-200 text-gray-500 cursor-not-allowed",
                    winnerSeatNumber === seatNumber && "animate-pulse ring-2 ring-yellow-400"
                  )}
                  data-testid={`button-seat-${seatNumber}`}
                >
                  <div className="font-bold">#{seatNumber}</div>
                  <div className="text-[10px] truncate">
                    {participant ? participant?.user?.email?.split('@')[0] : 'Open'}
                  </div>
                </button>

                {/* Number Cells */}
                {bingoCard[rowIndex]?.map((number, colIndex) => (
                  <button
                    key={colIndex}
                    onClick={() => handleNumberClick(rowIndex, colIndex)}
                    disabled={gamePhase !== 'playing'}
                    className={cn(
                      "rounded font-bold text-sm transition-all touch-manipulation h-12",
                      "focus:outline-none focus:ring-2 focus:ring-blue-500",
                      "flex items-center justify-center",
                      gamePhase === 'playing' && "cursor-pointer active:scale-95",
                      gamePhase !== 'playing' && "cursor-default",
                      number.isMarked 
                        ? "bg-green-600 text-white ring-1 ring-green-400" 
                        : "bg-gray-100 text-gray-900 hover:bg-gray-200",
                      winnerSeatNumber === seatNumber && number.isMarked && "bg-yellow-400 text-black"
                    )}
                    data-testid={`button-number-${seatNumber}-${colIndex}`}
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