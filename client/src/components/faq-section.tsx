import { useQuery } from "@tanstack/react-query";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { HelpCircle, ChevronDown, ChevronUp, Headphones, MessageCircle, Sparkles } from "lucide-react";
import type { FaqItem } from "@shared/schema";

export function FaqSection() {
  const [openItems, setOpenItems] = useState<Set<string>>(new Set());
  
  const { data: faqItems, isLoading } = useQuery<FaqItem[]>({
    queryKey: ["/api/faq"],
  });

  const toggleFaq = (id: string) => {
    const newOpenItems = new Set(openItems);
    if (newOpenItems.has(id)) {
      newOpenItems.delete(id);
    } else {
      newOpenItems.add(id);
    }
    setOpenItems(newOpenItems);
  };

  if (isLoading) {
    return (
      <section className="py-20 bg-gradient-to-br from-cyan-50 via-blue-50 to-indigo-50">
        <div className="max-w-5xl mx-auto px-4">
          <div className="text-center mb-16">
            <div className="inline-flex items-center justify-center w-20 h-20 bg-gradient-to-br from-cyan-500 to-blue-600 rounded-full mb-6 shadow-lg">
              <HelpCircle className="text-white animate-pulse" size={40} />
            </div>
            <h2 className="text-5xl md:text-6xl font-black text-transparent bg-clip-text bg-gradient-to-r from-cyan-600 via-blue-600 to-indigo-600 mb-6">
              Frequently Asked Questions
            </h2>
            <p className="text-xl text-gray-600">Loading FAQ information...</p>
          </div>
        </div>
      </section>
    );
  }

  return (
    <section id="faq" className="py-20 bg-gradient-to-br from-cyan-50 via-blue-50 to-indigo-50 relative overflow-hidden">
      {/* Background decorations */}
      <div className="absolute inset-0">
        <div className="absolute top-20 left-10 w-16 h-16 bg-gradient-to-br from-cyan-300 to-blue-400 rounded-full opacity-20 animate-bounce-soft"></div>
        <div className="absolute top-40 right-20 w-12 h-12 bg-gradient-to-br from-blue-300 to-indigo-400 rounded-full opacity-20 animate-pulse"></div>
        <div className="absolute bottom-32 left-1/4 w-20 h-20 bg-gradient-to-br from-indigo-300 to-purple-400 rounded-full opacity-15 animate-bounce-soft" style={{ animationDelay: '1s' }}></div>
      </div>
      
      <div className="max-w-5xl mx-auto px-4 relative z-10">
        <div className="text-center mb-16">
          <div className="inline-flex items-center justify-center w-20 h-20 bg-gradient-to-br from-cyan-500 to-blue-600 rounded-full mb-6 shadow-lg">
            <HelpCircle className="text-white" size={40} />
          </div>
          
          <h2 className="text-5xl md:text-6xl font-black text-transparent bg-clip-text bg-gradient-to-r from-cyan-600 via-blue-600 to-indigo-600 mb-6">
            Frequently Asked Questions
          </h2>
          
          <p className="text-xl md:text-2xl text-gray-700 max-w-4xl mx-auto leading-relaxed mb-8">
            Get answers to commonly asked questions about our online bingo platform.
          </p>
          
          {/* Quick highlights */}
          <div className="flex justify-center items-center space-x-6 text-sm font-semibold">
            <div className="flex items-center text-cyan-600">
              <MessageCircle className="mr-2" size={16} />
              <span>Instant Answers</span>
            </div>
            <div className="w-1 h-1 bg-gray-400 rounded-full"></div>
            <div className="flex items-center text-blue-600">
              <Sparkles className="mr-2" size={16} />
              <span>Expert Support</span>
            </div>
          </div>
        </div>

        <div className="space-y-6">
          {faqItems?.map((faq, index) => (
            <div key={faq.id} className="group relative overflow-hidden bg-white/95 backdrop-blur-sm rounded-2xl shadow-xl border-2 border-gradient-to-r from-cyan-200 to-blue-200 transform hover:scale-105 transition-all duration-300">
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

        {/* Contact Support */}
        <div className="text-center mt-16">
          <div className="bg-white/95 backdrop-blur-sm rounded-2xl p-10 shadow-2xl border-2 border-gradient-to-r from-cyan-200 to-blue-200 max-w-2xl mx-auto">
            <div className="mb-6">
              <div className="inline-flex items-center justify-center w-16 h-16 bg-gradient-to-br from-cyan-500 to-blue-600 rounded-full mb-4">
                <Headphones className="text-white" size={24} />
              </div>
              <h3 className="text-3xl font-black text-gray-800 mb-2">Still have questions?</h3>
              <p className="text-lg text-gray-600 mb-8">Our friendly support team is here to help you 24/7!</p>
            </div>
            
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Button className="bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-600 hover:to-blue-700 text-white px-8 py-4 text-lg font-bold rounded-xl shadow-lg transform hover:scale-105 transition-all duration-300">
            <Headphones className="mr-2" size={20} />
                Live Chat Support
              </Button>
              <Button variant="outline" className="border-2 border-blue-300 text-blue-600 hover:bg-blue-50 px-8 py-4 text-lg font-bold rounded-xl shadow-lg transform hover:scale-105 transition-all duration-300">
                <MessageCircle className="mr-2" size={20} />
                Send Message
          </Button>
            </div>
            
            {/* Support stats */}
            <div className="flex justify-center items-center space-x-8 mt-8 text-sm font-semibold text-gray-600">
              <div className="flex items-center">
                <div className="w-2 h-2 bg-green-500 rounded-full mr-2 animate-pulse"></div>
                <span>24/7 Available</span>
              </div>
              <div className="w-1 h-1 bg-gray-400 rounded-full"></div>
              <div className="flex items-center">
                <Sparkles className="mr-2 text-blue-500" size={16} />
                <span>Average Response: 2 mins</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
