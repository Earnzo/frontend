import React, { useState } from 'react';
import { QRCodeSVG } from 'qrcode.react';
import { walletAPI } from '../services/api';
import toast from 'react-hot-toast';

interface QRPaymentProps {
  amount: number;
  onPaymentSubmitted: () => void;
}

const QRPayment: React.FC<QRPaymentProps> = ({ amount, onPaymentSubmitted }) => {
  const [showTxnInput, setShowTxnInput] = useState(false);
  const [transactionId, setTransactionId] = useState('');
  const [upiRefId, setUpiRefId] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const upiId = '8796666659-4@ybl'; // 🔥 REPLACE WITH YOUR ACTUAL UPI ID
  const merchantName = 'DailyStake';
  
  // Generate UPI payment string
  const upiString = `upi://pay?pa=${upiId}&pn=${merchantName}&am=${amount}&cu=INR&tn=Wallet%20Topup%20${amount}`;

  const handleSubmitPayment = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    try {
      const result = await walletAPI.submitPayment({
        amount,
        transaction_id: transactionId,
        upi_ref_id: upiRefId
      });
      
      toast.success(result.message);
      onPaymentSubmitted();
      
      // Reset form
      setTransactionId('');
      setUpiRefId('');
      setShowTxnInput(false);
    } catch (error: any) {
      toast.error(error.response?.data?.error || 'Failed to submit payment');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="bg-gray-800 rounded-xl p-6 border border-gray-700">
      <h3 className="text-xl font-bold text-white mb-6 text-center">Pay with UPI QR</h3>
      
      {!showTxnInput ? (
        <div className="text-center space-y-6">
          {/* QR Code */}
          <div className="bg-white p-6 rounded-lg inline-block">
            <QRCodeSVG
              value={upiString}
              size={200}
              level="H"
              includeMargin={true}
              bgColor="#ffffff"
              fgColor="#000000"
            />
          </div>
          
          {/* Amount */}
          <div>
            <p className="text-emerald-500 font-bold text-3xl">₹{amount}</p>
            <p className="text-gray-400 text-sm">Scan to pay</p>
          </div>
          
          {/* Instructions */}
          <div className="bg-emerald-500/10 border border-emerald-500/30 rounded-lg p-4">
            <h4 className="text-emerald-500 font-semibold mb-2">Payment Steps:</h4>
            <ol className="text-sm text-gray-300 text-left space-y-1">
              <li>1. Open any UPI app (Google Pay, PhonePe, Paytm)</li>
              <li>2. Scan the QR code above</li>
              <li>3. Verify amount is ₹{amount}</li>
              <li>4. Complete payment with your UPI PIN</li>
              <li>5. Copy the transaction ID from your UPI app</li>
              <li>6. Click "I Paid" below and submit the transaction ID</li>
            </ol>
          </div>
          
          {/* Action Button */}
          <button
            onClick={() => setShowTxnInput(true)}
            className="w-full bg-gradient-to-r from-emerald-500 to-emerald-600 text-white py-3 px-4 rounded-lg font-semibold hover:from-emerald-600 hover:to-emerald-700 transition-all"
          >
            ✅ I Completed Payment
          </button>
          
          <p className="text-xs text-gray-500">
            UPI ID: {upiId}
          </p>
        </div>
      ) : (
        /* Transaction ID Input Form */
        <form onSubmit={handleSubmitPayment} className="space-y-6">
          <div className="text-center mb-6">
            <div className="w-16 h-16 mx-auto mb-4 bg-emerald-500/20 rounded-full flex items-center justify-center">
              <span className="text-emerald-500 text-2xl">📋</span>
            </div>
            <h4 className="text-lg font-semibold text-white">Submit Transaction Details</h4>
            <p className="text-gray-400 text-sm">Enter the transaction ID from your UPI app</p>
          </div>
          
          <div>
            <label className="block text-gray-300 mb-2 font-medium">
              Transaction ID <span className="text-red-400">*</span>
            </label>
            <input
              type="text"
              value={transactionId}
              onChange={(e) => setTransactionId(e.target.value)}
              placeholder="e.g., T2023090812345678"
              className="w-full px-4 py-3 bg-gray-700 border border-gray-600 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-emerald-500"
              required
            />
            <p className="text-xs text-gray-500 mt-1">
              Copy from your UPI app after successful payment
            </p>
          </div>
          
          <div>
            <label className="block text-gray-300 mb-2 font-medium">
              UPI Reference ID (Optional)
            </label>
            <input
              type="text"
              value={upiRefId}
              onChange={(e) => setUpiRefId(e.target.value)}
              placeholder="e.g., 123456789012"
              className="w-full px-4 py-3 bg-gray-700 border border-gray-600 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-emerald-500"
            />
          </div>
          
          <div className="bg-yellow-500/10 border border-yellow-500/30 rounded-lg p-4">
            <div className="flex items-start space-x-2">
              <span className="text-yellow-500 mt-0.5">⚠️</span>
              <div className="text-sm text-yellow-200">
                <p className="font-medium mb-1">Payment Verification</p>
                <p>Your payment will be verified manually. Wallet balance will be updated after admin approval (usually within 2-4 hours).</p>
              </div>
            </div>
          </div>
          
          <div className="flex gap-4">
            <button
              type="button"
              onClick={() => setShowTxnInput(false)}
              className="flex-1 py-3 px-4 bg-gray-600 text-white rounded-lg hover:bg-gray-500 font-medium transition-colors"
            >
              Back
            </button>
            <button
              type="submit"
              disabled={isSubmitting || !transactionId.trim()}
              className="flex-1 py-3 px-4 bg-gradient-to-r from-emerald-500 to-emerald-600 text-white rounded-lg hover:from-emerald-600 hover:to-emerald-700 disabled:opacity-50 disabled:cursor-not-allowed font-medium transition-all"
            >
              {isSubmitting ? 'Submitting...' : 'Submit for Verification'}
            </button>
          </div>
        </form>
      )}
    </div>
  );
};

export default QRPayment;
