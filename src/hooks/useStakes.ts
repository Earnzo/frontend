import { useState, useEffect } from 'react';
import { stakesAPI } from '../services/api';

export const useStakes = () => {
  const [stakes, setStakes] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isCreating, setIsCreating] = useState(false);

  const fetchStakes = async () => {
    setIsLoading(true);
    try {
      const data = await stakesAPI.getStakes();
      setStakes(data);
    } catch (error) {
      console.error('Error fetching stakes:', error);
    }
    setIsLoading(false);
  };

  const createStake = async (amount, duration = 60) => {
    setIsCreating(true);
    try {
      await stakesAPI.createStake(amount, duration);
      await fetchStakes(); // Refresh list
      return true;
    } catch (error) {
      console.error('Error creating stake:', error);
      return false;
    } finally {
      setIsCreating(false);
    }
  };

  // Calculate daily payout (same as backend logic)
  const calculateDailyPayout = (amount) => {
    if (amount >= 500 && amount <= 699) return 30;
    if (amount >= 700 && amount <= 999) return 45;
    if (amount >= 1000 && amount <= 1999) return 70;
    return Math.round(amount * 0.065);
  };

  useEffect(() => {
    fetchStakes();
  }, []);

  return { 
    stakes, 
    isLoading, 
    isCreating, 
    createStake, 
    calculateDailyPayout,
    refetch: fetchStakes 
  };
};
