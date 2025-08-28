import React from 'react';
import { cn } from '@/lib/utils';

interface MobileMasterCardProps {
  calledNumbers: number[];
  currentNumber?: number;
  nextCallIn?: number;
}

export function MobileMasterCard({ calledNumbers, currentNumber, nextCallIn }: MobileMasterCardProps) {
  const isNumberCalled = (num: number) => calledNumbers.includes(num);
  
  // Create 5 columns for B, I, N, G, O
  const columns = [
    { letter: 'B', range: [1, 15] },
    { letter: 'I', range: [16, 30] },
    { letter: 'N', range: [31, 45] },
    { letter: 'G', range: [46, 60] },
    { letter: 'O', range: [61, 75] }
  ];

  return (
    <div className="w-full h-full flex flex-col p-1">
      {/* Header with Current Number */}
      <div className="flex-shrink-0 text-center mb-2">
        <h3 className="text-sm font-bold text-gray-900">Master Card (1-75)</h3>
        
        {/* Current Number Display */}
        {currentNumber && (
          <div className="my-2 p-2 bg-green-100 border border-green-300 rounded">
            <div className="text-lg font-bold text-green-800">
              Current: {currentNumber}
            </div>
            {nextCallIn !== undefined && (
              <div className="text-xs text-green-600">
                Next call in {nextCallIn}s
              </div>
            )}
          </div>
        )}
        
        <div className="flex items-center justify-center gap-4 text-xs mt-1">
          <span className="flex items-center gap-1">
            <div className="w-4 h-4 bg-yellow-400 rounded border border-gray-400"></div>
            <span>Called</span>
          </span>
          <span className="flex items-center gap-1">
            <div className="w-4 h-4 bg-gray-100 rounded border border-gray-300"></div>
            <span>Not Called</span>
          </span>
        </div>
      </div>

      {/* Compact Grid */}
      <div className="flex-1 overflow-auto">
        <div className="grid grid-cols-5 gap-[2px] h-full min-h-0">
          {columns.map((col) => (
            <div key={col.letter} className="flex flex-col">
              {/* Column Header */}
              <div className="bg-blue-600 text-white font-bold text-center py-1 text-xs rounded-t">
                {col.letter}
              </div>
              
              {/* Numbers Grid */}
              <div className="flex-1 grid grid-rows-15 gap-[1px]">
                {Array.from({ length: 15 }, (_, i) => {
                  const num = col.range[0] + i;
                  const called = isNumberCalled(num);
                  
                  return (
                    <div
                      key={num}
                      className={cn(
                        "flex items-center justify-center text-xs font-medium rounded-sm transition-all",
                        called 
                          ? "bg-yellow-400 text-black font-bold border border-yellow-600" 
                          : "bg-gray-100 text-gray-700 border border-gray-300"
                      )}
                      data-testid={`master-number-${num}`}
                    >
                      {num}
                    </div>
                  );
                })}
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Stats Footer */}
      {calledNumbers.length > 0 && (
        <div className="flex-shrink-0 mt-2 bg-blue-50 rounded p-2 border border-blue-200">
          <div className="grid grid-cols-2 gap-2 text-xs">
            <div className="text-center">
              <div className="font-semibold text-blue-800">Numbers Called</div>
              <div className="text-lg font-bold text-blue-600">{calledNumbers.length}/75</div>
            </div>
            <div className="text-center">
              <div className="font-semibold text-blue-800">Last Called</div>
              <div className="text-lg font-bold text-blue-600">
                {calledNumbers[calledNumbers.length - 1] || '-'}
              </div>
            </div>
          </div>
          
          {/* Recent numbers */}
          <div className="mt-2 pt-2 border-t border-blue-200">
            <div className="text-xs font-semibold text-blue-800 text-center mb-1">Recent Numbers</div>
            <div className="flex flex-wrap justify-center gap-1">
              {calledNumbers.slice(-8).reverse().map((num, idx) => (
                <span 
                  key={idx} 
                  className={cn(
                    "px-2 py-1 rounded text-xs font-bold",
                    idx === 0 
                      ? "bg-green-600 text-white animate-pulse" 
                      : "bg-blue-600 text-white"
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