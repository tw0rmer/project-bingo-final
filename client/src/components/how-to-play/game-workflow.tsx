import { Card } from "@/components/ui/card";
import { Trophy, Target, Zap, CheckCircle } from "lucide-react";

export function GameWorkflow() {
  return (
    <section className="py-16 bg-white">
      <div className="max-w-6xl mx-auto px-4">
        <div className="text-center mb-12">
          <h2 className="text-4xl font-bold text-dark-brown mb-4">
            How a Typical Game Works
          </h2>
          <p className="text-xl text-gray-600 max-w-4xl mx-auto">
            Once you join a game, here's the complete end-to-end experience from getting your bingo card to celebrating your win!
          </p>
        </div>

        {/* Bingo Card Visual */}
        <div className="bg-gradient-to-br from-cream to-light-cream rounded-2xl p-8 mb-12 border-4 border-casino-gold">
          <h3 className="text-2xl font-bold text-center text-dark-brown mb-6">Your 15x5 Bingo Card</h3>
          
          <div className="max-w-md mx-auto bg-white rounded-xl p-6 shadow-lg border-2 border-casino-red">
            <div className="grid grid-cols-5 gap-1 mb-4">
              {/* Header Row */}
              <div className="bg-casino-red text-white font-bold text-center py-2 rounded text-lg">B</div>
              <div className="bg-casino-red text-white font-bold text-center py-2 rounded text-lg">I</div>
              <div className="bg-casino-red text-white font-bold text-center py-2 rounded text-lg">N</div>
              <div className="bg-casino-red text-white font-bold text-center py-2 rounded text-lg">G</div>
              <div className="bg-casino-red text-white font-bold text-center py-2 rounded text-lg">O</div>
              
              {/* Sample numbers */}
              {[
                ['2', '4', '7', '12', '15'],
                ['1', '6', '9', '11', '14'],
                ['3', '8', 'FREE', '10', '13'],
                ['5', '2', '6', '14', '12'],
                ['4', '7', '11', '9', '15']
              ].map((row, rowIndex) => 
                row.map((num, colIndex) => (
                  <div 
                    key={`${rowIndex}-${colIndex}`}
                    className={`
                      text-center py-2 font-semibold border border-gray-300 rounded
                      ${num === 'FREE' ? 'bg-casino-gold text-white' : 
                        (rowIndex === 2 && colIndex === 1) || (rowIndex === 1 && colIndex === 3) || 
                        (rowIndex === 3 && colIndex === 0) ? 'bg-green-200 text-green-800' : 'bg-gray-50'}
                    `}
                  >
                    {num}
                  </div>
                ))
              )}
            </div>
            <p className="text-sm text-center text-gray-600">Numbers 1-15 only • FREE center square</p>
          </div>
        </div>

        {/* Game Flow Steps */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-12">
          <Card className="p-6 text-center border-2 border-casino-gold hover:shadow-lg transition-all">
            <div className="w-16 h-16 bg-casino-gold rounded-full flex items-center justify-center mx-auto mb-4">
              <span className="text-white font-bold text-2xl">1</span>
            </div>
            <h4 className="text-xl font-bold text-dark-brown mb-3">Get Your Card</h4>
            <p className="text-gray-700">
              Receive your unique 15x5 bingo card with numbers 1-15 distributed across B-I-N-G-O columns.
            </p>
          </Card>

          <Card className="p-6 text-center border-2 border-casino-red hover:shadow-lg transition-all">
            <div className="w-16 h-16 bg-casino-red rounded-full flex items-center justify-center mx-auto mb-4">
              <span className="text-white font-bold text-2xl">2</span>
            </div>
            <h4 className="text-xl font-bold text-dark-brown mb-3">Numbers Called</h4>
            <p className="text-gray-700">
              Watch as numbers are called automatically. Matching numbers on your card are marked instantly.
            </p>
          </Card>

          <Card className="p-6 text-center border-2 border-rose-gold hover:shadow-lg transition-all">
            <div className="w-16 h-16 bg-rose-gold rounded-full flex items-center justify-center mx-auto mb-4">
              <span className="text-white font-bold text-2xl">3</span>
            </div>
            <h4 className="text-xl font-bold text-dark-brown mb-3">Pattern Forms</h4>
            <p className="text-gray-700">
              Complete lines, patterns, or full house as numbers are called. The system tracks everything!
            </p>
          </Card>

          <Card className="p-6 text-center border-2 border-green-500 hover:shadow-lg transition-all">
            <div className="w-16 h-16 bg-green-500 rounded-full flex items-center justify-center mx-auto mb-4">
              <Trophy className="text-white" size={24} />
            </div>
            <h4 className="text-xl font-bold text-dark-brown mb-3">Win & Celebrate!</h4>
            <p className="text-gray-700">
              When you complete the winning pattern, you're automatically declared the winner and paid instantly.
            </p>
          </Card>
        </div>

        {/* Winning Patterns */}
        <div className="bg-gradient-to-br from-light-cream to-white rounded-2xl p-8 border-4 border-casino-red">
          <h3 className="text-3xl font-bold text-center text-dark-brown mb-8">Common Winning Patterns</h3>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="text-center">
              <div className="bg-white rounded-lg p-4 shadow-lg border-2 border-casino-gold mb-4">
                <div className="grid grid-cols-5 gap-1">
                  {Array.from({ length: 25 }, (_, i) => (
                    <div 
                      key={i}
                      className={`w-6 h-6 rounded border ${
                        Math.floor(i / 5) === 2 ? 'bg-green-400' : 'bg-gray-100'
                      }`}
                    />
                  ))}
                </div>
              </div>
              <h4 className="text-xl font-bold text-dark-brown mb-2">Line Bingo</h4>
              <p className="text-gray-700">Complete any horizontal, vertical, or diagonal line</p>
            </div>
            
            <div className="text-center">
              <div className="bg-white rounded-lg p-4 shadow-lg border-2 border-casino-red mb-4">
                <div className="grid grid-cols-5 gap-1">
                  {Array.from({ length: 25 }, (_, i) => (
                    <div 
                      key={i}
                      className={`w-6 h-6 rounded border ${
                        i === 0 || i === 6 || i === 12 || i === 18 || i === 24 ? 'bg-green-400' : 'bg-gray-100'
                      }`}
                    />
                  ))}
                </div>
              </div>
              <h4 className="text-xl font-bold text-dark-brown mb-2">Diagonal</h4>
              <p className="text-gray-700">Complete a diagonal line from corner to corner</p>
            </div>
            
            <div className="text-center">
              <div className="bg-white rounded-lg p-4 shadow-lg border-2 border-rose-gold mb-4">
                <div className="grid grid-cols-5 gap-1">
                  {Array.from({ length: 25 }, (_, i) => (
                    <div 
                      key={i}
                      className="w-6 h-6 rounded border bg-green-400"
                    />
                  ))}
                </div>
              </div>
              <h4 className="text-xl font-bold text-dark-brown mb-2">Full House</h4>
              <p className="text-gray-700">Mark every number on your card for the biggest win!</p>
            </div>
          </div>
        </div>

        {/* Key Features */}
        <div className="mt-12 grid grid-cols-1 md:grid-cols-2 gap-8">
          <div className="bg-white rounded-xl p-6 shadow-lg border-2 border-casino-gold">
            <h4 className="text-xl font-bold text-dark-brown mb-4 flex items-center">
              <Zap className="casino-gold mr-2" size={24} />
              Automatic Features
            </h4>
            <ul className="space-y-2 text-gray-700">
              <li className="flex items-center">
                <CheckCircle className="casino-gold mr-3" size={16} />
                Numbers marked automatically when called
              </li>
              <li className="flex items-center">
                <CheckCircle className="casino-gold mr-3" size={16} />
                Instant win detection and notification
              </li>
              <li className="flex items-center">
                <CheckCircle className="casino-gold mr-3" size={16} />
                Prizes paid immediately to your account
              </li>
              <li className="flex items-center">
                <CheckCircle className="casino-gold mr-3" size={16} />
                Game history saved for your records
              </li>
            </ul>
          </div>

          <div className="bg-white rounded-xl p-6 shadow-lg border-2 border-casino-red">
            <h4 className="text-xl font-bold text-dark-brown mb-4 flex items-center">
              <Target className="casino-red mr-2" size={24} />
              Game Variations
            </h4>
            <ul className="space-y-2 text-gray-700">
              <li className="flex items-center">
                <CheckCircle className="casino-red mr-3" size={16} />
                Classic Bingo: Traditional full house wins
              </li>
              <li className="flex items-center">
                <CheckCircle className="casino-red mr-3" size={16} />
                Speed Bingo: Fast-paced with quick calls
              </li>
              <li className="flex items-center">
                <CheckCircle className="casino-red mr-3" size={16} />
                Pattern Games: Special shapes and designs
              </li>
              <li className="flex items-center">
                <CheckCircle className="casino-red mr-3" size={16} />
                Multi-line: Multiple winners per game
              </li>
            </ul>
          </div>
        </div>
      </div>
    </section>
  );
}