import { Button } from "@/components/ui/button";
import { Clock, Zap, TrendingUp, Timer, Star, Sparkles } from "lucide-react";

export function SpeedBingo() {
  return (
    <section className="py-20 bg-gradient-to-br from-red-50 via-pink-50 to-orange-50 relative overflow-hidden">
      {/* Background decorations */}
      <div className="absolute inset-0">
        <div className="absolute top-20 left-10 w-20 h-20 bg-gradient-to-br from-red-300 to-pink-400 rounded-full opacity-20 animate-bounce-soft"></div>
        <div className="absolute top-40 right-20 w-16 h-16 bg-gradient-to-br from-pink-300 to-orange-400 rounded-full opacity-20 animate-pulse"></div>
        <div className="absolute bottom-32 left-1/4 w-24 h-24 bg-gradient-to-br from-orange-300 to-red-400 rounded-full opacity-15 animate-bounce-soft" style={{ animationDelay: '1s' }}></div>
        
        {/* Floating sparkles */}
        <div className="absolute top-32 right-1/4 opacity-20">
          <Zap className="text-red-400 animate-pulse" size={20} />
        </div>
        <div className="absolute bottom-40 left-1/3 opacity-15">
          <Star className="text-orange-400 animate-bounce-soft" size={16} />
        </div>
      </div>
      
      <div className="max-w-7xl mx-auto px-4 relative z-10">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">
          {/* Enhanced Visual */}
          <div className="relative">
            <div className="absolute inset-0 bg-gradient-to-br from-red-400 to-pink-600 rounded-3xl transform -rotate-3 opacity-20"></div>
            <div className="bg-gradient-to-br from-red-500 via-pink-500 to-orange-500 rounded-3xl shadow-2xl p-8 relative z-10 overflow-hidden">
              <div className="absolute top-4 right-4">
                <Zap className="text-yellow-400 animate-pulse" size={24} />
              </div>
              
              <h3 className="text-3xl font-black mb-8 text-center bg-white/95 text-red-600 px-6 py-3 rounded-2xl shadow-lg backdrop-blur-sm">
                ⚡ Speed Bingo Action! ⚡
              </h3>
              
              {/* Enhanced Timer Display */}
              <div className="bg-white/95 backdrop-blur-sm rounded-2xl p-8 mb-8 text-center shadow-2xl border-4 border-yellow-400">
                <div className="text-5xl font-black mb-4 text-transparent bg-clip-text bg-gradient-to-r from-red-600 to-pink-600 animate-pulse">
                  ⚡ 2.5 sec ⚡
                </div>
                <p className="text-xl font-bold text-gray-800">Number Call Interval</p>
                <p className="text-sm text-red-600 font-medium mt-2">Lightning Fast!</p>
              </div>

              {/* Enhanced Mini Bingo Card */}
              <div className="grid grid-cols-5 gap-2 mb-8">
                <div className="bg-gradient-to-br from-red-500 to-pink-600 text-white font-black text-center py-3 rounded-xl text-sm shadow-lg">B</div>
                <div className="bg-gradient-to-br from-orange-500 to-red-500 text-white font-black text-center py-3 rounded-xl text-sm shadow-lg">I</div>
                <div className="bg-gradient-to-br from-yellow-500 to-orange-500 text-white font-black text-center py-3 rounded-xl text-sm shadow-lg">N</div>
                <div className="bg-gradient-to-br from-green-500 to-yellow-500 text-white font-black text-center py-3 rounded-xl text-sm shadow-lg">G</div>
                <div className="bg-gradient-to-br from-blue-500 to-green-500 text-white font-black text-center py-3 rounded-xl text-sm shadow-lg">O</div>
                
                {/* Enhanced Sample marked numbers */}
                <div className="bg-gradient-to-br from-yellow-400 to-orange-500 text-white text-center py-3 rounded-xl text-sm font-black shadow-lg animate-pulse">⚡</div>
                <div className="bg-white/95 text-gray-900 text-center py-3 rounded-xl text-sm shadow-lg font-bold">19</div>
                <div className="bg-gradient-to-br from-yellow-400 to-orange-500 text-white text-center py-3 rounded-xl text-sm font-black shadow-lg animate-pulse">⚡</div>
                <div className="bg-white/95 text-gray-900 text-center py-3 rounded-xl text-sm shadow-lg font-bold">47</div>
                <div className="bg-gradient-to-br from-yellow-400 to-orange-500 text-white text-center py-3 rounded-xl text-sm font-black shadow-lg animate-pulse">⚡</div>
              </div>

              <div className="text-center">
                <div className="flex items-center justify-center space-x-3 mb-6">
                  <Zap className="text-yellow-400 animate-bounce-soft" size={28} />
                  <span className="text-xl font-black bg-white/95 text-red-600 px-4 py-2 rounded-xl shadow-lg backdrop-blur-sm">
                    Fast-Paced Excitement!
                  </span>
                  <Zap className="text-yellow-400 animate-bounce-soft" size={28} />
                </div>
                <p className="bg-white/95 text-gray-800 inline-block px-6 py-3 rounded-2xl shadow-lg backdrop-blur-sm font-bold text-lg">
                  Quick reflexes meet big rewards in our most thrilling bingo format
                </p>
              </div>
            </div>
          </div>

          {/* Enhanced Content */}
          <div>
            <div className="flex items-center mb-8">
              <div className="w-20 h-20 bg-gradient-to-br from-red-500 to-pink-600 rounded-2xl flex items-center justify-center mr-6 shadow-2xl transform hover:scale-105 transition-all duration-300">
                <Clock className="text-white" size={36} />
              </div>
              <h2 className="text-5xl font-black text-transparent bg-clip-text bg-gradient-to-r from-red-600 to-pink-600">Speed Bingo</h2>
            </div>
            
            <p className="text-2xl text-gray-700 mb-10 leading-relaxed">
              Get your adrenaline pumping with our fastest bingo format! Numbers are called every 2-3 seconds, making each game an exciting race to complete your patterns. Perfect for players who love quick action and instant results.
            </p>

            <div className="grid grid-cols-2 gap-6 mb-10">
              <div className="group relative overflow-hidden bg-white/95 backdrop-blur-sm rounded-2xl p-6 shadow-2xl border-2 border-gradient-to-r from-red-200 to-pink-200 transform hover:scale-105 transition-all duration-300">
                <div className="absolute inset-0 bg-gradient-to-br from-red-50/30 to-pink-50/30"></div>
                <div className="relative z-10">
                  <div className="flex items-center mb-4">
                    <div className="w-10 h-10 bg-gradient-to-br from-orange-500 to-red-600 rounded-xl flex items-center justify-center mr-3">
                      <Timer className="text-white" size={20} />
                    </div>
                    <h4 className="font-black text-gray-800">Super Fast</h4>
                  </div>
                  <p className="text-3xl font-black text-red-600 mb-2">3-5 min</p>
                  <p className="text-gray-700 font-medium">Lightning quick games</p>
                </div>
              </div>
              
              <div className="group relative overflow-hidden bg-white/95 backdrop-blur-sm rounded-2xl p-6 shadow-2xl border-2 border-gradient-to-r from-pink-200 to-orange-200 transform hover:scale-105 transition-all duration-300">
                <div className="absolute inset-0 bg-gradient-to-br from-pink-50/30 to-orange-50/30"></div>
                <div className="relative z-10">
                  <div className="flex items-center mb-4">
                    <div className="w-10 h-10 bg-gradient-to-br from-yellow-500 to-orange-600 rounded-xl flex items-center justify-center mr-3">
                      <TrendingUp className="text-white" size={20} />
                    </div>
                    <h4 className="font-black text-gray-800">High Frequency</h4>
                  </div>
                  <p className="text-3xl font-black text-orange-600 mb-2">Every 2.5s</p>
                  <p className="text-gray-700 font-medium">Number calls</p>
                </div>
              </div>
              
              <div className="group relative overflow-hidden bg-white/95 backdrop-blur-sm rounded-2xl p-6 shadow-2xl border-2 border-gradient-to-r from-orange-200 to-yellow-200 transform hover:scale-105 transition-all duration-300">
                <div className="absolute inset-0 bg-gradient-to-br from-orange-50/30 to-yellow-50/30"></div>
                <div className="relative z-10">
                  <div className="flex items-center mb-4">
                    <div className="w-10 h-10 bg-gradient-to-br from-green-500 to-emerald-600 rounded-xl flex items-center justify-center mr-3">
                      <span className="text-white text-lg font-bold">$</span>
                    </div>
                    <h4 className="font-black text-gray-800">Entry Fees</h4>
                  </div>
                  <p className="text-3xl font-black text-green-600 mb-2">$1 - $15</p>
                  <p className="text-gray-700 font-medium">Lower stakes, more games</p>
                </div>
              </div>
              
              <div className="group relative overflow-hidden bg-white/95 backdrop-blur-sm rounded-2xl p-6 shadow-2xl border-2 border-gradient-to-r from-yellow-200 to-green-200 transform hover:scale-105 transition-all duration-300">
                <div className="absolute inset-0 bg-gradient-to-br from-yellow-50/30 to-green-50/30"></div>
                <div className="relative z-10">
                  <div className="flex items-center mb-4">
                    <div className="w-10 h-10 bg-gradient-to-br from-purple-500 to-indigo-600 rounded-xl flex items-center justify-center mr-3">
                      <span className="text-white text-lg font-bold">🏆</span>
                    </div>
                    <h4 className="font-black text-gray-800">Quick Wins</h4>
                  </div>
                  <p className="text-3xl font-black text-purple-600 mb-2">$50-$750</p>
                  <p className="text-gray-700 font-medium">Fast payouts</p>
                </div>
              </div>
            </div>

            <div className="relative overflow-hidden bg-white/95 backdrop-blur-sm rounded-3xl p-8 shadow-2xl border-2 border-gradient-to-r from-red-200 to-orange-200 mb-10">
              <div className="absolute inset-0 bg-gradient-to-br from-red-50/30 to-orange-50/30"></div>
              <div className="relative z-10">
                <h4 className="text-2xl font-black text-gray-800 mb-6 flex items-center">
                  <Sparkles className="mr-3 text-red-500" size={24} />
                  Unique Features:
                </h4>
                <ul className="space-y-4 text-gray-700 text-lg">
                  <li className="flex items-center bg-white/70 rounded-xl p-3">
                    <div className="w-8 h-8 bg-gradient-to-br from-red-500 to-pink-600 rounded-lg flex items-center justify-center mr-4">
                      <Zap className="text-white" size={16} />
                    </div>
                    <span className="font-bold">Auto-mark feature for lightning-fast gameplay</span>
                  </li>
                  <li className="flex items-center bg-white/70 rounded-xl p-3">
                    <div className="w-8 h-8 bg-gradient-to-br from-orange-500 to-red-600 rounded-lg flex items-center justify-center mr-4">
                      <Zap className="text-white" size={16} />
                    </div>
                    <span className="font-bold">Multiple pattern wins in single games</span>
                  </li>
                  <li className="flex items-center bg-white/70 rounded-xl p-3">
                    <div className="w-8 h-8 bg-gradient-to-br from-yellow-500 to-orange-600 rounded-lg flex items-center justify-center mr-4">
                      <Zap className="text-white" size={16} />
                    </div>
                    <span className="font-bold">Turbo bonus rounds with 2x payouts</span>
                  </li>
                  <li className="flex items-center bg-white/70 rounded-xl p-3">
                    <div className="w-8 h-8 bg-gradient-to-br from-green-500 to-yellow-600 rounded-lg flex items-center justify-center mr-4">
                      <Zap className="text-white" size={16} />
                    </div>
                    <span className="font-bold">Perfect for mobile play during breaks</span>
                  </li>
                </ul>
              </div>
            </div>

            <div className="flex flex-col sm:flex-row gap-4">
              <Button 
                size="lg"
                className="bg-gradient-to-r from-red-500 via-pink-500 to-orange-500 hover:from-red-600 hover:via-pink-600 hover:to-orange-600 text-white px-12 py-6 text-2xl font-black shadow-2xl transition-all duration-300 transform hover:scale-105 rounded-2xl flex-1"
              >
                <Zap className="mr-3" size={24} />
                Join Speed Game
              </Button>
              <Button 
                variant="outline"
                size="lg"
                className="px-8 py-6 text-xl border-4 border-red-400 text-red-600 hover:bg-gradient-to-r hover:from-red-500 hover:to-pink-600 hover:text-white font-black rounded-2xl shadow-lg transition-all duration-300 transform hover:scale-105"
              >
                <Star className="mr-2" size={20} />
                Watch Demo
              </Button>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}