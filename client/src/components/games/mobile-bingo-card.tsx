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
  masterCard?: number[][] | null; // Server master card that ALL players see
}

// REMOVED: Random card generation - All cards must come from server to ensure consistency

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
  serverCardsBySeat,
  masterCard
}: MobileBingoCardProps) {
  const [bingoCard, setBingoCard] = useState<BingoNumber[][]>([]);
  const winnerFiredRef = useRef(false);

  // Use ONLY server master card to ensure consistency
  useEffect(() => {
    console.log('[MOBILE BINGO] Master card received:', masterCard ? `${masterCard.length} rows` : 'null');
    
    if (masterCard && masterCard.length === 15) {
      const formattedCard = masterCard.map(row => 
        row.map(value => ({ value, isMarked: false }))
      );
      setBingoCard(formattedCard);
      console.log('[MOBILE BINGO] SUCCESS - Using server master card');
      console.log('[MOBILE BINGO] First row should be [2, 30, 43, 53, 71]:', masterCard[0]);
      return;
    }
    
    console.log('[MOBILE BINGO] ERROR - No master card received, waiting...');
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
    <div className="w-full h-full flex flex-col">
      {/* Header - minimal */}
      <div className="flex-shrink-0 text-center py-2">
        <h2 className="text-base font-bold text-gray-900">Bingo Card</h2>
        {selectedSeat && (
          <div className="inline-flex items-center bg-green-100 text-green-800 px-2 py-1 rounded-full text-xs font-medium mt-1">
            🪑 Seat {selectedSeat}
          </div>
        )}
      </div>

      {/* Column headers - compact */}
      <div className="flex-shrink-0 grid grid-cols-6 gap-1 px-2 mb-2">
        <div className="flex items-center justify-center bg-indigo-600 text-white rounded h-8 text-xs font-bold">
          SEAT
        </div>
        {['B', 'I', 'N', 'G', 'O'].map((letter, index) => (
          <div key={letter} className="flex flex-col items-center justify-center bg-blue-600 text-white rounded h-8 text-xs font-bold">
            <div className="text-white font-bold text-sm">{letter}</div>
            <div className="text-[10px] text-white opacity-90 leading-none">
              {index === 0 && "1-15"}
              {index === 1 && "16-30"}
              {index === 2 && "31-45"}
              {index === 3 && "46-60"}
              {index === 4 && "61-75"}
            </div>
          </div>
        ))}
      </div>

      {/* Scrollable content area - uses remaining space */}
      <div className="flex-1 overflow-y-auto px-2 pb-2">
          {Array.from({ length: 15 }, (_, rowIndex) => {
            const seatNumber = rowIndex + 1;
            const participant = participants.find(p => p.seatNumber === seatNumber);
            const isOccupied = !!participant;
            const isSelected = selectedSeat === seatNumber;
            const isMyRow = selectedSeat === seatNumber;

            return (
              <div key={rowIndex} className={cn(
                "grid grid-cols-6 gap-1 mb-2 rounded-lg p-1 transition-all",
                isMyRow && winnerSeatNumber === seatNumber && "bg-yellow-100 ring-4 ring-yellow-400 animate-pulse shadow-xl"
              )}>
                {/* Seat button - compact but touch-friendly */}
                <button
                  onClick={() => !isOccupied && !isJoining && gamePhase !== 'playing' && onSeatSelect(seatNumber)}
                  disabled={isOccupied || isJoining || gamePhase === 'playing'}
                  className={cn(
                    "flex flex-col items-center justify-center rounded h-11 font-bold transition-all",
                    "focus:outline-none focus:ring-2 focus:ring-blue-500",
                    "active:scale-95 transition-transform duration-100",
                    isSelected && "bg-emerald-600 text-white shadow-lg",
                    isOccupied && !isSelected && "bg-red-500 text-white cursor-not-allowed",
                    !isSelected && !isOccupied && "bg-gray-200 text-gray-800 hover:bg-blue-500 hover:text-white",
                    winnerSeatNumber === seatNumber && "ring-4 ring-yellow-400 animate-pulse"
                  )}
                >
                  <div className="text-sm font-bold text-current">#{seatNumber}</div>
                  <div className="text-[10px] font-medium truncate max-w-full leading-none">
                    {isOccupied ? (
                      participant?.user?.email?.split('@')[0] || 'User'
                    ) : (
                      'Open'
                    )}
                  </div>
                </button>

                {/* Bingo numbers - optimized size */}
                {bingoCard && bingoCard[rowIndex]?.map((number, colIndex) => (
                  <button
                    key={colIndex}
                    onClick={gamePhase === 'playing' && isMyRow ? () => handleNumberClick(rowIndex, colIndex) : undefined}
                    disabled={gamePhase !== 'playing' || !isMyRow}
                    className={cn(
                      "flex items-center justify-center rounded h-11 text-sm font-bold transition-all",
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
        
        {/* Instructions at bottom if no seat selected */}
        {!selectedSeat && gamePhase === 'lobby' && (
          <div className="text-center text-xs text-gray-600 bg-gray-50 rounded p-2 mt-4">
            Tap a seat number to join the game
          </div>
        )}
      </div>
    </div>
  );
}