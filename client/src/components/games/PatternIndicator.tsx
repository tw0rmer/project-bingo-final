import React, { useEffect, useState } from 'react';
import { TrendingUp, Target, Award, Zap, Star, Flame } from 'lucide-react';
import { cn } from '@/lib/utils';
import { PatternProgress } from '../../utils/patternDetection';

interface PatternIndicatorProps {
  patterns: PatternProgress[];
  className?: string;
  compact?: boolean;
}

export function PatternIndicator({ patterns, className, compact = false }: PatternIndicatorProps) {
  const [showOneAway, setShowOneAway] = useState(false);
  const [pulseIntensity, setPulseIntensity] = useState(1);

  // Get the closest patterns to winning - show earlier for anticipation
  const closePatterns = patterns
    .filter(p => !p.isComplete && p.progress >= 0.4) // Show when 40% complete (2/5 numbers)
    .sort((a, b) => b.progress - a.progress)
    .slice(0, 3);
  
  if (closePatterns.length === 0) return null;

  // Enhanced pulse effect for very close patterns
  useEffect(() => {
    if (closePatterns[0]?.numbersNeeded.length === 1) {
      setShowOneAway(true);
      const interval = setInterval(() => {
        setPulseIntensity(prev => prev === 1 ? 1.1 : 1);
      }, 300);
      return () => clearInterval(interval);
    } else {
      setShowOneAway(false);
      setPulseIntensity(1);
    }
  }, [closePatterns]);
  
  const getPatternIcon = (pattern: string) => {
    switch (pattern) {
      case 'row': return '➡️';
      case 'column': return '⬇️';
      case 'diagonal': return '↘️';
      case 'corners': return '⚡';
      default: return '🎯';
    }
  };
  
  const getProgressColor = (progress: number) => {
    if (progress >= 0.9) return 'text-red-500 bg-red-50 border-red-300 animate-pulse shadow-lg shadow-red-500/50';
    if (progress >= 0.8) return 'text-orange-500 bg-orange-50 border-orange-300 animate-pulse';
    if (progress >= 0.7) return 'text-yellow-500 bg-yellow-50 border-yellow-300';
    if (progress >= 0.6) return 'text-amber-500 bg-amber-50 border-amber-300';
    if (progress >= 0.5) return 'text-blue-500 bg-blue-50 border-blue-300';
    return 'text-gray-500 bg-gray-50 border-gray-300';
  };

  const getProgressEmoji = (progress: number) => {
    if (progress >= 0.9) return '🔥';
    if (progress >= 0.8) return '⚡';
    if (progress >= 0.7) return '🌟';
    if (progress >= 0.6) return '✨';
    if (progress >= 0.5) return '💫';
    return '🎯';
  };
  
  if (compact) {
    const best = closePatterns[0];
    if (!best) return null;
    
    return (
      <div className={cn("inline-flex items-center gap-1", className)} data-testid="pattern-indicator-compact">
        <span className="text-xs">{getPatternIcon(best.pattern)}</span>
        <span className="text-xs font-bold text-gray-700">
          {best.numbersNeeded.length} away!
        </span>
        {best.progress >= 0.8 && (
          <span className="text-xs animate-pulse">⚡</span>
        )}
      </div>
    );
  }
  
  return (
    <div className={cn("space-y-2", className)} data-testid="pattern-indicator">
      <div className="flex items-center gap-2 text-sm font-semibold text-gray-700">
        <Target className="w-4 h-4" />
        <span>Near Win Patterns</span>
        {closePatterns[0]?.progress >= 0.8 && (
          <span className="text-lg animate-bounce">🎯</span>
        )}
      </div>
      
      <div className="space-y-1">
        {closePatterns.map((pattern, index) => (
          <div
            key={`${pattern.pattern}-${index}`}
            className={cn(
              "relative flex items-center justify-between px-3 py-2 rounded-lg border transition-all duration-300",
              getProgressColor(pattern.progress)
            )}
          >
            <div className="flex items-center gap-2">
              <span className="text-lg">{getPatternIcon(pattern.pattern)}</span>
              <span className="text-xs font-medium capitalize">
                {pattern.pattern}
              </span>
              <span className="text-sm animate-pulse">
                {getProgressEmoji(pattern.progress)}
              </span>
            </div>
            
            <div className="flex items-center gap-2">
              <div className="flex flex-col items-end">
                <span className="text-xs font-bold">
                  {pattern.numbersNeeded.length} to go
                </span>
                <span className="text-[10px] opacity-75">
                  {Math.round(pattern.progress * 100)}% complete
                </span>
              </div>
              
              {pattern.progress >= 0.8 && (
                <Zap className="w-3 h-3 animate-pulse text-orange-500" />
              )}
              {pattern.progress >= 0.9 && (
                <Flame className="w-3 h-3 animate-pulse text-red-500" />
              )}
            </div>
            
            {/* Enhanced Progress bar */}
            <div className="absolute bottom-0 left-0 right-0 h-1 bg-gray-200 rounded-b-lg overflow-hidden">
              <div
                className="h-full bg-current opacity-50 transition-all duration-500"
                style={{ width: `${pattern.progress * 100}%` }}
              />
            </div>
          </div>
        ))}
      </div>
      
      {/* Lucky numbers hint with enhanced styling */}
      {closePatterns[0]?.numbersNeeded.length <= 2 && (
        <div className="mt-2 p-2 bg-gradient-to-r from-purple-50 to-pink-50 rounded-lg border border-purple-200 animate-pulse">
          <p className="text-xs font-medium text-purple-700 flex items-center gap-1">
            <span>🍀</span>
            <span>Need: {closePatterns[0].numbersNeeded.join(', ')}</span>
            <span>🍀</span>
          </p>
        </div>
      )}
      
      {/* Enhanced ONE AWAY banner with better positioning and effects */}
      {showOneAway && closePatterns[0]?.numbersNeeded.length === 1 && (
        <div className="fixed top-20 left-1/2 -translate-x-1/2 z-50 animate-bounce">
          <div 
            className="bg-gradient-to-r from-red-600 via-orange-500 to-red-600 text-white px-6 py-3 rounded-full shadow-2xl animate-pulse border-2 border-yellow-300"
            style={{ transform: `scale(${pulseIntensity})` }}
          >
            <p className="text-lg font-bold flex items-center gap-2">
              <span className="animate-spin">🔥</span>
              <span>ONE AWAY! Need: {closePatterns[0].numbersNeeded[0]}</span>
              <span className="animate-spin">🔥</span>
            </p>
            <div className="absolute -top-1 -right-1 w-3 h-3 bg-yellow-400 rounded-full animate-ping" />
            <div className="absolute -bottom-1 -left-1 w-2 h-2 bg-yellow-400 rounded-full animate-ping" style={{ animationDelay: '0.5s' }} />
          </div>
        </div>
      )}

      {/* Additional encouragement for close patterns */}
      {closePatterns[0]?.progress >= 0.8 && closePatterns[0]?.numbersNeeded.length > 1 && (
        <div className="mt-2 p-2 bg-gradient-to-r from-yellow-50 to-orange-50 rounded-lg border border-yellow-200">
          <p className="text-xs font-medium text-yellow-700 flex items-center gap-1">
            <span>⚡</span>
            <span>Almost there! Keep going!</span>
            <span>⚡</span>
          </p>
        </div>
      )}
    </div>
  );
}