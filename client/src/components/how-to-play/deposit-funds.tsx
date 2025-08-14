import { Button } from "@/components/ui/button";
import { CreditCard, Shield, Gift, Zap, CheckCircle } from "lucide-react";

export function DepositFunds() {
  return (
    <section className="py-16 bg-white">
      <div className="max-w-6xl mx-auto px-4">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
          {/* Visual Payment Methods */}
          <div className="bg-gradient-to-br from-light-cream to-white rounded-xl shadow-2xl p-8 border-4 border-casino-red">
            <h3 className="text-2xl font-bold casino-red mb-6 text-center">Secure Payment Methods</h3>
            
            {/* Payment Options */}
            <div className="space-y-4 mb-6">
              <div className="bg-white rounded-lg p-4 shadow border-2 border-gray-200 hover:border-casino-red transition-colors">
                <div className="flex items-center justify-between">
                  <div className="flex items-center">
                    <CreditCard className="casino-red mr-3" size={24} />
                    <span className="font-semibold text-dark-brown">Credit & Debit Cards</span>
                  </div>
                  <div className="text-sm text-gray-600">Visa, MasterCard, Amex</div>
                </div>
              </div>
              
              <div className="bg-white rounded-lg p-4 shadow border-2 border-gray-200 hover:border-casino-red transition-colors">
                <div className="flex items-center justify-between">
                  <div className="flex items-center">
                    <div className="w-6 h-6 bg-blue-600 rounded mr-3 flex items-center justify-center">
                      <span className="text-white text-xs font-bold">P</span>
                    </div>
                    <span className="font-semibold text-dark-brown">PayPal</span>
                  </div>
                  <div className="text-sm text-gray-600">Instant & Secure</div>
                </div>
              </div>
              
              <div className="bg-white rounded-lg p-4 shadow border-2 border-gray-200 hover:border-casino-red transition-colors">
                <div className="flex items-center justify-between">
                  <div className="flex items-center">
                    <div className="w-6 h-6 bg-green-600 rounded mr-3 flex items-center justify-center">
                      <span className="text-white text-xs font-bold">$</span>
                    </div>
                    <span className="font-semibold text-dark-brown">Bank Transfer</span>
                  </div>
                  <div className="text-sm text-gray-600">Direct & Reliable</div>
                </div>
              </div>
              
              <div className="bg-white rounded-lg p-4 shadow border-2 border-gray-200 hover:border-casino-red transition-colors">
                <div className="flex items-center justify-between">
                  <div className="flex items-center">
                    <div className="w-6 h-6 bg-orange-600 rounded mr-3 flex items-center justify-center">
                      <span className="text-white text-xs font-bold">E</span>
                    </div>
                    <span className="font-semibold text-dark-brown">E-Wallets</span>
                  </div>
                  <div className="text-sm text-gray-600">Skrill, Neteller & More</div>
                </div>
              </div>
            </div>

            {/* Deposit Amount Example */}
            <div className="bg-gradient-to-r from-red-50 to-orange-50 rounded-lg p-6 border-2 border-casino-red">
              <h4 className="font-bold text-dark-brown mb-4 text-center">Deposit Example</h4>
              <div className="space-y-3">
                <div className="flex justify-between">
                  <span className="text-gray-700">Your Deposit:</span>
                  <span className="font-bold text-dark-brown">$50.00</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-700">100% Welcome Bonus:</span>
                  <span className="font-bold casino-gold">+$50.00</span>
                </div>
                <hr className="border-casino-red" />
                <div className="flex justify-between text-lg">
                  <span className="font-bold text-dark-brown">Total to Play:</span>
                  <span className="font-bold casino-red">$100.00</span>
                </div>
              </div>
            </div>
          </div>

          {/* Content */}
          <div>
            <div className="flex items-center mb-6">
              <div className="w-16 h-16 bg-casino-red rounded-full flex items-center justify-center mr-4">
                <CreditCard className="text-white" size={28} />
              </div>
              <h2 className="text-4xl font-bold text-dark-brown">Step 2: Deposit Funds</h2>
            </div>
            
            <p className="text-xl text-gray-700 mb-8 leading-relaxed">
              Adding money to your account is safe, secure, and takes just minutes. Choose from multiple 
              payment methods and automatically claim your generous welcome bonus to double your playing power!
            </p>

            <div className="space-y-6 mb-8">
              <div className="bg-light-cream rounded-xl p-6 shadow-lg border-l-4 border-casino-red">
                <div className="flex items-start space-x-4">
                  <div className="w-10 h-10 bg-casino-red text-white rounded-full flex items-center justify-center font-bold flex-shrink-0">1</div>
                  <div>
                    <h4 className="text-xl font-bold text-dark-brown mb-2">Choose Payment Method</h4>
                    <p className="text-gray-700 text-lg mb-3">Select from credit cards, PayPal, bank transfer, or e-wallets - all protected by SSL encryption.</p>
                    <div className="flex items-center text-gray-600">
                      <Shield className="mr-2" size={16} />
                      <span>Bank-level security for all transactions</span>
                    </div>
                  </div>
                </div>
              </div>

              <div className="bg-light-cream rounded-xl p-6 shadow-lg border-l-4 border-casino-red">
                <div className="flex items-start space-x-4">
                  <div className="w-10 h-10 bg-casino-red text-white rounded-full flex items-center justify-center font-bold flex-shrink-0">2</div>
                  <div>
                    <h4 className="text-xl font-bold text-dark-brown mb-2">Enter Deposit Amount</h4>
                    <p className="text-gray-700 text-lg mb-3">Choose how much to deposit - minimum $10, maximum $500 for first deposit.</p>
                    <div className="flex items-center text-gray-600">
                      <Zap className="mr-2" size={16} />
                      <span>Instant processing for most payment methods</span>
                    </div>
                  </div>
                </div>
              </div>

              <div className="bg-light-cream rounded-xl p-6 shadow-lg border-l-4 border-casino-red">
                <div className="flex items-start space-x-4">
                  <div className="w-10 h-10 bg-casino-red text-white rounded-full flex items-center justify-center font-bold flex-shrink-0">3</div>
                  <div>
                    <h4 className="text-xl font-bold text-dark-brown mb-2">Claim Your Welcome Bonus</h4>
                    <p className="text-gray-700 text-lg mb-3">Automatically receive 100% match bonus up to $500 - double your money instantly!</p>
                    <div className="flex items-center text-gray-600">
                      <Gift className="mr-2" size={16} />
                      <span>Plus 50 free game entries to try all game types</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            <div className="bg-gradient-to-r from-green-50 to-blue-50 rounded-xl p-6 shadow-lg border-2 border-casino-red mb-8">
              <h4 className="text-xl font-bold text-dark-brown mb-4 flex items-center">
                <Gift className="casino-red mr-2" size={24} />
                Welcome Bonus Details
              </h4>
              <ul className="space-y-2 text-gray-700 text-lg">
                <li className="flex items-center">
                  <CheckCircle className="casino-red mr-3" size={16} />
                  100% match bonus up to $500
                </li>
                <li className="flex items-center">
                  <CheckCircle className="casino-red mr-3" size={16} />
                  50 free game entries (no wagering)
                </li>
                <li className="flex items-center">
                  <CheckCircle className="casino-red mr-3" size={16} />
                  Instant VIP status upgrade
                </li>
                <li className="flex items-center">
                  <CheckCircle className="casino-red mr-3" size={16} />
                  Fair 30x playthrough requirement
                </li>
              </ul>
            </div>

            <div className="flex space-x-4">
              <Button 
                size="lg"
                className="bg-casino-red text-white px-8 py-4 text-xl font-bold hover:bg-red-700 shadow-lg flex-1"
              >
                <CreditCard className="mr-2" size={20} />
                Make Your First Deposit
              </Button>
              <Button 
                variant="outline"
                size="lg"
                className="px-6 py-4 text-lg border-2 border-casino-red casino-red hover:bg-casino-red hover:text-white"
              >
                View All Bonuses
              </Button>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}