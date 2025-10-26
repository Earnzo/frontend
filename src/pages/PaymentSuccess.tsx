import React, { useEffect, useState } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import { useWallet } from '../hooks/useWallet';

const PaymentSuccess: React.FC = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const { refetch } = useWallet();
  const [isLoading, setIsLoading] = useState(true);
  const [paymentStatus, setPaymentStatus] = useState<'checking' | 'success' | 'failed'>('checking');

  useEffect(() => {
    // Refresh wallet data to show updated balance
    const checkPayment = async () => {
      try {
        // Wait a moment for webhook to process
        await new Promise(resolve => setTimeout(resolve, 2000));
        
        // Refresh wallet balance
        await refetch();
        
        setPaymentStatus('success');
      } catch (error) {
        setPaymentStatus('failed');
      } finally {
        setIsLoading(false);
      }
    };

    checkPayment();
  }, [refetch]);

  const handleContinue = () => {
    navigate('/dashboard');
  };

  return (
    <div className="min-h-screen bg-gray-900 flex items-center justify-center px-4">
      <div className="max-w-md w-full bg-gray-800 rounded-xl p-8 border border-gray-700 text-center">
        {isLoading || paymentStatus === 'checking' ? (
          <>
            <div className="w-16 h-16 mx-auto mb-6 bg-yellow-500/20 rounded-full flex items-center justify-center">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-yellow-500"></div>
            </div>
            <h1 className="text-2xl font-bold text-white mb-4">Processing Payment...</h1>
            <p className="text-gray-400 mb-6">Please wait while we confirm your payment.</p>
          </>
        ) : paymentStatus === 'success' ? (
          <>
            <div className="w-16 h-16 mx-auto mb-6 bg-emerald-500/20 rounded-full flex items-center justify-center">
              <span className="text-emerald-500 text-3xl">✅</span>
            </div>
            <h1 className="text-2xl font-bold text-emerald-500 mb-4">Payment Successful!</h1>
            <p className="text-gray-300 mb-6">Your wallet has been topped up successfully. Thank you for your payment!</p>
            <div className="bg-emerald-500/10 border border-emerald-500/30 rounded-lg p-4 mb-6">
              <p className="text-emerald-500 text-sm">
                🎉 Your transaction was completed successfully and your wallet balance has been updated.
              </p>
            </div>
          </>
        ) : (
          <>
            <div className="w-16 h-16 mx-auto mb-6 bg-red-500/20 rounded-full flex items-center justify-center">
              <span className="text-red-500 text-3xl">❌</span>
            </div>
            <h1 className="text-2xl font-bold text-red-500 mb-4">Payment Processing Failed</h1>
            <p className="text-gray-300 mb-6">We couldn't confirm your payment. Please check your wallet balance or contact support.</p>
          </>
        )}

        <button
          onClick={handleContinue}
          disabled={isLoading}
          className="w-full bg-gradient-to-r from-emerald-500 to-emerald-600 text-white py-3 px-4 rounded-lg font-semibold hover:from-emerald-600 hover:to-emerald-700 disabled:opacity-50 transition-all"
        >
          {isLoading ? 'Please wait...' : 'Continue to Dashboard'}
        </button>
        
        <p className="text-gray-500 text-xs mt-4">
          Transaction ID: {searchParams.get('txn_id') || 'N/A'}
        </p>
      </div>
    </div>
  );
};

export default PaymentSuccess;
