import { Button } from "@/components/ui/button";
import { Gamepad2, Filter, Eye, Users, DollarSign, Clock } from "lucide-react";

export function GameLobbyGuide() {
  return (
    <section className="py-16 bg-gradient-to-br from-cream to-light-cream">
      <div className="max-w-6xl mx-auto px-4">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
          {/* Content */}
          <div>
            <div className="flex items-center mb-6">
              <div className="w-16 h-16 bg-rose-gold rounded-full flex items-center justify-center mr-4">
                <Gamepad2 className="text-white" size={28} />
              </div>
              <h2 className="text-4xl font-bold text-dark-brown">Step 3: Navigate the Game Lobby</h2>
            </div>
            
            <p className="text-xl text-gray-700 mb-8 leading-relaxed">
              Our game lobby makes it easy to find the perfect bingo room for you. Filter by game type, 
              entry fee, or prize amount to quickly discover games that match your preferences and budget.
            </p>

            <div className="space-y-6 mb-8">
              <div className="bg-white rounded-xl p-6 shadow-lg border-l-4 border-rose-gold">
                <div className="flex items-start space-x-4">
                  <div className="w-10 h-10 bg-rose-gold text-white rounded-full flex items-center justify-center font-bold flex-shrink-0">1</div>
                  <div>
                    <h4 className="text-xl font-bold text-dark-brown mb-2">Browse Available Rooms</h4>
                    <p className="text-gray-700 text-lg mb-3">See all active bingo rooms with real-time player counts and starting times.</p>
                    <div className="flex items-center text-gray-600">
                      <Filter className="mr-2" size={16} />
                      <span>Filter by Classic, Speed, or Themed bingo games</span>
                    </div>
                  </div>
                </div>
              </div>

              <div className="bg-white rounded-xl p-6 shadow-lg border-l-4 border-rose-gold">
                <div className="flex items-start space-x-4">
                  <div className="w-10 h-10 bg-rose-gold text-white rounded-full flex items-center justify-center font-bold flex-shrink-0">2</div>
                  <div>
                    <h4 className="text-xl font-bold text-dark-brown mb-2">Check Game Details</h4>
                    <p className="text-gray-700 text-lg mb-3">View entry fees, prize pools, current players, and when the game starts.</p>
                    <div className="flex items-center text-gray-600">
                      <Eye className="mr-2" size={16} />
                      <span>All important information displayed clearly</span>
                    </div>
                  </div>
                </div>
              </div>

              <div className="bg-white rounded-xl p-6 shadow-lg border-l-4 border-rose-gold">
                <div className="flex items-start space-x-4">
                  <div className="w-10 h-10 bg-rose-gold text-white rounded-full flex items-center justify-center font-bold flex-shrink-0">3</div>
                  <div>
                    <h4 className="text-xl font-bold text-dark-brown mb-2">Join a Game</h4>
                    <p className="text-gray-700 text-lg mb-3">Click "Join Now" to enter the room and get your bingo card automatically.</p>
                    <div className="flex items-center text-gray-600">
                      <Users className="mr-2" size={16} />
                      <span>Join up to 15 players in each exciting game</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            <div className="bg-gradient-to-r from-orange-50 to-pink-50 rounded-xl p-6 shadow-lg border-2 border-rose-gold mb-8">
              <h4 className="text-xl font-bold text-dark-brown mb-4">Pro Tips for Choosing Games:</h4>
              <ul className="space-y-2 text-gray-700 text-lg">
                <li className="flex items-center">
                  <span className="w-2 h-2 bg-rose-gold rounded-full mr-3"></span>
                  Start with lower entry fee games to practice
                </li>
                <li className="flex items-center">
                  <span className="w-2 h-2 bg-rose-gold rounded-full mr-3"></span>
                  Check how many players are already in the room
                </li>
                <li className="flex items-center">
                  <span className="w-2 h-2 bg-rose-gold rounded-full mr-3"></span>
                  Look for games starting soon for quicker action
                </li>
                <li className="flex items-center">
                  <span className="w-2 h-2 bg-rose-gold rounded-full mr-3"></span>
                  Try different game types to find your favorite
                </li>
              </ul>
            </div>

            <Button 
              size="lg"
              className="bg-rose-gold text-white px-8 py-4 text-xl font-bold hover:bg-orange-600 shadow-lg"
            >
              <Gamepad2 className="mr-2" size={20} />
              Explore Game Lobby
            </Button>
          </div>

          {/* Game Lobby Visual */}
          <div className="bg-white rounded-xl shadow-2xl p-8 border-4 border-rose-gold">
            <h3 className="text-2xl font-bold casino-red mb-6 text-center">Game Lobby Preview</h3>
            
            {/* Filter Bar */}
            <div className="bg-gray-50 rounded-lg p-4 mb-6 border">
              <div className="flex items-center justify-between mb-3">
                <h4 className="font-semibold text-dark-brown">Filter Games:</h4>
                <Filter className="casino-red" size={20} />
              </div>
              <div className="flex gap-2 flex-wrap">
                <span className="bg-casino-gold text-white px-3 py-1 rounded-full text-sm font-semibold">All Games</span>
                <span className="bg-gray-200 text-gray-700 px-3 py-1 rounded-full text-sm">Classic</span>
                <span className="bg-gray-200 text-gray-700 px-3 py-1 rounded-full text-sm">Speed</span>
                <span className="bg-gray-200 text-gray-700 px-3 py-1 rounded-full text-sm">Themed</span>
              </div>
            </div>

            {/* Sample Game Cards */}
            <div className="space-y-4">
              <div className="border-2 border-green-200 bg-green-50 rounded-lg p-4">
                <div className="flex justify-between items-start mb-3">
                  <div>
                    <h5 className="font-bold text-dark-brown">Bingo-Go-The-Go!</h5>
                    <p className="text-sm text-gray-600">Room #1847</p>
                  </div>
                  <span className="bg-green-100 text-green-800 px-2 py-1 rounded text-xs font-semibold">OPEN</span>
                </div>
                <div className="grid grid-cols-2 gap-2 text-sm mb-3">
                  <div className="flex items-center">
                    <Users className="mr-1" size={12} />
                    <span>12/15 players</span>
                  </div>
                  <div className="flex items-center">
                    <DollarSign className="mr-1" size={12} />
                    <span>$250 prize</span>
                  </div>
                  <div className="flex items-center">
                    <span className="mr-1">💰</span>
                    <span>$5 entry</span>
                  </div>
                  <div className="flex items-center">
                    <Clock className="mr-1" size={12} />
                    <span>Starts in 2 min</span>
                  </div>
                </div>
                <div className="bg-casino-gold text-white text-center py-2 rounded font-semibold cursor-pointer hover:bg-yellow-500 transition-colors">
                  JOIN NOW
                </div>
              </div>
              
              <div className="border-2 border-yellow-200 bg-yellow-50 rounded-lg p-4">
                <div className="flex justify-between items-start mb-3">
                  <div>
                    <h5 className="font-bold text-dark-brown">Speed Bingo Express</h5>
                    <p className="text-sm text-gray-600">Room #1848</p>
                  </div>
                  <span className="bg-yellow-100 text-yellow-800 px-2 py-1 rounded text-xs font-semibold">WAITING</span>
                </div>
                <div className="grid grid-cols-2 gap-2 text-sm mb-3">
                  <div className="flex items-center">
                    <Users className="mr-1" size={12} />
                    <span>8/15 players</span>
                  </div>
                  <div className="flex items-center">
                    <DollarSign className="mr-1" size={12} />
                    <span>$150 prize</span>
                  </div>
                  <div className="flex items-center">
                    <span className="mr-1">💰</span>
                    <span>$3 entry</span>
                  </div>
                  <div className="flex items-center">
                    <Clock className="mr-1" size={12} />
                    <span>Starts in 5 min</span>
                  </div>
                </div>
                <div className="bg-casino-gold text-white text-center py-2 rounded font-semibold cursor-pointer hover:bg-yellow-500 transition-colors">
                  JOIN NOW
                </div>
              </div>
              
              <div className="border-2 border-red-200 bg-red-50 rounded-lg p-4">
                <div className="flex justify-between items-start mb-3">
                  <div>
                    <h5 className="font-bold text-dark-brown">Christmas Special 🎄</h5>
                    <p className="text-sm text-gray-600">Room #1849</p>
                  </div>
                  <span className="bg-red-100 text-red-800 px-2 py-1 rounded text-xs font-semibold">PREMIUM</span>
                </div>
                <div className="grid grid-cols-2 gap-2 text-sm mb-3">
                  <div className="flex items-center">
                    <Users className="mr-1" size={12} />
                    <span>3/15 players</span>
                  </div>
                  <div className="flex items-center">
                    <DollarSign className="mr-1" size={12} />
                    <span>$1000 prize</span>
                  </div>
                  <div className="flex items-center">
                    <span className="mr-1">💰</span>
                    <span>$25 entry</span>
                  </div>
                  <div className="flex items-center">
                    <Clock className="mr-1" size={12} />
                    <span>Starts in 8 min</span>
                  </div>
                </div>
                <div className="bg-casino-gold text-white text-center py-2 rounded font-semibold cursor-pointer hover:bg-yellow-500 transition-colors">
                  JOIN NOW
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}