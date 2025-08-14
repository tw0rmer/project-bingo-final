import React from 'react';
import { cn } from '@/lib/utils';
import { DollarSign, Users, Wifi, Play, Pause, CheckCircle, AlertCircle } from 'lucide-react';

interface MobileInfoViewProps {
  lobby: any;
  gameStatus: string;
  isConnected: boolean;
  isPaused: boolean;
  calledNumbers: number[];
}

export function MobileInfoView({ 
  lobby, 
  gameStatus, 
  isConnected, 
  isPaused,
  calledNumbers 
}: MobileInfoViewProps) {
  return (
    <div className="w-full h-full flex flex-col p-2">
      {/* Lobby Header */}
      <div className="flex-shrink-0 bg-gradient-to-r from-indigo-50 to-purple-50 rounded-lg p-3 mb-2">
        <div className="text-center">
          <h3 className="text-base font-bold text-gray-900">{lobby.name}</h3>
          <p className="text-xs text-gray-600">Lobby #{lobby.id}</p>
        </div>
      </div>

      {/* Info Grid */}
      <div className="flex-1 overflow-y-auto space-y-2">
        {/* Entry Fee & Players */}
        <div className="grid grid-cols-2 gap-2">
          <div className="bg-white rounded-lg border border-gray-200 p-3">
            <div className="flex items-center justify-between mb-1">
              <DollarSign size={14} className="text-green-600" />
              <span className="text-xs text-gray-500">Entry</span>
            </div>
            <div className="text-lg font-bold text-gray-900">${lobby.entryFee}</div>
            <div className="text-[10px] text-gray-500">Per seat</div>
          </div>
          
          <div className="bg-white rounded-lg border border-gray-200 p-3">
            <div className="flex items-center justify-between mb-1">
              <Users size={14} className="text-blue-600" />
              <span className="text-xs text-gray-500">Players</span>
            </div>
            <div className="text-lg font-bold text-gray-900">
              {lobby.seatsTaken}/{lobby.maxSeats}
            </div>
            <div className="text-[10px] text-gray-500">
              {lobby.maxSeats - lobby.seatsTaken} available
            </div>
          </div>
        </div>

        {/* Game Status */}
        <div className="bg-white rounded-lg border border-gray-200 p-3">
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs font-medium text-gray-600">Game Status</span>
            <div className={cn(
              "flex items-center gap-1",
              isConnected ? "text-green-600" : "text-red-600"
            )}>
              <Wifi size={12} />
              <span className="text-[10px] font-medium">
                {isConnected ? "Connected" : "Offline"}
              </span>
            </div>
          </div>
          
          <div className="flex items-center justify-center gap-2">
            {gameStatus === 'waiting' && (
              <>
                <AlertCircle size={20} className="text-yellow-500" />
                <div>
                  <div className="text-sm font-bold text-yellow-600">Waiting</div>
                  <div className="text-[10px] text-gray-500">Game will start soon</div>
                </div>
              </>
            )}
            {gameStatus === 'active' && !isPaused && (
              <>
                <Play size={20} className="text-green-600 animate-pulse" />
                <div>
                  <div className="text-sm font-bold text-green-600">Playing</div>
                  <div className="text-[10px] text-gray-500">Game in progress</div>
                </div>
              </>
            )}
            {gameStatus === 'active' && isPaused && (
              <>
                <Pause size={20} className="text-orange-600" />
                <div>
                  <div className="text-sm font-bold text-orange-600">Paused</div>
                  <div className="text-[10px] text-gray-500">Game paused</div>
                </div>
              </>
            )}
            {gameStatus === 'finished' && (
              <>
                <CheckCircle size={20} className="text-purple-600" />
                <div>
                  <div className="text-sm font-bold text-purple-600">Finished</div>
                  <div className="text-[10px] text-gray-500">Game completed</div>
                </div>
              </>
            )}
          </div>
        </div>

        {/* Prize Pool */}
        <div className="bg-gradient-to-r from-yellow-50 to-amber-50 rounded-lg border border-yellow-300 p-3">
          <div className="text-center">
            <div className="text-xs font-medium text-yellow-800 mb-1">Prize Pool</div>
            <div className="text-2xl font-bold text-yellow-600">
              ${(lobby.entryFee * lobby.seatsTaken * 0.9).toFixed(0)}
            </div>
            <div className="text-[10px] text-yellow-700 mt-1">
              Winner takes all!
            </div>
          </div>
        </div>

        {/* Game Progress */}
        {calledNumbers.length > 0 && (
          <div className="bg-blue-50 rounded-lg border border-blue-200 p-3">
            <div className="text-xs font-medium text-blue-800 mb-2">Game Progress</div>
            
            <div className="space-y-2">
              {/* Progress Bar */}
              <div>
                <div className="flex justify-between text-[10px] text-gray-600 mb-1">
                  <span>Numbers Called</span>
                  <span>{calledNumbers.length}/75</span>
                </div>
                <div className="h-2 bg-gray-200 rounded-full overflow-hidden">
                  <div 
                    className="h-full bg-blue-600 transition-all duration-300"
                    style={{ width: `${(calledNumbers.length / 75) * 100}%` }}
                  />
                </div>
              </div>

              {/* Last 5 Numbers */}
              <div>
                <div className="text-[10px] font-medium text-gray-600 mb-1">
                  Recent Numbers
                </div>
                <div className="flex gap-1 justify-center">
                  {calledNumbers.slice(-5).reverse().map((num, idx) => (
                    <div
                      key={idx}
                      className={cn(
                        "w-8 h-8 rounded flex items-center justify-center text-xs font-bold",
                        idx === 0 
                          ? "bg-green-600 text-white animate-pulse" 
                          : "bg-blue-600 text-white"
                      )}
                    >
                      {num}
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Rules Summary */}
        <div className="bg-gray-50 rounded-lg border border-gray-200 p-3">
          <div className="text-xs font-medium text-gray-700 mb-2">Quick Rules</div>
          <ul className="space-y-1 text-[10px] text-gray-600">
            <li className="flex items-start gap-1">
              <span className="text-green-600">✓</span>
              <span>Match all 5 numbers in your row to win</span>
            </li>
            <li className="flex items-start gap-1">
              <span className="text-green-600">✓</span>
              <span>Click "BINGO!" when you have a winning row</span>
            </li>
            <li className="flex items-start gap-1">
              <span className="text-green-600">✓</span>
              <span>Winner takes 90% of the prize pool</span>
            </li>
          </ul>
        </div>
      </div>
    </div>
  );
}