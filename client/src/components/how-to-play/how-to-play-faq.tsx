import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { HelpCircle } from "lucide-react";

export function HowToPlayFAQ() {
  const faqs = [
    {
      question: "How do I know if I've won?",
      answer: "The system automatically detects when you complete a winning pattern and immediately notifies you with celebration animations and sounds. Your winnings are instantly credited to your account balance."
    },
    {
      question: "What happens if I lose my internet connection during a game?",
      answer: "Don't worry! Your bingo card continues to be marked automatically even if you disconnect. If you win while disconnected, your prize will still be credited to your account when you reconnect."
    },
    {
      question: "How long does it take to receive my winnings?",
      answer: "Winnings are credited to your account instantly when you win. You can withdraw your balance immediately using the same payment method you used to deposit, and most withdrawals are processed within 1-3 business days."
    },
    {
      question: "Can I play multiple bingo cards at the same time?",
      answer: "Currently, each player gets one bingo card per game to keep things simple and fair. However, you can join multiple different game rooms simultaneously if you want to play several games at once."
    },
    {
      question: "What are the minimum and maximum deposits?",
      answer: "The minimum deposit is $10, perfect for beginners who want to start small. The maximum deposit varies by payment method but is typically $500 for your first deposit, with higher limits available for verified accounts."
    },
    {
      question: "How do I claim my welcome bonus?",
      answer: "Your 100% welcome bonus is automatically applied when you make your first deposit. Simply deposit any amount between $10-$500, and we'll instantly double it! The bonus funds can be used to play any bingo games."
    },
    {
      question: "Are the games fair and random?",
      answer: "Absolutely! All our bingo games use certified random number generators (RNG) that are regularly audited by independent testing agencies. Every number call is completely random and fair for all players."
    },
    {
      question: "What if I need help during a game?",
      answer: "Our customer support team is available 24/7 through live chat, email, or phone. You can also access our help center directly from any game screen for instant answers to common questions."
    },
    {
      question: "Can I practice before playing for real money?",
      answer: "Yes! Your welcome package includes 50 free game entries that let you play without any entry fees. This is perfect for getting comfortable with the interface and trying different game types."
    },
    {
      question: "How do I withdraw my winnings?",
      answer: "Go to your account page and click 'Withdraw'. You can withdraw using the same method you used to deposit. Most withdrawals are processed within 1-3 business days, and there's no minimum withdrawal amount."
    },
    {
      question: "What happens if two players win at the same time?",
      answer: "If multiple players complete the winning pattern on the same number call, the prize pool is split equally between all winners. This is rare but ensures everyone gets their fair share."
    },
    {
      question: "Can I change my payment method after signing up?",
      answer: "Yes, you can add multiple payment methods to your account at any time. Go to your account settings to add new cards, PayPal, or other payment options for deposits and withdrawals."
    }
  ];

  return (
    <section className="py-16 bg-gradient-to-br from-cream to-light-cream">
      <div className="max-w-4xl mx-auto px-4">
        <div className="text-center mb-12">
          <div className="inline-flex items-center justify-center w-16 h-16 bg-casino-gold rounded-full mb-4">
            <HelpCircle className="text-white" size={32} />
          </div>
          <h2 className="text-4xl font-bold text-dark-brown mb-4">
            Frequently Asked Questions
          </h2>
          <p className="text-xl text-gray-600 max-w-3xl mx-auto">
            Got questions? We've got answers! Here are the most common questions new players ask about gameplay, deposits, and winnings.
          </p>
        </div>

        <div className="bg-white rounded-2xl shadow-lg border-4 border-casino-gold p-8">
          <Accordion type="single" collapsible className="w-full">
            {faqs.map((faq, index) => (
              <AccordionItem key={index} value={`item-${index}`} className="border-b border-gray-200">
                <AccordionTrigger className="text-left text-lg font-semibold text-dark-brown hover:casino-gold py-6">
                  {faq.question}
                </AccordionTrigger>
                <AccordionContent className="text-gray-700 text-lg leading-relaxed pb-6">
                  {faq.answer}
                </AccordionContent>
              </AccordionItem>
            ))}
          </Accordion>
        </div>

        <div className="text-center mt-8">
          <p className="text-lg text-gray-700 mb-4">
            Still have questions? Our support team is here to help!
          </p>
          <div className="flex flex-wrap justify-center gap-4">
            <div className="bg-white rounded-lg px-6 py-3 shadow border-2 border-casino-gold">
              <span className="font-semibold text-dark-brown">💬 Live Chat: Available 24/7</span>
            </div>
            <div className="bg-white rounded-lg px-6 py-3 shadow border-2 border-casino-red">
              <span className="font-semibold text-dark-brown">📧 Email: support@wildcardpremium.com</span>
            </div>
            <div className="bg-white rounded-lg px-6 py-3 shadow border-2 border-rose-gold">
              <span className="font-semibold text-dark-brown">📞 Phone: 1-800-BINGO-WIN</span>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}