import { HelpCircle } from "lucide-react";

export function HowToPlay() {
  return (
    <section id="how-to-play" className="py-16 bg-gradient-to-br from-cream to-light-cream">
      <div className="max-w-6xl mx-auto px-4">
        <div className="text-center mb-12">
          <h2 className="text-4xl font-bold text-dark-brown mb-4">
            <HelpCircle className="inline mr-3 casino-gold" size={40} />
            How to Play 15x5 Bingo
          </h2>
          <p className="text-xl text-gray-600">Simple, fun, and exciting - learn in minutes!</p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
          {/* Bingo Card Visual */}
          <div className="bg-white rounded-xl shadow-lg p-8 border-4 border-casino-gold">
            <h3 className="text-2xl font-bold casino-red mb-6 text-center">Your Bingo Card (15x5)</h3>
            <div className="grid grid-cols-5 gap-2 mb-6">
              {/* Header Row */}
              <div className="bg-casino-red text-white font-bold text-center py-3 rounded">B</div>
              <div className="bg-casino-red text-white font-bold text-center py-3 rounded">I</div>
              <div className="bg-casino-red text-white font-bold text-center py-3 rounded">N</div>
              <div className="bg-casino-red text-white font-bold text-center py-3 rounded">G</div>
              <div className="bg-casino-red text-white font-bold text-center py-3 rounded">O</div>
              
              {/* Sample rows */}
              <div className="bg-gray-100 text-center py-2 rounded border font-semibold">7</div>
              <div className="bg-gray-100 text-center py-2 rounded border font-semibold">23</div>
              <div className="bg-casino-gold text-white text-center py-2 rounded border font-semibold">FREE</div>
              <div className="bg-gray-100 text-center py-2 rounded border font-semibold">52</div>
              <div className="bg-gray-100 text-center py-2 rounded border font-semibold">68</div>
              
              <div className="bg-gray-100 text-center py-2 rounded border font-semibold">12</div>
              <div className="bg-gray-100 text-center py-2 rounded border font-semibold">19</div>
              <div className="bg-gray-100 text-center py-2 rounded border font-semibold">34</div>
              <div className="bg-gray-100 text-center py-2 rounded border font-semibold">47</div>
              <div className="bg-gray-100 text-center py-2 rounded border font-semibold">71</div>
              
              {/* More rows indicator */}
              <div className="bg-gray-100 text-center py-2 rounded border text-gray-500">...</div>
              <div className="bg-gray-100 text-center py-2 rounded border text-gray-500">...</div>
              <div className="bg-gray-100 text-center py-2 rounded border text-gray-500">...</div>
              <div className="bg-gray-100 text-center py-2 rounded border text-gray-500">...</div>
              <div className="bg-gray-100 text-center py-2 rounded border text-gray-500">...</div>
            </div>
            <p className="text-sm text-gray-600 text-center">
              <strong>15 rows x 5 columns</strong> = More chances to win!
            </p>
          </div>

          {/* Instructions */}
          <div className="space-y-6">
            <div className="bg-white rounded-xl p-6 shadow-lg border-l-4 border-casino-gold">
              <div className="flex items-start space-x-4">
                <div className="w-10 h-10 bg-casino-gold text-white rounded-full flex items-center justify-center font-bold">1</div>
                <div>
                  <h4 className="text-xl font-bold text-dark-brown mb-2">Join a Room</h4>
                  <p className="text-gray-700 text-lg">Select from our available 15-player bingo rooms. Each room has different entry fees and prize pools.</p>
                </div>
              </div>
            </div>

            <div className="bg-white rounded-xl p-6 shadow-lg border-l-4 border-casino-gold">
              <div className="flex items-start space-x-4">
                <div className="w-10 h-10 bg-casino-gold text-white rounded-full flex items-center justify-center font-bold">2</div>
                <div>
                  <h4 className="text-xl font-bold text-dark-brown mb-2">Get Your Card</h4>
                  <p className="text-gray-700 text-lg">Receive a unique 15x5 bingo card with 75 numbers. More rows mean more chances to win!</p>
                </div>
              </div>
            </div>

            <div className="bg-white rounded-xl p-6 shadow-lg border-l-4 border-casino-gold">
              <div className="flex items-start space-x-4">
                <div className="w-10 h-10 bg-casino-gold text-white rounded-full flex items-center justify-center font-bold">3</div>
                <div>
                  <h4 className="text-xl font-bold text-dark-brown mb-2">Play & Win</h4>
                  <p className="text-gray-700 text-lg">Numbers are called automatically. Match patterns to win prizes. First to complete a line wins!</p>
                </div>
              </div>
            </div>

            <div className="bg-white rounded-xl p-6 shadow-lg border-l-4 border-casino-gold">
              <div className="flex items-start space-x-4">
                <div className="w-10 h-10 bg-casino-gold text-white rounded-full flex items-center justify-center font-bold">4</div>
                <div>
                  <h4 className="text-xl font-bold text-dark-brown mb-2">Collect Winnings</h4>
                  <p className="text-gray-700 text-lg">Winnings are automatically credited to your account. Cash out or play again!</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
