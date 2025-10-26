import React, { useState } from 'react';
import { walletAPI } from '../services/api';
import toast from 'react-hot-toast';
import QRPayment from './QRPayment';

interface TopUpModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
}

const TopUpModal: React.FC<TopUpModalProps> = ({ isOpen, onClose, onSuccess }) => {
  const [amount, setAmount] = useState(500);
  const [paymentMethod, setPaymentMethod] = useState<'qr' | 'test' | 'upi'>('qr');
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    console.log(`DEBUG: Payment method selected: ${paymentMethod}, amount: ${amount}`);

    try {
      if (paymentMethod === 'upi') {
        console.log('DEBUG: Attempting UPI Payment...');
        
        const result = await walletAPI.createUPIOrder(amount);
        console.log('DEBUG: UPI Order Result:', result);

        if (result.payment_url) {
          console.log('DEBUG: Redirecting to payment URL:', result.payment_url);
          
          toast.success('Redirecting to payment gateway...');
          
          setTimeout(() => {
            window.location.href = result.payment_url;
          }, 1000);
        } else {
          console.error('DEBUG: No payment_url in response:', result);
          toast.error('Payment URL not received from gateway');
        }
      } else if (paymentMethod === 'qr') {
        // QR Payment - handled by QRPayment component
        toast('Please scan the QR code and follow the payment instructions', { 
          icon: '📱' 
        });
      } else {
        // Test top-up
        console.log('DEBUG: Running test top-up...');
        const result = await walletAPI.topupWallet(amount);
        console.log('DEBUG: Test top-up result:', result);
        toast.success(result.message);
        onSuccess();
        onClose();
        setAmount(500);
      }
    } catch (error: any) {
      console.error('DEBUG: Payment Error:', error);
      console.error('DEBUG: Error response:', error.response?.data);
      toast.error(error.response?.data?.error || 'Payment failed');
    } finally {
      setIsLoading(false);
    }
  };

  if (!isOpen) return null;

  const quickAmounts = [500, 1000, 2000, 5000];

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-gray-800 rounded-xl p-6 w-full max-w-md border border-gray-700">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-2xl font-bold text-white">Top Up Wallet</h2>
          <button 
            onClick={onClose}
            className="text-gray-400 hover:text-white text-2xl"
          >
            ×
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Quick Amount Selection */}
          <div>
            <label className="block text-gray-300 mb-3 font-medium">Quick Select</label>
            <div className="grid grid-cols-2 gap-3">
              {quickAmounts.map((quickAmount) => (
                <button
                  key={quickAmount}
                  type="button"
                  onClick={() => setAmount(quickAmount)}
                  className={`p-3 rounded-lg border font-medium transition-colors ${
                    amount === quickAmount
                      ? 'border-emerald-500 bg-emerald-500/20 text-emerald-500'
                      : 'border-gray-600 bg-gray-700 text-gray-300 hover:border-gray-500'
                  }`}
                >
                  ₹{quickAmount.toLocaleString()}
                </button>
              ))}
            </div>
          </div>

          {/* Custom Amount Input */}
          <div>
            <label className="block text-gray-300 mb-3 font-medium">
              Or Enter Amount (Min ₹100)
            </label>
            <div className="relative">
              <span className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400">₹</span>
              <input
                type="number"
                value={amount}
                onChange={(e) => setAmount(Number(e.target.value))}
                min="100"
                className="w-full pl-8 pr-4 py-3 bg-gray-700 border border-gray-600 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-emerald-500 text-lg font-medium"
                placeholder="500"
                required
              />
            </div>
          </div>

          {/* Payment Method Selection */}
          <div>
            <label className="block text-gray-300 mb-3 font-medium">Payment Method</label>
            <div className="space-y-3">
              {/* QR Code Payment */}
              <div 
                className={`flex items-center justify-between p-4 rounded-lg border-2 cursor-pointer transition-colors ${
                  paymentMethod === 'qr' 
                    ? 'border-emerald-500 bg-emerald-500/10' 
                    : 'border-gray-600 bg-gray-700 hover:border-gray-500'
                }`}
                onClick={() => setPaymentMethod('qr')}
              >
                <div className="flex items-center space-x-3">
                  <div className={`w-3 h-3 rounded-full ${
                    paymentMethod === 'qr' ? 'bg-emerald-500' : 'bg-gray-500'
                  }`}></div>
                  <div>
                    <p className={`font-medium ${
                      paymentMethod === 'qr' ? 'text-emerald-500' : 'text-white'
                    }`}>QR Code Payment</p>
                    <p className="text-sm text-gray-400">Scan with UPI app</p>
                  </div>
                </div>
                {paymentMethod === 'qr' && (
                  <div className="w-5 h-5 border-2 border-emerald-500 rounded-full bg-emerald-500"></div>
                )}
              </div>

              {/* Test Top-up */}
              <div 
                className={`flex items-center justify-between p-4 rounded-lg border-2 cursor-pointer transition-colors ${
                  paymentMethod === 'test' 
                    ? 'border-emerald-500 bg-emerald-500/10' 
                    : 'border-gray-600 bg-gray-700 hover:border-gray-500'
                }`}
                onClick={() => setPaymentMethod('test')}
              >
                <div className="flex items-center space-x-3">
                  <div className={`w-3 h-3 rounded-full ${
                    paymentMethod === 'test' ? 'bg-emerald-500' : 'bg-gray-500'
                  }`}></div>
                  <div>
                    <p className={`font-medium ${
                      paymentMethod === 'test' ? 'text-emerald-500' : 'text-white'
                    }`}>Test Top-Up</p>
                    <p className="text-sm text-gray-400">For testing purposes</p>
                  </div>
                </div>
                {paymentMethod === 'test' && (
                  <div className="w-5 h-5 border-2 border-emerald-500 rounded-full bg-emerald-500"></div>
                )}
              </div>

              {/* UPI Gateway Payment */}
              <div 
                className={`flex items-center justify-between p-4 rounded-lg border-2 cursor-pointer transition-colors ${
                  paymentMethod === 'upi' 
                    ? 'border-emerald-500 bg-emerald-500/10' 
                    : 'border-gray-600 bg-gray-700 hover:border-gray-500'
                }`}
                onClick={() => setPaymentMethod('upi')}
              >
                <div className="flex items-center space-x-3">
                  <div className={`w-3 h-3 rounded-full ${
                    paymentMethod === 'upi' ? 'bg-emerald-500' : 'bg-gray-500'
                  }`}></div>
                  <div>
                    <p className={`font-medium ${
                      paymentMethod === 'upi' ? 'text-emerald-500' : 'text-white'
                    }`}>UPI Gateway</p>
                    <p className="text-sm text-gray-400">Pay via gateway redirect</p>
                  </div>
                </div>
                {paymentMethod === 'upi' && (
                  <div className="w-5 h-5 border-2 border-emerald-500 rounded-full bg-emerald-500"></div>
                )}
              </div>
            </div>
          </div>

          {/* Show QR Payment Component when QR is selected */}
          {paymentMethod === 'qr' && (
            <QRPayment 
              amount={amount} 
              onPaymentSubmitted={() => {
                toast.success('Payment submitted for verification!');
                onSuccess(); // Refresh wallet data
                onClose();
              }} 
            />
          )}

          {/* Show submit button for non-QR payments */}
          {paymentMethod !== 'qr' && (
            <>
              {/* Amount Summary */}
              <div className="bg-gradient-to-r from-emerald-500/10 to-blue-500/10 border border-emerald-500/30 rounded-xl p-5">
                <div className="flex justify-between items-center mb-2">
                  <span className="text-gray-300">Amount to Add:</span>
                  <span className="text-2xl font-bold text-emerald-500">₹{amount.toLocaleString()}</span>
                </div>
                <div className="flex justify-between items-center text-sm text-gray-400">
                  <span>Payment Method:</span>
                  <span className="text-emerald-500 capitalize">
                    {paymentMethod === 'upi' ? 'UPI Gateway' : 'Test Mode'}
                  </span>
                </div>
                {paymentMethod === 'upi' && (
                  <div className="mt-2 text-xs text-yellow-400">
                    ⚠️ You will be redirected to payment gateway to complete the transaction
                  </div>
                )}
              </div>

              <div className="flex gap-4">
                <button
                  type="button"
                  onClick={onClose}
                  className="flex-1 py-3 px-4 bg-gray-600 text-white rounded-lg hover:bg-gray-500 font-medium transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isLoading || amount < 100}
                  className="flex-1 py-3 px-4 bg-gradient-to-r from-emerald-500 to-emerald-600 text-white rounded-lg hover:from-emerald-600 hover:to-emerald-700 disabled:opacity-50 disabled:cursor-not-allowed font-medium transition-all"
                >
                  {isLoading ? 'Processing...' : paymentMethod === 'upi' ? 'Pay Now' : `Add ₹${amount.toLocaleString()}`}
                </button>
              </div>
            </>
          )}
        </form>
      </div>
    </div>
  );
};

export default TopUpModal;
