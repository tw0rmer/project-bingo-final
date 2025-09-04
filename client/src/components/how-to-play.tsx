import { HelpCircle, Sparkles, Star, Zap } from "lucide-react";

export function HowToPlay() {
  return (
    <section id="how-to-play" className="py-20 bg-gradient-to-br from-indigo-50 via-purple-50 to-pink-50 relative overflow-hidden">
      {/* Background decorations */}
      <div className="absolute inset-0">
        <div className="absolute top-20 left-10 w-16 h-16 bg-gradient-to-br from-indigo-300 to-purple-400 rounded-full opacity-20 animate-bounce-soft"></div>
        <div className="absolute top-40 right-20 w-12 h-12 bg-gradient-to-br from-purple-300 to-pink-400 rounded-full opacity-20 animate-pulse"></div>
        <div className="absolute bottom-32 left-1/4 w-20 h-20 bg-gradient-to-br from-pink-300 to-red-400 rounded-full opacity-15 animate-bounce-soft" style={{ animationDelay: '1s' }}></div>
      </div>
      
      <div className="max-w-7xl mx-auto px-4 relative z-10">
        <div className="text-center mb-16">
          <div className="inline-flex items-center justify-center w-20 h-20 bg-gradient-to-br from-indigo-500 to-purple-600 rounded-full mb-6 shadow-lg">
            <HelpCircle className="text-white" size={40} />
          </div>
          
          <h2 className="text-5xl md:text-6xl font-black text-transparent bg-clip-text bg-gradient-to-r from-indigo-600 via-purple-600 to-pink-600 mb-6">
            How to Play 15x5 Bingo
          </h2>
          
          <p className="text-xl md:text-2xl text-gray-700 max-w-3xl mx-auto leading-relaxed mb-8">
            Simple, fun, and exciting - learn in minutes and start winning in seconds!
          </p>
          
          {/* Quick highlights */}
          <div className="flex justify-center items-center space-x-6 text-sm font-semibold">
            <div className="flex items-center text-indigo-600">
              <Zap className="mr-2" size={16} />
              <span>Quick to Learn</span>
            </div>
            <div className="w-1 h-1 bg-gray-400 rounded-full"></div>
            <div className="flex items-center text-purple-600">
              <Star className="mr-2" size={16} />
              <span>Easy to Win</span>
            </div>
            <div className="w-1 h-1 bg-gray-400 rounded-full"></div>
            <div className="flex items-center text-pink-600">
              <Sparkles className="mr-2" size={16} />
              <span>Instant Results</span>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">
          {/* Bingo Card Visual */}
          <div className="relative">
            <div className="absolute inset-0 bg-gradient-to-br from-indigo-400 to-purple-600 rounded-2xl transform rotate-3 opacity-20"></div>
            <div className="bg-white/95 backdrop-blur-sm rounded-2xl shadow-2xl p-8 border-2 border-gradient-to-r from-indigo-200 to-purple-200 relative z-10 transform hover:scale-105 transition-all duration-300">
              <div className="absolute top-4 right-4">
                <Star className="text-yellow-400 animate-pulse" size={20} />
              </div>
              
              <h3 className="text-3xl font-black text-transparent bg-clip-text bg-gradient-to-r from-indigo-600 to-purple-600 mb-6 text-center">
                Your Bingo Card (15x5)
              </h3>
              
              <div className="grid grid-cols-5 gap-3 mb-6">
                {/* Header Row */}
                <div className="bg-gradient-to-br from-red-500 to-pink-600 text-white font-black text-center py-4 rounded-lg shadow-lg text-lg">B</div>
                <div className="bg-gradient-to-br from-orange-500 to-red-500 text-white font-black text-center py-4 rounded-lg shadow-lg text-lg">I</div>
                <div className="bg-gradient-to-br from-yellow-500 to-orange-500 text-white font-black text-center py-4 rounded-lg shadow-lg text-lg">N</div>
                <div className="bg-gradient-to-br from-green-500 to-yellow-500 text-white font-black text-center py-4 rounded-lg shadow-lg text-lg">G</div>
                <div className="bg-gradient-to-br from-blue-500 to-green-500 text-white font-black text-center py-4 rounded-lg shadow-lg text-lg">O</div>
                
                {/* Sample rows */}
                <div className="bg-gradient-to-br from-gray-50 to-gray-100 text-center py-3 rounded-lg border-2 border-gray-200 font-bold text-gray-700 hover:bg-gradient-to-br hover:from-blue-50 hover:to-indigo-50 transition-all">7</div>
                <div className="bg-gradient-to-br from-gray-50 to-gray-100 text-center py-3 rounded-lg border-2 border-gray-200 font-bold text-gray-700 hover:bg-gradient-to-br hover:from-blue-50 hover:to-indigo-50 transition-all">23</div>
                <div className="bg-gradient-to-br from-yellow-400 to-orange-500 text-white text-center py-3 rounded-lg border-2 border-yellow-300 font-black shadow-lg animate-pulse">FREE</div>
                <div className="bg-gradient-to-br from-gray-50 to-gray-100 text-center py-3 rounded-lg border-2 border-gray-200 font-bold text-gray-700 hover:bg-gradient-to-br hover:from-blue-50 hover:to-indigo-50 transition-all">52</div>
                <div className="bg-gradient-to-br from-gray-50 to-gray-100 text-center py-3 rounded-lg border-2 border-gray-200 font-bold text-gray-700 hover:bg-gradient-to-br hover:from-blue-50 hover:to-indigo-50 transition-all">68</div>
                
                <div className="bg-gradient-to-br from-gray-50 to-gray-100 text-center py-3 rounded-lg border-2 border-gray-200 font-bold text-gray-700 hover:bg-gradient-to-br hover:from-blue-50 hover:to-indigo-50 transition-all">12</div>
                <div className="bg-gradient-to-br from-gray-50 to-gray-100 text-center py-3 rounded-lg border-2 border-gray-200 font-bold text-gray-700 hover:bg-gradient-to-br hover:from-blue-50 hover:to-indigo-50 transition-all">19</div>
                <div className="bg-gradient-to-br from-gray-50 to-gray-100 text-center py-3 rounded-lg border-2 border-gray-200 font-bold text-gray-700 hover:bg-gradient-to-br hover:from-blue-50 hover:to-indigo-50 transition-all">34</div>
                <div className="bg-gradient-to-br from-gray-50 to-gray-100 text-center py-3 rounded-lg border-2 border-gray-200 font-bold text-gray-700 hover:bg-gradient-to-br hover:from-blue-50 hover:to-indigo-50 transition-all">47</div>
                <div className="bg-gradient-to-br from-gray-50 to-gray-100 text-center py-3 rounded-lg border-2 border-gray-200 font-bold text-gray-700 hover:bg-gradient-to-br hover:from-blue-50 hover:to-indigo-50 transition-all">71</div>
                
                {/* More rows indicator */}
                <div className="bg-gradient-to-br from-gray-100 to-gray-200 text-center py-3 rounded-lg border-2 border-gray-300 text-gray-500 font-semibold">⋮</div>
                <div className="bg-gradient-to-br from-gray-100 to-gray-200 text-center py-3 rounded-lg border-2 border-gray-300 text-gray-500 font-semibold">⋮</div>
                <div className="bg-gradient-to-br from-gray-100 to-gray-200 text-center py-3 rounded-lg border-2 border-gray-300 text-gray-500 font-semibold">⋮</div>
                <div className="bg-gradient-to-br from-gray-100 to-gray-200 text-center py-3 rounded-lg border-2 border-gray-300 text-gray-500 font-semibold">⋮</div>
                <div className="bg-gradient-to-br from-gray-100 to-gray-200 text-center py-3 rounded-lg border-2 border-gray-300 text-gray-500 font-semibold">⋮</div>
              </div>
              
              <div className="bg-gradient-to-r from-indigo-50 to-purple-50 rounded-lg p-4 border border-indigo-200">
                <p className="text-center font-bold text-gray-700">
                  <span className="text-2xl font-black text-transparent bg-clip-text bg-gradient-to-r from-indigo-600 to-purple-600">15 rows × 5 columns</span>
                  <br />
                  <span className="text-lg text-indigo-600">= More chances to win!</span>
                </p>
              </div>
            </div>
          </div>

          {/* Instructions */}
          <div className="space-y-8">
            <div className="group relative overflow-hidden bg-white/95 backdrop-blur-sm rounded-2xl p-8 shadow-2xl border-2 border-gradient-to-r from-indigo-200 to-purple-200 transform hover:scale-105 transition-all duration-300">
              <div className="absolute inset-0 bg-gradient-to-br from-indigo-50/50 to-purple-50/50"></div>
              <div className="flex items-start space-x-6 relative z-10">
                <div className="w-16 h-16 bg-gradient-to-br from-indigo-500 to-purple-600 text-white rounded-2xl flex items-center justify-center font-black text-2xl shadow-lg transform group-hover:scale-110 transition-transform">
                  1
                </div>
                <div>
                  <h4 className="text-2xl font-black text-gray-800 mb-3">🏠 Join a Room</h4>
                  <p className="text-gray-700 text-lg leading-relaxed">Select from our available 15-player bingo rooms. Each room has different entry fees and prize pools to match your playing style!</p>
                </div>
              </div>
            </div>

            <div className="group relative overflow-hidden bg-white/95 backdrop-blur-sm rounded-2xl p-8 shadow-2xl border-2 border-gradient-to-r from-purple-200 to-pink-200 transform hover:scale-105 transition-all duration-300">
              <div className="absolute inset-0 bg-gradient-to-br from-purple-50/50 to-pink-50/50"></div>
              <div className="flex items-start space-x-6 relative z-10">
                <div className="w-16 h-16 bg-gradient-to-br from-purple-500 to-pink-600 text-white rounded-2xl flex items-center justify-center font-black text-2xl shadow-lg transform group-hover:scale-110 transition-transform">
                  2
                </div>
                <div>
                  <h4 className="text-2xl font-black text-gray-800 mb-3">🎫 Get Your Card</h4>
                  <p className="text-gray-700 text-lg leading-relaxed">Receive a unique 15×5 bingo card with 75 numbers. More rows mean more chances to win big prizes!</p>
                </div>
              </div>
            </div>

            <div className="group relative overflow-hidden bg-white/95 backdrop-blur-sm rounded-2xl p-8 shadow-2xl border-2 border-gradient-to-r from-pink-200 to-red-200 transform hover:scale-105 transition-all duration-300">
              <div className="absolute inset-0 bg-gradient-to-br from-pink-50/50 to-red-50/50"></div>
              <div className="flex items-start space-x-6 relative z-10">
                <div className="w-16 h-16 bg-gradient-to-br from-pink-500 to-red-600 text-white rounded-2xl flex items-center justify-center font-black text-2xl shadow-lg transform group-hover:scale-110 transition-transform">
                  3
                </div>
                <div>
                  <h4 className="text-2xl font-black text-gray-800 mb-3">🎯 Play & Win</h4>
                  <p className="text-gray-700 text-lg leading-relaxed">Numbers are called automatically. Match patterns to win prizes. First to complete a line wins the jackpot!</p>
                </div>
              </div>
            </div>

            <div className="group relative overflow-hidden bg-white/95 backdrop-blur-sm rounded-2xl p-8 shadow-2xl border-2 border-gradient-to-r from-red-200 to-orange-200 transform hover:scale-105 transition-all duration-300">
              <div className="absolute inset-0 bg-gradient-to-br from-red-50/50 to-orange-50/50"></div>
              <div className="flex items-start space-x-6 relative z-10">
                <div className="w-16 h-16 bg-gradient-to-br from-red-500 to-orange-600 text-white rounded-2xl flex items-center justify-center font-black text-2xl shadow-lg transform group-hover:scale-110 transition-transform">
                  4
                </div>
                <div>
                  <h4 className="text-2xl font-black text-gray-800 mb-3">💰 Collect Winnings</h4>
                  <p className="text-gray-700 text-lg leading-relaxed">Winnings are automatically credited to your account instantly. Cash out or play again to multiply your earnings!</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
