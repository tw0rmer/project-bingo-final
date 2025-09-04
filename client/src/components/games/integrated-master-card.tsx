import React from 'react';
import { cn } from "@/lib/utils";
import { Eye, Timer } from "lucide-react";

interface IntegratedMasterCardProps {
  calledNumbers: number[];
  currentNumber?: number;
  nextCallIn?: number;
}

export function IntegratedMasterCard({ calledNumbers, currentNumber, nextCallIn }: IntegratedMasterCardProps) {
  const isNumberCalled = (num: number) => calledNumbers.includes(num);
  
  // Create 5 columns for number ranges (B, I, N, G, O)
  const columns = [
    { range: [1, 15], letter: 'B' },
    { range: [16, 30], letter: 'I' },
    { range: [31, 45], letter: 'N' },
    { range: [46, 60], letter: 'G' },
    { range: [61, 75], letter: 'O' }
  ];

  return (
    <div className="w-full h-full bg-gradient-to-r from-blue-50 to-purple-50 border border-blue-200 rounded-xl p-2 shadow-sm flex flex-col">
      {/* Header */}
      <div className="flex items-center justify-between mb-2">
        <div className="flex items-center gap-1">
          <Eye size={12} className="text-blue-600" />
          <h4 className="text-xs font-semibold text-gray-800">Called Numbers</h4>
        </div>
        {currentNumber && (
          <div className="flex items-center gap-1 bg-green-100 rounded px-1 py-0.5">
            <div className="text-xs font-bold text-green-700">{currentNumber}</div>
            {nextCallIn !== undefined && (
              <div className="flex items-center gap-1">
                <Timer size={10} className="text-green-600" />
                <span className="text-xs text-green-600">{nextCallIn}s</span>
              </div>
            )}
          </div>
        )}
      </div>

      {/* Ultra Compact Master Card Grid - Show all numbers in smaller format */}
      <div className="flex-1 grid grid-cols-5 gap-0.5">
        {columns.map((column, colIndex) => (
          <div key={colIndex} className="space-y-0.5">
            {/* Column Header */}
            <div className="text-center">
              <div className="text-xs font-bold text-gray-700 bg-white/80 rounded px-0.5 py-0.5">
                {column.letter}
              </div>
            </div>
            
            {/* Numbers - Show all 15 numbers in very compact format */}
            {Array.from({ length: column.range[1] - column.range[0] + 1 }, (_, i) => {
              const num = column.range[0] + i;
              const called = isNumberCalled(num);
              return (
                <div
                  key={num}
                  className={cn(
                    "h-3 flex items-center justify-center text-xs font-bold rounded transition-all duration-200",
                    called
                      ? "bg-gradient-to-br from-yellow-400 to-amber-500 text-white shadow-sm"
                      : "bg-white/60 text-gray-600 border border-gray-200"
                  )}
                >
                  {num}
                </div>
              );
            })}
          </div>
        ))}
      </div>

      {/* Compact Legend */}
      <div className="flex items-center justify-center gap-2 mt-2 text-xs">
        <div className="flex items-center gap-1">
          <div className="w-2 h-2 bg-gradient-to-br from-yellow-400 to-amber-500 rounded border border-yellow-300"></div>
          <span className="text-gray-600">Called</span>
        </div>
        <div className="flex items-center gap-1">
          <div className="w-2 h-2 bg-white/60 border border-gray-200 rounded"></div>
          <span className="text-gray-600">Not Called</span>
        </div>
      </div>
    </div>
  );
}
