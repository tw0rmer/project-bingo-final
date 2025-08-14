import { HelpCircle, Users, Shield, Trophy } from "lucide-react";

export function HowToPlayHeader() {
  return (
    <section className="py-16 bg-gradient-to-br from-cream to-light-cream">
      <div className="max-w-6xl mx-auto px-4 text-center">
        <div className="mb-8">
          <div className="inline-flex items-center justify-center w-20 h-20 bg-gradient-to-br from-casino-red to-rose-gold rounded-full mb-6">
            <HelpCircle className="text-white" size={40} />
          </div>
          <h1 className="text-5xl md:text-6xl font-bold text-dark-brown mb-4">
            How It Works
          </h1>
          <p className="text-xl md:text-2xl text-gray-700 max-w-4xl mx-auto leading-relaxed">
            New to online bingo? Don't worry! We'll guide you through every step 
            to get you playing and winning in just minutes. It's easier than you think!
          </p>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mt-12">
          <div className="bg-white rounded-xl p-6 shadow-lg border-2 border-casino-gold">
            <div className="w-16 h-16 bg-casino-gold rounded-full flex items-center justify-center mx-auto mb-4">
              <Users className="text-white" size={24} />
            </div>
            <h3 className="text-xl font-bold text-dark-brown mb-2">Beginner Friendly</h3>
            <p className="text-gray-600">Step-by-step instructions perfect for first-time players</p>
          </div>
          
          <div className="bg-white rounded-xl p-6 shadow-lg border-2 border-casino-gold">
            <div className="w-16 h-16 bg-casino-red rounded-full flex items-center justify-center mx-auto mb-4">
              <Shield className="text-white" size={24} />
            </div>
            <h3 className="text-xl font-bold text-dark-brown mb-2">Safe & Secure</h3>
            <p className="text-gray-600">Your information and money are always protected</p>
          </div>
          
          <div className="bg-white rounded-xl p-6 shadow-lg border-2 border-casino-gold">
            <div className="w-16 h-16 bg-rose-gold rounded-full flex items-center justify-center mx-auto mb-4">
              <Trophy className="text-white" size={24} />
            </div>
            <h3 className="text-xl font-bold text-dark-brown mb-2">Start Winning Fast</h3>
            <p className="text-gray-600">Be playing and winning within 5 minutes of signing up</p>
          </div>
        </div>
      </div>
    </section>
  );
}