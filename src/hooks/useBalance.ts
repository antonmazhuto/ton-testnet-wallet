import { useState, useEffect, useCallback } from 'react';
import { ton } from '@/lib/ton';

/**
 * Hook to fetch and auto-refresh the TON balance for a given address.
 * 
 * @param address The wallet address to fetch balance for
 * @param refreshInterval The interval in milliseconds for auto-refresh (default: 10000ms)
 * @returns { balance, isLoading, error, refresh }
 */
export function useBalance(address: string | undefined, refreshInterval = 10000) {
  const [balance, setBalance] = useState<number>(0);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [error, setError] = useState<Error | null>(null);

  const fetchBalance = useCallback(async () => {
    if (!address) return;
    
    try {
      const result = await ton.getBalance(address);
      // tonweb returns balance in nanoTON (string), convert to TON (number)
      const tonBalance = Number(result) / 1000000000;
      setBalance(tonBalance);
      setError(null);
    } catch (err: any) {
      console.error('Failed to fetch balance:', err);
      setError(err);
    }
  }, [address]);

  useEffect(() => {
    if (!address) {
      setBalance(0);
      setIsLoading(false);
      return;
    }

    const initFetch = async () => {
      setIsLoading(true);
      await fetchBalance();
      setIsLoading(false);
    };

    initFetch();

    const intervalId = setInterval(fetchBalance, refreshInterval);
    return () => clearInterval(intervalId);
  }, [address, fetchBalance, refreshInterval]);

  return { 
    balance, 
    isLoading, 
    error, 
    refresh: fetchBalance 
  };
}
