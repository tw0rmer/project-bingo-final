import { Button } from "@/components/ui/button";
import { Clock, Zap, TrendingUp, Timer } from "lucide-react";

export function SpeedBingo() {
  return (
    <section className="py-16 bg-white">
      <div className="max-w-6xl mx-auto px-4">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
          {/* Visual */}
          <div className="bg-gradient-to-br from-casino-red to-rose-gold rounded-xl shadow-2xl p-8">
            <h3 className="text-2xl font-bold mb-6 text-center inline-block bg-white text-gray-900 px-4 py-1 rounded">
              Speed Bingo Action!
            </h3>
            
            {/* Timer Display */}
            <div className="bg-white rounded-lg p-6 mb-6 text-center shadow">
              <div className="text-4xl font-bold mb-2 text-gray-900">⚡ 2.5 sec</div>
              <p className="text-lg text-gray-700">Number Call Interval</p>
            </div>

            {/* Mini Bingo Card */}
            <div className="grid grid-cols-5 gap-1 mb-6">
              <div className="bg-white text-casino-red font-bold text-center py-2 rounded text-sm">B</div>
              <div className="bg-white text-casino-red font-bold text-center py-2 rounded text-sm">I</div>
              <div className="bg-white text-casino-red font-bold text-center py-2 rounded text-sm">N</div>
              <div className="bg-white text-casino-red font-bold text-center py-2 rounded text-sm">G</div>
              <div className="bg-white text-casino-red font-bold text-center py-2 rounded text-sm">O</div>
              
              {/* Sample marked numbers */}
              <div className="bg-yellow-400 text-casino-red text-center py-2 rounded text-sm font-bold">✓</div>
              <div className="bg-white text-gray-900 text-center py-2 rounded text-sm shadow-sm">19</div>
              <div className="bg-yellow-400 text-casino-red text-center py-2 rounded text-sm font-bold">✓</div>
              <div className="bg-white text-gray-900 text-center py-2 rounded text-sm shadow-sm">47</div>
              <div className="bg-yellow-400 text-casino-red text-center py-2 rounded text-sm font-bold">✓</div>
            </div>

            <div className="text-center">
              <div className="flex items-center justify-center space-x-2 mb-4">
                <Zap className="text-yellow-400" size={24} />
                <span className="text-lg font-semibold bg-white text-gray-900 px-2 rounded shadow-sm">Fast-Paced Excitement!</span>
                <Zap className="text-yellow-400" size={24} />
              </div>
              <p className="bg-white/95 text-gray-800 inline-block px-3 py-1 rounded shadow-sm">
                Quick reflexes meet big rewards in our most thrilling bingo format
              </p>
            </div>
          </div>

          {/* Content */}
          <div>
            <div className="flex items-center mb-6">
              <div className="w-16 h-16 bg-casino-red rounded-full flex items-center justify-center mr-4">
                <Clock className="text-white" size={28} />
              </div>
              <h2 className="text-4xl font-bold text-dark-brown">Speed Bingo</h2>
            </div>
            
            <p className="text-xl text-gray-700 mb-8 leading-relaxed">
              Get your adrenaline pumping with our fastest bingo format! Numbers are called every 2-3 seconds, making each game an exciting race to complete your patterns. Perfect for players who love quick action and instant results.
            </p>

            <div className="grid grid-cols-2 gap-6 mb-8">
              <div className="bg-light-cream rounded-lg p-6 shadow-lg border-l-4 border-casino-red">
                <div className="flex items-center mb-3">
                  <Timer className="casino-red mr-2" size={20} />
                  <h4 className="font-bold text-dark-brown">Super Fast</h4>
                </div>
                <p className="text-2xl font-bold casino-red">3-5 min</p>
                <p className="text-gray-600">Lightning quick games</p>
              </div>
              
              <div className="bg-light-cream rounded-lg p-6 shadow-lg border-l-4 border-casino-red">
                <div className="flex items-center mb-3">
                  <TrendingUp className="casino-red mr-2" size={20} />
                  <h4 className="font-bold text-dark-brown">High Frequency</h4>
                </div>
                <p className="text-2xl font-bold casino-red">Every 2.5s</p>
                <p className="text-gray-600">Number calls</p>
              </div>
              
              <div className="bg-light-cream rounded-lg p-6 shadow-lg border-l-4 border-casino-red">
                <div className="flex items-center mb-3">
                  <span className="casino-red mr-2 text-lg font-bold">$</span>
                  <h4 className="font-bold text-dark-brown">Entry Fees</h4>
                </div>
                <p className="text-2xl font-bold casino-red">$1 - $15</p>
                <p className="text-gray-600">Lower stakes, more games</p>
              </div>
              
              <div className="bg-light-cream rounded-lg p-6 shadow-lg border-l-4 border-casino-red">
                <div className="flex items-center mb-3">
                  <span className="casino-red mr-2 text-lg font-bold">🏆</span>
                  <h4 className="font-bold text-dark-brown">Quick Wins</h4>
                </div>
                <p className="text-2xl font-bold casino-red">$50-$750</p>
                <p className="text-gray-600">Fast payouts</p>
              </div>
            </div>

            <div className="bg-gradient-to-r from-red-50 to-orange-50 rounded-xl p-6 shadow-lg border-2 border-casino-red mb-8">
              <h4 className="text-xl font-bold text-dark-brown mb-4">Unique Features:</h4>
              <ul className="space-y-2 text-gray-700 text-lg">
                <li className="flex items-center">
                  <Zap className="casino-red mr-3" size={16} />
                  Auto-mark feature for lightning-fast gameplay
                </li>
                <li className="flex items-center">
                  <Zap className="casino-red mr-3" size={16} />
                  Multiple pattern wins in single games
                </li>
                <li className="flex items-center">
                  <Zap className="casino-red mr-3" size={16} />
                  Turbo bonus rounds with 2x payouts
                </li>
                <li className="flex items-center">
                  <Zap className="casino-red mr-3" size={16} />
                  Perfect for mobile play during breaks
                </li>
              </ul>
            </div>

            <div className="flex space-x-4">
              <Button 
                size="lg"
                className="bg-casino-red text-white px-8 py-4 text-xl font-bold hover:bg-red-700 shadow-lg flex-1"
              >
                <Zap className="mr-2" size={20} />
                Join Speed Game
              </Button>
              <Button 
                variant="outline"
                size="lg"
                className="px-6 py-4 text-lg border-2 border-casino-red casino-red hover:bg-casino-red hover:text-white"
              >
                Watch Demo
              </Button>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}