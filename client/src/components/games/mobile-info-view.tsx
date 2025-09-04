import React from 'react';
import { cn } from '@/lib/utils';
import { DollarSign, Users, Wifi, Play, Pause, CheckCircle, AlertCircle } from 'lucide-react';

interface MobileInfoViewProps {
  lobby: any;
  gameStatus: string;
  isConnected: boolean;
  isPaused: boolean;
  calledNumbers: number[];
  currentUserParticipation?: any;
  participants?: any[];
  onLeaveLobby?: () => void;
  user?: any;
  gameId?: number;
  currentCallSpeed?: number;
}

export function MobileInfoView({ 
  lobby, 
  gameStatus, 
  isConnected, 
  isPaused,
  calledNumbers,
  currentUserParticipation,
  participants = [],
  onLeaveLobby,
  user,
  gameId,
  currentCallSpeed = 5
}: MobileInfoViewProps) {
  
  const handleSpeedChange = async (seconds: number) => {
    if (!gameId || !user?.isAdmin) return;
    
    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`/api/admin/games/${gameId}/set-interval`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ seconds })
      });
      
      if (!response.ok) {
        const error = await response.json();
        console.error('Failed to change speed:', error.message);
      } else {
        console.log(`[ADMIN] Changed call speed to ${seconds} seconds`);
      }
    } catch (error) {
      console.error('[ADMIN] Error changing speed:', error);
    }
  };
  return (
    <div className="w-full h-full flex flex-col p-4 bg-white/95 backdrop-blur-sm rounded-3xl border-2 border-gray-200/50 shadow-2xl">
      {/* Enhanced Lobby Header */}
      <div className="flex-shrink-0 bg-gradient-to-r from-indigo-100 to-purple-100 rounded-2xl p-4 mb-4 border border-indigo-200/50">
        <div className="text-center">
          <h3 className="text-lg font-bold text-gray-800">{lobby.name}</h3>
          <p className="text-sm text-gray-600">Lobby #{lobby.id}</p>
        </div>
      </div>

      {/* Info Grid */}
      <div className="flex-1 overflow-y-auto space-y-2">
        {/* Enhanced Entry Fee & Game Info */}
        <div className="grid grid-cols-2 gap-3">
          <div className="bg-gray-100/80 rounded-2xl border border-green-300/50 p-4 backdrop-blur-sm">
            <div className="flex items-center justify-between mb-2">
              <DollarSign size={16} className="text-green-600" />
              <span className="text-sm text-gray-700">Entry</span>
            </div>
            <div className="text-xl font-bold text-green-700">${lobby.entryFee}</div>
            <div className="text-xs text-gray-600">Per seat</div>
          </div>
          
          <div className="bg-gray-100/80 rounded-2xl border border-blue-300/50 p-4 backdrop-blur-sm">
            <div className="flex items-center justify-between mb-2">
              <Users size={16} className="text-blue-600" />
              <span className="text-sm text-gray-700">My Seats</span>
            </div>
            <div className="text-xl font-bold text-blue-700">
              {currentUserParticipation?.length || 0}/2
            </div>
            <div className="text-xs text-gray-600">
              seats selected
            </div>
          </div>
        </div>

        {/* Enhanced Game Status */}
        <div className="bg-gray-100/80 rounded-2xl border border-purple-300/50 p-4 backdrop-blur-sm">
          <div className="flex items-center justify-between mb-3">
            <span className="text-sm font-medium text-gray-700">Game Status</span>
            <div className={cn(
              "flex items-center gap-1 px-2 py-1 rounded-lg",
              isConnected ? "text-green-600 bg-green-100" : "text-red-600 bg-red-100"
            )}>
              <Wifi size={12} />
              <span className="text-xs font-medium">
                {isConnected ? "Connected" : "Offline"}
              </span>
            </div>
          </div>
          
          <div className="flex items-center justify-center gap-3">
            {gameStatus === 'waiting' && (
              <>
                <AlertCircle size={24} className="text-yellow-500" />
                <div>
                  <div className="text-lg font-bold text-yellow-600">Waiting</div>
                  <div className="text-xs text-gray-600">Game will start soon</div>
                </div>
              </>
            )}
            {gameStatus === 'active' && !isPaused && (
              <>
                <Play size={24} className="text-green-500 animate-pulse" />
                <div>
                  <div className="text-lg font-bold text-green-600">Playing</div>
                  <div className="text-xs text-gray-600">Game in progress</div>
                </div>
              </>
            )}
            {gameStatus === 'active' && isPaused && (
              <>
                <Pause size={24} className="text-orange-500" />
                <div>
                  <div className="text-lg font-bold text-orange-600">Paused</div>
                  <div className="text-xs text-gray-600">Game paused</div>
                </div>
              </>
            )}
            {gameStatus === 'finished' && (
              <>
                <CheckCircle size={24} className="text-purple-500" />
                <div>
                  <div className="text-lg font-bold text-purple-600">Finished</div>
                  <div className="text-xs text-gray-600">Game completed</div>
                </div>
              </>
            )}
          </div>
        </div>

        {/* Enhanced Prize Pool */}
        <div className="bg-gradient-to-r from-yellow-100 to-amber-100 rounded-2xl border border-yellow-300/50 p-4 backdrop-blur-sm">
          <div className="text-center">
            <div className="text-sm font-medium text-yellow-700 mb-2">Prize Pool</div>
            <div className="text-2xl font-bold text-yellow-600">
              ${(lobby.entryFee * participants.length * 0.7).toFixed(2)}
            </div>
            <div className="text-xs text-yellow-700 mt-1">
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
              <span>Winners are automatically detected when you complete a row</span>
            </li>
            <li className="flex items-start gap-1">
              <span className="text-green-600">✓</span>
              <span>Winner takes 90% of the prize pool</span>
            </li>
          </ul>
        </div>

        {/* ADMIN CONTROLS - Only visible to admins during active games */}
        {user?.isAdmin && gameStatus === 'active' && (
          <div className="mt-4 p-3 bg-red-50 border border-red-200 rounded-lg">
            <h4 className="text-red-800 font-semibold mb-3 text-sm">⚙️ Admin Controls</h4>
            
            {/* Game Speed Control */}
            <div className="mb-3 p-3 bg-blue-50 border border-blue-200 rounded">
              <label className="block text-blue-800 font-medium text-xs mb-2">
                🎯 Number Call Speed
              </label>
              <select
                value={currentCallSpeed}
                onChange={(e) => handleSpeedChange(parseInt(e.target.value))}
                className="w-full px-3 py-2 text-sm bg-white border border-blue-300 rounded-md text-blue-800 font-medium focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent cursor-pointer"
                data-testid="admin-speed-dropdown"
              >
                <option value="1">⚡ 1 second - Lightning Fast</option>
                <option value="2">🚀 2 seconds - Fast Pace</option>
                <option value="3">⏱️ 3 seconds - Quick Game</option>
                <option value="4">🎯 4 seconds - Standard</option>
                <option value="5">🐌 5 seconds - Relaxed</option>
              </select>
              <div className="text-xs text-blue-600 mt-2 text-center">
                Numbers called every {currentCallSpeed} second{currentCallSpeed > 1 ? 's' : ''}
              </div>
            </div>
          </div>
        )}

        {/* Back to Lobby Button */}
        {onLeaveLobby && (
          <div className="mt-2">
            <button
              onClick={onLeaveLobby}
              className="w-full py-3 px-4 rounded-lg font-medium text-sm transition-colors bg-blue-600 text-white hover:bg-blue-700"
              data-testid="button-mobile-back-lobby"
            >
              ← Back to Lobby
            </button>
          </div>
        )}
      </div>
    </div>
  );
}