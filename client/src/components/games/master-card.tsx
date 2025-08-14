import React from 'react';
import { cn } from "@/lib/utils";

type MasterCardProps = {
  calledNumbers: number[];
  className?: string;
  compact?: boolean; // smaller cells for sidebar
  showHeaders?: boolean; // optional B I N G O headers
};

// Compact 5x15 board (B,I,N,G,O columns). Numbers 1..75.
export const MasterCard: React.FC<MasterCardProps> = ({ calledNumbers, className, compact = true, showHeaders = false }) => {
  const columns = [
    { label: 'B', start: 1, end: 15 },
    { label: 'I', start: 16, end: 30 },
    { label: 'N', start: 31, end: 45 },
    { label: 'G', start: 46, end: 60 },
    { label: 'O', start: 61, end: 75 },
  ];

  return (
    <div className={cn("rounded-md border border-gray-200 bg-white p-2", className)}>
      <div className={cn("grid grid-cols-5 text-center", compact ? "gap-[1px]" : "gap-[2px]") }>
        {columns.map((col) => (
          <div key={col.label} className="flex flex-col gap-[2px]">
            {showHeaders && (
              <div className="h-6 rounded bg-gray-100 text-gray-900 text-[11px] font-semibold flex items-center justify-center border border-gray-200">
                {col.label}
              </div>
            )}
            {Array.from({ length: 15 }, (_, i) => col.start + i).map((num) => {
              const isCalled = calledNumbers.includes(num);
              return (
                <div
                  key={num}
                  className={cn(
                    compact ? "h-5 text-[10px]" : "h-6 text-[10px]",
                    "rounded leading-none flex items-center justify-center select-none",
                    isCalled
                      ? "bg-yellow-200/80 text-gray-900 font-semibold"
                      : "bg-gray-100 text-gray-900 border border-gray-200"
                  )}
                  title={`Number ${num}${isCalled ? ' (called)' : ''}`}
                >
                  {num}
                </div>
              );
            })}
          </div>
        ))}
      </div>
    </div>
  );
};

export default MasterCard;


