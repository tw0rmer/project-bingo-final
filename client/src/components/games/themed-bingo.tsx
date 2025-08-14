import { Button } from "@/components/ui/button";
import { Star, Calendar, Gift, Heart } from "lucide-react";

export function ThemedBingo() {
  return (
    <section className="py-16 bg-gradient-to-br from-cream to-light-cream">
      <div className="max-w-6xl mx-auto px-4">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
          {/* Content */}
          <div>
            <div className="flex items-center mb-6">
              <div className="w-16 h-16 bg-rose-gold rounded-full flex items-center justify-center mr-4">
                <Star className="text-white" size={28} />
              </div>
              <h2 className="text-4xl font-bold text-dark-brown">Special Themed Bingo</h2>
            </div>
            
            <p className="text-xl text-gray-700 mb-8 leading-relaxed">
              Experience bingo like never before with our seasonal and holiday-themed games! Each themed event features unique patterns, special bonus rounds, exclusive prizes, and festive atmospheres that make every game feel like a celebration.
            </p>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
              <div className="bg-white rounded-lg p-6 shadow-lg border-l-4 border-rose-gold">
                <div className="flex items-center mb-3">
                  <Calendar className="rose-gold mr-2" size={20} />
                  <h4 className="font-bold text-dark-brown">Seasonal Events</h4>
                </div>
                <p className="text-gray-700">Christmas, Halloween, Valentine's Day, and more special occasions</p>
              </div>
              
              <div className="bg-white rounded-lg p-6 shadow-lg border-l-4 border-rose-gold">
                <div className="flex items-center mb-3">
                  <Gift className="rose-gold mr-2" size={20} />
                  <h4 className="font-bold text-dark-brown">Special Prizes</h4>
                </div>
                <p className="text-gray-700">Exclusive rewards and bonus jackpots only available in themed games</p>
              </div>
            </div>

            <div className="bg-white rounded-xl p-6 shadow-lg border-2 border-rose-gold mb-8">
              <h4 className="text-xl font-bold text-dark-brown mb-4">Current Themed Games:</h4>
              <div className="space-y-4">
                <div className="flex items-center justify-between p-4 bg-gradient-to-r from-red-50 to-green-50 rounded-lg border">
                  <div className="flex items-center">
                    <span className="text-2xl mr-3">🎄</span>
                    <div>
                      <h5 className="font-bold text-dark-brown">Christmas Wonderland</h5>
                      <p className="text-gray-600">Holiday patterns & 2x bonus rounds</p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="font-bold casino-gold">$50 entry</p>
                    <p className="text-sm text-gray-600">Up to $2,500 prize</p>
                  </div>
                </div>
                
                <div className="flex items-center justify-between p-4 bg-gradient-to-r from-pink-50 to-red-50 rounded-lg border">
                  <div className="flex items-center">
                    <Heart className="text-pink-500 mr-3" size={24} />
                    <div>
                      <h5 className="font-bold text-dark-brown">Valentine's Romance</h5>
                      <p className="text-gray-600">Heart patterns & couple bonuses</p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="font-bold casino-gold">$25 entry</p>
                    <p className="text-sm text-gray-600">Up to $1,200 prize</p>
                  </div>
                </div>
                
                <div className="flex items-center justify-between p-4 bg-gradient-to-r from-orange-50 to-yellow-50 rounded-lg border">
                  <div className="flex items-center">
                    <span className="text-2xl mr-3">🏆</span>
                    <div>
                      <h5 className="font-bold text-dark-brown">Championship Series</h5>
                      <p className="text-gray-600">Weekly tournament format</p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="font-bold casino-gold">$15 entry</p>
                    <p className="text-sm text-gray-600">Up to $5,000 prize</p>
                  </div>
                </div>
              </div>
            </div>

            <div className="grid grid-cols-3 gap-4 mb-8">
              <div className="text-center bg-white rounded-lg p-4 shadow border-2 border-rose-gold">
                <p className="text-2xl font-bold text-rose-gold">$5-$50</p>
                <p className="text-gray-600 text-sm">Entry Range</p>
              </div>
              <div className="text-center bg-white rounded-lg p-4 shadow border-2 border-rose-gold">
                <p className="text-2xl font-bold text-rose-gold">8-20 min</p>
                <p className="text-gray-600 text-sm">Game Time</p>
              </div>
              <div className="text-center bg-white rounded-lg p-4 shadow border-2 border-rose-gold">
                <p className="text-2xl font-bold text-rose-gold">$5K Max</p>
                <p className="text-gray-600 text-sm">Top Prizes</p>
              </div>
            </div>

            <Button 
              size="lg"
              className="bg-rose-gold text-white px-8 py-4 text-xl font-bold hover:bg-orange-600 shadow-lg"
            >
              <Star className="mr-2" size={20} />
              Browse Themed Games
            </Button>
          </div>

          {/* Visual */}
          <div className="space-y-6">
            {/* Theme Showcase Cards */}
            <div className="bg-gradient-to-br from-green-600 to-red-600 rounded-xl p-6 text-white shadow-2xl">
              <div className="text-center">
                <span className="text-4xl mb-2 block">🎄</span>
                <h3 className="text-xl font-bold mb-2">Christmas Wonderland</h3>
                <p className="text-green-100 mb-4">Special holiday patterns like Christmas trees, presents, and stars!</p>
                <div className="grid grid-cols-5 gap-1 mb-4">
                  {/* Mini themed bingo card */}
                  <div className="bg-white text-green-600 font-bold text-center py-1 rounded text-xs">B</div>
                  <div className="bg-white text-green-600 font-bold text-center py-1 rounded text-xs">I</div>
                  <div className="bg-white text-green-600 font-bold text-center py-1 rounded text-xs">N</div>
                  <div className="bg-white text-green-600 font-bold text-center py-1 rounded text-xs">G</div>
                  <div className="bg-white text-green-600 font-bold text-center py-1 rounded text-xs">O</div>
                  
                  <div className="bg-yellow-400 text-green-600 text-center py-1 rounded text-xs">🎁</div>
                  <div className="bg-white bg-opacity-50 text-center py-1 rounded text-xs">19</div>
                  <div className="bg-yellow-400 text-green-600 text-center py-1 rounded text-xs">🎄</div>
                  <div className="bg-white bg-opacity-50 text-center py-1 rounded text-xs">47</div>
                  <div className="bg-yellow-400 text-green-600 text-center py-1 rounded text-xs">⭐</div>
                </div>
                <p className="text-sm text-green-100">Complete the Christmas tree pattern to win!</p>
              </div>
            </div>
            
            <div className="bg-gradient-to-br from-pink-500 to-red-500 rounded-xl p-6 text-white shadow-2xl">
              <div className="text-center">
                <Heart className="text-4xl mb-2 mx-auto" size={48} />
                <h3 className="text-xl font-bold mb-2">Valentine's Romance</h3>
                <p className="text-pink-100 mb-4">Heart-shaped patterns and romantic bonus rounds for couples!</p>
                <div className="bg-white bg-opacity-20 rounded-lg p-3">
                  <p className="text-sm font-semibold">💕 Couple Bonus: Play together, win together! 💕</p>
                </div>
              </div>
            </div>

            <div className="bg-gradient-to-br from-orange-500 to-yellow-500 rounded-xl p-6 text-white shadow-2xl">
              <div className="text-center">
                <span className="text-4xl mb-2 block">🏆</span>
                <h3 className="text-xl font-bold mb-2">Championship Series</h3>
                <p className="text-yellow-100 mb-4">Compete in weekly tournaments with massive prize pools!</p>
                <div className="bg-white bg-opacity-20 rounded-lg p-3">
                  <p className="text-sm font-semibold">🥇 Weekly Leaderboard Competition 🥇</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}