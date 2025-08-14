import { Button } from "@/components/ui/button";
import { Play, UserPlus, LogIn, ArrowRight } from "lucide-react";

export function GamesCTA() {
  return (
    <section className="py-16 bg-cream">
      <div className="max-w-4xl mx-auto px-4 text-center">
        <div className="mb-8">
          <h2 className="text-5xl font-bold mb-4 text-dark-brown">Ready to Start Playing?</h2>
          <p className="text-xl text-gray-700 max-w-2xl mx-auto leading-relaxed">
            Join thousands of players already winning big in our premium bingo games. 
            Get your welcome bonus and start playing in under 2 minutes!
          </p>
        </div>

        {/* Welcome Bonus Highlight */}
        <div className="bg-white rounded-2xl p-8 mb-8 border-2 border-casino-gold">
          <div className="text-center">
            <h3 className="text-3xl font-bold mb-6 text-dark-brown">🎉 Welcome Bonus Package</h3>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
              <div className="bg-white rounded-xl p-6 shadow-lg border-2 border-casino-gold">
                <div className="text-2xl font-bold text-casino-red mb-2">100% Match</div>
                <p className="text-dark-brown font-semibold">Up to $500 bonus on your first deposit</p>
              </div>
              <div className="bg-white rounded-xl p-6 shadow-lg border-2 border-casino-gold">
                <div className="text-2xl font-bold text-casino-red mb-2">50 Free Games</div>
                <p className="text-dark-brown font-semibold">Try all game types with no entry fees</p>
              </div>
              <div className="bg-white rounded-xl p-6 shadow-lg border-2 border-casino-gold">
                <div className="text-2xl font-bold text-casino-red mb-2">VIP Status</div>
                <p className="text-dark-brown font-semibold">Instant access to exclusive rooms</p>
              </div>
            </div>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex flex-col sm:flex-row gap-4 justify-center items-center mb-8">
          <Button 
            size="lg"
            className="bg-casino-gold text-dark-brown px-10 py-4 text-xl font-bold hover:bg-yellow-400 shadow-2xl transform hover:scale-105 transition-all"
          >
            <UserPlus className="mr-3" size={24} />
            Sign Up & Claim Bonus
            <ArrowRight className="ml-3" size={20} />
          </Button>
          
          <Button 
            variant="outline"
            size="lg"
            className="border-2 border-casino-red text-casino-red px-8 py-4 text-xl font-bold hover:bg-casino-red hover:text-white"
          >
            <LogIn className="mr-2" size={20} />
            Already Have Account? Login
          </Button>
        </div>

        {/* Quick Start Steps */}
        <div className="bg-white rounded-xl p-8 border-2 border-casino-gold shadow-lg">
          <h4 className="text-2xl font-bold mb-6 text-dark-brown text-center">Get Started in 3 Easy Steps:</h4>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="text-center">
              <div className="w-12 h-12 bg-casino-red text-white rounded-full flex items-center justify-center mx-auto mb-3 font-bold text-xl shadow-lg">1</div>
              <p className="text-dark-brown font-semibold text-lg">Create your free account in 60 seconds</p>
            </div>
            <div className="text-center">
              <div className="w-12 h-12 bg-casino-red text-white rounded-full flex items-center justify-center mx-auto mb-3 font-bold text-xl shadow-lg">2</div>
              <p className="text-dark-brown font-semibold text-lg">Make your first deposit and claim bonus</p>
            </div>
            <div className="text-center">
              <div className="w-12 h-12 bg-casino-red text-white rounded-full flex items-center justify-center mx-auto mb-3 font-bold text-xl shadow-lg">3</div>
              <p className="text-dark-brown font-semibold text-lg">Choose a game and start winning!</p>
            </div>
          </div>
        </div>

        {/* Trust Indicators */}
        <div className="mt-8 text-center">
          <p className="text-gray-700 mb-4 text-lg font-medium">Trusted by over 50,000 players worldwide</p>
          <div className="flex justify-center items-center space-x-6 text-sm">
            <span className="flex items-center text-gray-700 font-medium">
              <span className="w-2 h-2 bg-green-400 rounded-full mr-2"></span>
              SSL Secured
            </span>
            <span className="flex items-center text-gray-700 font-medium">
              <span className="w-2 h-2 bg-green-400 rounded-full mr-2"></span>
              Licensed & Regulated
            </span>
            <span className="flex items-center text-gray-700 font-medium">
              <span className="w-2 h-2 bg-green-400 rounded-full mr-2"></span>
              Fair Play Certified
            </span>
            <span className="flex items-center text-gray-700 font-medium">
              <span className="w-2 h-2 bg-green-400 rounded-full mr-2"></span>
              24/7 Support
            </span>
          </div>
        </div>
      </div>
    </section>
  );
}