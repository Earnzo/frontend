import React, { useState, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { useWallet } from '../hooks/useWallet';
import { useStakes } from '../hooks/useStakes';
import TopUpModal from './TopUpModal';
import { useWalletWebSocket } from '../hooks/useWalletWebSocket';
import toast from 'react-hot-toast';

const Dashboard: React.FC = () => {
  const { user, logout } = useAuth();
  const { wallet, transactions, isLoading: walletLoading, refetch: refetchWallet } = useWallet();
  const { stakes, isLoading: stakesLoading, createStake, calculateDailyPayout, isCreating } = useStakes();
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showUserMenu, setShowUserMenu] = useState(false);
  const [showTopUpModal, setShowTopUpModal] = useState(false);
  const [stakeAmount, setStakeAmount] = useState(500);

  // Add WebSocket connection hook for real-time updates
  const token = localStorage.getItem('token') || '';
  const { wallet: realtimeWallet, isConnected } = useWalletWebSocket(token);

  // Use real-time wallet data if available, otherwise use initial data
  const currentWallet = realtimeWallet || wallet;

  if (walletLoading || stakesLoading) {
    return (
      <div className="min-h-screen bg-gray-900 flex items-center justify-center">
        <div className="text-white text-xl">Loading your data...</div>
      </div>
    );
  }

  // Calculate real data
  const activeStakes = stakes.filter(stake => stake.state === 'ACTIVE');
  const completedStakes = stakes.filter(stake => stake.state === 'COMPLETED');
  const totalInvestment = activeStakes.reduce((sum, stake) => sum + stake.amount, 0);
  const dailyPayout = activeStakes.reduce((sum, stake) => sum + stake.daily_payout, 0);
  const totalEarned = transactions
    .filter(tx => tx.type === 'PAYOUT')
    .reduce((sum, tx) => sum + tx.amount, 0);

  const handleCreateStake = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await createStake(stakeAmount);
      setShowCreateModal(false);
      setStakeAmount(500);
    } catch (error) {
      console.error('Failed to create stake:', error);
    }
  };

  const dailyPayoutForAmount = calculateDailyPayout(stakeAmount);
  const recoveryDays = Math.ceil(stakeAmount / dailyPayoutForAmount);
  const totalReturn = dailyPayoutForAmount * 60;

  return (
    <div className="min-h-screen bg-gray-900 text-white p-6">
      {/* Header */}
      <div className="flex justify-between items-center mb-8">
        <div className="flex items-center space-x-4">
          <h1 className="text-2xl font-bold text-emerald-500">DailyStake</h1>
          {/* Real-time Connection Status */}
          <span className={`inline-flex items-center px-3 py-1 rounded-full text-sm ${
            isConnected 
              ? 'bg-green-500/20 text-green-500' 
              : 'bg-red-500/20 text-red-500'
          }`}>
            <div className={`w-2 h-2 rounded-full mr-2 ${
              isConnected ? 'bg-green-500' : 'bg-red-500'
            }`}></div>
            {isConnected ? 'Live Updates' : 'Reconnecting...'}
          </span>
        </div>
        
        <div className="flex items-center space-x-6">
          <div className="flex items-center space-x-4">
            <span className="text-emerald-500 text-sm">KYC Verified</span>
            <div className="w-2 h-2 bg-red-500 rounded-full"></div>
            <span className="text-white">1</span>
          </div>
          
          {/* User Profile with Dropdown */}
          <div className="relative">
            <button 
              onClick={() => setShowUserMenu(!showUserMenu)}
              className="flex items-center space-x-2 bg-emerald-500 rounded-full p-2"
            >
              <div className="w-8 h-8 bg-emerald-600 rounded-full flex items-center justify-center text-white font-semibold">
                {user?.email?.[0]?.toUpperCase()}
              </div>
            </button>
            
            {/* Dropdown Menu */}
            {showUserMenu && (
              <div className="absolute right-0 mt-2 w-64 bg-gray-800 border border-gray-700 rounded-lg shadow-lg z-10">
                <div className="p-4 border-b border-gray-700">
                  <div className="flex items-center space-x-3">
                    <div className="w-10 h-10 bg-emerald-500 rounded-full flex items-center justify-center text-white font-semibold">
                      {user?.email?.[0]?.toUpperCase()}
                    </div>
                    <div>
                      <p className="text-white font-medium">{user?.email}</p>
                      <p className="text-gray-400 text-sm">+91 98765 43210</p>
                    </div>
                  </div>
                </div>
                <div className="p-2">
                  <button className="w-full flex items-center space-x-2 px-3 py-2 text-gray-300 hover:bg-gray-700 rounded">
                    <span>👤</span>
                    <span>Profile</span>
                  </button>
                  <button className="w-full flex items-center space-x-2 px-3 py-2 text-gray-300 hover:bg-gray-700 rounded">
                    <span>⚙️</span>
                    <span>Settings</span>
                  </button>
                  <button 
                    onClick={logout}
                    className="w-full flex items-center space-x-2 px-3 py-2 text-red-400 hover:bg-gray-700 rounded"
                  >
                    <span>🚪</span>
                    <span>Log out</span>
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
        <div className="bg-gray-800 rounded-xl p-6 border border-gray-700">
          <div className="flex justify-between items-start mb-2">
            <h3 className="text-gray-400 text-sm">Active Stakes</h3>
            <div className="w-8 h-8 bg-emerald-500/20 rounded-lg flex items-center justify-center">
              <span className="text-emerald-500 text-xl">📈</span>
            </div>
          </div>
          <p className="text-3xl font-bold text-white">{activeStakes.length}</p>
          <p className="text-xs text-gray-500 mt-1">Live this month</p>
        </div>

        <div className="bg-gray-800 rounded-xl p-6 border border-gray-700">
          <div className="flex justify-between items-start mb-2">
            <h3 className="text-gray-400 text-sm">Total Investment</h3>
            <div className="w-8 h-8 bg-emerald-500/20 rounded-lg flex items-center justify-center">
              <span className="text-emerald-500 text-xl">📊</span>
            </div>
          </div>
          <p className="text-3xl font-bold text-emerald-500">₹{totalInvestment.toLocaleString()}</p>
          <p className="text-xs text-emerald-400 mt-1">+3.2% vs last month</p>
        </div>

        <div className="bg-gray-800 rounded-xl p-6 border border-gray-700">
          <div className="flex justify-between items-start mb-2">
            <h3 className="text-gray-400 text-sm">Today's Payout</h3>
            <div className="w-8 h-8 bg-emerald-500/20 rounded-lg flex items-center justify-center">
              <span className="text-emerald-500 text-xl">💰</span>
            </div>
          </div>
          <p className="text-3xl font-bold text-emerald-500">₹{dailyPayout}</p>
          <p className="text-xs text-gray-500 mt-1">vs yesterday +4 Rs</p>
        </div>

        <div className="bg-gray-800 rounded-xl p-6 border border-gray-700">
          <div className="flex justify-between items-start mb-2">
            <h3 className="text-gray-400 text-sm">Completed Stakes</h3>
            <div className="w-8 h-8 bg-emerald-500/20 rounded-lg flex items-center justify-center">
              <span className="text-emerald-500 text-xl">✅</span>
            </div>
          </div>
          <p className="text-3xl font-bold text-white">{completedStakes.length}</p>
          <p className="text-xs text-gray-500 mt-1">All time</p>
        </div>
      </div>

      {/* Main Content Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Left Column - Wallet & Stakes */}
        <div className="lg:col-span-2 space-y-8">
          {/* Wallet Balance with Real-time Updates */}
          <div className="bg-gray-800 rounded-xl p-6 border border-gray-700">
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-xl font-bold flex items-center">
                <span className="mr-2">💳</span>
                Wallet Balance
              </h2>
              <div className="flex items-center space-x-2">
                <div className={`w-2 h-2 rounded-full ${isConnected ? 'bg-green-500' : 'bg-red-500'}`}></div>
                <span className="text-xs text-gray-400">{isConnected ? 'Real-time' : 'Offline'}</span>
              </div>
            </div>
            
            <div className="mb-6">
              <div className="text-4xl font-bold text-emerald-500 mb-2">
                ₹{currentWallet?.balance?.toLocaleString() || '0'}
              </div>
              <p className="text-gray-400 text-sm">Available Balance</p>
              {isConnected && (
                <p className="text-xs text-green-500">✓ Live updates active</p>
              )}
            </div>
            
            <div className="grid grid-cols-2 gap-4 mb-6">
              <div>
                <p className="text-gray-400 text-sm">Total Earned</p>
                <p className="text-xl font-bold">₹{totalEarned.toLocaleString()}</p>
                <p className="text-xs text-emerald-400">+5.9% this month</p>
              </div>
              <div>
                <p className="text-gray-400 text-sm">Pending Payments</p>
                <p className="text-xl font-bold text-yellow-500">₹{currentWallet?.pending_balance?.toLocaleString() || '0'}</p>
                <p className="text-xs text-yellow-400">Processing...</p>
              </div>
            </div>
            
            <div className="flex space-x-4">
              <button 
                onClick={() => setShowTopUpModal(true)}
                className="flex-1 bg-emerald-500 hover:bg-emerald-600 text-white py-3 px-4 rounded-lg font-medium flex items-center justify-center transition-colors"
              >
                <span className="mr-2">💳</span>
                Top Up Wallet
              </button>
              <button className="flex-1 border border-gray-600 hover:border-gray-500 text-gray-300 py-3 px-4 rounded-lg font-medium transition-colors">
                Withdraw
              </button>
            </div>
          </div>

          {/* Your Stakes Section - keeping original design */}
          <div className="bg-gray-800 rounded-xl p-6 border border-gray-700">
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-xl font-bold">Your Stakes</h2>
              <button 
                onClick={() => setShowCreateModal(true)}
                className="bg-gradient-to-r from-emerald-500 to-blue-500 hover:from-emerald-600 hover:to-blue-600 px-6 py-2 rounded-lg text-white font-medium transition-all"
              >
                + Create New Stake
              </button>
            </div>

            {/* Stakes content - keeping your original implementation */}
            {stakes.length === 0 ? (
              <div className="text-center py-12">
                <div className="w-16 h-16 bg-gray-700 rounded-full flex items-center justify-center mx-auto mb-4">
                  <span className="text-2xl">📊</span>
                </div>
                <p className="text-gray-400 mb-4">No stakes created yet</p>
                <button 
                  onClick={() => setShowCreateModal(true)}
                  className="bg-emerald-500 hover:bg-emerald-600 px-6 py-2 rounded-lg text-white font-medium transition-colors"
                >
                  Create Your First Stake
                </button>
              </div>
            ) : (
              <div className="space-y-4">
                {stakes.map((stake) => (
                  <div key={stake.id} className="border border-gray-700 rounded-lg p-6 hover:border-emerald-500/50 transition-colors">
                    <div className="flex justify-between items-start mb-4">
                      <div>
                        <h3 className="font-bold text-lg">Stake #{stake.id.slice(0, 8)}</h3>
                        <p className="text-gray-400 text-sm">
                          Started {new Date(stake.created_at).toLocaleDateString()}
                        </p>
                      </div>
                      <div className="text-right">
                        <span className={`px-3 py-1 rounded-full text-sm font-medium ${
                          stake.state === 'ACTIVE' ? 'bg-emerald-500/20 text-emerald-500' :
                          stake.state === 'COMPLETED' ? 'bg-blue-500/20 text-blue-500' :
                          'bg-yellow-500/20 text-yellow-500'
                        }`}>
                          {stake.state}
                        </span>
                      </div>
                    </div>
                    
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-6 mb-4">
                      <div>
                        <p className="text-gray-400 text-sm">Staked Amount</p>
                        <p className="text-xl font-bold">₹{stake.amount.toLocaleString()}</p>
                      </div>
                      <div>
                        <p className="text-gray-400 text-sm">Daily Payout</p>
                        <p className="text-xl font-bold text-emerald-500">₹{stake.daily_payout}</p>
                      </div>
                      <div>
                        <p className="text-gray-400 text-sm">Total Return</p>
                        <p className="text-xl font-bold">₹{stake.daily_payout * stake.duration_days}</p>
                      </div>
                      <div>
                        <p className="text-gray-400 text-sm">Days Left</p>
                        <p className="text-xl font-bold">{stake.payouts_remaining || 0} / {stake.duration_days}</p>
                      </div>
                    </div>

                    {/* Progress Bar */}
                    <div className="mb-4">
                      <div className="flex justify-between text-sm text-gray-400 mb-2">
                        <span>Progress</span>
                        <span>{stake.duration_days - (stake.payouts_remaining || 0)} / {stake.duration_days} days</span>
                      </div>
                      <div className="w-full bg-gray-700 rounded-full h-2">
                        <div 
                          className="bg-gradient-to-r from-emerald-500 to-blue-500 h-2 rounded-full transition-all duration-300"
                          style={{
                            width: `${((stake.duration_days - (stake.payouts_remaining || 0)) / stake.duration_days) * 100}%`
                          }}
                        ></div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Right Column - keeping your original market and transactions */}
        <div className="space-y-8">
          {/* Live Market */}
          <div className="bg-gray-800 rounded-xl p-6 border border-gray-700">
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-xl font-bold">Live Market</h2>
              <div className="w-6 h-6 text-gray-400">🔄</div>
            </div>
            
            <div className="space-y-4">
              <div className="flex justify-between items-center p-3 bg-emerald-500/10 rounded-lg">
                <div>
                  <span className="font-bold">NIFTY</span>
                  <p className="text-sm text-gray-400">SENSEX</p>
                </div>
                <div className="text-right">
                  <p className="font-bold">₹18,640.24</p>
                  <p className="text-sm text-emerald-500">+1.8%</p>
                </div>
              </div>
              
              <div className="flex justify-between items-center p-3 bg-gray-700 rounded-lg">
                <div>
                  <span className="font-bold">SENSEX</span>
                  <p className="text-sm text-gray-400">₹62,570.96</p>
                </div>
                <div className="text-right">
                  <p className="text-sm text-emerald-500">+1.6%</p>
                </div>
              </div>
              
              <div className="flex justify-between items-center p-3 bg-gray-700 rounded-lg">
                <div>
                  <span className="font-bold">BANKNIFTY</span>
                  <p className="text-sm text-gray-400">₹42,313.27</p>
                </div>
                <div className="text-right">
                  <p className="text-sm text-red-400">-1.8%</p>
                </div>
              </div>
              
              <div className="flex justify-between items-center p-3 bg-gray-700 rounded-lg">
                <div>
                  <span className="font-bold">RELIANCE</span>
                  <p className="text-sm text-gray-400">₹2,387.86</p>
                </div>
                <div className="text-right">
                  <p className="text-sm text-emerald-500">+1.6%</p>
                </div>
              </div>
            </div>

            <div className="mt-6 p-4 bg-gray-700 rounded-lg text-center">
              <p className="text-sm text-gray-400 mb-2">Interactive Chart</p>
              <p className="text-xs text-gray-500">Real-time data from market</p>
            </div>
          </div>

          {/* Transaction History */}
          <div className="bg-gray-800 rounded-xl p-6 border border-gray-700">
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-xl font-bold">Transaction History</h2>
              <button className="text-emerald-500 hover:text-emerald-400 text-sm transition-colors">
                {transactions.length} Transactions
              </button>
            </div>
            
            {transactions.length === 0 ? (
              <div className="text-center py-8">
                <div className="w-12 h-12 bg-gray-700 rounded-full flex items-center justify-center mx-auto mb-4">
                  <span className="text-xl">📝</span>
                </div>
                <p className="text-gray-400">No transactions yet</p>
              </div>
            ) : (
              <div className="space-y-4">
                {transactions.slice(0, 4).map((tx) => (
                  <div key={tx.id} className="flex items-center justify-between p-3 bg-gray-700 rounded-lg hover:bg-gray-600 transition-colors">
                    <div className="flex items-center space-x-3">
                      <div className={`w-3 h-3 rounded-full ${
                        tx.type === 'PAYOUT' ? 'bg-emerald-500' : 
                        tx.type === 'TOPUP' ? 'bg-blue-500' : 'bg-yellow-500'
                      }`}></div>
                      <div>
                        <p className="font-medium">{tx.type === 'PAYOUT' ? 'Payout' : tx.type === 'TOPUP' ? 'Top Up' : tx.type}</p>
                        <p className="text-xs text-gray-400">
                          {new Date(tx.created_at).toLocaleDateString()} {new Date(tx.created_at).toLocaleTimeString()}
                        </p>
                      </div>
                    </div>
                    <div className="text-right">
                      <span className={`font-bold ${
                        tx.type === 'PAYOUT' || tx.type === 'TOPUP' ? 'text-emerald-500' : 'text-white'
                      }`}>
                        +₹{tx.amount}
                      </span>
                      <p className="text-xs text-gray-400">Balance: ₹{tx.balance_after}</p>
                    </div>
                  </div>
                ))}
              </div>
            )}
            
            <button className="w-full mt-4 bg-gray-700 hover:bg-gray-600 py-3 rounded-lg text-sm font-medium transition-colors">
              Load More
            </button>
          </div>
        </div>
      </div>

      {/* Top Up Modal with Real-time Updates */}
      <TopUpModal 
        isOpen={showTopUpModal} 
        onClose={() => setShowTopUpModal(false)}
        onSuccess={() => {
          refetchWallet(); // Also refresh the standard wallet data
          toast.success('Top-up initiated! Real-time balance will update upon approval.');
        }}
      />

      {/* Create Stake Modal - keeping your original implementation */}
      {showCreateModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-gray-800 rounded-xl p-6 w-full max-w-lg border border-gray-700">
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-2xl font-bold text-white">Create New Stake</h2>
              <button 
                onClick={() => setShowCreateModal(false)}
                className="text-gray-400 hover:text-white text-2xl"
              >
                ×
              </button>
            </div>
            
            <form onSubmit={handleCreateStake} className="space-y-6">
              <div>
                <label className="block text-gray-300 mb-3 font-medium">
                  Stake Amount (Minimum ₹500)
                </label>
                <div className="relative">
                  <span className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400">₹</span>
                  <input
                    type="number"
                    value={stakeAmount}
                    onChange={(e) => setStakeAmount(Number(e.target.value))}
                    min="500"
                    className="w-full pl-8 pr-4 py-3 bg-gray-700 border border-gray-600 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-emerald-500 text-lg font-medium"
                    placeholder="500"
                    required
                  />
                  <div className="absolute right-3 top-1/2 transform -translate-y-1/2">
                    <div className="w-6 h-6 bg-emerald-500 rounded text-white text-xs flex items-center justify-center">
                      ₹
                    </div>
                  </div>
                </div>
              </div>

              <div>
                <label className="block text-gray-300 mb-3 font-medium">Payment Method</label>
                <div className="space-y-3">
                  <div className="flex items-center justify-between p-4 bg-emerald-500/10 border-2 border-emerald-500 rounded-lg">
                    <div className="flex items-center space-x-3">
                      <div className="w-3 h-3 bg-emerald-500 rounded-full"></div>
                      <div>
                        <p className="font-medium text-emerald-500">Use Wallet</p>
                        <p className="text-sm text-gray-400">Balance: ₹{currentWallet?.balance?.toLocaleString()}</p>
                      </div>
                    </div>
                    <div className="w-5 h-5 border-2 border-emerald-500 rounded-full bg-emerald-500"></div>
                  </div>
                  
                  <div className="flex items-center justify-between p-4 bg-gray-700 border border-gray-600 rounded-lg opacity-60">
                    <div className="flex items-center space-x-3">
                      <div className="w-3 h-3 bg-gray-500 rounded-full"></div>
                      <div>
                        <p className="font-medium">Pay via Gateway</p>
                        <p className="text-sm text-gray-400">Razorpay/UPI</p>
                      </div>
                    </div>
                    <div className="w-5 h-5 border-2 border-gray-500 rounded-full"></div>
                  </div>
                </div>
              </div>

              <div className="bg-gradient-to-r from-emerald-500/10 to-blue-500/10 border border-emerald-500/30 rounded-xl p-5">
                <div className="flex items-center mb-4">
                  <span className="text-xl mr-2">📊</span>
                  <h3 className="font-bold text-emerald-500">Payout Calculation</h3>
                </div>
                
                <div className="grid grid-cols-2 gap-4 mb-4">
                  <div className="text-center p-3 bg-gray-700/50 rounded-lg">
                    <p className="text-gray-400 text-sm">Daily Payout</p>
                    <p className="text-2xl font-bold text-emerald-500">₹{dailyPayoutForAmount}</p>
                  </div>
                  <div className="text-center p-3 bg-gray-700/50 rounded-lg">
                    <p className="text-gray-400 text-sm">Recovery Days</p>
                    <p className="text-2xl font-bold">{recoveryDays} days</p>
                  </div>
                </div>
                
                <div className="space-y-2 text-sm">
                  <div className="flex justify-between">
                    <span>Total Return (60 days):</span>
                    <span className="text-emerald-500 font-bold">₹{totalReturn.toLocaleString()}</span>
                  </div>
                  <div className="flex justify-between pt-2 border-t border-gray-600">
                    <span>Return Percentage:</span>
                    <span className="text-emerald-500 font-bold text-lg">
                      +{((totalReturn - stakeAmount) / stakeAmount * 100).toFixed(1)}%
                    </span>
                  </div>
                </div>
              </div>

              <div className="flex gap-4">
                <button
                  type="button"
                  onClick={() => setShowCreateModal(false)}
                  className="flex-1 py-3 px-4 bg-gray-600 text-white rounded-lg hover:bg-gray-500 font-medium transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isCreating || stakeAmount < 500}
                  className="flex-1 py-3 px-4 bg-gradient-to-r from-emerald-500 to-blue-500 text-white rounded-lg hover:from-emerald-600 hover:to-blue-600 disabled:opacity-50 disabled:cursor-not-allowed font-medium transition-all"
                >
                  {isCreating ? 'Creating...' : 'Create Stake'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default Dashboard;
