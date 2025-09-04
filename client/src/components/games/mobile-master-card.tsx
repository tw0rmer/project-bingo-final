import React from 'react';
import { cn } from '@/lib/utils';

interface MobileMasterCardProps {
  calledNumbers: number[];
  currentNumber?: number;
  nextCallIn?: number;
}

export function MobileMasterCard({ calledNumbers, currentNumber, nextCallIn }: MobileMasterCardProps) {
  const isNumberCalled = (num: number) => calledNumbers.includes(num);
  
  // Create 5 columns for number ranges
  const columns = [
    { range: [1, 15] },
    { range: [16, 30] },
    { range: [31, 45] },
    { range: [46, 60] },
    { range: [61, 75] }
  ];

  return (
    <div className="w-full h-full flex flex-col p-3 bg-white/95 backdrop-blur-sm rounded-3xl border-2 border-gray-200/50 shadow-2xl">
      {/* Enhanced Header with Current Number */}
      <div className="flex-shrink-0 text-center mb-4">
        <h3 className="text-lg font-bold text-gray-800 mb-3">Master Card (1-75)</h3>
        
        {/* Enhanced Current Number Display */}
        {currentNumber && (
          <div className="my-3 p-4 bg-gradient-to-r from-green-100 to-emerald-100 border border-green-300 rounded-2xl backdrop-blur-sm">
            <div className="text-2xl font-bold text-green-700">
              Current: {currentNumber}
            </div>
            {nextCallIn !== undefined && (
              <div className="text-sm text-green-600 mt-1">
                Next call in {nextCallIn}s
              </div>
            )}
          </div>
        )}
        
        <div className="flex items-center justify-center gap-6 text-sm mt-3">
          <span className="flex items-center gap-2">
            <div className="w-5 h-5 bg-gradient-to-br from-yellow-400 to-amber-500 rounded-lg border border-yellow-300 shadow-lg"></div>
            <span className="text-gray-700 font-medium">Called</span>
          </span>
          <span className="flex items-center gap-2">
            <div className="w-5 h-5 bg-gradient-to-br from-gray-200 to-gray-300 rounded-lg border border-gray-400 shadow-lg"></div>
            <span className="text-gray-700 font-medium">Not Called</span>
          </span>
        </div>
      </div>

      {/* Horizontal Called Numbers Display */}
      {calledNumbers.length > 0 ? (
        <div className="flex-1 overflow-auto">
          <div className="bg-gradient-to-r from-yellow-50 to-orange-50 rounded-2xl p-4 border border-yellow-200/50">
            <div className="text-lg font-bold text-gray-700 mb-4 flex items-center gap-2 justify-center">
              🔥 Called Numbers ({calledNumbers.length}/75)
            </div>
            
            {/* Horizontal Grid of Called Numbers */}
            <div className="grid grid-cols-8 md:grid-cols-10 gap-2 max-h-64 overflow-y-auto">
              {calledNumbers.map((num, idx) => (
                <div
                  key={idx}
                  className={cn(
                    "px-3 py-2 rounded-xl text-sm font-bold border transition-all duration-300 flex items-center justify-center min-h-10 shadow-lg",
                    idx === calledNumbers.length - 1 
                      ? "bg-gradient-to-br from-red-500 to-red-600 text-white border-red-400 shadow-red-500/50 animate-pulse scale-110 ring-2 ring-red-300" 
                      : "bg-gradient-to-br from-yellow-400 to-amber-500 text-black border-yellow-300 shadow-yellow-500/30"
                  )}
                  data-testid={`called-number-${num}`}
                >
                  {num}
                </div>
              ))}
            </div>
            
            {/* Summary Stats */}
            <div className="grid grid-cols-2 gap-4 mt-4 pt-4 border-t border-yellow-200/50">
              <div className="text-center">
                <div className="text-sm font-bold text-gray-600">Progress</div>
                <div className="text-xl font-black text-orange-600">{Math.round((calledNumbers.length / 75) * 100)}%</div>
              </div>
              <div className="text-center">
                <div className="text-sm font-bold text-gray-600">Last Called</div>
                <div className="text-xl font-black text-red-600">
                  {calledNumbers[calledNumbers.length - 1] || '-'}
                </div>
              </div>
            </div>
          </div>
        </div>
      ) : (
        <div className="flex-1 flex items-center justify-center">
          <div className="text-center p-8">
            <div className="text-6xl mb-4">🎯</div>
            <div className="text-lg font-bold text-gray-600">No numbers called yet</div>
            <div className="text-sm text-gray-500">Game will start soon!</div>
          </div>
        </div>
      )}

      {/* Enhanced Stats Footer */}
      {calledNumbers.length > 0 && (
        <div className="flex-shrink-0 mt-4 bg-gradient-to-r from-blue-100 to-indigo-100 rounded-2xl p-4 border border-blue-300/50 backdrop-blur-sm">
          <div className="grid grid-cols-2 gap-4 text-sm">
            <div className="text-center">
              <div className="font-bold text-blue-700 mb-1">Numbers Called</div>
              <div className="text-2xl font-black text-blue-600">{calledNumbers.length}/75</div>
            </div>
            <div className="text-center">
              <div className="font-bold text-blue-700 mb-1">Last Called</div>
              <div className="text-2xl font-black text-blue-600">
                {calledNumbers[calledNumbers.length - 1] || '-'}
              </div>
            </div>
          </div>
          
          {/* Enhanced Recent numbers */}
          <div className="mt-4 pt-4 border-t border-blue-300/30">
            <div className="text-sm font-bold text-blue-700 text-center mb-3">Recent Numbers</div>
            <div className="flex flex-wrap justify-center gap-2">
              {calledNumbers.slice(-8).reverse().map((num, idx) => (
                <span 
                  key={idx} 
                  className={cn(
                    "px-3 py-2 rounded-xl text-sm font-bold shadow-lg border transition-all duration-300",
                    idx === 0 
                      ? "bg-gradient-to-br from-green-500 to-emerald-600 text-white animate-pulse border-green-400 scale-110" 
                      : "bg-gradient-to-br from-blue-500 to-blue-600 text-white border-blue-400"
                  )}
                >
                  {num}
                </span>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}