import React from 'react';
import { X, Target, TrendingUp, Lightbulb } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';

interface PatternIndicatorPopupProps {
  isOpen: boolean;
  onClose: () => void;
  onDoNotShowAgain: () => void;
  className?: string;
}

export function PatternIndicatorPopup({ 
  isOpen, 
  onClose, 
  onDoNotShowAgain,
  className 
}: PatternIndicatorPopupProps) {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
      <div className={cn(
        "relative max-w-md w-full bg-white rounded-xl shadow-2xl border border-gray-200 overflow-hidden",
        "animate-in fade-in-0 zoom-in-95 duration-300",
        className
      )}>
        {/* Header */}
        <div className="bg-gradient-to-r from-purple-600 to-blue-600 p-6 text-white relative">
          <button
            onClick={onClose}
            className="absolute top-4 right-4 p-1 hover:bg-white/20 rounded-full transition-colors"
            data-testid="button-close-popup"
          >
            <X className="w-5 h-5" />
          </button>
          
          <div className="flex items-center gap-3">
            <div className="p-2 bg-white/20 rounded-lg">
              <Target className="w-6 h-6" />
            </div>
            <div>
              <h2 className="text-xl font-bold">Pattern Indicator</h2>
              <p className="text-purple-100 text-sm">Track your progress to winning!</p>
            </div>
          </div>
        </div>

        {/* Content */}
        <div className="p-6 space-y-4">
          <div className="flex items-start gap-3">
            <div className="p-2 bg-blue-50 rounded-lg">
              <TrendingUp className="w-5 h-5 text-blue-600" />
            </div>
            <div>
              <h3 className="font-semibold text-gray-900">Live Progress Tracking</h3>
              <p className="text-sm text-gray-600">
                See how close you are to completing winning patterns in real-time as numbers are called.
              </p>
            </div>
          </div>

          <div className="flex items-start gap-3">
            <div className="p-2 bg-green-50 rounded-lg">
              <Lightbulb className="w-5 h-5 text-green-600" />
            </div>
            <div>
              <h3 className="font-semibold text-gray-900">Smart Hints</h3>
              <p className="text-sm text-gray-600">
                Get hints about which numbers you need to complete your patterns and win the game.
              </p>
            </div>
          </div>

          {/* Visual Example */}
          <div className="bg-gradient-to-r from-yellow-50 to-orange-50 border border-yellow-200 rounded-lg p-4">
            <div className="flex items-center gap-2 mb-2">
              <span className="text-lg">➡️</span>
              <span className="text-sm font-medium text-orange-700">Row Pattern</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-xs text-orange-600">2 numbers to go</span>
              <span className="text-xs font-bold text-orange-700">80% complete</span>
            </div>
            <div className="mt-2 h-1 bg-orange-200 rounded-full overflow-hidden">
              <div className="h-full bg-orange-500 rounded-full w-4/5 transition-all duration-500" />
            </div>
          </div>

          <div className="text-center pt-2">
            <p className="text-xs text-gray-500">
              Look for the pattern indicator in the bottom-right corner during games!
            </p>
          </div>
        </div>

        {/* Footer */}
        <div className="bg-gray-50 p-4 flex gap-3">
          <Button
            onClick={onDoNotShowAgain}
            variant="outline"
            size="sm"
            className="flex-1 text-gray-600 hover:text-gray-800"
            data-testid="button-do-not-show-again"
          >
            Don't show again
          </Button>
          <Button
            onClick={onClose}
            size="sm"
            className="flex-1 bg-purple-600 hover:bg-purple-700 text-white"
            data-testid="button-got-it"
          >
            Got it!
          </Button>
        </div>
      </div>
    </div>
  );
}