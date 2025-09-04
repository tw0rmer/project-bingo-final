import React, { useState } from 'react';
import { SiteLayout } from '@/components/SiteLayout';
import { useLocation } from 'wouter';
import { useAuth } from '@/contexts/AuthContext';
import { Button } from '@/components/ui/button';
import { 
  ArrowLeft, 
  DollarSign, 
  CreditCard, 
  Mail, 
  Bitcoin, 
  Sparkles, 
  Star,
  Shield,
  Clock,
  CheckCircle
} from 'lucide-react';

export default function AddBalancePage() {
  const [, setLocation] = useLocation();
  const { user } = useAuth();
  const [selectedMethod, setSelectedMethod] = useState<string>('etransfer');
  const [amount, setAmount] = useState<string>('');

  if (!user) {
    setLocation('/login');
    return null;
  }

  const paymentMethods = [
    {
      id: 'etransfer',
      name: 'E-Transfer',
      description: 'Send e-transfer to our business email',
      icon: Mail,
      processingTime: '1-24 hours',
      fees: 'No fees'
    },
    {
      id: 'paypal',
      name: 'PayPal',
      description: 'Pay securely with PayPal',
      icon: CreditCard,
      processingTime: 'Instant',
      fees: 'Processing fees apply',
      disabled: true
    },
    {
      id: 'creditcard',
      name: 'Credit Card',
      description: 'Visa, MasterCard, American Express',
      icon: CreditCard,
      processingTime: 'Instant',
      fees: 'Processing fees apply',
      disabled: true
    },
    {
      id: 'crypto',
      name: 'Cryptocurrency',
      description: 'Bitcoin, Ethereum, and more',
      icon: Bitcoin,
      processingTime: '30 minutes',
      fees: 'Network fees apply',
      disabled: true
    }
  ];

  const handleSubmit = () => {
    if (!amount || parseFloat(amount) <= 0) {
      alert('Please enter a valid amount');
      return;
    }

    if (selectedMethod === 'etransfer') {
      alert(`E-Transfer Instructions:\n\nAmount: $${amount}\nSend to: payments@wildcardpremium.com\nMessage: User ID ${user.id}\n\nProcessing time: 1-24 hours\nYour balance will be updated once payment is confirmed.`);
    } else {
      alert('This payment method is coming soon!');
    }
  };

  return (
    <SiteLayout>
      <div className="min-h-screen bg-gradient-to-br from-green-50 via-emerald-50 to-teal-50">
        {/* Animated Background Decorations */}
        <div className="fixed inset-0 overflow-hidden pointer-events-none">
          <div className="absolute top-20 left-10 w-32 h-32 bg-gradient-to-br from-green-400/20 to-emerald-400/20 rounded-full animate-pulse"></div>
          <div className="absolute top-40 right-20 w-24 h-24 bg-gradient-to-br from-teal-400/20 to-cyan-400/20 rounded-full animate-bounce-soft"></div>
          <div className="absolute bottom-20 left-20 w-28 h-28 bg-gradient-to-br from-emerald-400/20 to-green-400/20 rounded-full animate-pulse"></div>
          <div className="absolute bottom-40 right-10 w-20 h-20 bg-gradient-to-br from-cyan-400/20 to-teal-400/20 rounded-full animate-bounce-soft"></div>
        </div>

        <div className="max-w-4xl mx-auto p-4 sm:p-6 relative z-10">
          {/* Enhanced Header */}
          <div className="mb-8">
            <div className="flex items-center gap-4 mb-6">
              <button
                onClick={() => setLocation('/dashboard')}
                className="flex items-center gap-2 text-gray-700 hover:text-gray-900 transition-colors text-sm font-medium bg-white/80 backdrop-blur-sm rounded-xl px-4 py-2 border border-gray-200/50 shadow-lg hover:shadow-xl"
              >
                <ArrowLeft size={16} />
                Back to Dashboard
              </button>
            </div>
            <div className="text-center bg-white/95 backdrop-blur-sm rounded-3xl p-8 border-2 border-gray-200/50 shadow-2xl">
              <div className="flex items-center justify-center gap-3 mb-4">
                <div className="w-16 h-16 bg-gradient-to-br from-green-500 to-emerald-600 rounded-2xl flex items-center justify-center shadow-2xl">
                  <DollarSign size={32} className="text-white" />
                </div>
                <div className="floating-sparkles">
                  <Sparkles size={20} className="text-yellow-500 animate-pulse" />
                  <Star size={16} className="text-orange-500 animate-bounce-soft" />
                </div>
              </div>
              <h1 className="text-4xl font-bold bg-gradient-to-r from-gray-800 to-gray-600 bg-clip-text text-transparent mb-3">Add Balance</h1>
              <p className="text-gray-600 text-lg">Choose a payment method to fund your account</p>
            </div>
          </div>

                  {/* Enhanced Current Balance */}
          <div className="bg-gradient-to-r from-green-100 to-emerald-100 rounded-3xl p-8 border-2 border-green-200/50 shadow-2xl mb-8">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-2xl font-bold bg-gradient-to-r from-green-700 to-emerald-700 bg-clip-text text-transparent mb-2">Current Balance</h2>
                <p className="text-4xl font-bold text-green-700">${(user.balance || '0').toString()}</p>
              </div>
              <div className="w-16 h-16 bg-gradient-to-br from-green-500 to-emerald-600 rounded-2xl flex items-center justify-center shadow-2xl">
                <DollarSign size={32} className="text-white" />
              </div>
            </div>
          </div>

                  {/* Enhanced Amount Input */}
          <div className="bg-white/95 backdrop-blur-sm rounded-3xl p-8 shadow-2xl border-2 border-gray-200/50 mb-8">
            <div className="flex items-center gap-3 mb-6">
              <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-purple-600 rounded-xl flex items-center justify-center shadow-lg">
                <DollarSign size={24} className="text-white" />
              </div>
              <h3 className="text-2xl font-bold bg-gradient-to-r from-gray-800 to-gray-600 bg-clip-text text-transparent">Enter Amount</h3>
            </div>
            <div className="flex items-center gap-6">
              <div className="flex-1">
                <label htmlFor="amount" className="block text-sm font-bold text-gray-700 mb-3">
                  Amount (CAD)
                </label>
                <div className="relative">
                  <span className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-700 text-xl font-bold">$</span>
                  <input
                    type="number"
                    id="amount"
                    value={amount}
                    onChange={(e) => setAmount(e.target.value)}
                    placeholder="0.00"
                    min="1"
                    step="0.01"
                    className="w-full pl-10 pr-6 py-4 border-2 border-gray-200 rounded-2xl focus:ring-4 focus:ring-blue-400/30 focus:border-blue-500 text-xl font-bold transition-all duration-300"
                  />
                </div>
              </div>
              <div className="flex gap-3">
                {[25, 50, 100, 200].map((preset) => (
                  <button
                    key={preset}
                    onClick={() => setAmount(preset.toString())}
                    className="px-4 py-3 bg-gradient-to-r from-gray-100 to-gray-200 hover:from-gray-200 hover:to-gray-300 text-gray-900 rounded-2xl text-lg font-bold transition-all duration-300 shadow-lg hover:shadow-xl"
                  >
                    ${preset}
                  </button>
                ))}
              </div>
            </div>
          </div>

                  {/* Enhanced Payment Methods */}
          <div className="bg-white/95 backdrop-blur-sm rounded-3xl p-8 shadow-2xl border-2 border-gray-200/50 mb-8">
            <div className="flex items-center gap-3 mb-6">
              <div className="w-12 h-12 bg-gradient-to-br from-purple-500 to-pink-600 rounded-xl flex items-center justify-center shadow-lg">
                <CreditCard size={24} className="text-white" />
              </div>
              <h3 className="text-2xl font-bold bg-gradient-to-r from-gray-800 to-gray-600 bg-clip-text text-transparent">Payment Methods</h3>
            </div>
            <div className="grid gap-6">
              {paymentMethods.map((method) => {
                const Icon = method.icon;
                return (
                  <div
                    key={method.id}
                    className={`relative border-2 rounded-2xl p-6 cursor-pointer transition-all duration-300 ${
                      method.disabled
                        ? 'border-gray-200 bg-gray-50/80 opacity-60 cursor-not-allowed'
                        : selectedMethod === method.id
                        ? 'border-green-500 bg-gradient-to-r from-green-50 to-emerald-50 shadow-2xl scale-105'
                        : 'border-gray-200 hover:border-gray-300 hover:shadow-xl'
                    }`}
                    onClick={() => !method.disabled && setSelectedMethod(method.id)}
                  >
                    {method.disabled && (
                      <div className="absolute top-3 right-3 bg-gray-500 text-white px-3 py-1 rounded-xl text-sm font-bold">
                        Coming Soon
                      </div>
                    )}
                    <div className="flex items-start gap-6">
                      <div className={`w-12 h-12 rounded-xl flex items-center justify-center shadow-lg ${
                        method.disabled 
                          ? 'bg-gray-400' 
                          : selectedMethod === method.id 
                            ? 'bg-gradient-to-br from-green-500 to-emerald-600' 
                            : 'bg-gradient-to-br from-gray-500 to-gray-600'
                      }`}>
                        <Icon size={24} className="text-white" />
                      </div>
                      <div className="flex-1">
                        <div className="flex items-center gap-3 mb-3">
                          <h4 className="text-xl font-bold text-gray-900">{method.name}</h4>
                          {selectedMethod === method.id && !method.disabled && (
                            <span className="bg-gradient-to-r from-green-500 to-emerald-600 text-white px-3 py-1 rounded-xl text-sm font-bold shadow-lg">SELECTED</span>
                          )}
                        </div>
                        <p className="text-gray-700 text-lg mb-4">{method.description}</p>
                        <div className="flex gap-6 text-lg">
                          <span className="flex items-center gap-2 text-gray-800">
                            <Clock size={16} />
                            <strong>Processing:</strong> {method.processingTime}
                          </span>
                          <span className="flex items-center gap-2 text-gray-800">
                            <Shield size={16} />
                            <strong>Fees:</strong> {method.fees}
                          </span>
                        </div>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

                  {/* Enhanced E-Transfer Instructions */}
          {selectedMethod === 'etransfer' && (
            <div className="bg-gradient-to-r from-blue-100 to-indigo-100 rounded-3xl p-8 border-2 border-blue-200/50 shadow-2xl mb-8">
              <div className="flex items-center gap-3 mb-6">
                <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-xl flex items-center justify-center shadow-lg">
                  <Mail size={24} className="text-white" />
                </div>
                <h3 className="text-2xl font-bold bg-gradient-to-r from-blue-700 to-indigo-700 bg-clip-text text-transparent">E-Transfer Instructions</h3>
              </div>
              <div className="space-y-4 text-lg">
                <div className="flex justify-between items-center p-4 bg-white/80 rounded-2xl border border-blue-200/50">
                  <span className="text-blue-700 font-bold">Send to:</span>
                  <span className="text-blue-900 font-mono font-bold">payments@wildcardpremium.com</span>
                </div>
                <div className="flex justify-between items-center p-4 bg-white/80 rounded-2xl border border-blue-200/50">
                  <span className="text-blue-700 font-bold">Message/Reference:</span>
                  <span className="text-blue-900 font-mono font-bold">User ID {user.id}</span>
                </div>
                <div className="flex justify-between items-center p-4 bg-white/80 rounded-2xl border border-blue-200/50">
                  <span className="text-blue-700 font-bold">Processing Time:</span>
                  <span className="text-blue-900 font-bold">1-24 hours</span>
                </div>
              </div>
              <div className="mt-6 p-6 bg-blue-200/50 rounded-2xl border border-blue-300/50">
                <p className="text-blue-800 text-lg font-medium">
                  <strong>Important:</strong> Please include your User ID ({user.id}) in the transfer message to ensure proper crediting to your account.
                </p>
              </div>
            </div>
          )}

          {/* Enhanced Submit Button */}
          <div className="flex gap-6 mb-8">
            <Button
              onClick={handleSubmit}
              className="flex-1 bg-gradient-to-r from-green-500 to-emerald-600 hover:from-green-600 hover:to-emerald-700 text-white py-4 px-8 rounded-2xl text-xl font-bold shadow-2xl hover:shadow-3xl transition-all duration-300"
              disabled={!amount || parseFloat(amount) <= 0}
            >
              {selectedMethod === 'etransfer' ? 'Get E-Transfer Instructions' : 'Proceed with Payment'}
            </Button>
          </div>

          {/* Enhanced Help Section */}
          <div className="bg-white/95 backdrop-blur-sm rounded-3xl p-8 border-2 border-gray-200/50 shadow-2xl">
            <div className="flex items-center gap-3 mb-6">
              <div className="w-12 h-12 bg-gradient-to-br from-yellow-500 to-orange-600 rounded-xl flex items-center justify-center shadow-lg">
                <CheckCircle size={24} className="text-white" />
              </div>
              <h3 className="text-2xl font-bold bg-gradient-to-r from-gray-800 to-gray-600 bg-clip-text text-transparent">Need Help?</h3>
            </div>
            <div className="grid sm:grid-cols-2 gap-8 text-lg">
              <div className="bg-gradient-to-r from-blue-100 to-indigo-100 rounded-2xl p-6 border border-blue-200/50">
                <h4 className="font-bold text-blue-900 mb-3 text-xl">📞 Contact Support</h4>
                <p className="text-blue-800 font-medium">Email: support@wildcardpremium.com</p>
                <p className="text-blue-800 font-medium">Phone: 1-800-WILDCARD</p>
              </div>
              <div className="bg-gradient-to-r from-green-100 to-emerald-100 rounded-2xl p-6 border border-green-200/50">
                <h4 className="font-bold text-green-900 mb-3 text-xl">⏰ Processing Times</h4>
                <p className="text-green-800 font-medium">E-Transfer: 1-24 hours</p>
                <p className="text-green-800 font-medium">Other methods: Coming soon</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </SiteLayout>
  );
}