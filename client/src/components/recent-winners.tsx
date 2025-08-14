import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Trophy } from "lucide-react";
import { apiRequest, authApiRequest } from "@/lib/api";
import { useAuth } from "@/contexts/AuthContext";

export function RecentWinners() {
  const qc = useQueryClient();
  const { data: winners, isLoading } = useQuery<any[]>({
    queryKey: ["/api/winners"],
    queryFn: () => apiRequest("/winners"),
  });
  const addMutation = useMutation({
    mutationFn: (payload: any) => authApiRequest("/admin/winners", { method: 'POST', body: JSON.stringify(payload) }),
    onSuccess: () => qc.invalidateQueries({ queryKey: ["/api/winners"] })
  });
  const updateMutation = useMutation({
    mutationFn: ({ id, updates }: any) => authApiRequest(`/admin/winners/${id}`, { method: 'PUT', body: JSON.stringify(updates) }),
    onSuccess: () => qc.invalidateQueries({ queryKey: ["/api/winners"] })
  });
  const deleteMutation = useMutation({
    mutationFn: (id: number) => authApiRequest(`/admin/winners/${id}`, { method: 'DELETE' }),
    onSuccess: () => qc.invalidateQueries({ queryKey: ["/api/winners"] })
  });
  const resetMutation = useMutation({
    mutationFn: () => authApiRequest(`/admin/winners/reset`, { method: 'POST' }),
    onSuccess: () => qc.invalidateQueries({ queryKey: ["/api/winners"] })
  });
  const { user } = useAuth();

  if (isLoading) {
    return (
      <section id="winners" className="py-16 bg-gradient-to-br from-casino-gold/10 via-white to-casino-red/10">
        <div className="max-w-7xl mx-auto px-4">
          <div className="text-center mb-12">
            <div className="inline-flex items-center justify-center w-20 h-20 bg-gradient-to-br from-casino-gold to-yellow-600 rounded-full mb-6">
              <Trophy className="text-white animate-pulse" size={40} />
            </div>
            <h2 className="text-5xl font-bold bg-gradient-to-r from-casino-gold to-casino-red bg-clip-text text-transparent mb-4">
              🏆 Recent Big Winners! 🏆
            </h2>
            <p className="text-xl text-gray-600">Loading amazing winnings...</p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {[1, 2, 3].map((i) => (
              <div key={i} className="bg-gradient-to-br from-gray-200 to-gray-300 rounded-2xl p-6 animate-pulse">
                <div className="w-16 h-16 bg-gray-300 rounded-full mx-auto mb-4"></div>
                <div className="h-6 bg-gray-300 rounded mb-2"></div>
                <div className="h-12 bg-gray-400 rounded mb-4"></div>
                <div className="h-20 bg-gray-300 rounded"></div>
              </div>
            ))}
          </div>
        </div>
      </section>
    );
  }

  return (
    <section id="winners" className="py-16 bg-gradient-to-br from-casino-gold/10 via-white to-casino-red/10">
      <div className="max-w-7xl mx-auto px-4">
        <div className="text-center mb-12">
          <div className="inline-flex items-center justify-center w-20 h-20 bg-gradient-to-br from-casino-gold to-yellow-600 rounded-full mb-6">
            <Trophy className="text-white" size={40} />
          </div>
          <h2 className="text-5xl font-bold bg-gradient-to-r from-casino-gold to-casino-red bg-clip-text text-transparent mb-4">
            🏆 Recent Big Winners! 🏆
          </h2>
          <p className="text-xl text-gray-600 max-w-2xl mx-auto">
            Check out our latest champions and their amazing winnings! Could you be next?
          </p>
        </div>

        {/* Admin Controls - Hidden from regular users */}
        {user?.isAdmin && (
          <div className="flex justify-center mb-8">
            <div className="bg-white rounded-lg shadow-md p-4 flex items-center gap-4">
              <span className="text-sm text-gray-600">Admin Controls:</span>
              <button 
                className="bg-casino-gold hover:bg-yellow-600 text-white px-4 py-2 rounded-lg font-medium transition-colors" 
                onClick={() => addMutation.mutate({ lobbyId: 1, userId: user.id, amount: Math.floor(Math.random() * 1000) + 100, note: 'Manual Entry' })}
              >
                Add Winner
              </button>
              <button 
                className="bg-gray-600 hover:bg-gray-700 text-white px-4 py-2 rounded-lg font-medium transition-colors" 
                onClick={() => resetMutation.mutate()}
              >
                Reset All
              </button>
            </div>
          </div>
        )}

        {/* Winners Display */}
        {winners && winners.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {winners.map((winner: any, index: number) => {
              const winAmount = Number(winner.amount || 0);
              const isJackpot = winAmount >= 500;
              const isBigWin = winAmount >= 100;
              
              return (
                <div 
                  key={winner.id}
                  className={`
                    relative overflow-hidden rounded-2xl shadow-xl transform hover:scale-105 transition-all duration-300
                    ${isJackpot ? 'bg-gradient-to-br from-purple-600 via-pink-600 to-red-600' :
                      isBigWin ? 'bg-gradient-to-br from-casino-gold via-yellow-500 to-orange-500' :
                      'bg-gradient-to-br from-green-500 via-emerald-500 to-teal-600'}
                  `}
                >
                  {/* Animated Background Pattern */}
                  <div className="absolute inset-0 bg-white/10 backdrop-blur-sm"></div>
                  
                  {/* Winner Ranking Badge */}
                  <div className="absolute top-4 right-4 z-10">
                    <div className={`
                      w-8 h-8 rounded-full flex items-center justify-center text-white font-bold text-sm
                      ${index === 0 ? 'bg-yellow-400' : index === 1 ? 'bg-gray-400' : index === 2 ? 'bg-orange-400' : 'bg-blue-400'}
                    `}>
                      #{index + 1}
                    </div>
                  </div>

                  <div className="relative p-6 text-white">
                    {/* Winner Info */}
                    <div className="text-center mb-4">
                      <div className="w-16 h-16 bg-white/20 rounded-full flex items-center justify-center mx-auto mb-3">
                        <span className="text-2xl">🎉</span>
                      </div>
                      <h3 className="text-lg font-bold mb-1">
                        Player #{winner.userId}
                      </h3>
                      <p className="text-white/80 text-sm">
                        {new Date(winner.createdAt).toLocaleDateString('en-US', {
                          month: 'short',
                          day: 'numeric',
                          hour: '2-digit',
                          minute: '2-digit'
                        })}
                      </p>
                    </div>

                    {/* Win Amount - Big and Flashy */}
                    <div className="text-center mb-4">
                      <div className="text-4xl font-black mb-2">
                        ${winAmount.toFixed(2)}
                      </div>
                      <div className={`
                        inline-flex items-center px-3 py-1 rounded-full text-xs font-bold
                        ${isJackpot ? 'bg-white/30 text-white' :
                          isBigWin ? 'bg-white/30 text-white' :
                          'bg-white/30 text-white'}
                      `}>
                        {isJackpot ? '🎰 JACKPOT!' : isBigWin ? '💰 BIG WIN!' : '🎯 WINNER!'}
                      </div>
                    </div>

                    {/* Game Info */}
                    <div className="bg-white/10 rounded-lg p-3">
                      <div className="flex justify-between items-center text-sm">
                        <span className="text-white/80">Game Room:</span>
                        <span className="font-semibold">Lobby #{winner.lobbyId}</span>
                      </div>
                      {winner.gameId && (
                        <div className="flex justify-between items-center text-sm mt-1">
                          <span className="text-white/80">Game ID:</span>
                          <span className="font-semibold">#{winner.gameId}</span>
                        </div>
                      )}
                    </div>

                    {/* Admin Actions - Hidden from regular users */}
                    {user?.isAdmin && (
                      <div className="mt-4 pt-3 border-t border-white/20">
                        <div className="flex gap-2">
                          <button
                            onClick={() => updateMutation.mutate({ 
                              id: winner.id, 
                              updates: { 
                                amount: (prompt('New amount:', winner.amount) || winner.amount).toString()
                              } 
                            })}
                            className="flex-1 bg-white/20 hover:bg-white/30 text-white py-2 px-3 rounded-lg text-xs font-medium transition-colors"
                          >
                            Edit
                          </button>
                          <button
                            onClick={() => {
                              if (confirm('Delete this winner entry?')) {
                                deleteMutation.mutate(winner.id);
                              }
                            }}
                            className="bg-red-500/80 hover:bg-red-600 text-white py-2 px-3 rounded-lg text-xs font-medium transition-colors"
                          >
                            Delete
                          </button>
                        </div>
                      </div>
                    )}
                  </div>

                  {/* Sparkle Effect */}
                  {isJackpot && (
                    <div className="absolute inset-0 pointer-events-none">
                      <div className="absolute top-2 left-4 w-2 h-2 bg-white rounded-full animate-ping"></div>
                      <div className="absolute top-8 right-8 w-1 h-1 bg-white rounded-full animate-pulse"></div>
                      <div className="absolute bottom-4 left-8 w-1.5 h-1.5 bg-white rounded-full animate-ping delay-300"></div>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        ) : (
          <div className="text-center py-16">
            <div className="w-24 h-24 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-6">
              <Trophy className="text-gray-400" size={48} />
            </div>
            <h3 className="text-2xl font-bold text-gray-600 mb-4">
              No Winners Yet!
            </h3>
            <p className="text-gray-500 text-lg max-w-md mx-auto">
              Be the first to win big! Join a bingo game and claim your spot on the winners board.
            </p>
          </div>
        )}

        {/* Call to Action */}
        <div className="text-center mt-12">
          <div className="bg-gradient-to-r from-casino-gold to-casino-red rounded-2xl p-8 text-white">
            <h3 className="text-3xl font-bold mb-4">Ready to Join Them?</h3>
            <p className="text-xl mb-6 text-white/90">
              Start playing today and see your name up here tomorrow!
            </p>
            <a 
              href="#lobbies" 
              className="inline-flex items-center bg-white text-casino-red px-8 py-4 rounded-xl font-bold text-lg hover:bg-gray-100 transition-colors shadow-lg"
            >
              Play Now & Win Big! 🎰
            </a>
          </div>
        </div>
      </div>
    </section>
  );
}
