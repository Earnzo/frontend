import React, { useState, useEffect } from 'react';
import { walletAPI } from '../services/api';
import toast from 'react-hot-toast';

interface PaymentRequest {
  id: number;
  user_email: string;
  amount: number;
  transaction_id: string;
  upi_ref_id: string;
  status: string;
  created_at: string;
  notes: string;
}

const AdminPayments: React.FC = () => {
  const [payments, setPayments] = useState<PaymentRequest[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchPendingPayments = async () => {
    try {
      const data = await walletAPI.getPendingPayments();
      setPayments(data);
    } catch (error) {
      toast.error('Failed to fetch pending payments');
    } finally {
      setLoading(false);
    }
  };

  const handleApprove = async (paymentId: number) => {
    try {
      await walletAPI.approvePayment(paymentId);
      toast.success('Payment approved successfully');
      fetchPendingPayments(); // Refresh list
    } catch (error) {
      toast.error('Failed to approve payment');
    }
  };

  useEffect(() => {
    fetchPendingPayments();
  }, []);

  return (
    <div className="min-h-screen bg-gray-900 p-6">
      <div className="max-w-6xl mx-auto">
        <h1 className="text-2xl font-bold text-white mb-6">Pending Payment Approvals</h1>
        
        {loading ? (
          <div className="text-center text-white">Loading...</div>
        ) : payments.length === 0 ? (
          <div className="text-center text-gray-400">No pending payments</div>
        ) : (
          <div className="bg-gray-800 rounded-xl border border-gray-700 overflow-hidden">
            <table className="w-full">
              <thead className="bg-gray-700">
                <tr>
                  <th className="px-6 py-3 text-left text-white">User</th>
                  <th className="px-6 py-3 text-left text-white">Amount</th>
                  <th className="px-6 py-3 text-left text-white">Transaction ID</th>
                  <th className="px-6 py-3 text-left text-white">Date</th>
                  <th className="px-6 py-3 text-left text-white">Actions</th>
                </tr>
              </thead>
              <tbody>
                {payments.map((payment) => (
                  <tr key={payment.id} className="border-t border-gray-600">
                    <td className="px-6 py-4 text-white">{payment.user_email}</td>
                    <td className="px-6 py-4 text-emerald-500 font-semibold">₹{payment.amount}</td>
                    <td className="px-6 py-4 text-gray-300 font-mono text-sm">
                      {payment.transaction_id}
                    </td>
                    <td className="px-6 py-4 text-gray-400">
                      {new Date(payment.created_at).toLocaleString()}
                    </td>
                    <td className="px-6 py-4">
                      <button
                        onClick={() => handleApprove(payment.id)}
                        className="bg-emerald-500 hover:bg-emerald-600 text-white px-4 py-2 rounded font-medium"
                      >
                        Approve
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
};

export default AdminPayments;
