import React, { useEffect, useState } from 'react';
import { cn } from '@/lib/utils';
import { Trophy, Star, Sparkles, DollarSign, Crown, Gem, Coins, TrendingUp, Zap, Gift } from 'lucide-react';

interface WinnerCelebrationModalProps {
  isOpen: boolean;
  onClose: () => void;
  prizeAmount: number;
  winningSeats: number[];
  winningRow: number[];
  duration?: number;
  totalPrizePool?: number;
  houseFee?: number;
}

export function WinnerCelebrationModalEnhanced({
  isOpen,
  onClose,
  prizeAmount,
  winningSeats,
  winningRow,
  duration = 45,
  totalPrizePool,
  houseFee
}: WinnerCelebrationModalProps) {
  const [timeLeft, setTimeLeft] = useState(duration);
  const [showConfetti, setShowConfetti] = useState(false);
  const [coinAnimation, setCoinAnimation] = useState(false);

  useEffect(() => {
    console.log(`[MODAL] useEffect triggered - isOpen: ${isOpen} @ ${Date.now()}`);
    if (isOpen) {
      console.log(`[MODAL] ===== MODAL MOUNTING @ ${Date.now()} =====`);
      console.log('[MODAL] Props received:', { prizeAmount, winningSeats, winningRow, totalPrizePool, houseFee });
      setTimeLeft(duration);
      setShowConfetti(true);
      setCoinAnimation(true);
      console.log(`[MODAL] Modal state initialized, DOM should be visible now`);
      
      const timer = setInterval(() => {
        setTimeLeft((prev) => {
          if (prev <= 1) {
            clearInterval(timer);
            console.log(`[MODAL] 45-second timer expired, calling onClose @ ${Date.now()}`);
            onClose();
            return 0;
          }
          return prev - 1;
        });
      }, 1000);

      return () => {
        console.log(`[MODAL] Cleanup - clearing timer @ ${Date.now()}`);
        clearInterval(timer);
      };
    } else {
      console.log(`[MODAL] isOpen is false, modal should not render @ ${Date.now()}`);
    }
  }, [isOpen, duration, onClose]);

  if (!isOpen) return null;

  const formatSeats = (seats: number[]) => {
    if (seats.length === 1) return `Seat ${seats[0]}`;
    if (seats.length === 2) return `Seats ${seats[0]} & ${seats[1]}`;
    return `Seats ${seats.slice(0, -1).join(', ')} & ${seats[seats.length - 1]}`;
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-gradient-to-br from-black/95 via-purple-900/90 to-black/95 backdrop-blur-md">
      {/* Animated Gradient Background */}
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-r from-purple-600 via-pink-600 to-blue-600 opacity-20 animate-gradient-shift"></div>
        <div className="absolute inset-0 bg-[url('data:image/svg+xml,%3Csvg%20width%3D%2260%22%20height%3D%2260%22%20viewBox%3D%220%200%2060%2060%22%20xmlns%3D%22http%3A//www.w3.org/2000/svg%22%3E%3Cg%20fill%3D%22none%22%20fill-rule%3D%22evenodd%22%3E%3Cg%20fill%3D%22%239C92AC%22%20fill-opacity%3D%220.05%22%3E%3Cpath%20d%3D%22M36%2034v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2V6h4V4h-4zM6%2034v-4H4v4H0v2h4v4h2v-4h4v-2H6zM6%204V0H4v4H0v2h4v4h2V6h4V4H6z%22/%3E%3C/g%3E%3C/g%3E%3C/svg%3E')] opacity-10"></div>
      </div>

      {/* Floating Light Particles */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        {Array.from({ length: 50 }).map((_, i) => (
          <div
            key={`particle-${i}`}
            className="absolute w-1 h-1 bg-gradient-to-r from-yellow-400 to-white rounded-full animate-float-up"
            style={{
              left: `${Math.random() * 100}%`,
              bottom: `-10px`,
              animationDelay: `${Math.random() * 5}s`,
              animationDuration: `${5 + Math.random() * 5}s`
            }}
          />
        ))}
      </div>

      {/* Coin Rain Animation for Desktop */}
      {coinAnimation && (
        <div className="absolute inset-0 pointer-events-none overflow-hidden hidden lg:block">
          {Array.from({ length: 30 }).map((_, i) => (
            <div
              key={`coin-${i}`}
              className="absolute animate-coin-fall"
              style={{
                left: `${Math.random() * 100}%`,
                top: `-50px`,
                animationDelay: `${Math.random() * 2}s`,
                animationDuration: `${2 + Math.random() * 2}s`
              }}
            >
              <Coins className="w-8 h-8 text-yellow-400 animate-spin" />
            </div>
          ))}
        </div>
      )}

      {/* Lightning Effects for Desktop */}
      <div className="absolute inset-0 pointer-events-none hidden lg:block">
        {Array.from({ length: 5 }).map((_, i) => (
          <div
            key={`lightning-${i}`}
            className="absolute animate-lightning"
            style={{
              left: `${20 + i * 15}%`,
              top: '0',
              animationDelay: `${i * 0.5}s`
            }}
          >
            <Zap className="w-16 h-16 text-yellow-300 opacity-0" />
          </div>
        ))}
      </div>

      {/* Main Modal - Optimized for Mobile and Desktop */}
      <div className="relative max-w-sm sm:max-w-lg lg:max-w-4xl w-full mx-2 sm:mx-4 lg:mx-8 max-h-[95vh] overflow-auto">
        {/* Outer Glow Ring */}
        <div className="absolute inset-0 bg-gradient-to-r from-yellow-400 via-amber-400 to-yellow-400 rounded-2xl lg:rounded-3xl blur-2xl lg:blur-3xl opacity-30 animate-pulse-slow"></div>
        
        {/* Card Container */}
        <div className="relative bg-gradient-to-br from-gray-900 via-purple-900 to-gray-900 rounded-2xl lg:rounded-3xl p-1 animate-modal-slide-up">
          {/* Inner Card */}
          <div className="bg-gradient-to-br from-gray-800 via-gray-900 to-black rounded-2xl lg:rounded-3xl p-4 sm:p-6 lg:p-12">
            
            {/* Timer Badge */}
            <div className="absolute top-3 right-3 lg:top-6 lg:right-6 bg-gradient-to-r from-red-600 to-red-700 rounded-full px-2 py-1 lg:px-4 lg:py-2 text-white text-sm lg:text-base font-bold animate-pulse">
              {timeLeft}s
            </div>

            {/* Content Grid for Desktop */}
            <div className="grid lg:grid-cols-2 gap-4 sm:gap-6 lg:gap-12">
              
              {/* Left Side - Trophy and Title */}
              <div className="text-center lg:text-left space-y-3 sm:space-y-4 lg:space-y-6">
                {/* Animated Trophy */}
                <div className="relative mx-auto lg:mx-0 w-20 h-20 sm:w-28 sm:h-28 lg:w-40 lg:h-40">
                  <div className="absolute inset-0 bg-gradient-to-b from-yellow-400 to-amber-500 rounded-full animate-spin-slow blur-lg lg:blur-xl opacity-50"></div>
                  <div className="absolute inset-0 bg-gradient-to-b from-amber-400 to-yellow-500 rounded-full flex items-center justify-center animate-float">
                    <Trophy className="w-12 h-12 sm:w-16 sm:h-16 lg:w-24 lg:h-24 text-white drop-shadow-2xl" />
                  </div>
                  <Crown className="absolute -top-2 -right-2 sm:-top-3 sm:-right-3 lg:-top-4 lg:-right-4 w-6 h-6 sm:w-8 sm:h-8 lg:w-12 lg:h-12 text-yellow-400 animate-bounce-slow" />
                  <Gem className="absolute -bottom-2 -left-2 sm:-bottom-3 sm:-left-3 lg:-bottom-4 lg:-left-4 w-5 h-5 sm:w-7 sm:h-7 lg:w-10 lg:h-10 text-purple-400 animate-pulse" />
                  <Star className="absolute top-0 left-0 w-4 h-4 sm:w-6 sm:h-6 lg:w-8 lg:h-8 text-amber-400 animate-spin" />
                </div>

                {/* Winner Text */}
                <div className="space-y-1 sm:space-y-2 lg:space-y-3">
                  <h1 className="text-3xl sm:text-4xl lg:text-7xl font-black bg-gradient-to-r from-yellow-400 via-amber-400 to-yellow-400 bg-clip-text text-transparent animate-text-glow">
                    WINNER!
                  </h1>
                  <p className="text-lg sm:text-xl lg:text-3xl font-bold text-white animate-fade-in">
                    🎊 Incredible Victory! 🎊
                  </p>
                  <div className="flex items-center justify-center lg:justify-start gap-2 text-amber-400">
                    <Sparkles className="w-4 h-4 sm:w-5 sm:h-5 lg:w-6 lg:h-6 animate-pulse" />
                    <span className="text-sm sm:text-base lg:text-lg font-medium">Champion Status</span>
                    <Sparkles className="w-4 h-4 sm:w-5 sm:h-5 lg:w-6 lg:h-6 animate-pulse" />
                  </div>
                </div>
              </div>

              {/* Right Side - Prize and Details */}
              <div className="space-y-3 sm:space-y-4 lg:space-y-6">
                {/* Prize Display - Animated Counter */}
                <div className="bg-gradient-to-br from-green-900/50 to-emerald-900/50 rounded-xl lg:rounded-2xl p-3 sm:p-4 lg:p-6 border-2 border-green-400/50 backdrop-blur-sm">
                  <div className="text-center space-y-2 sm:space-y-3 lg:space-y-4">
                    <div className="flex items-center justify-center gap-2 lg:gap-3">
                      <DollarSign className="w-6 h-6 sm:w-8 sm:h-8 lg:w-10 lg:h-10 text-green-400 animate-bounce" />
                      <span className="text-3xl sm:text-4xl lg:text-6xl font-black text-transparent bg-gradient-to-r from-green-400 to-emerald-400 bg-clip-text animate-count-up">
                        {prizeAmount.toFixed(2)}
                      </span>
                    </div>
                    <div className="flex items-center justify-center gap-2 text-green-400">
                      <TrendingUp className="w-4 h-4 sm:w-5 sm:h-5 lg:w-5 lg:h-5" />
                      <span className="text-sm sm:text-base lg:text-lg font-bold">Added to Balance!</span>
                    </div>
                  </div>

                  {/* Prize Breakdown with Animation */}
                  {totalPrizePool && houseFee !== undefined && (
                    <div className="mt-3 sm:mt-4 lg:mt-6 bg-black/30 rounded-lg lg:rounded-xl p-2 sm:p-3 lg:p-4 space-y-1 sm:space-y-2 animate-slide-in">
                      <div className="flex justify-between text-gray-400 text-xs sm:text-sm">
                        <span>Prize Pool:</span>
                        <span className="font-bold text-white">${totalPrizePool.toFixed(2)}</span>
                      </div>
                      <div className="flex justify-between text-gray-400 text-xs sm:text-sm">
                        <span>House (30%):</span>
                        <span className="font-bold text-red-400">-${houseFee.toFixed(2)}</span>
                      </div>
                      <div className="border-t border-green-400/30 pt-1 sm:pt-2 flex justify-between text-green-400 font-bold text-sm sm:text-base lg:text-lg">
                        <span>Your Win:</span>
                        <span className="text-base sm:text-lg lg:text-xl">${prizeAmount.toFixed(2)}</span>
                      </div>
                    </div>
                  )}
                </div>

                {/* Winning Details Card */}
                <div className="bg-gradient-to-br from-purple-900/30 to-blue-900/30 rounded-lg lg:rounded-xl p-3 sm:p-4 lg:p-5 border border-purple-400/30 backdrop-blur-sm">
                  <div className="space-y-2 sm:space-y-3">
                    <div className="flex items-center gap-2 text-purple-300">
                      <Gift className="w-4 h-4 sm:w-5 sm:h-5" />
                      <span className="font-bold text-sm sm:text-base">Winning Details</span>
                    </div>
                    <p className="text-white font-medium text-sm sm:text-base">
                      {formatSeats(winningSeats)}
                    </p>
                    <div className="flex flex-wrap gap-1 sm:gap-2">
                      {winningRow.map((num, i) => (
                        <span
                          key={i}
                          className="px-2 py-1 sm:px-3 sm:py-1 bg-gradient-to-r from-purple-600 to-blue-600 rounded-md lg:rounded-lg text-white text-xs sm:text-sm font-bold animate-number-pop"
                          style={{ animationDelay: `${i * 0.1}s` }}
                        >
                          {num}
                        </span>
                      ))}
                    </div>
                    {winningSeats.length > 1 && (
                      <div className="bg-yellow-500/20 rounded-md lg:rounded-lg p-2 text-yellow-300 text-xs sm:text-sm font-bold animate-pulse">
                        🎯 Multi-Seat Bonus Active! x{winningSeats.length}
                      </div>
                    )}
                  </div>
                </div>

                {/* Action Button */}
                <button
                  onClick={onClose}
                  className="w-full bg-gradient-to-r from-yellow-500 via-amber-500 to-yellow-500 hover:from-yellow-600 hover:via-amber-600 hover:to-yellow-600 text-black font-black text-base sm:text-lg lg:text-xl py-3 sm:py-4 rounded-lg lg:rounded-xl transition-all duration-300 transform hover:scale-105 animate-pulse-slow shadow-2xl"
                >
                  CLAIM & CONTINUE
                </button>
              </div>
            </div>

            {/* Bottom Celebration Text for Desktop */}
            <div className="hidden lg:block mt-8 text-center">
              <p className="text-2xl font-bold bg-gradient-to-r from-pink-400 via-purple-400 to-blue-400 bg-clip-text text-transparent animate-text-shimmer">
                🌟 Legendary Performance! You're on Fire! 🔥
              </p>
            </div>
          </div>
        </div>
      </div>

      <style>{`
        @keyframes gradient-shift {
          0%, 100% { transform: translateX(0%); }
          50% { transform: translateX(-50%); }
        }
        @keyframes float-up {
          0% { transform: translateY(0) scale(0); opacity: 0; }
          10% { transform: translateY(-10vh) scale(1); opacity: 1; }
          90% { transform: translateY(-90vh) scale(1); opacity: 1; }
          100% { transform: translateY(-100vh) scale(0); opacity: 0; }
        }
        @keyframes coin-fall {
          0% { transform: translateY(0) rotateY(0deg); opacity: 0; }
          10% { opacity: 1; }
          90% { opacity: 1; }
          100% { transform: translateY(100vh) rotateY(720deg); opacity: 0; }
        }
        @keyframes lightning {
          0%, 90%, 100% { opacity: 0; transform: scale(1); }
          95% { opacity: 1; transform: scale(1.5); }
        }
        @keyframes modal-slide-up {
          0% { transform: translateY(100px) scale(0.9); opacity: 0; }
          100% { transform: translateY(0) scale(1); opacity: 1; }
        }
        @keyframes text-glow {
          0%, 100% { text-shadow: 0 0 20px rgba(251, 191, 36, 0.5), 0 0 40px rgba(251, 191, 36, 0.3); }
          50% { text-shadow: 0 0 30px rgba(251, 191, 36, 0.8), 0 0 60px rgba(251, 191, 36, 0.5); }
        }
        @keyframes number-pop {
          0% { transform: scale(0) rotate(180deg); }
          50% { transform: scale(1.2) rotate(360deg); }
          100% { transform: scale(1) rotate(360deg); }
        }
        @keyframes text-shimmer {
          0% { background-position: 0% 50%; }
          100% { background-position: 100% 50%; }
        }
        @keyframes bounce-slow {
          0%, 100% { transform: translateY(0); }
          50% { transform: translateY(-10px); }
        }
        @keyframes pulse-slow {
          0%, 100% { opacity: 1; }
          50% { opacity: 0.7; }
        }
        @keyframes spin-slow {
          from { transform: rotate(0deg); }
          to { transform: rotate(360deg); }
        }
        @keyframes float {
          0%, 100% { transform: translateY(0px); }
          50% { transform: translateY(-10px); }
        }
        @keyframes fade-in {
          from { opacity: 0; transform: translateY(10px); }
          to { opacity: 1; transform: translateY(0); }
        }
        @keyframes slide-in {
          from { opacity: 0; transform: translateX(-20px); }
          to { opacity: 1; transform: translateX(0); }
        }
        @keyframes count-up {
          from { transform: scale(0.5); }
          to { transform: scale(1); }
        }
        
        .animate-gradient-shift { animation: gradient-shift 10s ease infinite; }
        .animate-float-up { animation: float-up linear infinite; }
        .animate-coin-fall { animation: coin-fall linear infinite; }
        .animate-lightning { animation: lightning 3s ease-in-out infinite; }
        .animate-modal-slide-up { animation: modal-slide-up 0.5s cubic-bezier(0.68, -0.55, 0.265, 1.55); }
        .animate-text-glow { animation: text-glow 2s ease-in-out infinite; }
        .animate-number-pop { animation: number-pop 0.5s cubic-bezier(0.68, -0.55, 0.265, 1.55) both; }
        .animate-text-shimmer { 
          animation: text-shimmer 3s linear infinite;
          background-size: 200% 100%;
        }
        .animate-bounce-slow { animation: bounce-slow 2s ease-in-out infinite; }
        .animate-pulse-slow { animation: pulse-slow 3s ease-in-out infinite; }
        .animate-spin-slow { animation: spin-slow 6s linear infinite; }
        .animate-float { animation: float 3s ease-in-out infinite; }
        .animate-fade-in { animation: fade-in 0.5s ease-out forwards; }
        .animate-slide-in { animation: slide-in 0.5s ease-out forwards; }
        .animate-count-up { animation: count-up 0.5s cubic-bezier(0.68, -0.55, 0.265, 1.55); }
      `}</style>
    </div>
  );
}
