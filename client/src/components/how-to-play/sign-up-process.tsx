import { Button } from "@/components/ui/button";
import { UserPlus, Mail, Lock, CheckCircle, Shield } from "lucide-react";

export function SignUpProcess() {
  return (
    <section className="py-16 bg-gradient-to-br from-cream to-light-cream">
      <div className="max-w-6xl mx-auto px-4">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
          {/* Content */}
          <div>
            <div className="flex items-center mb-6">
              <div className="w-16 h-16 bg-casino-gold rounded-full flex items-center justify-center mr-4">
                <UserPlus className="text-white" size={28} />
              </div>
              <h2 className="text-4xl font-bold text-dark-brown">Step 1: Sign Up Process</h2>
            </div>
            
            <p className="text-xl text-gray-700 mb-8 leading-relaxed">
              Creating your account is quick and secure. We only need basic information to get you started, 
              and we'll never share your details with anyone. Your privacy and security are our top priorities.
            </p>

            <div className="space-y-6 mb-8">
              <div className="bg-white rounded-xl p-6 shadow-lg border-l-4 border-casino-gold">
                <div className="flex items-start space-x-4">
                  <div className="w-10 h-10 bg-casino-gold text-white rounded-full flex items-center justify-center font-bold flex-shrink-0">1</div>
                  <div>
                    <h4 className="text-xl font-bold text-dark-brown mb-2">Enter Your Details</h4>
                    <p className="text-gray-700 text-lg mb-3">Provide your email address, choose a username, and create a secure password.</p>
                    <div className="flex items-center text-gray-600">
                      <Mail className="mr-2" size={16} />
                      <span>We'll use your email for account verification only</span>
                    </div>
                  </div>
                </div>
              </div>

              <div className="bg-white rounded-xl p-6 shadow-lg border-l-4 border-casino-gold">
                <div className="flex items-start space-x-4">
                  <div className="w-10 h-10 bg-casino-gold text-white rounded-full flex items-center justify-center font-bold flex-shrink-0">2</div>
                  <div>
                    <h4 className="text-xl font-bold text-dark-brown mb-2">Email Confirmation</h4>
                    <p className="text-gray-700 text-lg mb-3">Check your inbox for a confirmation email and click the verification link.</p>
                    <div className="flex items-center text-gray-600">
                      <CheckCircle className="mr-2" size={16} />
                      <span>This ensures your account security and helps us prevent spam</span>
                    </div>
                  </div>
                </div>
              </div>

              <div className="bg-white rounded-xl p-6 shadow-lg border-l-4 border-casino-gold">
                <div className="flex items-start space-x-4">
                  <div className="w-10 h-10 bg-casino-gold text-white rounded-full flex items-center justify-center font-bold flex-shrink-0">3</div>
                  <div>
                    <h4 className="text-xl font-bold text-dark-brown mb-2">Account Activation</h4>
                    <p className="text-gray-700 text-lg mb-3">Once verified, your account is instantly activated and ready to use!</p>
                    <div className="flex items-center text-gray-600">
                      <Shield className="mr-2" size={16} />
                      <span>Full access to all games and features immediately</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            <div className="bg-gradient-to-r from-yellow-50 to-orange-50 rounded-xl p-6 shadow-lg border-2 border-casino-gold mb-8">
              <h4 className="text-xl font-bold text-dark-brown mb-4 flex items-center">
                <Shield className="casino-gold mr-2" size={24} />
                Your Information is Safe
              </h4>
              <ul className="space-y-2 text-gray-700 text-lg">
                <li className="flex items-center">
                  <CheckCircle className="casino-gold mr-3" size={16} />
                  SSL encryption protects all your data
                </li>
                <li className="flex items-center">
                  <CheckCircle className="casino-gold mr-3" size={16} />
                  We never sell or share your information
                </li>
                <li className="flex items-center">
                  <CheckCircle className="casino-gold mr-3" size={16} />
                  Secure servers with 24/7 monitoring
                </li>
                <li className="flex items-center">
                  <CheckCircle className="casino-gold mr-3" size={16} />
                  GDPR compliant data handling
                </li>
              </ul>
            </div>

            <Button 
              size="lg"
              className="bg-casino-gold text-white px-8 py-4 text-xl font-bold hover:bg-yellow-500 shadow-lg"
            >
              <UserPlus className="mr-2" size={20} />
              Start Your Free Account
            </Button>
          </div>

          {/* Visual Mock-up */}
          <div className="bg-white rounded-xl shadow-2xl p-8 border-4 border-casino-gold">
            <h3 className="text-2xl font-bold casino-red mb-6 text-center">Sign Up Form Preview</h3>
            
            <div className="space-y-6">
              <div>
                <label className="block text-sm font-semibold text-dark-brown mb-2">Email Address</label>
                <div className="w-full p-3 border-2 border-gray-300 rounded-lg bg-gray-50 text-gray-500">
                  your.email@example.com
                </div>
              </div>
              
              <div>
                <label className="block text-sm font-semibold text-dark-brown mb-2">Username</label>
                <div className="w-full p-3 border-2 border-gray-300 rounded-lg bg-gray-50 text-gray-500">
                  Choose a unique username
                </div>
              </div>
              
              <div>
                <label className="block text-sm font-semibold text-dark-brown mb-2">Password</label>
                <div className="w-full p-3 border-2 border-gray-300 rounded-lg bg-gray-50 text-gray-500 flex items-center">
                  <Lock className="mr-2" size={16} />
                  ••••••••••
                </div>
              </div>
              
              <div className="flex items-center space-x-2">
                <div className="w-4 h-4 border-2 border-casino-gold rounded bg-casino-gold flex items-center justify-center">
                  <CheckCircle className="text-white" size={12} />
                </div>
                <span className="text-sm text-gray-700">I agree to the Terms & Conditions</span>
              </div>
              
              <div className="bg-casino-gold text-white p-3 rounded-lg text-center font-bold text-lg shadow-lg cursor-pointer hover:bg-yellow-500 transition-colors">
                Create My Free Account
              </div>
            </div>
            
            <div className="mt-6 text-center">
              <p className="text-sm text-gray-600">Account creation takes less than 60 seconds</p>
              <div className="flex items-center justify-center space-x-2 mt-2">
                <Shield className="casino-gold" size={16} />
                <span className="text-sm casino-gold font-semibold">SSL Secured</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}