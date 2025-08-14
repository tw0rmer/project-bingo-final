import { Button } from "@/components/ui/button";
import { Play, Gift, Clock, Trophy } from "lucide-react";

export function HowToPlayCTA() {
  return (
    <section className="py-20 bg-gradient-to-br from-casino-red via-rose-gold to-casino-gold">
      <div className="max-w-4xl mx-auto px-4 text-center">
        <div className="mb-8">
          <h2 className="text-4xl md:text-5xl font-bold text-white mb-4">
            Ready to Start Playing?
          </h2>
          <p className="text-xl md:text-2xl text-white opacity-90 max-w-3xl mx-auto leading-relaxed">
            Join thousands of players who are already winning big! Your first game is just minutes away.
          </p>
        </div>

        {/* Quick Benefits */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-10">
          <div className="bg-white bg-opacity-15 backdrop-blur-sm rounded-xl p-6 border border-white border-opacity-30">
            <div className="w-16 h-16 bg-white bg-opacity-20 rounded-full flex items-center justify-center mx-auto mb-4">
              <Clock className="text-white" size={28} />
            </div>
            <h3 className="text-xl font-bold text-white mb-2">Start in Under 5 Minutes</h3>
            <p className="text-white opacity-90">From signup to your first game - it's that quick!</p>
          </div>
          
          <div className="bg-white bg-opacity-15 backdrop-blur-sm rounded-xl p-6 border border-white border-opacity-30">
            <div className="w-16 h-16 bg-white bg-opacity-20 rounded-full flex items-center justify-center mx-auto mb-4">
              <Gift className="text-white" size={28} />
            </div>
            <h3 className="text-xl font-bold text-white mb-2">100% Welcome Bonus</h3>
            <p className="text-white opacity-90">Double your money with our generous first deposit bonus</p>
          </div>
          
          <div className="bg-white bg-opacity-15 backdrop-blur-sm rounded-xl p-6 border border-white border-opacity-30">
            <div className="w-16 h-16 bg-white bg-opacity-20 rounded-full flex items-center justify-center mx-auto mb-4">
              <Trophy className="text-white" size={28} />
            </div>
            <h3 className="text-xl font-bold text-white mb-2">Win Real Money</h3>
            <p className="text-white opacity-90">Instant payouts directly to your account when you win</p>
          </div>
        </div>

        {/* Main CTA */}
        <div className="bg-white rounded-2xl p-8 shadow-2xl border-4 border-white mb-8">
          <h3 className="text-2xl font-bold text-dark-brown mb-6">🎉 Limited Time Welcome Package</h3>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
            <div className="bg-gradient-to-br from-green-50 to-emerald-50 rounded-lg p-4 border-2 border-green-300">
              <div className="text-2xl font-bold text-green-700 mb-1">100% Match</div>
              <p className="text-gray-700 font-semibold">Up to $500 bonus</p>
            </div>
            <div className="bg-gradient-to-br from-blue-50 to-sky-50 rounded-lg p-4 border-2 border-blue-300">
              <div className="text-2xl font-bold text-blue-700 mb-1">50 Free Games</div>
              <p className="text-gray-700 font-semibold">Try all game types</p>
            </div>
            <div className="bg-gradient-to-br from-purple-50 to-violet-50 rounded-lg p-4 border-2 border-purple-300">
              <div className="text-2xl font-bold text-purple-700 mb-1">VIP Status</div>
              <p className="text-gray-700 font-semibold">Exclusive room access</p>
            </div>
          </div>
          
          <div className="space-y-4">
            <Button 
              size="lg"
              className="bg-casino-red text-white px-12 py-6 text-2xl font-bold hover:bg-red-700 shadow-lg w-full md:w-auto"
            >
              <Play className="mr-3" size={24} />
              Claim Bonus & Start Playing
            </Button>
            
            <p className="text-sm text-gray-600">
              Sign up takes 60 seconds • No hidden fees • 24/7 support available
            </p>
          </div>
        </div>

        {/* Security Badges */}
        <div className="flex flex-wrap justify-center items-center gap-6 text-white opacity-90">
          <div className="flex items-center">
            <div className="w-8 h-8 bg-white bg-opacity-20 rounded-full flex items-center justify-center mr-2">
              <span className="text-sm font-bold">🔒</span>
            </div>
            <span className="text-sm font-semibold">SSL Secured</span>
          </div>
          <div className="flex items-center">
            <div className="w-8 h-8 bg-white bg-opacity-20 rounded-full flex items-center justify-center mr-2">
              <span className="text-sm font-bold">✓</span>
            </div>
            <span className="text-sm font-semibold">Licensed & Regulated</span>
          </div>
          <div className="flex items-center">
            <div className="w-8 h-8 bg-white bg-opacity-20 rounded-full flex items-center justify-center mr-2">
              <span className="text-sm font-bold">⚡</span>
            </div>
            <span className="text-sm font-semibold">Instant Payouts</span>
          </div>
          <div className="flex items-center">
            <div className="w-8 h-8 bg-white bg-opacity-20 rounded-full flex items-center justify-center mr-2">
              <span className="text-sm font-bold">📞</span>
            </div>
            <span className="text-sm font-semibold">24/7 Support</span>
          </div>
        </div>
      </div>
    </section>
  );
}