import React, { useEffect, useState } from 'react';
import { cn } from '@/lib/utils';
import { Target, Zap, Flame, Star, Trophy } from 'lucide-react';

interface WinningAnticipationProps {
  progress: number;
  numbersNeeded: number[];
  isVisible: boolean;
  className?: string;
  variant?: 'compact' | 'full' | 'floating';
}

export function WinningAnticipation({ 
  progress, 
  numbersNeeded, 
  isVisible, 
  className,
  variant = 'full' 
}: WinningAnticipationProps) {
  const [pulseIntensity, setPulseIntensity] = useState(1);
  const [showSparkles, setShowSparkles] = useState(false);

  useEffect(() => {
    if (isVisible && numbersNeeded.length === 1) {
      // Very close to winning - enhance effects
      setShowSparkles(true);
      const interval = setInterval(() => {
        setPulseIntensity(prev => prev === 1 ? 1.05 : 1);
      }, 200);
      return () => clearInterval(interval);
    } else {
      setShowSparkles(false);
      setPulseIntensity(1);
    }
  }, [isVisible, numbersNeeded.length]);

  if (!isVisible) return null;

  const getProgressLevel = () => {
    if (progress >= 0.9) return 'critical';
    if (progress >= 0.8) return 'high';
    if (progress >= 0.6) return 'medium';
    return 'low';
  };

  const getProgressColor = () => {
    const level = getProgressLevel();
    switch (level) {
      case 'critical': return 'from-red-500 via-orange-500 to-red-500 border-yellow-300';
      case 'high': return 'from-orange-500 to-yellow-500 border-orange-300';
      case 'medium': return 'from-yellow-500 to-blue-500 border-yellow-300';
      case 'low': return 'from-blue-500 to-purple-500 border-blue-300';
    }
  };

  const getProgressIcon = () => {
    const level = getProgressLevel();
    switch (level) {
      case 'critical': return <Flame className="w-4 h-4 animate-pulse" />;
      case 'high': return <Zap className="w-4 h-4 animate-pulse" />;
      case 'medium': return <Star className="w-4 h-4" />;
      case 'low': return <Target className="w-4 h-4" />;
    }
  };

  const getProgressMessage = () => {
    if (numbersNeeded.length === 1) {
      return `🔥 ONE AWAY! Need: ${numbersNeeded[0]} 🔥`;
    } else if (numbersNeeded.length === 2) {
      return `⚡ Almost there! Need: ${numbersNeeded.join(', ')} ⚡`;
    } else if (progress >= 0.8) {
      return `🌟 Getting close! ${numbersNeeded.length} numbers away 🌟`;
    } else if (progress >= 0.6) {
      return `✨ Making progress! ${numbersNeeded.length} numbers away ✨`;
    }
    return `🎯 Keep going! ${numbersNeeded.length} numbers away 🎯`;
  };

  if (variant === 'compact') {
    return (
      <div className={cn("inline-flex items-center gap-2 px-2 py-1 rounded-full text-xs font-medium", className)}>
        {getProgressIcon()}
        <span>{numbersNeeded.length} away</span>
        {progress >= 0.8 && <span className="animate-pulse">⚡</span>}
      </div>
    );
  }

  if (variant === 'floating') {
    return (
      <div className="fixed top-20 left-1/2 -translate-x-1/2 z-50 animate-bounce">
        <div 
          className={cn(
            "bg-gradient-to-r text-white px-6 py-3 rounded-full shadow-2xl animate-pulse border-2",
            getProgressColor()
          )}
          style={{ transform: `scale(${pulseIntensity})` }}
        >
          <div className="flex items-center gap-2 text-lg font-bold">
            {getProgressMessage()}
          </div>
          
          {/* Animated sparkles */}
          {showSparkles && (
            <>
              <div className="absolute -top-1 -right-1 w-3 h-3 bg-yellow-400 rounded-full animate-ping" />
              <div className="absolute -bottom-1 -left-1 w-2 h-2 bg-yellow-400 rounded-full animate-ping" style={{ animationDelay: '0.5s' }} />
              <div className="absolute -top-2 left-1/2 -translate-x-1/2 w-1.5 h-1.5 bg-yellow-400 rounded-full animate-ping" style={{ animationDelay: '1s' }} />
            </>
          )}
        </div>
      </div>
    );
  }

  // Full variant
  return (
    <div className={cn("p-4 rounded-lg border-2 transition-all duration-300", className)}>
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center gap-2">
          {getProgressIcon()}
          <span className="font-semibold text-lg">Winning Progress</span>
        </div>
        <div className="text-right">
          <div className="text-2xl font-bold text-gray-700">
            {Math.round(progress * 100)}%
          </div>
          <div className="text-sm text-gray-500">
            {numbersNeeded.length} numbers needed
          </div>
        </div>
      </div>

      {/* Progress bar */}
      <div className="w-full bg-gray-200 rounded-full h-3 mb-3">
        <div 
          className={cn(
            "h-full rounded-full transition-all duration-500",
            progress >= 0.9 ? "bg-gradient-to-r from-red-500 to-orange-500" :
            progress >= 0.8 ? "bg-gradient-to-r from-orange-500 to-yellow-500" :
            progress >= 0.6 ? "bg-gradient-to-r from-yellow-500 to-blue-500" :
            "bg-gradient-to-r from-blue-500 to-purple-500"
          )}
          style={{ width: `${progress * 100}%` }}
        />
      </div>

      {/* Message */}
      <div className="text-center">
        <p className="text-lg font-bold text-gray-700 mb-2">
          {getProgressMessage()}
        </p>
        
        {/* Numbers needed */}
        {numbersNeeded.length > 0 && (
          <div className="flex items-center justify-center gap-2">
            <span className="text-sm text-gray-600">Need:</span>
            {numbersNeeded.map((num, index) => (
              <span 
                key={index}
                className="px-3 py-1 bg-gray-100 rounded-full text-sm font-bold text-gray-700 border-2 border-gray-300"
              >
                {num}
              </span>
            ))}
          </div>
        )}

        {/* Encouragement */}
        {progress >= 0.8 && (
          <div className="mt-3 p-2 bg-gradient-to-r from-yellow-50 to-orange-50 rounded-lg border border-yellow-200">
            <p className="text-sm font-medium text-yellow-700 flex items-center justify-center gap-2">
              <Trophy className="w-4 h-4 text-yellow-600" />
              <span>You're so close! Keep going!</span>
              <Trophy className="w-4 h-4 text-yellow-600" />
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
