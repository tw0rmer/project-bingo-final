import { Gamepad2, Sparkles, Star, Zap, DollarSign } from "lucide-react";

export function GamesHeader() {
  return (
    <section className="py-20 bg-gradient-to-br from-purple-50 via-pink-50 to-orange-50 relative overflow-hidden">
      {/* Background decorations */}
      <div className="absolute inset-0">
        <div className="absolute top-20 left-10 w-20 h-20 bg-gradient-to-br from-purple-300 to-pink-400 rounded-full opacity-20 animate-bounce-soft"></div>
        <div className="absolute top-40 right-20 w-16 h-16 bg-gradient-to-br from-pink-300 to-orange-400 rounded-full opacity-20 animate-pulse"></div>
        <div className="absolute bottom-32 left-1/4 w-24 h-24 bg-gradient-to-br from-orange-300 to-red-400 rounded-full opacity-15 animate-bounce-soft" style={{ animationDelay: '1s' }}></div>
        <div className="absolute bottom-20 right-10 w-12 h-12 bg-gradient-to-br from-blue-300 to-purple-400 rounded-full opacity-20 animate-pulse" style={{ animationDelay: '2s' }}></div>
        
        {/* Floating sparkles */}
        <div className="absolute top-32 right-1/4 opacity-20">
          <Sparkles className="text-pink-400 animate-pulse" size={20} />
        </div>
        <div className="absolute bottom-40 left-1/3 opacity-15">
          <Star className="text-purple-400 animate-bounce-soft" size={16} />
        </div>
      </div>
      
      <div className="max-w-7xl mx-auto px-4 text-center relative z-10">
        <div className="mb-16">
          <div className="inline-flex items-center justify-center w-24 h-24 bg-gradient-to-br from-purple-600 via-pink-600 to-orange-600 rounded-2xl mb-8 shadow-2xl transform hover:scale-105 transition-all duration-300">
            <Gamepad2 className="text-white" size={48} />
          </div>
          
          <h1 className="text-6xl md:text-7xl font-black text-transparent bg-clip-text bg-gradient-to-r from-purple-600 via-pink-600 to-orange-600 mb-6">
            Our Bingo Games
          </h1>
          
          <p className="text-2xl md:text-3xl text-gray-700 max-w-5xl mx-auto leading-relaxed mb-8">
            Discover the excitement of premium online bingo with our variety of game types. 
            From classic 15x5 bingo to fast-paced speed rounds and special themed events, 
            there's something for every player!
          </p>
          
          {/* Quick highlights */}
          <div className="flex justify-center items-center space-x-6 text-lg font-semibold">
            <div className="flex items-center text-purple-600">
              <Zap className="mr-2" size={20} />
              <span>Instant Action</span>
            </div>
            <div className="w-1 h-1 bg-gray-400 rounded-full"></div>
            <div className="flex items-center text-pink-600">
              <Star className="mr-2" size={20} />
              <span>Premium Experience</span>
            </div>
            <div className="w-1 h-1 bg-gray-400 rounded-full"></div>
            <div className="flex items-center text-orange-600">
              <DollarSign className="mr-2" size={20} />
              <span>Big Rewards</span>
            </div>
          </div>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mt-16">
          <div className="group relative overflow-hidden bg-white/95 backdrop-blur-sm rounded-3xl p-8 shadow-2xl border-2 border-gradient-to-r from-purple-200 to-pink-200 transform hover:scale-105 transition-all duration-300">
            <div className="absolute inset-0 bg-gradient-to-br from-purple-50/30 to-pink-50/30"></div>
            <div className="relative z-10">
              <div className="w-20 h-20 bg-gradient-to-br from-purple-500 to-pink-600 rounded-2xl flex items-center justify-center mx-auto mb-6 shadow-lg group-hover:scale-110 transition-transform">
                <Sparkles className="text-white" size={32} />
              </div>
              <h3 className="text-2xl font-black text-gray-800 mb-4">15+ Game Varieties</h3>
              <p className="text-gray-700 text-lg">Choose from multiple bingo formats and exciting themes</p>
            </div>
          </div>
          
          <div className="group relative overflow-hidden bg-white/95 backdrop-blur-sm rounded-3xl p-8 shadow-2xl border-2 border-gradient-to-r from-pink-200 to-orange-200 transform hover:scale-105 transition-all duration-300">
            <div className="absolute inset-0 bg-gradient-to-br from-pink-50/30 to-orange-50/30"></div>
            <div className="relative z-10">
              <div className="w-20 h-20 bg-gradient-to-br from-pink-500 to-orange-600 rounded-2xl flex items-center justify-center mx-auto mb-6 shadow-lg group-hover:scale-110 transition-transform">
                <span className="text-white font-black text-2xl">24/7</span>
              </div>
              <h3 className="text-2xl font-black text-gray-800 mb-4">Always Available</h3>
              <p className="text-gray-700 text-lg">Games running around the clock for your convenience</p>
            </div>
          </div>
          
          <div className="group relative overflow-hidden bg-white/95 backdrop-blur-sm rounded-3xl p-8 shadow-2xl border-2 border-gradient-to-r from-orange-200 to-red-200 transform hover:scale-105 transition-all duration-300">
            <div className="absolute inset-0 bg-gradient-to-br from-orange-50/30 to-red-50/30"></div>
            <div className="relative z-10">
              <div className="w-20 h-20 bg-gradient-to-br from-orange-500 to-red-600 rounded-2xl flex items-center justify-center mx-auto mb-6 shadow-lg group-hover:scale-110 transition-transform">
                <span className="text-white font-black text-xl">$1M+</span>
              </div>
              <h3 className="text-2xl font-black text-gray-800 mb-4">Big Prize Pools</h3>
              <p className="text-gray-700 text-lg">Massive jackpots and daily prize opportunities</p>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}