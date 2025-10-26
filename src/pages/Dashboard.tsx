import React from 'react';
import { useAuth } from '../contexts/AuthContext';
import { useWallet } from '../hooks/useWallet';
import { useStakes } from '../hooks/useStakes';

const Dashboard = () => {
  // Get real data instead of demo data
  const { user } = useAuth();
  const { wallet, transactions, isLoading: walletLoading } = useWallet();
  const { stakes, isLoading: stakesLoading } = useStakes();

  if (walletLoading || stakesLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gray-900">
        <div className="text-white text-xl">Loading your data...</div>
      </div>
    );
  }

  // Calculate real values
  const activeStakes = stakes.filter(stake => stake.state === 'ACTIVE');
  const completedStakes = stakes.filter(stake => stake.state === 'COMPLETED');
  const totalInvestment = activeStakes.reduce((sum, stake) => sum + stake.amount, 0);
  const dailyPayout = activeStakes.reduce((sum, stake) => sum + stake.daily_payout, 0);

  return (
    <div className="min-h-screen bg-gray-900 text-white p-6">
      {/* Your existing header */}
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-2xl font-bold">DailyStake</h1>
        <div className="flex items-center space-x-4">
          <span className="text-emerald-500">KYC Verified</span>
          <span>{user?.email}</span>
        </div>
      </div>

      {/* Stats Cards - Replace demo values with real data */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
        {/* Active Stakes - REAL DATA */}
        <div className="bg-gray-800 rounded-xl p-6">
          <h3 className="text-gray-400 text-sm">Active Stakes</h3>
          <p className="text-2xl font-bold text-emerald-500">{activeStakes.length}</p>
        </div>
        
        {/* Total Investment - REAL DATA */}
        <div className="bg-gray-800 rounded-xl p-6">
          <h3 className="text-gray-400 text-sm">Total Investment</h3>
          <p className="text-2xl font-bold">₹{totalInvestment.toLocaleString()}</p>
        </div>
        
        {/* Today's Payout - REAL DATA */}
        <div className="bg-gray-800 rounded-xl p-6">
          <h3 className="text-gray-400 text-sm">Today's Payout</h3>
          <p className="text-2xl font-bold text-emerald-500">₹{dailyPayout}</p>
        </div>
        
        {/* Completed Stakes - REAL DATA */}
        <div className="bg-gray-800 rounded-xl p-6">
          <h3 className="text-gray-400 text-sm">Completed Stakes</h3>
          <p className="text-2xl font-bold">{completedStakes.length}</p>
        </div>
      </div>

      {/* Wallet Balance - REAL DATA */}
      <div className="bg-gray-800 rounded-xl p-6 mb-8">
        <h2 className="text-xl font-bold mb-4">Wallet Balance</h2>
        <div className="text-3xl font-bold text-emerald-500">
          ₹{wallet?.balance?.toLocaleString() || '0'}
        </div>
        <p className="text-gray-400">Available Balance</p>
      </div>

      {/* Stakes List - REAL DATA */}
      <div className="bg-gray-800 rounded-xl p-6 mb-8">
        <h2 className="text-xl font-bold mb-4">Your Stakes</h2>
        {stakes.length === 0 ? (
          <p className="text-gray-400">No stakes created yet</p>
        ) : (
          <div className="space-y-4">
            {stakes.map((stake) => (
              <div key={stake.id} className="border border-gray-700 rounded-lg p-4">
                <div className="flex justify-between items-center">
                  <div>
                    <h3 className="font-semibold">Stake #{stake.id.slice(0, 8)}</h3>
                    <p className="text-gray-400">Amount: ₹{stake.amount}</p>
                  </div>
                  <div className="text-right">
                    <p className="text-emerald-500">₹{stake.daily_payout}/day</p>
                    <p className="text-sm text-gray-400">{stake.state}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Transaction History - REAL DATA */}
      <div className="bg-gray-800 rounded-xl p-6">
        <h2 className="text-xl font-bold mb-4">Transaction History</h2>
        {transactions.length === 0 ? (
          <p className="text-gray-400">No transactions yet</p>
        ) : (
          <div className="space-y-2">
            {transactions.slice(0, 5).map((transaction) => (
              <div key={transaction.id} className="flex justify-between items-center py-2 border-b border-gray-700">
                <div>
                  <p className="font-medium">{transaction.type}</p>
                  <p className="text-sm text-gray-400">
                    {new Date(transaction.created_at).toLocaleDateString()}
                  </p>
                </div>
                <div className="text-right">
                  <span className={`font-semibold ${transaction.type === 'PAYOUT' ? 'text-emerald-500' : 'text-white'}`}>
                    {transaction.type === 'PAYOUT' ? '+' : ''}₹{transaction.amount}
                  </span>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default Dashboard;
