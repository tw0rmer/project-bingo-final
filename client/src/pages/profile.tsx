import React, { useState, useEffect } from 'react';
import { SiteLayout } from '@/components/SiteLayout';
import { useLocation } from 'wouter';
import { useAuth } from '@/contexts/AuthContext';
import { Button } from '@/components/ui/button';
import { authApiRequest } from '@/lib/api';
import { 
  User, 
  Shield, 
  Trophy, 
  ArrowLeft, 
  Edit, 
  Save, 
  X, 
  Crown, 
  Target, 
  DollarSign, 
  TrendingUp, 
  AlertTriangle,
  Trash2,
  Sparkles,
  Star
} from 'lucide-react';

interface ProfileStats {
  totalWinnings: number;
  gamesWon: number;
}

interface DashboardData {
  user: any;
  lobbies: any[];
  recentTransactions: any[];
  stats?: {
    totalWinnings: number;
    gamesWon: number;
  };
}

export default function ProfilePage() {
  const [, setLocation] = useLocation();
  const { user, logout } = useAuth();
  const [activeTab, setActiveTab] = useState<'account' | 'security' | 'winnings'>('account');
  const [isEditing, setIsEditing] = useState(false);
  const [profileStats, setProfileStats] = useState<ProfileStats>({ totalWinnings: 0, gamesWon: 0 });
  const [formData, setFormData] = useState({
    email: user?.email || '',
    username: (user as any)?.username || '',
    currentPassword: '',
    newPassword: '',
    confirmPassword: ''
  });

  // Fetch profile stats when component mounts
  useEffect(() => {
    const fetchProfileStats = async () => {
      try {
        const data = await authApiRequest<DashboardData>('/dashboard');
        if (data.stats) {
          setProfileStats({
            totalWinnings: data.stats.totalWinnings || 0,
            gamesWon: data.stats.gamesWon || 0
          });
        }
      } catch (error) {
        console.error('Failed to fetch profile stats:', error);
      }
    };

    if (user) {
      fetchProfileStats();
    }
  }, [user]);

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
    { id: 'account', label: 'Account', icon: User },
    { id: 'security', label: 'Security', icon: Shield },
    { id: 'winnings', label: 'Winnings', icon: Trophy }
  ];

  return (
    <SiteLayout>
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50">
        {/* Animated Background Decorations */}
        <div className="fixed inset-0 overflow-hidden pointer-events-none">
          <div className="absolute top-20 left-10 w-32 h-32 bg-gradient-to-br from-blue-400/20 to-purple-400/20 rounded-full animate-pulse"></div>
          <div className="absolute top-40 right-20 w-24 h-24 bg-gradient-to-br from-pink-400/20 to-orange-400/20 rounded-full animate-bounce-soft"></div>
          <div className="absolute bottom-20 left-20 w-28 h-28 bg-gradient-to-br from-green-400/20 to-blue-400/20 rounded-full animate-pulse"></div>
          <div className="absolute bottom-40 right-10 w-20 h-20 bg-gradient-to-br from-yellow-400/20 to-red-400/20 rounded-full animate-bounce-soft"></div>
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
                <div className="w-16 h-16 bg-gradient-to-br from-blue-500 to-purple-600 rounded-2xl flex items-center justify-center shadow-2xl">
                  <User size={32} className="text-white" />
                </div>
                <div className="floating-sparkles">
                  <Sparkles size={20} className="text-yellow-500 animate-pulse" />
                  <Star size={16} className="text-orange-500 animate-bounce-soft" />
                </div>
              </div>
              <h1 className="text-4xl font-bold bg-gradient-to-r from-gray-800 to-gray-600 bg-clip-text text-transparent mb-3">Profile Settings</h1>
              <p className="text-gray-600 text-lg">Manage your account information and preferences</p>
            </div>
        </div>

                  {/* Enhanced Tabs */}
          <div className="mb-8">
            <div className="bg-white/95 backdrop-blur-sm rounded-2xl border-2 border-gray-200/50 shadow-xl overflow-hidden">
              <nav className="flex">
                {tabs.map((tab) => {
                  const Icon = tab.icon;
                  return (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id as any)}
                      className={`flex-1 flex items-center justify-center gap-3 py-4 px-6 font-bold text-sm transition-all duration-300 ${
                    activeTab === tab.id
                          ? 'bg-gradient-to-r from-blue-500 to-purple-600 text-white shadow-lg scale-105'
                          : 'text-gray-600 hover:text-gray-800 hover:bg-gray-50'
                  }`}
                >
                      <Icon size={20} />
                  <span>{tab.label}</span>
                </button>
                  );
                })}
            </nav>
          </div>
        </div>

                  {/* Enhanced Account Tab */}
        {activeTab === 'account' && (
            <div className="space-y-8">
              <div className="bg-white/95 backdrop-blur-sm rounded-3xl p-8 shadow-2xl border-2 border-gray-200/50">
                <div className="flex items-center justify-between mb-8">
                  <div className="flex items-center gap-3">
                    <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-purple-600 rounded-xl flex items-center justify-center shadow-lg">
                      <User size={24} className="text-white" />
                    </div>
                    <h2 className="text-2xl font-bold bg-gradient-to-r from-gray-800 to-gray-600 bg-clip-text text-transparent">Account Information</h2>
                  </div>
                <Button
                  onClick={() => setIsEditing(!isEditing)}
                    className={`flex items-center gap-2 px-6 py-3 rounded-xl font-bold transition-all duration-300 ${
                      isEditing 
                        ? 'bg-red-500 hover:bg-red-600 text-white shadow-lg hover:shadow-xl' 
                        : 'bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700 text-white shadow-lg hover:shadow-xl'
                    }`}
                  >
                    {isEditing ? <X size={18} /> : <Edit size={18} />}
                  {isEditing ? 'Cancel' : 'Edit'}
                </Button>
              </div>

                              <div className="grid gap-8">
                <div>
                    <label className="block text-sm font-bold text-gray-700 mb-3">Email Address</label>
                  <input
                    type="email"
                    value={formData.email}
                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                    disabled={!isEditing}
                      className="w-full px-6 py-4 border-2 border-gray-200 rounded-2xl focus:ring-4 focus:ring-blue-400/30 focus:border-blue-500 disabled:bg-gray-50 disabled:text-gray-500 text-lg transition-all duration-300"
                  />
                </div>

                <div>
                    <label className="block text-sm font-bold text-gray-700 mb-3">Username</label>
                  <input
                    type="text"
                    value={formData.username}
                    onChange={(e) => setFormData({ ...formData, username: e.target.value })}
                    disabled={!isEditing}
                    placeholder="Set your username"
                      className="w-full px-6 py-4 border-2 border-gray-200 rounded-2xl focus:ring-4 focus:ring-blue-400/30 focus:border-blue-500 disabled:bg-gray-50 disabled:text-gray-500 text-lg transition-all duration-300"
                  />
                </div>

                  <div className="grid sm:grid-cols-2 gap-6">
                    <div className="bg-gradient-to-r from-green-100 to-emerald-100 rounded-2xl p-6 border-2 border-green-200/50">
                      <div className="flex items-center gap-3 mb-3">
                        <div className="w-8 h-8 bg-green-500 rounded-lg flex items-center justify-center">
                          <span className="text-white font-bold">✓</span>
                        </div>
                        <label className="block text-sm font-bold text-gray-700">Account Status</label>
                      </div>
                      <div className="text-xl font-bold text-green-700">Active</div>
                    </div>
                    <div className="bg-gradient-to-r from-purple-100 to-indigo-100 rounded-2xl p-6 border-2 border-purple-200/50">
                      <div className="flex items-center gap-3 mb-3">
                        <div className="w-8 h-8 bg-purple-500 rounded-lg flex items-center justify-center">
                          {user.isAdmin ? <Crown size={16} className="text-white" /> : <Target size={16} className="text-white" />}
                        </div>
                        <label className="block text-sm font-bold text-gray-700">Account Type</label>
                      </div>
                      <div className="text-xl font-bold text-purple-700">
                        {user.isAdmin ? 'Admin' : 'Player'}
                    </div>
                  </div>
                </div>

                {isEditing && (
                    <div className="flex gap-4">
                    <Button
                      onClick={handleSaveProfile}
                        className="flex items-center gap-2 bg-gradient-to-r from-green-500 to-emerald-600 hover:from-green-600 hover:to-emerald-700 text-white py-4 px-8 rounded-2xl font-bold shadow-lg hover:shadow-xl transition-all duration-300"
                    >
                        <Save size={18} />
                      Save Changes
                    </Button>
                  </div>
                )}
              </div>
            </div>

              {/* Enhanced Account Balance Card */}
              <div className="bg-gradient-to-r from-green-100 to-emerald-100 rounded-3xl p-8 border-2 border-green-200/50 shadow-2xl">
                <div className="flex items-center gap-4 mb-6">
                  <div className="w-12 h-12 bg-gradient-to-br from-green-500 to-emerald-600 rounded-xl flex items-center justify-center shadow-lg">
                    <DollarSign size={24} className="text-white" />
                  </div>
                  <h3 className="text-2xl font-bold bg-gradient-to-r from-green-700 to-emerald-700 bg-clip-text text-transparent">Account Balance</h3>
                </div>
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-4xl font-bold text-green-700 mb-2">${(user.balance || '0').toString()}</p>
                    <p className="text-gray-600 text-lg">Available balance</p>
                </div>
                <Button
                  onClick={() => setLocation('/add-balance')}
                    className="bg-gradient-to-r from-green-500 to-emerald-600 hover:from-green-600 hover:to-emerald-700 text-white py-4 px-8 rounded-2xl font-bold shadow-lg hover:shadow-xl transition-all duration-300"
                >
                  Add Funds
                </Button>
              </div>
            </div>
          </div>
        )}

                  {/* Enhanced Security Tab */}
        {activeTab === 'security' && (
            <div className="space-y-8">
              <div className="bg-white/95 backdrop-blur-sm rounded-3xl p-8 shadow-2xl border-2 border-gray-200/50">
                <div className="flex items-center gap-3 mb-8">
                  <div className="w-12 h-12 bg-gradient-to-br from-red-500 to-pink-600 rounded-xl flex items-center justify-center shadow-lg">
                    <Shield size={24} className="text-white" />
                  </div>
                  <h2 className="text-2xl font-bold bg-gradient-to-r from-gray-800 to-gray-600 bg-clip-text text-transparent">Change Password</h2>
                </div>
                
          <div className="space-y-6">
                <div>
                    <label className="block text-sm font-bold text-gray-700 mb-3">Current Password</label>
                  <input
                    type="password"
                    value={formData.currentPassword}
                    onChange={(e) => setFormData({ ...formData, currentPassword: e.target.value })}
                      className="w-full px-6 py-4 border-2 border-gray-200 rounded-2xl focus:ring-4 focus:ring-red-400/30 focus:border-red-500 text-lg transition-all duration-300"
                  />
                </div>

                <div>
                    <label className="block text-sm font-bold text-gray-700 mb-3">New Password</label>
                  <input
                    type="password"
                    value={formData.newPassword}
                    onChange={(e) => setFormData({ ...formData, newPassword: e.target.value })}
                      className="w-full px-6 py-4 border-2 border-gray-200 rounded-2xl focus:ring-4 focus:ring-red-400/30 focus:border-red-500 text-lg transition-all duration-300"
                  />
                </div>

                <div>
                    <label className="block text-sm font-bold text-gray-700 mb-3">Confirm New Password</label>
                  <input
                    type="password"
                    value={formData.confirmPassword}
                    onChange={(e) => setFormData({ ...formData, confirmPassword: e.target.value })}
                      className="w-full px-6 py-4 border-2 border-gray-200 rounded-2xl focus:ring-4 focus:ring-red-400/30 focus:border-red-500 text-lg transition-all duration-300"
                  />
                </div>

                <Button
                  onClick={handleChangePassword}
                    className="flex items-center gap-2 bg-gradient-to-r from-red-500 to-pink-600 hover:from-red-600 hover:to-pink-700 text-white py-4 px-8 rounded-2xl font-bold shadow-lg hover:shadow-xl transition-all duration-300"
                  disabled={!formData.currentPassword || !formData.newPassword || !formData.confirmPassword}
                >
                    <Shield size={18} />
                  Update Password
                </Button>
              </div>
            </div>

              {/* Enhanced Account Security Info */}
              <div className="bg-gradient-to-r from-blue-100 to-indigo-100 rounded-3xl p-8 border-2 border-blue-200/50 shadow-2xl">
                <div className="flex items-center gap-3 mb-6">
                  <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-xl flex items-center justify-center shadow-lg">
                    <Shield size={24} className="text-white" />
                  </div>
                  <h3 className="text-2xl font-bold bg-gradient-to-r from-blue-700 to-indigo-700 bg-clip-text text-transparent">Account Security</h3>
                </div>
                <div className="space-y-4 text-lg">
                  <div className="flex justify-between items-center p-4 bg-white/80 rounded-2xl border border-blue-200/50">
                    <span className="text-blue-700 font-bold">Two-Factor Authentication:</span>
                    <span className="text-blue-900 font-bold">Coming Soon</span>
                  </div>
                  <div className="flex justify-between items-center p-4 bg-white/80 rounded-2xl border border-blue-200/50">
                    <span className="text-blue-700 font-bold">Login Notifications:</span>
                    <span className="text-green-700 font-bold">Enabled</span>
                  </div>
                  <div className="flex justify-between items-center p-4 bg-white/80 rounded-2xl border border-blue-200/50">
                    <span className="text-blue-700 font-bold">Account Created:</span>
                    <span className="text-blue-900 font-bold">{new Date().toLocaleDateString()}</span>
                </div>
              </div>
            </div>
          </div>
        )}

                  {/* Enhanced Winnings Tab */}
        {activeTab === 'winnings' && (
            <div className="space-y-8">
              {/* Enhanced Winnings Summary */}
              <div className="grid sm:grid-cols-3 gap-6">
                <div className="bg-gradient-to-r from-green-100 to-emerald-100 rounded-3xl p-8 border-2 border-green-200/50 shadow-2xl">
                  <div className="flex items-center gap-3 mb-4">
                    <div className="w-10 h-10 bg-gradient-to-br from-green-500 to-emerald-600 rounded-xl flex items-center justify-center shadow-lg">
                      <DollarSign size={20} className="text-white" />
                    </div>
                    <h3 className="text-xl font-bold bg-gradient-to-r from-green-700 to-emerald-700 bg-clip-text text-transparent">Total Winnings</h3>
                  </div>
                  <p className="text-4xl font-bold text-green-700 mb-2">${profileStats.totalWinnings.toFixed(2)}</p>
                  <p className="text-gray-600 text-lg">All-time earnings</p>
                </div>
                
                <div className="bg-gradient-to-r from-blue-100 to-cyan-100 rounded-3xl p-8 border-2 border-blue-200/50 shadow-2xl">
                  <div className="flex items-center gap-3 mb-4">
                    <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-cyan-600 rounded-xl flex items-center justify-center shadow-lg">
                      <Trophy size={20} className="text-white" />
                    </div>
                    <h3 className="text-xl font-bold bg-gradient-to-r from-blue-700 to-cyan-700 bg-clip-text text-transparent">Games Won</h3>
                  </div>
                  <p className="text-4xl font-bold text-blue-700 mb-2">{profileStats.gamesWon}</p>
                  <p className="text-gray-600 text-lg">Total victories</p>
                </div>
              </div>
              
              {/* Enhanced Withdrawal Section */}
              <div className="bg-white/95 backdrop-blur-sm rounded-3xl p-8 shadow-2xl border-2 border-gray-200/50">
                <div className="flex items-center gap-3 mb-6">
                  <div className="w-12 h-12 bg-gradient-to-br from-yellow-500 to-orange-600 rounded-xl flex items-center justify-center shadow-lg">
                    <DollarSign size={24} className="text-white" />
              </div>
                  <h3 className="text-2xl font-bold bg-gradient-to-r from-gray-800 to-gray-600 bg-clip-text text-transparent">Withdraw Winnings</h3>
            </div>
                <div className="bg-gradient-to-r from-yellow-100 to-orange-100 border-2 border-yellow-200/50 rounded-2xl p-6 mb-6">
                  <p className="text-yellow-800 text-lg font-medium">
                  <strong>Coming Soon:</strong> Withdrawal functionality is currently being developed. 
                  You'll be able to withdraw your winnings via e-transfer, PayPal, and other methods.
                </p>
              </div>
              
                <div className="grid sm:grid-cols-2 gap-6">
                <div>
                    <label className="block text-sm font-bold text-gray-700 mb-3">Withdrawal Method</label>
                    <select className="w-full px-6 py-4 border-2 border-gray-200 rounded-2xl bg-gray-50 text-lg" disabled>
                    <option>E-Transfer (Coming Soon)</option>
                  </select>
                </div>
                <div>
                    <label className="block text-sm font-bold text-gray-700 mb-3">Amount</label>
                  <input
                    type="number"
                    placeholder="0.00"
                      className="w-full px-6 py-4 border-2 border-gray-200 rounded-2xl bg-gray-50 text-lg"
                    disabled
                  />
                </div>
              </div>
              
                <Button className="mt-6 bg-gray-400 py-4 px-8 rounded-2xl text-lg font-bold" disabled>
                Request Withdrawal (Coming Soon)
              </Button>
            </div>

              {/* Enhanced Recent Winnings */}
              <div className="bg-white/95 backdrop-blur-sm rounded-3xl p-8 shadow-2xl border-2 border-gray-200/50">
                <div className="flex items-center gap-3 mb-6">
                  <div className="w-12 h-12 bg-gradient-to-br from-purple-500 to-pink-600 rounded-xl flex items-center justify-center shadow-lg">
                    <Trophy size={24} className="text-white" />
                  </div>
                  <h3 className="text-2xl font-bold bg-gradient-to-r from-gray-800 to-gray-600 bg-clip-text text-transparent">Recent Winnings</h3>
                </div>
                <div className="text-center py-12 text-gray-500">
                  <div className="text-6xl mb-6">🎯</div>
                  <p className="text-2xl font-bold mb-2">No winnings yet!</p>
                  <p className="text-lg">Start playing to see your wins here.</p>
                </div>
            </div>
          </div>
        )}

          {/* Enhanced Danger Zone */}
          <div className="mt-8 bg-gradient-to-r from-red-100 to-pink-100 rounded-3xl p-8 border-2 border-red-200/50 shadow-2xl">
            <div className="flex items-center gap-3 mb-6">
              <div className="w-12 h-12 bg-gradient-to-br from-red-500 to-pink-600 rounded-xl flex items-center justify-center shadow-lg">
                <AlertTriangle size={24} className="text-white" />
              </div>
              <h3 className="text-2xl font-bold bg-gradient-to-r from-red-700 to-pink-700 bg-clip-text text-transparent">Danger Zone</h3>
            </div>
            <div className="space-y-6">
              <div className="bg-white/80 rounded-2xl p-6 border border-red-200/50">
                <h4 className="font-bold text-red-800 mb-3 text-lg">Delete Account</h4>
                <p className="text-red-700 text-lg mb-4">
                Permanently delete your account and all associated data. This action cannot be undone.
              </p>
              <Button
                variant="outline"
                  className="flex items-center gap-2 border-2 border-red-300 text-red-700 hover:bg-red-100 py-3 px-6 rounded-2xl font-bold"
                onClick={() => alert('Account deletion feature will be implemented soon!')}
              >
                  <Trash2 size={18} />
                Delete Account
              </Button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </SiteLayout>
  );
}