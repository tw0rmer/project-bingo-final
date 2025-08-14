import { Trophy, Zap, Star, TrendingUp, Shield, Users } from "lucide-react";

export function GameBenefits() {
  return (
    <section className="py-16 bg-white">
      <div className="max-w-6xl mx-auto px-4">
        <div className="text-center mb-12">
          <h2 className="text-4xl font-bold text-dark-brown mb-4">
            Why Choose Our Bingo Games?
          </h2>
          <p className="text-xl text-gray-600 max-w-3xl mx-auto">
            Every game type offers unique advantages designed to maximize your enjoyment and winning potential
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {/* Classic Bingo Benefits */}
          <div className="bg-gradient-to-br from-light-cream to-white rounded-xl p-8 shadow-lg border-2 border-casino-gold">
            <div className="text-center mb-6">
              <div className="w-16 h-16 bg-casino-gold rounded-full flex items-center justify-center mx-auto mb-4">
                <Trophy className="text-white" size={24} />
              </div>
              <h3 className="text-2xl font-bold text-dark-brown mb-2">Classic Bingo Benefits</h3>
            </div>
            
            <ul className="space-y-4">
              <li className="flex items-start">
                <Users className="casino-gold mr-3 mt-1 flex-shrink-0" size={18} />
                <div>
                  <h4 className="font-semibold text-dark-brown">Social Experience</h4>
                  <p className="text-gray-600 text-sm">Chat with other players and build friendships</p>
                </div>
              </li>
              <li className="flex items-start">
                <Shield className="casino-gold mr-3 mt-1 flex-shrink-0" size={18} />
                <div>
                  <h4 className="font-semibold text-dark-brown">Beginner Friendly</h4>
                  <p className="text-gray-600 text-sm">Perfect pace for learning and enjoying the game</p>
                </div>
              </li>
              <li className="flex items-start">
                <TrendingUp className="casino-gold mr-3 mt-1 flex-shrink-0" size={18} />
                <div>
                  <h4 className="font-semibold text-dark-brown">Steady Wins</h4>
                  <p className="text-gray-600 text-sm">Consistent winning opportunities with every game</p>
                </div>
              </li>
              <li className="flex items-start">
                <Trophy className="casino-gold mr-3 mt-1 flex-shrink-0" size={18} />
                <div>
                  <h4 className="font-semibold text-dark-brown">Big Prize Pools</h4>
                  <p className="text-gray-600 text-sm">Larger jackpots with higher entry fees</p>
                </div>
              </li>
            </ul>

            <div className="mt-6 p-4 bg-yellow-50 rounded-lg border-l-4 border-casino-gold">
              <p className="text-casino-gold font-semibold text-sm">
                🏆 Best for: Players who enjoy traditional bingo with time to socialize
              </p>
            </div>
          </div>

          {/* Speed Bingo Benefits */}
          <div className="bg-gradient-to-br from-red-50 to-white rounded-xl p-8 shadow-lg border-2 border-casino-red">
            <div className="text-center mb-6">
              <div className="w-16 h-16 bg-casino-red rounded-full flex items-center justify-center mx-auto mb-4">
                <Zap className="text-white" size={24} />
              </div>
              <h3 className="text-2xl font-bold text-dark-brown mb-2">Speed Bingo Benefits</h3>
            </div>
            
            <ul className="space-y-4">
              <li className="flex items-start">
                <Zap className="casino-red mr-3 mt-1 flex-shrink-0" size={18} />
                <div>
                  <h4 className="font-semibold text-dark-brown">Instant Excitement</h4>
                  <p className="text-gray-600 text-sm">Adrenaline-pumping fast-paced action</p>
                </div>
              </li>
              <li className="flex items-start">
                <TrendingUp className="casino-red mr-3 mt-1 flex-shrink-0" size={18} />
                <div>
                  <h4 className="font-semibold text-dark-brown">More Games Per Hour</h4>
                  <p className="text-gray-600 text-sm">Play 8-12 games in the time of one classic game</p>
                </div>
              </li>
              <li className="flex items-start">
                <Trophy className="casino-red mr-3 mt-1 flex-shrink-0" size={18} />
                <div>
                  <h4 className="font-semibold text-dark-brown">Quick Payouts</h4>
                  <p className="text-gray-600 text-sm">Instant wins and immediate satisfaction</p>
                </div>
              </li>
              <li className="flex items-start">
                <Shield className="casino-red mr-3 mt-1 flex-shrink-0" size={18} />
                <div>
                  <h4 className="font-semibold text-dark-brown">Lower Risk</h4>
                  <p className="text-gray-600 text-sm">Smaller entry fees, more chances to play</p>
                </div>
              </li>
            </ul>

            <div className="mt-6 p-4 bg-red-50 rounded-lg border-l-4 border-casino-red">
              <p className="text-casino-red font-semibold text-sm">
                ⚡ Best for: Players who love quick action and frequent wins
              </p>
            </div>
          </div>

          {/* Themed Bingo Benefits */}
          <div className="bg-gradient-to-br from-orange-50 to-white rounded-xl p-8 shadow-lg border-2 border-rose-gold">
            <div className="text-center mb-6">
              <div className="w-16 h-16 bg-rose-gold rounded-full flex items-center justify-center mx-auto mb-4">
                <Star className="text-white" size={24} />
              </div>
              <h3 className="text-2xl font-bold text-dark-brown mb-2">Themed Bingo Benefits</h3>
            </div>
            
            <ul className="space-y-4">
              <li className="flex items-start">
                <Star className="text-rose-gold mr-3 mt-1 flex-shrink-0" size={18} />
                <div>
                  <h4 className="font-semibold text-dark-brown">Unique Experience</h4>
                  <p className="text-gray-600 text-sm">Special patterns, themes, and festive atmosphere</p>
                </div>
              </li>
              <li className="flex items-start">
                <Trophy className="text-rose-gold mr-3 mt-1 flex-shrink-0" size={18} />
                <div>
                  <h4 className="font-semibold text-dark-brown">Exclusive Prizes</h4>
                  <p className="text-gray-600 text-sm">Special rewards only available in themed games</p>
                </div>
              </li>
              <li className="flex items-start">
                <TrendingUp className="text-rose-gold mr-3 mt-1 flex-shrink-0" size={18} />
                <div>
                  <h4 className="font-semibold text-dark-brown">Bonus Rounds</h4>
                  <p className="text-gray-600 text-sm">Extra chances to win with special game features</p>
                </div>
              </li>
              <li className="flex items-start">
                <Users className="text-rose-gold mr-3 mt-1 flex-shrink-0" size={18} />
                <div>
                  <h4 className="font-semibold text-dark-brown">Community Events</h4>
                  <p className="text-gray-600 text-sm">Join celebrations with other players</p>
                </div>
              </li>
            </ul>

            <div className="mt-6 p-4 bg-orange-50 rounded-lg border-l-4 border-rose-gold">
              <p className="text-rose-gold font-semibold text-sm">
                🌟 Best for: Players who enjoy variety and special celebrations
              </p>
            </div>
          </div>
        </div>

        {/* Overall Benefits */}
        <div className="mt-16 bg-gradient-to-br from-cream to-light-cream rounded-2xl p-8 border-4 border-casino-gold">
          <h3 className="text-3xl font-bold text-center text-dark-brown mb-8">
            All Games Include These Premium Features
          </h3>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            <div className="text-center">
              <div className="w-12 h-12 bg-casino-gold rounded-full flex items-center justify-center mx-auto mb-3">
                <Shield className="text-white" size={20} />
              </div>
              <h4 className="font-bold text-dark-brown mb-2">Fair Play Guaranteed</h4>
              <p className="text-gray-600 text-sm">RNG certified for completely random number generation</p>
            </div>
            
            <div className="text-center">
              <div className="w-12 h-12 bg-casino-gold rounded-full flex items-center justify-center mx-auto mb-3">
                <Zap className="text-white" size={20} />
              </div>
              <h4 className="font-bold text-dark-brown mb-2">Instant Payouts</h4>
              <p className="text-gray-600 text-sm">Winnings credited immediately to your account</p>
            </div>
            
            <div className="text-center">
              <div className="w-12 h-12 bg-casino-gold rounded-full flex items-center justify-center mx-auto mb-3">
                <Users className="text-white" size={20} />
              </div>
              <h4 className="font-bold text-dark-brown mb-2">24/7 Support</h4>
              <p className="text-gray-600 text-sm">Always here to help with any questions or issues</p>
            </div>
            
            <div className="text-center">
              <div className="w-12 h-12 bg-casino-gold rounded-full flex items-center justify-center mx-auto mb-3">
                <Trophy className="text-white" size={20} />
              </div>
              <h4 className="font-bold text-dark-brown mb-2">VIP Rewards</h4>
              <p className="text-gray-600 text-sm">Earn points and unlock exclusive bonuses</p>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}