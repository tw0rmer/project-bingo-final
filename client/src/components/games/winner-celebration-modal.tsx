import React, { useEffect, useState } from 'react';
import { cn } from '@/lib/utils';
import { Trophy, Star, Sparkles, DollarSign } from 'lucide-react';

interface WinnerCelebrationModalProps {
  isOpen: boolean;
  onClose: () => void;
  prizeAmount: number;
  winningSeats: number[];
  winningRow: number[];
  duration?: number; // Duration in seconds, default 30
}

export function WinnerCelebrationModal({
  isOpen,
  onClose,
  prizeAmount,
  winningSeats,
  winningRow,
  duration = 30
}: WinnerCelebrationModalProps) {
  const [timeLeft, setTimeLeft] = useState(duration);
  const [showConfetti, setShowConfetti] = useState(false);

  useEffect(() => {
    if (isOpen) {
      setTimeLeft(duration);
      setShowConfetti(true);
      
      const timer = setInterval(() => {
        setTimeLeft((prev) => {
          if (prev <= 1) {
            clearInterval(timer);
            onClose();
            return 0;
          }
          return prev - 1;
        });
      }, 1000);

      return () => clearInterval(timer);
    }
  }, [isOpen, duration, onClose]);

  if (!isOpen) return null;

  const formatSeats = (seats: number[]) => {
    if (seats.length === 1) return `Seat ${seats[0]}`;
    if (seats.length === 2) return `Seats ${seats[0]} & ${seats[1]}`;
    return `Seats ${seats.slice(0, -1).join(', ')} & ${seats[seats.length - 1]}`;
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm">
      {/* Confetti Animation */}
      {showConfetti && (
        <div className="absolute inset-0 pointer-events-none overflow-hidden">
          {Array.from({ length: 50 }).map((_, i) => (
            <div
              key={i}
              className={cn(
                "absolute w-2 h-2 animate-bounce",
                i % 4 === 0 && "bg-yellow-400",
                i % 4 === 1 && "bg-amber-400", 
                i % 4 === 2 && "bg-orange-400",
                i % 4 === 3 && "bg-red-400"
              )}
              style={{
                left: `${Math.random() * 100}%`,
                top: `-10px`,
                animationDelay: `${Math.random() * 2}s`,
                animationDuration: `${2 + Math.random() * 3}s`
              }}
            />
          ))}
        </div>
      )}

      {/* Main Modal */}
      <div className="relative bg-gradient-to-br from-yellow-50 via-amber-50 to-orange-50 rounded-3xl p-8 max-w-lg w-full mx-4 border-4 border-yellow-400 shadow-2xl animate-pulse">
        {/* Golden Glow Border */}
        <div className="absolute inset-0 rounded-3xl bg-gradient-to-r from-yellow-400 via-amber-400 to-yellow-400 opacity-20 blur-xl"></div>
        
        {/* Close Timer */}
        <div className="absolute top-4 right-4 bg-white/90 rounded-full px-3 py-1 text-sm font-medium text-gray-700">
          {timeLeft}s
        </div>

        {/* Content */}
        <div className="relative text-center space-y-6">
          {/* Trophy Icon */}
          <div className="relative mx-auto w-24 h-24">
            <div className="absolute inset-0 bg-gradient-to-b from-yellow-400 to-amber-500 rounded-full animate-spin-slow"></div>
            <div className="absolute inset-2 bg-gradient-to-b from-amber-400 to-yellow-500 rounded-full flex items-center justify-center">
              <Trophy className="w-12 h-12 text-white" />
            </div>
            <Sparkles className="absolute -top-2 -right-2 w-6 h-6 text-yellow-400 animate-bounce" />
            <Star className="absolute -bottom-2 -left-2 w-5 h-5 text-amber-400 animate-pulse" />
          </div>

          {/* Winner Text */}
          <div className="space-y-2">
            <h1 className="text-4xl font-bold bg-gradient-to-r from-yellow-600 via-amber-600 to-orange-600 bg-clip-text text-transparent animate-pulse">
              🎉 BINGO! 🎉
            </h1>
            <p className="text-xl font-semibold text-gray-800">
              Congratulations! You Won!
            </p>
          </div>

          {/* Prize Display */}
          <div className="bg-gradient-to-r from-green-100 to-emerald-100 rounded-2xl p-6 border-2 border-green-300">
            <div className="flex items-center justify-center gap-2 mb-2">
              <DollarSign className="w-8 h-8 text-green-600" />
              <span className="text-4xl font-bold text-green-700">
                ${prizeAmount.toFixed(2)}
              </span>
            </div>
            <p className="text-green-600 font-medium">Prize Added to Your Balance!</p>
          </div>

          {/* Winning Details */}
          <div className="bg-white/50 rounded-xl p-4 space-y-2">
            <p className="text-gray-700 font-medium">
              Winning {formatSeats(winningSeats)}
            </p>
            <p className="text-sm text-gray-600">
              Numbers: {winningRow.join(' - ')}
            </p>
            {winningSeats.length > 1 && (
              <p className="text-xs text-blue-600 font-medium">
                Multiple seats bonus: {winningSeats.length}x prize!
              </p>
            )}
          </div>

          {/* Celebration Message */}
          <div className="text-lg font-medium text-amber-700 animate-bounce">
            ✨ Amazing bingo skills! ✨
          </div>

          {/* Manual Close Button */}
          <button
            onClick={onClose}
            className="bg-gradient-to-r from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700 text-white font-bold py-3 px-6 rounded-xl transition-all duration-200 transform hover:scale-105"
          >
            Continue Playing
          </button>
        </div>
      </div>

      <style jsx>{`
        @keyframes spin-slow {
          from {
            transform: rotate(0deg);
          }
          to {
            transform: rotate(360deg);
          }
        }
        .animate-spin-slow {
          animation: spin-slow 3s linear infinite;
        }
      `}</style>
    </div>
  );
}