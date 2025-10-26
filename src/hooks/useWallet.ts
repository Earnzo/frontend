import { useState, useEffect } from 'react';
import { walletAPI } from '../services/api';

interface Wallet {
  balance: number;
  pending_balance: number;
  created_at: string;
}

interface Transaction {
  id: string;
  type: string;
  amount: number;
  balance_after: number;
  created_at: string;
}

export const useWallet = () => {
  const [wallet, setWallet] = useState<Wallet | null>(null);
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  const fetchWallet = async () => {
    try {
      const walletData = await walletAPI.getWallet();
      setWallet(walletData);
    } catch (error) {
      console.error('Failed to fetch wallet:', error);
    }
  };

  const fetchTransactions = async () => {
    try {
      const transactionsData = await walletAPI.getTransactions();
      setTransactions(transactionsData);
    } catch (error) {
      console.error('Failed to fetch transactions:', error);
    }
  };

  const refetch = async () => {
    setIsLoading(true);
    await Promise.all([fetchWallet(), fetchTransactions()]);
    setIsLoading(false);
  };

  useEffect(() => {
    const fetchData = async () => {
      setIsLoading(true);
      await Promise.all([fetchWallet(), fetchTransactions()]);
      setIsLoading(false);
    };

    fetchData();
  }, []);

  return {
    wallet,
    transactions,
    isLoading,
    refetch
  };
};
