import { useState } from 'react';
import { cn } from "@/lib/utils";

interface SeatSelectionProps {
  onSeatSelect: (seatNumber: number) => void;
  selectedSeat?: number;
  takenSeats: number[];
}

export function SeatSelection({ onSeatSelect, selectedSeat, takenSeats }: SeatSelectionProps) {
  return (
    <div className="flex flex-col gap-2">
      {/* Header */}
      <div className="bg-casino-red text-white font-bold text-center py-3 rounded text-lg">
        Seat
      </div>
      
      {/* Seats 1-15 */}
      {Array.from({ length: 15 }, (_, i) => i + 1).map((seatNumber) => {
        const isSelected = selectedSeat === seatNumber;
        const isTaken = takenSeats.includes(seatNumber);
        
        return (
          <button
            key={seatNumber}
            onClick={() => !isTaken && onSeatSelect(seatNumber)}
            disabled={isTaken}
            className={cn(
              "text-center py-3 rounded font-bold text-lg transition-colors",
              "focus:outline-none focus:ring-2 focus:ring-casino-gold focus:ring-offset-2",
              isSelected && "bg-green-500 text-white hover:bg-green-600",
              isTaken && "bg-red-500 text-white cursor-not-allowed",
              !isSelected && !isTaken && "bg-gray-100 text-dark-brown hover:bg-casino-gold hover:text-white cursor-pointer"
            )}
          >
            {seatNumber}
          </button>
        );
      })}
    </div>
  );
} 