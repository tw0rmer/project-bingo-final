import { Gamepad2, Sparkles } from "lucide-react";

export function GamesHeader() {
  return (
    <section className="py-16 bg-gradient-to-br from-cream to-light-cream">
      <div className="max-w-6xl mx-auto px-4 text-center">
        <div className="mb-8">
          <div className="inline-flex items-center justify-center w-20 h-20 bg-gradient-to-br from-casino-red to-rose-gold rounded-full mb-6">
            <Gamepad2 className="text-white" size={40} />
          </div>
          <h1 className="text-5xl md:text-6xl font-bold text-dark-brown mb-4">
            Our Bingo Games
          </h1>
          <p className="text-xl md:text-2xl text-gray-700 max-w-4xl mx-auto leading-relaxed">
            Discover the excitement of premium online bingo with our variety of game types. 
            From classic 15x5 bingo to fast-paced speed rounds and special themed events, 
            there's something for every player!
          </p>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mt-12">
          <div className="bg-white rounded-xl p-6 shadow-lg border-2 border-casino-gold">
            <div className="w-16 h-16 bg-casino-gold rounded-full flex items-center justify-center mx-auto mb-4">
              <Sparkles className="text-white" size={24} />
            </div>
            <h3 className="text-xl font-bold text-dark-brown mb-2">15+ Game Varieties</h3>
            <p className="text-gray-600">Choose from multiple bingo formats and themes</p>
          </div>
          
          <div className="bg-white rounded-xl p-6 shadow-lg border-2 border-casino-gold">
            <div className="w-16 h-16 bg-casino-red rounded-full flex items-center justify-center mx-auto mb-4">
              <span className="text-white font-bold text-xl">24/7</span>
            </div>
            <h3 className="text-xl font-bold text-dark-brown mb-2">Always Available</h3>
            <p className="text-gray-600">Games running around the clock for your convenience</p>
          </div>
          
          <div className="bg-white rounded-xl p-6 shadow-lg border-2 border-casino-gold">
            <div className="w-16 h-16 bg-rose-gold rounded-full flex items-center justify-center mx-auto mb-4">
              <span className="text-white font-bold text-lg">$1M+</span>
            </div>
            <h3 className="text-xl font-bold text-dark-brown mb-2">Big Prize Pools</h3>
            <p className="text-gray-600">Massive jackpots and daily prize opportunities</p>
          </div>
        </div>
      </div>
    </section>
  );
}