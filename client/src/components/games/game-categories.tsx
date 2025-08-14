import { Clock, Target, Star } from "lucide-react";

export function GameCategories() {
  return (
    <section className="py-16 bg-white">
      <div className="max-w-6xl mx-auto px-4">
        <div className="text-center mb-12">
          <h2 className="text-4xl font-bold text-dark-brown mb-4">
            Three Amazing Game Types
          </h2>
          <p className="text-xl text-gray-600 max-w-3xl mx-auto">
            Each game type offers unique excitement and winning opportunities designed for different play styles
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {/* Classic Bingo */}
          <div className="bg-gradient-to-br from-light-cream to-white rounded-xl p-8 shadow-lg border-2 border-casino-gold hover:shadow-xl transition-all">
            <div className="text-center">
              <div className="w-20 h-20 bg-casino-gold rounded-full flex items-center justify-center mx-auto mb-6">
                <Target className="text-white" size={32} />
              </div>
              <h3 className="text-2xl font-bold text-dark-brown mb-4">Classic Bingo</h3>
              <p className="text-gray-700 text-lg mb-6">
                Traditional 15x5 bingo with familiar gameplay. Perfect for players who love the classic bingo experience with plenty of time to socialize.
              </p>
              <div className="space-y-3 text-left">
                <div className="flex justify-between">
                  <span className="text-gray-600">Game Duration:</span>
                  <span className="font-semibold">10-15 minutes</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Entry Fees:</span>
                  <span className="font-semibold">$3 - $25</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Max Players:</span>
                  <span className="font-semibold">15 players</span>
                </div>
              </div>
            </div>
          </div>

          {/* Speed Bingo */}
          <div className="bg-gradient-to-br from-light-cream to-white rounded-xl p-8 shadow-lg border-2 border-casino-red hover:shadow-xl transition-all">
            <div className="text-center">
              <div className="w-20 h-20 bg-casino-red rounded-full flex items-center justify-center mx-auto mb-6">
                <Clock className="text-white" size={32} />
              </div>
              <h3 className="text-2xl font-bold text-dark-brown mb-4">Speed Bingo</h3>
              <p className="text-gray-700 text-lg mb-6">
                Fast-paced action with numbers called every 2-3 seconds. For players who love quick games and instant excitement!
              </p>
              <div className="space-y-3 text-left">
                <div className="flex justify-between">
                  <span className="text-gray-600">Game Duration:</span>
                  <span className="font-semibold">3-5 minutes</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Entry Fees:</span>
                  <span className="font-semibold">$1 - $15</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Max Players:</span>
                  <span className="font-semibold">15 players</span>
                </div>
              </div>
            </div>
          </div>

          {/* Themed Bingo */}
          <div className="bg-gradient-to-br from-light-cream to-white rounded-xl p-8 shadow-lg border-2 border-rose-gold hover:shadow-xl transition-all">
            <div className="text-center">
              <div className="w-20 h-20 bg-rose-gold rounded-full flex items-center justify-center mx-auto mb-6">
                <Star className="text-white" size={32} />
              </div>
              <h3 className="text-2xl font-bold text-dark-brown mb-4">Special Themed Bingo</h3>
              <p className="text-gray-700 text-lg mb-6">
                Seasonal and holiday-themed games with special patterns, bonus rounds, and exclusive prizes. Always something new to discover!
              </p>
              <div className="space-y-3 text-left">
                <div className="flex justify-between">
                  <span className="text-gray-600">Game Duration:</span>
                  <span className="font-semibold">8-20 minutes</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Entry Fees:</span>
                  <span className="font-semibold">$5 - $50</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Max Players:</span>
                  <span className="font-semibold">15 players</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}