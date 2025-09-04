import { Clock, Target, Star, Users, Timer, DollarSign } from "lucide-react";

export function GameCategories() {
  return (
    <section className="py-20 bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50 relative overflow-hidden">
      {/* Background decorations */}
      <div className="absolute inset-0">
        <div className="absolute top-20 left-10 w-16 h-16 bg-gradient-to-br from-blue-300 to-indigo-400 rounded-full opacity-20 animate-bounce-soft"></div>
        <div className="absolute top-40 right-20 w-12 h-12 bg-gradient-to-br from-indigo-300 to-purple-400 rounded-full opacity-20 animate-pulse"></div>
        <div className="absolute bottom-32 left-1/4 w-20 h-20 bg-gradient-to-br from-purple-300 to-pink-400 rounded-full opacity-15 animate-bounce-soft" style={{ animationDelay: '1s' }}></div>
      </div>
      
      <div className="max-w-7xl mx-auto px-4 relative z-10">
        <div className="text-center mb-16">
          <h2 className="text-5xl md:text-6xl font-black text-transparent bg-clip-text bg-gradient-to-r from-blue-600 via-indigo-600 to-purple-600 mb-6">
            Three Amazing Game Types
          </h2>
          <p className="text-xl md:text-2xl text-gray-700 max-w-4xl mx-auto leading-relaxed">
            Each game type offers unique excitement and winning opportunities designed for different play styles
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {/* Enhanced Classic Bingo */}
          <div className="group relative overflow-hidden bg-white/95 backdrop-blur-sm rounded-3xl p-8 shadow-2xl border-2 border-gradient-to-r from-yellow-200 to-orange-200 hover:shadow-2xl transform hover:scale-105 transition-all duration-300">
            <div className="absolute inset-0 bg-gradient-to-br from-yellow-50/30 to-orange-50/30"></div>
            <div className="text-center relative z-10">
              <div className="w-24 h-24 bg-gradient-to-br from-yellow-500 to-orange-600 rounded-2xl flex items-center justify-center mx-auto mb-6 shadow-lg group-hover:scale-110 transition-transform">
                <Target className="text-white" size={40} />
              </div>
              <h3 className="text-3xl font-black text-gray-800 mb-4">Classic Bingo</h3>
              <p className="text-gray-700 text-lg mb-8 leading-relaxed">
                Traditional 15x5 bingo with familiar gameplay. Perfect for players who love the classic bingo experience with plenty of time to socialize.
              </p>
              <div className="space-y-4">
                <div className="flex justify-between items-center bg-white/70 rounded-xl p-3">
                  <div className="flex items-center">
                    <Timer className="w-4 h-4 text-gray-600 mr-2" />
                    <span className="text-gray-700 font-medium">Duration:</span>
                  </div>
                  <span className="font-bold text-gray-800">10-15 minutes</span>
                </div>
                <div className="flex justify-between items-center bg-white/70 rounded-xl p-3">
                  <div className="flex items-center">
                    <DollarSign className="w-4 h-4 text-gray-600 mr-2" />
                    <span className="text-gray-700 font-medium">Entry Fees:</span>
                  </div>
                  <span className="font-bold text-green-600">$3 - $25</span>
                </div>
                <div className="flex justify-between items-center bg-white/70 rounded-xl p-3">
                  <div className="flex items-center">
                    <Users className="w-4 h-4 text-gray-600 mr-2" />
                    <span className="text-gray-700 font-medium">Max Players:</span>
                  </div>
                  <span className="font-bold text-blue-600">15 players</span>
                </div>
              </div>
            </div>
          </div>

          {/* Enhanced Speed Bingo */}
          <div className="group relative overflow-hidden bg-white/95 backdrop-blur-sm rounded-3xl p-8 shadow-2xl border-2 border-gradient-to-r from-red-200 to-pink-200 hover:shadow-2xl transform hover:scale-105 transition-all duration-300">
            <div className="absolute inset-0 bg-gradient-to-br from-red-50/30 to-pink-50/30"></div>
            <div className="text-center relative z-10">
              <div className="w-24 h-24 bg-gradient-to-br from-red-500 to-pink-600 rounded-2xl flex items-center justify-center mx-auto mb-6 shadow-lg group-hover:scale-110 transition-transform">
                <Clock className="text-white" size={40} />
              </div>
              <h3 className="text-3xl font-black text-gray-800 mb-4">Speed Bingo</h3>
              <p className="text-gray-700 text-lg mb-8 leading-relaxed">
                Fast-paced action with numbers called every 2-3 seconds. For players who love quick games and instant excitement!
              </p>
              <div className="space-y-4">
                <div className="flex justify-between items-center bg-white/70 rounded-xl p-3">
                  <div className="flex items-center">
                    <Timer className="w-4 h-4 text-gray-600 mr-2" />
                    <span className="text-gray-700 font-medium">Duration:</span>
                  </div>
                  <span className="font-bold text-gray-800">3-5 minutes</span>
                </div>
                <div className="flex justify-between items-center bg-white/70 rounded-xl p-3">
                  <div className="flex items-center">
                    <DollarSign className="w-4 h-4 text-gray-600 mr-2" />
                    <span className="text-gray-700 font-medium">Entry Fees:</span>
                  </div>
                  <span className="font-bold text-green-600">$1 - $15</span>
                </div>
                <div className="flex justify-between items-center bg-white/70 rounded-xl p-3">
                  <div className="flex items-center">
                    <Users className="w-4 h-4 text-gray-600 mr-2" />
                    <span className="text-gray-700 font-medium">Max Players:</span>
                  </div>
                  <span className="font-bold text-blue-600">15 players</span>
                </div>
              </div>
            </div>
          </div>

          {/* Enhanced Themed Bingo */}
          <div className="group relative overflow-hidden bg-white/95 backdrop-blur-sm rounded-3xl p-8 shadow-2xl border-2 border-gradient-to-r from-purple-200 to-indigo-200 hover:shadow-2xl transform hover:scale-105 transition-all duration-300">
            <div className="absolute inset-0 bg-gradient-to-br from-purple-50/30 to-indigo-50/30"></div>
            <div className="text-center relative z-10">
              <div className="w-24 h-24 bg-gradient-to-br from-purple-500 to-indigo-600 rounded-2xl flex items-center justify-center mx-auto mb-6 shadow-lg group-hover:scale-110 transition-transform">
                <Star className="text-white" size={40} />
              </div>
              <h3 className="text-3xl font-black text-gray-800 mb-4">Themed Bingo</h3>
              <p className="text-gray-700 text-lg mb-8 leading-relaxed">
                Seasonal and holiday-themed games with special patterns, bonus rounds, and exclusive prizes. Always something new to discover!
              </p>
              <div className="space-y-4">
                <div className="flex justify-between items-center bg-white/70 rounded-xl p-3">
                  <div className="flex items-center">
                    <Timer className="w-4 h-4 text-gray-600 mr-2" />
                    <span className="text-gray-700 font-medium">Duration:</span>
                  </div>
                  <span className="font-bold text-gray-800">8-20 minutes</span>
                </div>
                <div className="flex justify-between items-center bg-white/70 rounded-xl p-3">
                  <div className="flex items-center">
                    <DollarSign className="w-4 h-4 text-gray-600 mr-2" />
                    <span className="text-gray-700 font-medium">Entry Fees:</span>
                  </div>
                  <span className="font-bold text-green-600">$5 - $50</span>
                </div>
                <div className="flex justify-between items-center bg-white/70 rounded-xl p-3">
                  <div className="flex items-center">
                    <Users className="w-4 h-4 text-gray-600 mr-2" />
                    <span className="text-gray-700 font-medium">Max Players:</span>
                  </div>
                  <span className="font-bold text-blue-600">15 players</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}