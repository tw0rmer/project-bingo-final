import { useState } from "react";
import { Button } from "@/components/ui/button";
import { HelpCircle, ChevronDown, ChevronUp, Headphones, MessageCircle, Sparkles, Star } from "lucide-react";

export function GamesFAQ() {
  const [openItems, setOpenItems] = useState<Set<string>>(new Set());

  const toggleFaq = (id: string) => {
    const newOpenItems = new Set(openItems);
    if (newOpenItems.has(id)) {
      newOpenItems.delete(id);
    } else {
      newOpenItems.add(id);
    }
    setOpenItems(newOpenItems);
  };

  const gamesFaqs = [
    {
      id: "games-1",
      question: "What's the difference between Classic, Speed, and Themed bingo?",
      answer: "Classic Bingo offers traditional 10-15 minute games with social features. Speed Bingo features fast 3-5 minute games with numbers called every 2-3 seconds. Themed Bingo includes seasonal games with special patterns, bonus rounds, and exclusive prizes."
    },
    {
      id: "games-2", 
      question: "How does the 15x5 bingo card format work?",
      answer: "Our unique 15x5 format gives you 75 numbers on each card (15 rows × 5 columns) instead of the traditional 25. This means significantly more chances to win with multiple patterns possible on each card, including lines, shapes, and full cards."
    },
    {
      id: "games-3",
      question: "Can I play multiple games at the same time?",
      answer: "Yes! You can join multiple game rooms simultaneously. Our interface makes it easy to track all your active games. Many players enjoy having a Classic game running while playing several Speed games for maximum excitement."
    },
    {
      id: "games-4",
      question: "How are winners determined and prizes distributed?",
      answer: "Winners are determined by completing required patterns first. Our system uses certified random number generation for fair play. Prizes are automatically credited to your account balance immediately upon winning, with no delays."
    },
    {
      id: "games-5",
      question: "What are the entry fees and prize ranges for each game type?",
      answer: "Classic Bingo: $3-$25 entry, $180-$1000 prizes. Speed Bingo: $1-$15 entry, $50-$750 prizes. Themed Bingo: $5-$50 entry, up to $5000 prizes. Higher entry fees generally mean bigger prize pools."
    },
    {
      id: "games-6",
      question: "Are there special bonuses or promotions for different game types?",
      answer: "Yes! Classic games offer chat bonuses and loyalty rewards. Speed games feature turbo bonus rounds with 2x payouts. Themed games include seasonal bonuses, couple bonuses (Valentine's), and tournament formats with leaderboard prizes."
    },
    {
      id: "games-7",
      question: "Can I try the games for free before playing with real money?",
      answer: "Absolutely! New players receive 50 free games as part of their welcome bonus. You can try all three game types without any entry fees to find your favorites before playing with real money."
    },
    {
      id: "games-8",
      question: "How do I know which game type is best for me?",
      answer: "Try our free games to discover your preference! Choose Classic if you enjoy socializing and steady gameplay. Pick Speed if you love quick action and frequent wins. Select Themed games if you want variety and special celebrations."
    }
  ];

  return (
    <section className="py-20 bg-gradient-to-br from-cyan-50 via-blue-50 to-indigo-50 relative overflow-hidden">
      {/* Background decorations */}
      <div className="absolute inset-0">
        <div className="absolute top-20 left-10 w-20 h-20 bg-gradient-to-br from-cyan-300 to-blue-400 rounded-full opacity-20 animate-bounce-soft"></div>
        <div className="absolute top-40 right-20 w-16 h-16 bg-gradient-to-br from-blue-300 to-indigo-400 rounded-full opacity-20 animate-pulse"></div>
        <div className="absolute bottom-32 left-1/4 w-24 h-24 bg-gradient-to-br from-indigo-300 to-purple-400 rounded-full opacity-15 animate-bounce-soft" style={{ animationDelay: '1s' }}></div>
        
        {/* Floating sparkles */}
        <div className="absolute top-32 right-1/4 opacity-20">
          <Sparkles className="text-blue-400 animate-pulse" size={20} />
        </div>
        <div className="absolute bottom-40 left-1/3 opacity-15">
          <Star className="text-indigo-400 animate-bounce-soft" size={16} />
        </div>
      </div>
      
      <div className="max-w-5xl mx-auto px-4 relative z-10">
        <div className="text-center mb-16">
          <div className="inline-flex items-center justify-center w-24 h-24 bg-gradient-to-br from-cyan-500 to-blue-600 rounded-2xl mb-8 shadow-2xl">
            <HelpCircle className="text-white" size={48} />
          </div>
          
          <h2 className="text-6xl font-black text-transparent bg-clip-text bg-gradient-to-r from-cyan-600 via-blue-600 to-indigo-600 mb-6">
            Games FAQ
          </h2>
          
          <p className="text-2xl text-gray-700 max-w-3xl mx-auto leading-relaxed mb-8">
            Everything you need to know about our three exciting bingo game types
          </p>
          
          {/* Quick highlights */}
          <div className="flex justify-center items-center space-x-6 text-lg font-semibold">
            <div className="flex items-center text-blue-600">
              <MessageCircle className="mr-2" size={20} />
              <span>Instant Answers</span>
            </div>
            <div className="w-1 h-1 bg-gray-400 rounded-full"></div>
            <div className="flex items-center text-indigo-600">
              <Headphones className="mr-2" size={20} />
              <span>Expert Support</span>
            </div>
          </div>
        </div>

        <div className="space-y-6">
          {gamesFaqs.map((faq) => (
            <div key={faq.id} className="group relative overflow-hidden bg-white/95 backdrop-blur-sm rounded-3xl shadow-2xl border-2 border-gradient-to-r from-cyan-200 to-blue-200 transform hover:scale-105 transition-all duration-300">
              <div className="absolute inset-0 bg-gradient-to-br from-cyan-50/30 to-blue-50/30"></div>
              <button 
                onClick={() => toggleFaq(faq.id)}
                className="w-full px-8 py-6 text-left flex justify-between items-center hover:bg-gradient-to-r hover:from-cyan-50/50 hover:to-blue-50/50 transition-all duration-200 relative z-10"
              >
                <h3 className="text-xl font-bold text-gray-800 pr-4 group-hover:text-gray-900 transition-colors">{faq.question}</h3>
                <div className={`transition-all duration-300 ${openItems.has(faq.id) ? 'rotate-180' : 'rotate-0'}`}>
                {openItems.has(faq.id) ? (
                    <ChevronUp className="text-blue-600" size={24} />
                ) : (
                    <ChevronDown className="text-blue-600" size={24} />
                )}
                </div>
              </button>
              {openItems.has(faq.id) && (
                <div className="px-8 pb-6 text-gray-700 text-lg leading-relaxed relative z-10 animate-fade-in">
                  <div className="border-t border-blue-100 pt-4">
                  {faq.answer}
                  </div>
                </div>
              )}
              
              {/* Decorative element */}
              <div className="absolute top-4 right-4 opacity-10">
                <MessageCircle className="text-blue-400" size={16} />
              </div>
            </div>
          ))}
        </div>

        {/* Enhanced Game-specific help sections */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mt-16">
          <div className="group relative overflow-hidden bg-white/95 backdrop-blur-sm rounded-3xl p-8 shadow-2xl border-2 border-gradient-to-r from-yellow-200 to-orange-200 transform hover:scale-105 transition-all duration-300">
            <div className="absolute inset-0 bg-gradient-to-br from-yellow-50/30 to-orange-50/30"></div>
            <div className="relative z-10">
              <h4 className="text-2xl font-black text-gray-800 mb-4">Classic Bingo Help</h4>
              <p className="text-gray-700 mb-6 font-medium">Need help with traditional gameplay, chat features, or patterns?</p>
            <Button 
              variant="outline" 
                className="w-full border-2 border-yellow-400 text-yellow-600 hover:bg-gradient-to-r hover:from-yellow-500 hover:to-orange-500 hover:text-white font-bold py-3 rounded-xl transition-all duration-300"
            >
              Classic Game Guide
            </Button>
            </div>
          </div>
          
          <div className="group relative overflow-hidden bg-white/95 backdrop-blur-sm rounded-3xl p-8 shadow-2xl border-2 border-gradient-to-r from-red-200 to-pink-200 transform hover:scale-105 transition-all duration-300">
            <div className="absolute inset-0 bg-gradient-to-br from-red-50/30 to-pink-50/30"></div>
            <div className="relative z-10">
              <h4 className="text-2xl font-black text-gray-800 mb-4">Speed Bingo Help</h4>
              <p className="text-gray-700 mb-6 font-medium">Questions about fast gameplay, auto-mark, or turbo bonuses?</p>
            <Button 
              variant="outline" 
                className="w-full border-2 border-red-400 text-red-600 hover:bg-gradient-to-r hover:from-red-500 hover:to-pink-500 hover:text-white font-bold py-3 rounded-xl transition-all duration-300"
            >
              Speed Game Guide
            </Button>
            </div>
          </div>
          
          <div className="group relative overflow-hidden bg-white/95 backdrop-blur-sm rounded-3xl p-8 shadow-2xl border-2 border-gradient-to-r from-purple-200 to-indigo-200 transform hover:scale-105 transition-all duration-300">
            <div className="absolute inset-0 bg-gradient-to-br from-purple-50/30 to-indigo-50/30"></div>
            <div className="relative z-10">
              <h4 className="text-2xl font-black text-gray-800 mb-4">Themed Bingo Help</h4>
              <p className="text-gray-700 mb-6 font-medium">Learn about special patterns, themes, and seasonal events?</p>
            <Button 
              variant="outline" 
                className="w-full border-2 border-purple-400 text-purple-600 hover:bg-gradient-to-r hover:from-purple-500 hover:to-indigo-500 hover:text-white font-bold py-3 rounded-xl transition-all duration-300"
            >
              Themed Game Guide
            </Button>
          </div>
        </div>
        </div>

        {/* Enhanced Contact Support */}
        <div className="text-center mt-16">
          <div className="bg-white/95 backdrop-blur-sm rounded-3xl p-12 shadow-2xl border-2 border-gradient-to-r from-cyan-200 to-blue-200 relative overflow-hidden">
            <div className="absolute inset-0 bg-gradient-to-br from-cyan-50/30 to-blue-50/30"></div>
            
            <div className="relative z-10">
              <div className="inline-flex items-center justify-center w-16 h-16 bg-gradient-to-br from-cyan-500 to-blue-600 rounded-2xl mb-6 shadow-lg">
                <Headphones className="text-white" size={32} />
        </div>

              <h3 className="text-3xl font-black text-gray-800 mb-4">Still Need Help?</h3>
              <p className="text-xl text-gray-700 mb-8 max-w-2xl mx-auto leading-relaxed">
              Our friendly support team is available 24/7 to help you with any game-related questions
            </p>
              
              <div className="flex flex-col sm:flex-row gap-4 justify-center mb-8">
                <Button className="bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-600 hover:to-blue-700 text-white px-10 py-4 text-lg font-bold shadow-2xl transition-all duration-300 transform hover:scale-105 rounded-2xl">
                  <Headphones className="mr-3" size={20} />
                Live Chat Support
              </Button>
              <Button 
                variant="outline" 
                  className="px-10 py-4 text-lg border-2 border-cyan-400 text-cyan-600 hover:bg-gradient-to-r hover:from-cyan-500 hover:to-blue-600 hover:text-white font-bold rounded-2xl shadow-lg transition-all duration-300 transform hover:scale-105"
              >
                  <MessageCircle className="mr-2" size={20} />
                Email Support
              </Button>
              </div>
              
              {/* Support stats */}
              <div className="flex justify-center items-center space-x-8 text-sm font-semibold">
                <div className="flex items-center text-green-600">
                  <div className="w-2 h-2 bg-green-500 rounded-full mr-2 animate-pulse"></div>
                  <span>24/7 Available</span>
                </div>
                <div className="w-1 h-1 bg-gray-400 rounded-full"></div>
                <div className="flex items-center text-blue-600">
                  <MessageCircle className="mr-2" size={16} />
                  <span>Average Response: 2 mins</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}