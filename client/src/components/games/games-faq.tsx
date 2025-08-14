import { useState } from "react";
import { Button } from "@/components/ui/button";
import { HelpCircle, ChevronDown, ChevronUp, Headphones } from "lucide-react";

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
    <section className="py-16 bg-light-cream">
      <div className="max-w-4xl mx-auto px-4">
        <div className="text-center mb-12">
          <h2 className="text-4xl font-bold text-dark-brown mb-4">
            <HelpCircle className="inline mr-3 casino-gold" size={40} />
            Games FAQ
          </h2>
          <p className="text-xl text-gray-600">
            Everything you need to know about our three exciting bingo game types
          </p>
        </div>

        <div className="space-y-6">
          {gamesFaqs.map((faq) => (
            <div key={faq.id} className="bg-white rounded-xl shadow-lg border border-gray-200">
              <button 
                onClick={() => toggleFaq(faq.id)}
                className="w-full px-6 py-4 text-left flex justify-between items-center hover:bg-gray-50 transition-colors"
              >
                <h3 className="text-lg font-semibold text-dark-brown pr-4">{faq.question}</h3>
                {openItems.has(faq.id) ? (
                  <ChevronUp className="casino-gold flex-shrink-0" size={20} />
                ) : (
                  <ChevronDown className="casino-gold flex-shrink-0" size={20} />
                )}
              </button>
              {openItems.has(faq.id) && (
                <div className="px-6 pb-4 text-gray-700 text-lg">
                  {faq.answer}
                </div>
              )}
            </div>
          ))}
        </div>

        {/* Game-specific help sections */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-12">
          <div className="bg-white rounded-xl p-6 shadow-lg border-2 border-casino-gold">
            <h4 className="text-xl font-bold text-dark-brown mb-3">Classic Bingo Help</h4>
            <p className="text-gray-600 mb-4">Need help with traditional gameplay, chat features, or patterns?</p>
            <Button 
              variant="outline" 
              className="w-full border-casino-gold casino-gold hover:bg-casino-gold hover:text-white"
            >
              Classic Game Guide
            </Button>
          </div>
          
          <div className="bg-white rounded-xl p-6 shadow-lg border-2 border-casino-red">
            <h4 className="text-xl font-bold text-dark-brown mb-3">Speed Bingo Help</h4>
            <p className="text-gray-600 mb-4">Questions about fast gameplay, auto-mark, or turbo bonuses?</p>
            <Button 
              variant="outline" 
              className="w-full border-casino-red casino-red hover:bg-casino-red hover:text-white"
            >
              Speed Game Guide
            </Button>
          </div>
          
          <div className="bg-white rounded-xl p-6 shadow-lg border-2 border-rose-gold">
            <h4 className="text-xl font-bold text-dark-brown mb-3">Themed Bingo Help</h4>
            <p className="text-gray-600 mb-4">Learn about special patterns, themes, and seasonal events?</p>
            <Button 
              variant="outline" 
              className="w-full border-rose-gold text-rose-gold hover:bg-rose-gold hover:text-white"
            >
              Themed Game Guide
            </Button>
          </div>
        </div>

        {/* Contact Support */}
        <div className="text-center mt-12">
          <div className="bg-gradient-to-br from-cream to-white rounded-xl p-8 shadow-lg border-2 border-casino-gold">
            <h3 className="text-2xl font-bold text-dark-brown mb-4">Still Need Help?</h3>
            <p className="text-lg text-gray-600 mb-6">
              Our friendly support team is available 24/7 to help you with any game-related questions
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Button className="bg-casino-gold text-white px-8 py-3 text-lg font-semibold hover:bg-yellow-500">
                <Headphones className="mr-2" size={20} />
                Live Chat Support
              </Button>
              <Button 
                variant="outline" 
                className="px-8 py-3 text-lg border-2 border-casino-gold casino-gold hover:bg-casino-gold hover:text-white"
              >
                Email Support
              </Button>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}