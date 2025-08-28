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
  totalPrizePool?: number;
  houseFee?: number;
}

export function WinnerCelebrationModal({
  isOpen,
  onClose,
  prizeAmount,
  winningSeats,
  winningRow,
  duration = 30,
  totalPrizePool,
  houseFee
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
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-gradient-to-br from-purple-900/90 via-blue-900/90 to-indigo-900/90 backdrop-blur-sm">
      {/* Animated Background Stars */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        {Array.from({ length: 100 }).map((_, i) => (
          <div
            key={`star-${i}`}
            className="absolute w-1 h-1 bg-white rounded-full animate-pulse"
            style={{
              left: `${Math.random() * 100}%`,
              top: `${Math.random() * 100}%`,
              animationDelay: `${Math.random() * 3}s`,
              animationDuration: `${1 + Math.random() * 2}s`,
              opacity: Math.random() * 0.8 + 0.2
            }}
          />
        ))}
      </div>

      {/* Floating Golden Orbs */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        {Array.from({ length: 20 }).map((_, i) => (
          <div
            key={`orb-${i}`}
            className="absolute rounded-full bg-gradient-to-br from-yellow-300 to-amber-500 opacity-70 animate-float"
            style={{
              left: `${Math.random() * 100}%`,
              top: `${Math.random() * 100}%`,
              width: `${20 + Math.random() * 40}px`,
              height: `${20 + Math.random() * 40}px`,
              animationDelay: `${Math.random() * 4}s`,
              animationDuration: `${3 + Math.random() * 2}s`
            }}
          />
        ))}
      </div>

      {/* Enhanced Confetti Animation */}
      {showConfetti && (
        <div className="absolute inset-0 pointer-events-none overflow-hidden">
          {Array.from({ length: 80 }).map((_, i) => (
            <div
              key={`confetti-${i}`}
              className={cn(
                "absolute animate-confetti-fall",
                i % 6 === 0 && "bg-yellow-400 w-3 h-1",
                i % 6 === 1 && "bg-amber-400 w-2 h-2 rounded-full", 
                i % 6 === 2 && "bg-orange-400 w-1 h-3",
                i % 6 === 3 && "bg-red-400 w-2 h-2",
                i % 6 === 4 && "bg-pink-400 w-3 h-1",
                i % 6 === 5 && "bg-purple-400 w-2 h-2 rounded-full"
              )}
              style={{
                left: `${Math.random() * 100}%`,
                top: `-20px`,
                animationDelay: `${Math.random() * 3}s`,
                animationDuration: `${3 + Math.random() * 4}s`,
                transform: `rotate(${Math.random() * 360}deg)`
              }}
            />
          ))}
        </div>
      )}

      {/* Main Modal */}
      <div className="relative bg-gradient-to-br from-yellow-50 via-amber-50 to-orange-50 rounded-3xl p-8 max-w-lg w-full mx-4 border-4 border-yellow-400 shadow-2xl animate-modal-bounce">
        {/* Golden Glow Border Animation */}
        <div className="absolute inset-0 rounded-3xl bg-gradient-to-r from-yellow-400 via-amber-400 to-yellow-400 opacity-30 blur-xl animate-glow-pulse"></div>
        
        {/* Secondary Glow Ring */}
        <div className="absolute inset-[-10px] rounded-3xl bg-gradient-to-r from-yellow-300 via-amber-300 to-yellow-300 opacity-20 blur-2xl animate-spin-slow"></div>
        
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
            <div className="flex items-center justify-center gap-2 mb-3">
              <DollarSign className="w-8 h-8 text-green-600" />
              <span className="text-4xl font-bold text-green-700">
                ${prizeAmount.toFixed(2)}
              </span>
            </div>
            <p className="text-green-600 font-medium mb-3">Prize Added to Your Balance!</p>
            
            {/* Prize Breakdown */}
            {totalPrizePool && houseFee !== undefined && (
              <div className="bg-white/70 rounded-lg p-3 text-sm space-y-1">
                <div className="flex justify-between text-gray-700">
                  <span>Total Prize Pool:</span>
                  <span className="font-medium">${totalPrizePool.toFixed(2)}</span>
                </div>
                <div className="flex justify-between text-gray-700">
                  <span>House Fee (30%):</span>
                  <span className="font-medium">-${houseFee.toFixed(2)}</span>
                </div>
                <div className="border-t pt-1 flex justify-between text-green-700 font-bold">
                  <span>Your Prize (70%):</span>
                  <span>${prizeAmount.toFixed(2)}</span>
                </div>
              </div>
            )}
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

      <style>{`
        @keyframes spin-slow {
          from { transform: rotate(0deg); }
          to { transform: rotate(360deg); }
        }
        @keyframes float {
          0%, 100% { transform: translateY(0px) rotate(0deg); }
          50% { transform: translateY(-20px) rotate(180deg); }
        }
        @keyframes confetti-fall {
          0% { transform: translateY(-20px) rotate(0deg); opacity: 1; }
          100% { transform: translateY(100vh) rotate(720deg); opacity: 0; }
        }
        @keyframes modal-bounce {
          0% { transform: scale(0.3) rotate(-10deg); opacity: 0; }
          50% { transform: scale(1.05) rotate(2deg); }
          100% { transform: scale(1) rotate(0deg); opacity: 1; }
        }
        @keyframes glow-pulse {
          0%, 100% { opacity: 0.3; transform: scale(1); }
          50% { opacity: 0.6; transform: scale(1.02); }
        }
        
        .animate-spin-slow { animation: spin-slow 6s linear infinite; }
        .animate-float { animation: float 4s ease-in-out infinite; }
        .animate-confetti-fall { animation: confetti-fall linear forwards; }
        .animate-modal-bounce { animation: modal-bounce 0.6s cubic-bezier(0.68, -0.55, 0.265, 1.55); }
        .animate-glow-pulse { animation: glow-pulse 2s ease-in-out infinite; }
      `}</style>
    </div>
  );
}