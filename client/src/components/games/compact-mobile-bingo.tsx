import React, { useState, useEffect, useRef } from 'react';
import { cn } from '@/lib/utils';
import { ChevronLeft, ChevronRight } from 'lucide-react';

export interface BingoNumber {
  value: number;
  isMarked: boolean;
}

interface CompactMobileBingoProps {
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

export function CompactMobileBingo({
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
}: CompactMobileBingoProps) {
  const [bingoCard, setBingoCard] = useState<BingoNumber[][]>(() => generateNewBingoCard());
  const [currentPage, setCurrentPage] = useState(0);
  const scrollContainerRef = useRef<HTMLDivElement>(null);
  const winnerFiredRef = useRef(false);
  
  // Calculate pagination
  const SEATS_PER_PAGE = 5; // Show 5 seats at a time on mobile
  const totalPages = Math.ceil(15 / SEATS_PER_PAGE);
  const startSeat = currentPage * SEATS_PER_PAGE;
  const endSeat = Math.min(startSeat + SEATS_PER_PAGE, 15);

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

  // Check for win
  useEffect(() => {
    if (gamePhase !== 'playing' || !selectedSeat || winnerFiredRef.current) return;
    const myRow = bingoCard[selectedSeat - 1];
    if (!myRow) return;
    
    const allMarked = myRow.every(cell => cell.isMarked);
    if (allMarked && !winnerFiredRef.current) {
      winnerFiredRef.current = true;
      const rowNumbers = myRow.map(cell => cell.value);
      onWin('bingo', rowNumbers);
    }
  }, [bingoCard, selectedSeat, gamePhase, onWin]);

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

  const handlePrevPage = () => {
    setCurrentPage(prev => Math.max(0, prev - 1));
  };

  const handleNextPage = () => {
    setCurrentPage(prev => Math.min(totalPages - 1, prev + 1));
  };

  // Auto-scroll to selected seat's page
  useEffect(() => {
    if (selectedSeat) {
      const targetPage = Math.floor((selectedSeat - 1) / SEATS_PER_PAGE);
      setCurrentPage(targetPage);
    }
  }, [selectedSeat]);

  return (
    <div className="w-full h-full flex flex-col bg-white p-2">
      {/* Navigation Header */}
      <div className="flex-shrink-0 flex items-center justify-between mb-2 bg-gray-50 rounded-lg p-2">
        <button
          onClick={handlePrevPage}
          disabled={currentPage === 0}
          className={cn(
            "p-1 rounded-lg transition-colors",
            currentPage === 0 
              ? "bg-gray-200 text-gray-400 cursor-not-allowed" 
              : "bg-blue-500 text-white hover:bg-blue-600 active:scale-95"
          )}
          data-testid="button-prev-page"
        >
          <ChevronLeft size={20} />
        </button>
        
        <div className="text-center">
          <div className="text-sm font-bold text-gray-900">
            Seats {startSeat + 1} - {endSeat}
          </div>
          <div className="text-xs text-gray-600">
            Page {currentPage + 1} of {totalPages}
          </div>
        </div>
        
        <button
          onClick={handleNextPage}
          disabled={currentPage === totalPages - 1}
          className={cn(
            "p-1 rounded-lg transition-colors",
            currentPage === totalPages - 1 
              ? "bg-gray-200 text-gray-400 cursor-not-allowed" 
              : "bg-blue-500 text-white hover:bg-blue-600 active:scale-95"
          )}
          data-testid="button-next-page"
        >
          <ChevronRight size={20} />
        </button>
      </div>

      {/* Page Indicators */}
      <div className="flex-shrink-0 flex justify-center gap-1 mb-2">
        {Array.from({ length: totalPages }, (_, i) => (
          <button
            key={i}
            onClick={() => setCurrentPage(i)}
            className={cn(
              "w-2 h-2 rounded-full transition-all",
              i === currentPage 
                ? "bg-blue-600 w-6" 
                : "bg-gray-300 hover:bg-gray-400"
            )}
            data-testid={`button-page-${i}`}
          />
        ))}
      </div>

      {/* Bingo Grid */}
      <div className="flex-1 overflow-auto" ref={scrollContainerRef}>
        <div className="grid grid-cols-6 gap-1 h-full">
          {/* Headers */}
          <div className="bg-indigo-600 text-white font-bold text-center rounded flex items-center justify-center text-xs">
            Seat
          </div>
          {['B', 'I', 'N', 'G', 'O'].map((letter) => (
            <div 
              key={letter} 
              className="bg-blue-600 text-white font-bold text-center rounded flex items-center justify-center text-xs"
            >
              {letter}
            </div>
          ))}

          {/* Visible Rows */}
          {Array.from({ length: endSeat - startSeat }, (_, offset) => {
            const rowIndex = startSeat + offset;
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
                  className={cn(
                    "rounded p-1 font-medium text-xs transition-all touch-manipulation",
                    "focus:outline-none focus:ring-2 focus:ring-blue-500",
                    "active:scale-95",
                    isSelected && "bg-emerald-600 text-white ring-2 ring-emerald-400",
                    isOccupied && !isSelected && "bg-red-600 text-white cursor-not-allowed",
                    !isSelected && !isOccupied && "bg-gray-100 text-gray-900 hover:bg-blue-100",
                    winnerSeatNumber === seatNumber && "animate-pulse ring-2 ring-yellow-400"
                  )}
                  data-testid={`button-seat-${seatNumber}`}
                >
                  <div className="font-bold">#{seatNumber}</div>
                  <div className="text-[10px] truncate">
                    {isOccupied ? participant?.user?.email?.split('@')[0] : 'Open'}
                  </div>
                </button>

                {/* Number Cells */}
                {bingoCard[rowIndex]?.map((number, colIndex) => (
                  <button
                    key={colIndex}
                    onClick={() => handleNumberClick(rowIndex, colIndex)}
                    disabled={gamePhase !== 'playing'}
                    className={cn(
                      "rounded font-bold text-sm transition-all touch-manipulation",
                      "focus:outline-none focus:ring-2 focus:ring-blue-500",
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
              </React.Fragment>
            );
          })}
        </div>
      </div>

      {/* Quick Jump to Selected Seat */}
      {selectedSeat && (
        <div className="flex-shrink-0 mt-2 bg-green-50 border border-green-300 rounded-lg p-2">
          <div className="text-xs text-green-800 text-center">
            Your seat: #{selectedSeat}
            {Math.floor((selectedSeat - 1) / SEATS_PER_PAGE) !== currentPage && (
              <button
                onClick={() => setCurrentPage(Math.floor((selectedSeat - 1) / SEATS_PER_PAGE))}
                className="ml-2 text-green-600 underline font-medium"
                data-testid="button-jump-to-seat"
              >
                Jump to seat
              </button>
            )}
          </div>
        </div>
      )}
    </div>
  );
}