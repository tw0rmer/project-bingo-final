import React from 'react';
import { cn } from '@/lib/utils';
import { Users, Trophy, Clock } from 'lucide-react';

interface MobilePlayersViewProps {
  participants: any[];
  maxSeats: number;
  currentUserId: number;
  winnerSeatNumber?: number;
}

export function MobilePlayersView({ 
  participants, 
  maxSeats, 
  currentUserId, 
  winnerSeatNumber 
}: MobilePlayersViewProps) {
  // Group seats by status
  const occupiedSeats = participants.map(p => p.seatNumber);
  const availableSeats = Array.from({ length: maxSeats }, (_, i) => i + 1)
    .filter(seat => !occupiedSeats.includes(seat));

  return (
    <div className="w-full h-full flex flex-col p-2">
      {/* Header */}
      <div className="flex-shrink-0 bg-gradient-to-r from-purple-50 to-blue-50 rounded-lg p-2 mb-2">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Users size={16} className="text-purple-600" />
            <span className="text-sm font-bold text-gray-900">
              Players ({participants.length}/{maxSeats})
            </span>
          </div>
          <div className="text-xs text-gray-600">
            {availableSeats.length} seats available
          </div>
        </div>
      </div>

      {/* Players List - Compact View */}
      <div className="flex-1 overflow-y-auto space-y-1">
        {participants.length > 0 ? (
          <>
            {/* Active Players */}
            <div className="space-y-1">
              {participants.map((participant) => {
                const isMe = participant.userId === currentUserId;
                const isWinner = winnerSeatNumber === participant.seatNumber;
                
                return (
                  <div 
                    key={participant.id} 
                    className={cn(
                      "flex items-center justify-between rounded-lg p-2 border transition-all",
                      isWinner && "ring-2 ring-yellow-400 bg-yellow-50 border-yellow-300 animate-pulse",
                      isMe && !isWinner && "bg-green-50 border-green-300",
                      !isMe && !isWinner && "bg-gray-50 border-gray-200 hover:bg-gray-100"
                    )}
                    data-testid={`player-card-${participant.seatNumber}`}
                  >
                    <div className="flex items-center gap-2">
                      {/* Seat Number Badge */}
                      <div className={cn(
                        "w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold",
                        isWinner && "bg-yellow-400 text-black",
                        isMe && !isWinner && "bg-green-600 text-white",
                        !isMe && !isWinner && "bg-gray-600 text-white"
                      )}>
                        {participant.seatNumber}
                      </div>
                      
                      {/* Player Info */}
                      <div className="min-w-0">
                        <div className="flex items-center gap-1">
                          <span className="font-medium text-xs text-gray-900 truncate">
                            {participant.user?.email?.split('@')[0] || 'Unknown'}
                          </span>
                          {isMe && (
                            <span className="text-[10px] bg-green-600 text-white px-1 rounded">YOU</span>
                          )}
                          {isWinner && (
                            <Trophy size={12} className="text-yellow-500" />
                          )}
                        </div>
                        <div className="flex items-center gap-1 text-[10px] text-gray-500">
                          <Clock size={10} />
                          <span>
                            {new Date(participant.joinedAt).toLocaleTimeString([], { 
                              hour: '2-digit', 
                              minute: '2-digit' 
                            })}
                          </span>
                        </div>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>

            {/* Available Seats Summary */}
            {availableSeats.length > 0 && (
              <div className="mt-2 pt-2 border-t border-gray-200">
                <div className="text-xs font-medium text-gray-600 mb-1">Available Seats:</div>
                <div className="flex flex-wrap gap-1">
                  {availableSeats.slice(0, 10).map(seat => (
                    <div 
                      key={seat}
                      className="w-7 h-7 bg-white border border-gray-300 rounded flex items-center justify-center text-xs text-gray-600"
                    >
                      {seat}
                    </div>
                  ))}
                  {availableSeats.length > 10 && (
                    <div className="px-2 py-1 text-xs text-gray-500">
                      +{availableSeats.length - 10} more
                    </div>
                  )}
                </div>
              </div>
            )}
          </>
        ) : (
          <div className="flex flex-col items-center justify-center h-full text-center p-4">
            <Users size={32} className="text-gray-300 mb-2" />
            <p className="text-gray-500 text-sm font-medium">No players yet</p>
            <p className="text-gray-400 text-xs mt-1">Be the first to join!</p>
          </div>
        )}
      </div>
    </div>
  );
}