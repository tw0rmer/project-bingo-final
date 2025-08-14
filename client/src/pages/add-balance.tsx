import React, { useState } from 'react';
import { SiteLayout } from '@/components/SiteLayout';
import { useLocation } from 'wouter';
import { useAuth } from '@/contexts/AuthContext';
import { Button } from '@/components/ui/button';

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
      icon: '📧',
      processingTime: '1-24 hours',
      fees: 'No fees'
    },
    {
      id: 'paypal',
      name: 'PayPal',
      description: 'Pay securely with PayPal',
      icon: '💳',
      processingTime: 'Instant',
      fees: 'Processing fees apply',
      disabled: true
    },
    {
      id: 'creditcard',
      name: 'Credit Card',
      description: 'Visa, MasterCard, American Express',
      icon: '💳',
      processingTime: 'Instant',
      fees: 'Processing fees apply',
      disabled: true
    },
    {
      id: 'crypto',
      name: 'Cryptocurrency',
      description: 'Bitcoin, Ethereum, and more',
      icon: '₿',
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
      <div className="max-w-4xl mx-auto p-4 sm:p-6">
        {/* Header */}
        <div className="mb-6">
          <div className="flex items-center gap-4 mb-4">
            <button
              onClick={() => setLocation('/dashboard')}
              className="text-casino-red hover:opacity-80 transition-colors text-sm"
            >
              ← Back to Dashboard
            </button>
          </div>
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Add Balance</h1>
          <p className="text-gray-600">Choose a payment method to fund your account</p>
        </div>

        {/* Current Balance */}
        <div className="bg-gradient-to-r from-green-50 to-emerald-50 rounded-xl p-6 border border-green-200 mb-6">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-lg font-semibold text-gray-900 mb-1">Current Balance</h2>
              <p className="text-3xl font-bold text-green-600">${parseFloat(user.balance || '0').toFixed(2)}</p>
            </div>
            <div className="text-4xl">💰</div>
          </div>
        </div>

        {/* Amount Input */}
        <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-200 mb-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Enter Amount</h3>
          <div className="flex items-center gap-4">
            <div className="flex-1">
              <label htmlFor="amount" className="block text-sm font-medium text-gray-700 mb-2">
                Amount (CAD)
              </label>
              <div className="relative">
                <span className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-500 text-lg">$</span>
                <input
                  type="number"
                  id="amount"
                  value={amount}
                  onChange={(e) => setAmount(e.target.value)}
                  placeholder="0.00"
                  min="1"
                  step="0.01"
                  className="w-full pl-8 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-casino-gold focus:border-transparent text-lg"
                />
              </div>
            </div>
            <div className="flex gap-2">
              {[25, 50, 100, 200].map((preset) => (
                <button
                  key={preset}
                  onClick={() => setAmount(preset.toString())}
                  className="px-3 py-2 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-lg text-sm font-medium transition-colors"
                >
                  ${preset}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Payment Methods */}
        <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-200 mb-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Payment Methods</h3>
          <div className="grid gap-4">
            {paymentMethods.map((method) => (
              <div
                key={method.id}
                className={`relative border rounded-lg p-4 cursor-pointer transition-all ${
                  method.disabled
                    ? 'border-gray-200 bg-gray-50 opacity-60 cursor-not-allowed'
                    : selectedMethod === method.id
                    ? 'border-casino-gold bg-yellow-50'
                    : 'border-gray-200 hover:border-gray-300'
                }`}
                onClick={() => !method.disabled && setSelectedMethod(method.id)}
              >
                {method.disabled && (
                  <div className="absolute top-2 right-2 bg-gray-500 text-white px-2 py-1 rounded text-xs font-medium">
                    Coming Soon
                  </div>
                )}
                <div className="flex items-start gap-4">
                  <div className="text-2xl">{method.icon}</div>
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-1">
                      <h4 className="font-semibold text-gray-900">{method.name}</h4>
                      {selectedMethod === method.id && !method.disabled && (
                        <span className="bg-casino-gold text-white px-2 py-0.5 rounded text-xs font-bold">SELECTED</span>
                      )}
                    </div>
                    <p className="text-gray-600 text-sm mb-2">{method.description}</p>
                    <div className="flex gap-4 text-sm">
                      <span className="text-gray-500">
                        <strong>Processing:</strong> {method.processingTime}
                      </span>
                      <span className="text-gray-500">
                        <strong>Fees:</strong> {method.fees}
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* E-Transfer Instructions */}
        {selectedMethod === 'etransfer' && (
          <div className="bg-blue-50 rounded-xl p-6 border border-blue-200 mb-6">
            <h3 className="text-lg font-semibold text-blue-900 mb-4">📧 E-Transfer Instructions</h3>
            <div className="space-y-3 text-sm">
              <div className="flex justify-between">
                <span className="text-blue-700 font-medium">Send to:</span>
                <span className="text-blue-900 font-mono">payments@wildcardpremium.com</span>
              </div>
              <div className="flex justify-between">
                <span className="text-blue-700 font-medium">Message/Reference:</span>
                <span className="text-blue-900 font-mono">User ID {user.id}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-blue-700 font-medium">Processing Time:</span>
                <span className="text-blue-900">1-24 hours</span>
              </div>
            </div>
            <div className="mt-4 p-3 bg-blue-100 rounded-lg">
              <p className="text-blue-800 text-sm">
                <strong>Important:</strong> Please include your User ID ({user.id}) in the transfer message to ensure proper crediting to your account.
              </p>
            </div>
          </div>
        )}

        {/* Submit Button */}
        <div className="flex gap-4">
          <Button
            onClick={handleSubmit}
            className="flex-1 bg-casino-gold hover:bg-yellow-500 text-white py-3 text-lg font-semibold"
            disabled={!amount || parseFloat(amount) <= 0}
          >
            {selectedMethod === 'etransfer' ? 'Get E-Transfer Instructions' : 'Proceed with Payment'}
          </Button>
        </div>

        {/* Help Section */}
        <div className="mt-8 bg-gray-50 rounded-xl p-6 border border-gray-200">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Need Help?</h3>
          <div className="grid sm:grid-cols-2 gap-4 text-sm">
            <div>
              <h4 className="font-medium text-gray-900 mb-2">📞 Contact Support</h4>
              <p className="text-gray-600">Email: support@wildcardpremium.com</p>
              <p className="text-gray-600">Phone: 1-800-WILDCARD</p>
            </div>
            <div>
              <h4 className="font-medium text-gray-900 mb-2">⏰ Processing Times</h4>
              <p className="text-gray-600">E-Transfer: 1-24 hours</p>
              <p className="text-gray-600">Other methods: Coming soon</p>
            </div>
          </div>
        </div>
      </div>
    </SiteLayout>
  );
}