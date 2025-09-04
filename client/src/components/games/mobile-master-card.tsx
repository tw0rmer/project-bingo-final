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

      {/* Enhanced Compact Grid */}
      <div className="flex-1 overflow-auto">
        <div className="grid grid-cols-5 gap-[3px] h-full min-h-0">
          {columns.map((col, colIndex) => {
            const gradients = [
              'from-red-500 to-red-600',      // 1-15
              'from-orange-500 to-orange-600', // 16-30
              'from-yellow-500 to-yellow-600', // 31-45
              'from-green-500 to-green-600',   // 46-60
              'from-blue-500 to-blue-600'     // 61-75
            ];
            return (
              <div key={colIndex} className="flex flex-col">
                {/* Enhanced Column Header */}
                <div className={`bg-gradient-to-br ${gradients[colIndex]} text-white font-bold text-center py-2 text-sm rounded-t-2xl shadow-lg border border-white/20`}>
                  {col.range[0]}-{col.range[1]}
                </div>
                
                {/* Enhanced Numbers Grid */}
                <div className="flex-1 grid grid-rows-15 gap-[2px]">
                  {Array.from({ length: 15 }, (_, i) => {
                    const num = col.range[0] + i;
                    const called = isNumberCalled(num);
                    
                    return (
                      <div
                        key={num}
                        className={cn(
                          "flex items-center justify-center text-sm font-bold rounded-lg transition-all duration-300 shadow-sm border",
                          called 
                            ? "bg-gradient-to-br from-yellow-400 to-amber-500 text-black border-yellow-300 shadow-yellow-500/30 scale-105" 
                            : "bg-gradient-to-br from-gray-100 to-gray-200 text-gray-800 border-gray-300"
                        )}
                        data-testid={`master-number-${num}`}
                      >
                        {num}
                      </div>
                    );
                  })}
                </div>
              </div>
            );
          })}
        </div>
      </div>

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