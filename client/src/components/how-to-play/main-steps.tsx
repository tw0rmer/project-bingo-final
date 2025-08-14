import { UserPlus, CreditCard, Gamepad2 } from "lucide-react";

export function MainSteps() {
  return (
    <section className="py-16 bg-white">
      <div className="max-w-6xl mx-auto px-4">
        <div className="text-center mb-12">
          <h2 className="text-4xl font-bold text-dark-brown mb-4">
            Getting Started in 3 Simple Steps
          </h2>
          <p className="text-xl text-gray-600 max-w-3xl mx-auto">
            Follow these easy steps to join thousands of players and start winning today
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {/* Step 1: Sign Up */}
          <div className="bg-gradient-to-br from-light-cream to-white rounded-xl p-8 shadow-lg border-2 border-casino-gold hover:shadow-xl transition-all relative">
            {/* Step number badge */}
            <div className="absolute -top-4 left-8 w-8 h-8 bg-casino-gold text-white rounded-full flex items-center justify-center font-bold text-lg shadow-lg">
              1
            </div>
            
            <div className="text-center pt-4">
              <div className="w-20 h-20 bg-casino-gold rounded-full flex items-center justify-center mx-auto mb-6">
                <UserPlus className="text-white" size={32} />
              </div>
              <h3 className="text-2xl font-bold text-dark-brown mb-4">Sign Up</h3>
              <p className="text-gray-700 text-lg mb-6">
                Create your free account with just your email and a secure password. Takes less than 60 seconds!
              </p>
              
              <div className="space-y-3 text-left bg-white rounded-lg p-4 shadow border">
                <div className="flex items-center">
                  <span className="w-2 h-2 bg-casino-gold rounded-full mr-3"></span>
                  <span className="text-gray-700">Enter your email address</span>
                </div>
                <div className="flex items-center">
                  <span className="w-2 h-2 bg-casino-gold rounded-full mr-3"></span>
                  <span className="text-gray-700">Choose a secure password</span>
                </div>
                <div className="flex items-center">
                  <span className="w-2 h-2 bg-casino-gold rounded-full mr-3"></span>
                  <span className="text-gray-700">Verify your email</span>
                </div>
                <div className="flex items-center">
                  <span className="w-2 h-2 bg-casino-gold rounded-full mr-3"></span>
                  <span className="text-gray-700">Account activated!</span>
                </div>
              </div>
            </div>
          </div>

          {/* Step 2: Deposit Funds */}
          <div className="bg-gradient-to-br from-light-cream to-white rounded-xl p-8 shadow-lg border-2 border-casino-red hover:shadow-xl transition-all relative">
            <div className="absolute -top-4 left-8 w-8 h-8 bg-casino-red text-white rounded-full flex items-center justify-center font-bold text-lg shadow-lg">
              2
            </div>
            
            <div className="text-center pt-4">
              <div className="w-20 h-20 bg-casino-red rounded-full flex items-center justify-center mx-auto mb-6">
                <CreditCard className="text-white" size={32} />
              </div>
              <h3 className="text-2xl font-bold text-dark-brown mb-4">Deposit Funds</h3>
              <p className="text-gray-700 text-lg mb-6">
                Add money to your account using secure payment methods and claim your welcome bonus.
              </p>
              
              <div className="space-y-3 text-left bg-white rounded-lg p-4 shadow border">
                <div className="flex items-center">
                  <span className="w-2 h-2 bg-casino-red rounded-full mr-3"></span>
                  <span className="text-gray-700">Choose payment method</span>
                </div>
                <div className="flex items-center">
                  <span className="w-2 h-2 bg-casino-red rounded-full mr-3"></span>
                  <span className="text-gray-700">Enter deposit amount</span>
                </div>
                <div className="flex items-center">
                  <span className="w-2 h-2 bg-casino-red rounded-full mr-3"></span>
                  <span className="text-gray-700">Claim 100% match bonus</span>
                </div>
                <div className="flex items-center">
                  <span className="w-2 h-2 bg-casino-red rounded-full mr-3"></span>
                  <span className="text-gray-700">Ready to play!</span>
                </div>
              </div>
            </div>
          </div>

          {/* Step 3: Pick a Game */}
          <div className="bg-gradient-to-br from-light-cream to-white rounded-xl p-8 shadow-lg border-2 border-rose-gold hover:shadow-xl transition-all relative">
            <div className="absolute -top-4 left-8 w-8 h-8 bg-rose-gold text-white rounded-full flex items-center justify-center font-bold text-lg shadow-lg">
              3
            </div>
            
            <div className="text-center pt-4">
              <div className="w-20 h-20 bg-rose-gold rounded-full flex items-center justify-center mx-auto mb-6">
                <Gamepad2 className="text-white" size={32} />
              </div>
              <h3 className="text-2xl font-bold text-dark-brown mb-4">Pick a Game</h3>
              <p className="text-gray-700 text-lg mb-6">
                Browse our game lobby and join a bingo room that matches your style and budget.
              </p>
              
              <div className="space-y-3 text-left bg-white rounded-lg p-4 shadow border">
                <div className="flex items-center">
                  <span className="w-2 h-2 bg-rose-gold rounded-full mr-3"></span>
                  <span className="text-gray-700">Browse available rooms</span>
                </div>
                <div className="flex items-center">
                  <span className="w-2 h-2 bg-rose-gold rounded-full mr-3"></span>
                  <span className="text-gray-700">Check entry fees & prizes</span>
                </div>
                <div className="flex items-center">
                  <span className="w-2 h-2 bg-rose-gold rounded-full mr-3"></span>
                  <span className="text-gray-700">Click "Join Now"</span>
                </div>
                <div className="flex items-center">
                  <span className="w-2 h-2 bg-rose-gold rounded-full mr-3"></span>
                  <span className="text-gray-700">Start winning!</span>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Quick Stats */}
        <div className="mt-16 bg-gradient-to-br from-cream to-light-cream rounded-2xl p-8 border-4 border-casino-gold">
          <div className="text-center mb-6">
            <h3 className="text-2xl font-bold text-dark-brown">Join the Fun Today!</h3>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6 text-center">
            <div>
              <div className="text-3xl font-bold casino-gold">Under 5 min</div>
              <p className="text-gray-600">From signup to first game</p>
            </div>
            <div>
              <div className="text-3xl font-bold casino-gold">100% Bonus</div>
              <p className="text-gray-600">On your first deposit</p>
            </div>
            <div>
              <div className="text-3xl font-bold casino-gold">50+ Games</div>
              <p className="text-gray-600">Always available to join</p>
            </div>
            <div>
              <div className="text-3xl font-bold casino-gold">24/7 Support</div>
              <p className="text-gray-600">Help whenever you need it</p>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}