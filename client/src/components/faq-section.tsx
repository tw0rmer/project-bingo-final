import { useQuery } from "@tanstack/react-query";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { HelpCircle, ChevronDown, ChevronUp, Headphones } from "lucide-react";
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
      <section className="py-16 bg-light-cream">
        <div className="max-w-4xl mx-auto px-4">
          <div className="text-center mb-12">
            <h2 className="text-4xl font-bold text-dark-brown mb-4">
              <HelpCircle className="inline mr-3 casino-gold" size={40} />
              Frequently Asked Questions
            </h2>
            <p className="text-xl text-gray-600">Loading FAQ information...</p>
          </div>
        </div>
      </section>
    );
  }

  return (
    <section id="faq" className="py-16 bg-light-cream">
      <div className="max-w-4xl mx-auto px-4">
        <div className="text-center mb-12">
          <h2 className="text-4xl font-bold text-dark-brown mb-4">
            <HelpCircle className="inline mr-3 casino-gold" size={40} />
            Frequently Asked Questions
          </h2>
          <p className="text-xl text-gray-600">Get answers to commonly asked questions about our online bingo platform.</p>
        </div>

        <div className="space-y-6">
          {faqItems?.map((faq) => (
            <div key={faq.id} className="bg-white rounded-xl shadow-lg border border-gray-200">
              <button 
                onClick={() => toggleFaq(faq.id)}
                className="w-full px-6 py-4 text-left flex justify-between items-center hover:bg-gray-50 transition-colors"
              >
                <h3 className="text-lg font-semibold text-dark-brown">{faq.question}</h3>
                {openItems.has(faq.id) ? (
                  <ChevronUp className="casino-gold" size={20} />
                ) : (
                  <ChevronDown className="casino-gold" size={20} />
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

        {/* Contact Support */}
        <div className="text-center mt-12">
          <p className="text-lg text-gray-600 mb-6">Still have questions?</p>
          <Button className="bg-casino-gold text-white px-8 py-3 text-lg font-semibold hover:bg-yellow-500">
            <Headphones className="mr-2" size={20} />
            Contact Support
          </Button>
        </div>
      </div>
    </section>
  );
}
