import React, { useState } from 'react';
import { useStakes } from "../../hooks/useStakes";

const CreateStakeModal = ({ isOpen, onClose }) => {
  const [amount, setAmount] = useState(500);
  const { createStake, isCreating, calculateDailyPayout } = useStakes();

  const handleSubmit = async (e) => {
    e.preventDefault();
    const success = await createStake(amount);
    if (success) {
      onClose();
      setAmount(500);
    }
  };

  const dailyPayout = calculateDailyPayout(amount);
  const totalReturn = dailyPayout * 60; // 60 days
  const recoveryDays = Math.ceil(amount / dailyPayout);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-gray-800 rounded-xl p-6 w-full max-w-md">
        <h2 className="text-xl font-bold text-white mb-4">Create New Stake</h2>
        
        <form onSubmit={handleSubmit}>
          <div className="mb-4">
            <label className="block text-gray-300 mb-2">Stake Amount (Minimum ₹500)</label>
            <input
              type="number"
              value={amount}
              onChange={(e) => setAmount(Number(e.target.value))}
              min="500"
              className="w-full p-3 bg-gray-700 border border-gray-600 rounded-lg text-white"
              required
            />
          </div>

          {/* Real-time Payout Calculation */}
          <div className="bg-gray-700 rounded-lg p-4 mb-4">
            <h3 className="font-semibold text-emerald-500 mb-2">Payout Calculation</h3>
            <div className="flex justify-between mb-2">
              <span>Daily Payout:</span>
              <span className="text-emerald-500">₹{dailyPayout}</span>
            </div>
            <div className="flex justify-between mb-2">
              <span>Recovery Days:</span>
              <span>{recoveryDays} days</span>
            </div>
            <div className="flex justify-between mb-2">
              <span>Total Return (60 days):</span>
              <span className="text-emerald-500">₹{totalReturn}</span>
            </div>
            <div className="flex justify-between">
              <span>Return %:</span>
              <span className="text-emerald-500">+{((totalReturn - amount) / amount * 100).toFixed(1)}%</span>
            </div>
          </div>

          <div className="flex gap-4">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 py-3 px-4 bg-gray-600 text-white rounded-lg hover:bg-gray-500"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isCreating}
              className="flex-1 py-3 px-4 bg-gradient-to-r from-emerald-500 to-emerald-600 text-white rounded-lg hover:from-emerald-600 hover:to-emerald-700 disabled:opacity-50"
            >
              {isCreating ? 'Creating...' : 'Create Stake'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default CreateStakeModal;
