import React from 'react';
import { TrendingUp, Target, Award, Zap } from 'lucide-react';
import { cn } from '@/lib/utils';
import { PatternProgress } from '../../utils/patternDetection';

interface PatternIndicatorProps {
  patterns: PatternProgress[];
  className?: string;
  compact?: boolean;
}

export function PatternIndicator({ patterns, className, compact = false }: PatternIndicatorProps) {
  // Get the closest patterns to winning
  const closePatterns = patterns
    .filter(p => !p.isComplete && p.progress >= 0.6)
    .sort((a, b) => b.progress - a.progress)
    .slice(0, 3);
  
  if (closePatterns.length === 0) return null;
  
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
    if (progress >= 0.9) return 'text-red-500 bg-red-50 border-red-300 animate-pulse';
    if (progress >= 0.8) return 'text-orange-500 bg-orange-50 border-orange-300';
    if (progress >= 0.7) return 'text-yellow-500 bg-yellow-50 border-yellow-300';
    return 'text-blue-500 bg-blue-50 border-blue-300';
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
      </div>
    );
  }
  
  return (
    <div className={cn("space-y-2", className)} data-testid="pattern-indicator">
      <div className="flex items-center gap-2 text-sm font-semibold text-gray-700">
        <Target className="w-4 h-4" />
        <span>Near Win Patterns</span>
      </div>
      
      <div className="space-y-1">
        {closePatterns.map((pattern, index) => (
          <div
            key={`${pattern.pattern}-${index}`}
            className={cn(
              "flex items-center justify-between px-3 py-2 rounded-lg border transition-all duration-300",
              getProgressColor(pattern.progress)
            )}
          >
            <div className="flex items-center gap-2">
              <span className="text-lg">{getPatternIcon(pattern.pattern)}</span>
              <span className="text-xs font-medium capitalize">
                {pattern.pattern}
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
                <Zap className="w-3 h-3 animate-pulse" />
              )}
            </div>
            
            {/* Progress bar */}
            <div className="absolute bottom-0 left-0 right-0 h-1 bg-gray-200 rounded-b-lg overflow-hidden">
              <div
                className="h-full bg-current opacity-50 transition-all duration-500"
                style={{ width: `${pattern.progress * 100}%` }}
              />
            </div>
          </div>
        ))}
      </div>
      
      {/* Lucky numbers hint */}
      {closePatterns[0]?.numbersNeeded.length <= 2 && (
        <div className="mt-2 p-2 bg-gradient-to-r from-purple-50 to-pink-50 rounded-lg border border-purple-200">
          <p className="text-xs font-medium text-purple-700">
            🍀 Need: {closePatterns[0].numbersNeeded.join(', ')}
          </p>
        </div>
      )}
    </div>
  );
}