import { Button } from "@/components/ui/button";
import { Play } from "lucide-react";

export function HeroSection() {
  return (
    <section className="relative bg-gradient-to-br from-cream to-light-cream py-16 overflow-hidden">
      <div className="absolute inset-0 opacity-10">
        <div className="absolute top-10 left-10 w-20 h-20 bg-casino-gold rounded-full"></div>
        <div className="absolute top-32 right-20 w-16 h-16 bg-casino-red rounded-full"></div>
        <div className="absolute bottom-20 left-1/4 w-12 h-12 bg-rose-gold rounded-full"></div>
        <div className="absolute bottom-10 right-10 w-24 h-24 bg-casino-gold rounded-full"></div>
      </div>
      
      <div className="max-w-4xl mx-auto text-center px-4 relative z-10">
        <div className="bg-white rounded-2xl shadow-2xl p-8 border-4 border-casino-gold">
          <div className="mb-6">
            <span className="inline-block bg-casino-red text-white px-6 py-2 rounded-full text-lg font-semibold mb-4">
              🎉 WELCOME BONUS
            </span>
          </div>
          
          <h1 className="text-5xl md:text-6xl font-bold text-dark-brown mb-4">Welcome</h1>
          <div className="text-4xl md:text-5xl font-bold casino-red mb-6">
            100% Match Bonus
          </div>
          
          <p className="text-xl text-gray-700 mb-8 max-w-2xl mx-auto">
            Join thousands of players enjoying premium 15-player bingo games with exciting prizes and daily bonuses!
          </p>
          
          <Button 
            size="lg"
            className="bg-gradient-to-r from-yellow-500 to-yellow-600 text-white px-12 py-4 text-xl font-bold hover:shadow-lg transform hover:scale-105 transition-all"
          >
            <Play className="mr-2" size={20} />
            JOIN TODAY
          </Button>
          
          <p className="text-sm text-gray-600 mt-4">
            *Terms and conditions apply. 18+ only.
          </p>
        </div>
      </div>
    </section>
  );
}
