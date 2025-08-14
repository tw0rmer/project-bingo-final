import React, { useState } from 'react';
import { SiteLayout } from '@/components/SiteLayout';
import { useLocation } from 'wouter';
import { useAuth } from '@/contexts/AuthContext';
import { Button } from '@/components/ui/button';

export default function ProfilePage() {
  const [, setLocation] = useLocation();
  const { user, logout } = useAuth();
  const [activeTab, setActiveTab] = useState<'account' | 'security' | 'winnings'>('account');
  const [isEditing, setIsEditing] = useState(false);
  const [formData, setFormData] = useState({
    email: user?.email || '',
    username: (user as any)?.username || '',
    currentPassword: '',
    newPassword: '',
    confirmPassword: ''
  });

  if (!user) {
    setLocation('/login');
    return null;
  }

  const handleSaveProfile = () => {
    // TODO: Implement profile update API call
    alert('Profile update functionality will be implemented soon!');
    setIsEditing(false);
  };

  const handleChangePassword = () => {
    if (formData.newPassword !== formData.confirmPassword) {
      alert('New passwords do not match!');
      return;
    }
    // TODO: Implement password change API call
    alert('Password change functionality will be implemented soon!');
    setFormData({ ...formData, currentPassword: '', newPassword: '', confirmPassword: '' });
  };

  const tabs = [
    { id: 'account', label: 'Account', icon: '👤' },
    { id: 'security', label: 'Security', icon: '🔒' },
    { id: 'winnings', label: 'Winnings', icon: '🏆' }
  ];

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
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Profile Settings</h1>
          <p className="text-gray-600">Manage your account information and preferences</p>
        </div>

        {/* Tabs */}
        <div className="mb-6">
          <div className="border-b border-gray-200">
            <nav className="flex space-x-1 overflow-x-auto">
              {tabs.map((tab) => (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id as any)}
                  className={`flex items-center gap-2 py-3 px-4 border-b-2 font-medium text-sm transition-colors whitespace-nowrap ${
                    activeTab === tab.id
                      ? 'border-casino-gold text-casino-red bg-yellow-50'
                      : 'border-transparent text-gray-600 hover:text-gray-800 hover:border-gray-300'
                  }`}
                >
                  <span className="text-base">{tab.icon}</span>
                  <span>{tab.label}</span>
                </button>
              ))}
            </nav>
          </div>
        </div>

        {/* Account Tab */}
        {activeTab === 'account' && (
          <div className="space-y-6">
            <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-200">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-xl font-semibold text-gray-900">Account Information</h2>
                <Button
                  onClick={() => setIsEditing(!isEditing)}
                  variant={isEditing ? 'outline' : 'default'}
                  className={isEditing ? 'border-casino-red text-casino-red' : 'bg-casino-gold hover:bg-yellow-500'}
                >
                  {isEditing ? 'Cancel' : 'Edit'}
                </Button>
              </div>

              <div className="grid gap-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Email Address</label>
                  <input
                    type="email"
                    value={formData.email}
                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                    disabled={!isEditing}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-casino-gold focus:border-transparent disabled:bg-gray-50 disabled:text-gray-500"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Username</label>
                  <input
                    type="text"
                    value={formData.username}
                    onChange={(e) => setFormData({ ...formData, username: e.target.value })}
                    disabled={!isEditing}
                    placeholder="Set your username"
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-casino-gold focus:border-transparent disabled:bg-gray-50 disabled:text-gray-500"
                  />
                </div>

                <div className="grid sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Account Status</label>
                    <div className="px-4 py-3 bg-green-50 border border-green-200 rounded-lg">
                      <span className="text-green-700 font-medium">✅ Active</span>
                    </div>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Account Type</label>
                    <div className="px-4 py-3 bg-gray-50 border border-gray-200 rounded-lg">
                      <span className="text-gray-700 font-medium">
                        {user.isAdmin ? '👑 Admin' : '🎯 Player'}
                      </span>
                    </div>
                  </div>
                </div>

                {isEditing && (
                  <div className="flex gap-3">
                    <Button
                      onClick={handleSaveProfile}
                      className="bg-green-600 hover:bg-green-700"
                    >
                      Save Changes
                    </Button>
                  </div>
                )}
              </div>
            </div>

            {/* Account Balance Card */}
            <div className="bg-gradient-to-r from-green-50 to-emerald-50 rounded-xl p-6 border border-green-200">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Account Balance</h3>
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-3xl font-bold text-green-600">${parseFloat(user.balance || '0').toFixed(2)}</p>
                  <p className="text-sm text-gray-600 mt-1">Available balance</p>
                </div>
                <Button
                  onClick={() => setLocation('/add-balance')}
                  className="bg-casino-gold hover:bg-yellow-500"
                >
                  Add Funds
                </Button>
              </div>
            </div>
          </div>
        )}

        {/* Security Tab */}
        {activeTab === 'security' && (
          <div className="space-y-6">
            <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-200">
              <h2 className="text-xl font-semibold text-gray-900 mb-6">Change Password</h2>
              
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Current Password</label>
                  <input
                    type="password"
                    value={formData.currentPassword}
                    onChange={(e) => setFormData({ ...formData, currentPassword: e.target.value })}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-casino-gold focus:border-transparent"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">New Password</label>
                  <input
                    type="password"
                    value={formData.newPassword}
                    onChange={(e) => setFormData({ ...formData, newPassword: e.target.value })}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-casino-gold focus:border-transparent"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Confirm New Password</label>
                  <input
                    type="password"
                    value={formData.confirmPassword}
                    onChange={(e) => setFormData({ ...formData, confirmPassword: e.target.value })}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-casino-gold focus:border-transparent"
                  />
                </div>

                <Button
                  onClick={handleChangePassword}
                  className="bg-casino-red hover:opacity-90"
                  disabled={!formData.currentPassword || !formData.newPassword || !formData.confirmPassword}
                >
                  Update Password
                </Button>
              </div>
            </div>

            {/* Account Security Info */}
            <div className="bg-blue-50 rounded-xl p-6 border border-blue-200">
              <h3 className="text-lg font-semibold text-blue-900 mb-4">🔒 Account Security</h3>
              <div className="space-y-3 text-sm">
                <div className="flex justify-between">
                  <span className="text-blue-700 font-medium">Two-Factor Authentication:</span>
                  <span className="text-blue-900">Coming Soon</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-blue-700 font-medium">Login Notifications:</span>
                  <span className="text-blue-900">Enabled</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-blue-700 font-medium">Account Created:</span>
                  <span className="text-blue-900">{new Date(user.createdAt || '').toLocaleDateString()}</span>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Winnings Tab */}
        {activeTab === 'winnings' && (
          <div className="space-y-6">
            {/* Winnings Summary */}
            <div className="grid sm:grid-cols-3 gap-4">
              <div className="bg-gradient-to-r from-green-50 to-emerald-50 rounded-xl p-6 border border-green-200">
                <h3 className="text-lg font-semibold text-gray-900 mb-2">Total Winnings</h3>
                <p className="text-3xl font-bold text-green-600">$0.00</p>
                <p className="text-sm text-gray-600 mt-1">All-time earnings</p>
              </div>
              
              <div className="bg-gradient-to-r from-blue-50 to-cyan-50 rounded-xl p-6 border border-blue-200">
                <h3 className="text-lg font-semibold text-gray-900 mb-2">Games Won</h3>
                <p className="text-3xl font-bold text-blue-600">0</p>
                <p className="text-sm text-gray-600 mt-1">Total victories</p>
              </div>
              
              <div className="bg-gradient-to-r from-purple-50 to-indigo-50 rounded-xl p-6 border border-purple-200">
                <h3 className="text-lg font-semibold text-gray-900 mb-2">Win Rate</h3>
                <p className="text-3xl font-bold text-purple-600">0%</p>
                <p className="text-sm text-gray-600 mt-1">Success percentage</p>
              </div>
            </div>

            {/* Withdrawal Section */}
            <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-200">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">💸 Withdraw Winnings</h3>
              <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4 mb-4">
                <p className="text-yellow-800 text-sm">
                  <strong>Coming Soon:</strong> Withdrawal functionality is currently being developed. 
                  You'll be able to withdraw your winnings via e-transfer, PayPal, and other methods.
                </p>
              </div>
              
              <div className="grid sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Withdrawal Method</label>
                  <select className="w-full px-4 py-3 border border-gray-300 rounded-lg bg-gray-50" disabled>
                    <option>E-Transfer (Coming Soon)</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Amount</label>
                  <input
                    type="number"
                    placeholder="0.00"
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg bg-gray-50"
                    disabled
                  />
                </div>
              </div>
              
              <Button className="mt-4 bg-gray-400" disabled>
                Request Withdrawal (Coming Soon)
              </Button>
            </div>

            {/* Recent Winnings */}
            <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-200">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">🏆 Recent Winnings</h3>
              <div className="text-center py-8 text-gray-500">
                <div className="text-4xl mb-4">🎯</div>
                <p>No winnings yet!</p>
                <p className="text-sm mt-2">Start playing to see your wins here.</p>
              </div>
            </div>
          </div>
        )}

        {/* Danger Zone */}
        <div className="mt-8 bg-red-50 rounded-xl p-6 border border-red-200">
          <h3 className="text-lg font-semibold text-red-900 mb-4">⚠️ Danger Zone</h3>
          <div className="space-y-4">
            <div>
              <h4 className="font-medium text-red-800 mb-2">Delete Account</h4>
              <p className="text-red-700 text-sm mb-3">
                Permanently delete your account and all associated data. This action cannot be undone.
              </p>
              <Button
                variant="outline"
                className="border-red-300 text-red-700 hover:bg-red-100"
                onClick={() => alert('Account deletion feature will be implemented soon!')}
              >
                Delete Account
              </Button>
            </div>
          </div>
        </div>
      </div>
    </SiteLayout>
  );
}