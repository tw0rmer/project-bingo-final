import { Button } from "@/components/ui/button";
import { Play, Star, Sparkles } from "lucide-react";

export function HeroSection() {
  return (
    <section id="about" className="relative bg-gradient-to-br from-amber-50 via-orange-50 to-red-50 py-20 overflow-hidden">
      {/* Enhanced Background Decorations */}
      <div className="absolute inset-0">
        {/* Animated floating elements */}
        <div className="absolute top-10 left-10 w-20 h-20 bg-gradient-to-br from-yellow-400 to-orange-500 rounded-full opacity-20 animate-bounce-soft"></div>
        <div className="absolute top-32 right-20 w-16 h-16 bg-gradient-to-br from-red-400 to-pink-500 rounded-full opacity-20 animate-pulse"></div>
        <div className="absolute bottom-20 left-1/4 w-12 h-12 bg-gradient-to-br from-orange-400 to-red-500 rounded-full opacity-20 animate-bounce-soft" style={{ animationDelay: '0.5s' }}></div>
        <div className="absolute bottom-10 right-10 w-24 h-24 bg-gradient-to-br from-yellow-400 to-orange-500 rounded-full opacity-15 animate-pulse" style={{ animationDelay: '1s' }}></div>
        
        {/* Subtle pattern overlay */}
        <div className="absolute inset-0 opacity-5" style={{
          backgroundImage: `radial-gradient(circle at 25% 25%, #f59e0b 2px, transparent 2px),
                           radial-gradient(circle at 75% 75%, #ef4444 2px, transparent 2px)`,
          backgroundSize: '50px 50px'
        }}></div>
      </div>
      
      <div className="max-w-5xl mx-auto text-center px-4 relative z-10">
        <div className="bg-white/95 backdrop-blur-sm rounded-3xl shadow-2xl p-10 border-4 border-gradient-to-r from-yellow-400 via-orange-500 to-red-500 relative overflow-hidden">
          {/* Subtle gradient overlay */}
          <div className="absolute inset-0 bg-gradient-to-br from-yellow-50/50 via-orange-50/30 to-red-50/50 rounded-3xl"></div>
          
          {/* Floating sparkles */}
          <div className="absolute top-6 right-6">
            <Sparkles className="text-yellow-400 animate-pulse" size={24} />
          </div>
          <div className="absolute top-12 left-8">
            <Star className="text-orange-400 animate-bounce-soft" size={20} />
          </div>
          <div className="absolute bottom-6 left-6">
            <Sparkles className="text-red-400 animate-pulse" size={20} style={{ animationDelay: '0.5s' }} />
          </div>
          
          <div className="relative z-10">
            <div className="mb-8">
              <span className="inline-flex items-center bg-gradient-to-r from-red-500 to-pink-600 text-white px-8 py-3 rounded-full text-lg font-bold mb-4 shadow-lg transform hover:scale-105 transition-all">
                🎉 WELCOME BONUS
                <Sparkles className="ml-2" size={18} />
              </span>
            </div>
            
            <h1 className="text-6xl md:text-7xl font-black text-transparent bg-clip-text bg-gradient-to-r from-gray-800 via-gray-900 to-gray-800 mb-6">
              Welcome
            </h1>
            <div className="text-5xl md:text-6xl font-black mb-8">
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-red-600 via-orange-500 to-yellow-500 animate-shimmer">
                100% Match Bonus
              </span>
            </div>
            
            <p className="text-xl md:text-2xl text-gray-700 mb-10 max-w-3xl mx-auto leading-relaxed">
              Join thousands of players enjoying premium 15-player bingo games with 
              <span className="font-semibold text-orange-600"> exciting prizes</span> and 
              <span className="font-semibold text-red-600"> daily bonuses!</span>
            </p>
            
            <div className="space-y-4">
              <Button 
                size="lg"
                className="bg-gradient-to-r from-yellow-500 via-orange-500 to-red-500 hover:from-yellow-600 hover:via-orange-600 hover:to-red-600 text-white px-16 py-6 text-2xl font-bold hover:shadow-2xl transform hover:scale-105 transition-all duration-300 rounded-2xl shadow-xl"
              >
                <Play className="mr-3" size={24} />
                JOIN TODAY
              </Button>
              
              <div className="flex items-center justify-center space-x-4 text-sm font-medium">
                <div className="flex items-center text-green-600">
                  <Star className="mr-1" size={16} />
                  <span>4.9/5 Rating</span>
                </div>
                <div className="w-2 h-2 bg-gray-300 rounded-full"></div>
                <div className="flex items-center text-blue-600">
                  <Sparkles className="mr-1" size={16} />
                  <span>10,000+ Happy Players</span>
                </div>
              </div>
            </div>
            
            <p className="text-sm text-gray-500 mt-6 font-medium">
              *Terms and conditions apply. 18+ only. Gamble responsibly.
            </p>
          </div>
        </div>
        
        {/* Additional trust indicators */}
        <div className="mt-8 flex justify-center items-center space-x-8 opacity-60">
          <div className="text-xs font-semibold text-gray-600 uppercase tracking-wide">Trusted by thousands</div>
          <div className="w-1 h-1 bg-gray-400 rounded-full"></div>
          <div className="text-xs font-semibold text-gray-600 uppercase tracking-wide">Secure & Fair</div>
          <div className="w-1 h-1 bg-gray-400 rounded-full"></div>
          <div className="text-xs font-semibold text-gray-600 uppercase tracking-wide">24/7 Support</div>
        </div>
      </div>
    </section>
  );
}
