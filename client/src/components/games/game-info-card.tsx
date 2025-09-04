import React from 'react';
import { cn } from "@/lib/utils";
import { Users, DollarSign, Timer, Target, Gamepad2 } from "lucide-react";

interface GameInfoCardProps {
  lobby: any;
  participants: any[];
  selectedSeats: number[];
  gamePhase: 'lobby' | 'playing' | 'finished';
  currentNumber?: number;
  nextCallIn?: number;
  onGameSwitch?: (gameId: number) => void;
  availableGames?: any[];
}

export function GameInfoCard({ lobby, participants, selectedSeats, gamePhase, currentNumber, nextCallIn, onGameSwitch, availableGames }: GameInfoCardProps) {
  const totalPlayers = participants.length;
  const totalSeats = lobby?.maxSeats || 15;
  const poolSize = totalPlayers * parseFloat(lobby?.entryFee || '0');

  return (
    <div className="w-full h-full bg-gradient-to-r from-green-50 to-emerald-50 border border-green-200 rounded-xl p-3 shadow-sm flex flex-col">
      {/* Header */}
      <div className="flex items-center gap-2 mb-3">
        <Target size={14} className="text-green-600" />
        <h4 className="text-xs font-semibold text-gray-800">Game Status</h4>
      </div>

      {/* Game Information */}
      <div className="flex-1 space-y-2">
        {/* Pool Size */}
        <div className="bg-white/60 rounded-lg p-2 border border-green-200">
          <div className="flex items-center gap-2 mb-1">
            <DollarSign size={12} className="text-green-600" />
            <span className="text-xs font-medium text-gray-700">Pool Size</span>
          </div>
          <div className="text-sm font-bold text-green-700">
            ${poolSize.toFixed(2)}
          </div>
        </div>

        {/* Total Players */}
        <div className="bg-white/60 rounded-lg p-2 border border-blue-200">
          <div className="flex items-center gap-2 mb-1">
            <Users size={12} className="text-blue-600" />
            <span className="text-xs font-medium text-gray-700">Total Players</span>
          </div>
          <div className="text-sm font-bold text-blue-700">
            {totalPlayers}/{totalSeats}
          </div>
        </div>

        {/* Your Seats */}
        <div className="bg-white/60 rounded-lg p-2 border border-purple-200">
          <div className="flex items-center gap-2 mb-1">
            <Target size={12} className="text-purple-600" />
            <span className="text-xs font-medium text-gray-700">Your Seats</span>
          </div>
          <div className="text-sm font-bold text-purple-700">
            {selectedSeats.length}/2
          </div>
          {selectedSeats.length > 0 && (
            <div className="text-xs text-gray-600 mt-1">
              Seats: {selectedSeats.join(', ')}
            </div>
          )}
        </div>

        {/* Current Number (if game is active) */}
        {gamePhase === 'playing' && currentNumber && (
          <div className="bg-white/60 rounded-lg p-2 border border-orange-200">
            <div className="flex items-center gap-2 mb-1">
              <Timer size={12} className="text-orange-600" />
              <span className="text-xs font-medium text-gray-700">Current</span>
            </div>
            <div className="text-sm font-bold text-orange-700">
              {currentNumber}
            </div>
            {nextCallIn !== undefined && (
              <div className="text-xs text-gray-600 mt-1">
                Next in {nextCallIn}s
              </div>
            )}
          </div>
        )}

        {/* Game Room Navigation */}
        <div className="bg-white/60 rounded-lg p-2 border border-indigo-200">
          <div className="flex items-center gap-2 mb-2">
            <Gamepad2 size={12} className="text-indigo-600" />
            <span className="text-xs font-medium text-gray-700">Game Rooms</span>
          </div>
          <div className="grid grid-cols-2 gap-1">
            {availableGames && availableGames.length > 0 ? (
              availableGames.map((game) => (
                <button
                  key={game.id}
                  onClick={() => onGameSwitch?.(game.gameNumber)}
                  className={cn(
                    "text-xs font-bold py-1 px-2 rounded transition-all duration-200",
                    "bg-gradient-to-r from-indigo-500 to-purple-600 text-white",
                    "hover:from-indigo-600 hover:to-purple-700",
                    "active:scale-95 transform",
                    "focus:outline-none focus:ring-2 focus:ring-indigo-400 focus:ring-opacity-50"
                  )}
                >
                  Game {game.gameNumber}
                </button>
              ))
            ) : (
              <div className="col-span-2 text-center text-xs text-gray-500 py-2">
                No games available
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
