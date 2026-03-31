import { useState, useEffect, useCallback } from 'react';
import { ton } from '@/lib/ton';
import { Transaction } from '@/lib/types';

/**
 * Hook to fetch and manage transaction history for a given address.
 * Includes auto-refresh and searching by address.
 *
 * @param address The wallet address to fetch transactions for
 * @param limit The number of transactions to fetch (default: 10)
 * @returns { transactions, filteredTransactions, isLoading, error, refresh, search, searchQuery }
 */
export function useTransactions(address: string | undefined, limit = 10) {
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [error, setError] = useState<Error | null>(null);

  const fetchTransactions = useCallback(async () => {
    if (!address) return;

    try {
      // TonWeb.getTransactions(address, limit, lt, hash, to_lt)
      const rawTxs = await ton.getTransactions(address, limit);
      
      if (!Array.isArray(rawTxs)) {
        console.warn('TonWeb returned non-array transactions:', rawTxs);
        if (rawTxs && typeof rawTxs === 'object' && 'error' in rawTxs) {
          throw new Error((rawTxs as any).error || 'Failed to fetch transactions');
        }
        setTransactions([]);
        return;
      }

      const parsedTxs: Transaction[] = rawTxs.map((tx: any) => {
        const utime = tx.utime * 1000; // Convert to ms
        const hash = tx.transaction_id.hash;
        const id = `${hash}_${tx.transaction_id.lt}`;

        let type: 'receive' | 'send' = 'receive';
        let amount = 0;
        let from = '';
        let to = '';

        // Simple heuristic for parsing amount/type from TonWeb result
        if (tx.in_msg && tx.in_msg.source) {
          // Incoming message
          from = tx.in_msg.source;
          to = tx.in_msg.destination;
          amount = Number(tx.in_msg.value) / 1000000000; // to TON
          type = from.toLowerCase() === address.toLowerCase() ? 'send' : 'receive';
        } else if (tx.out_msgs && tx.out_msgs.length > 0) {
          // Outgoing message
          from = tx.out_msgs[0].source;
          to = tx.out_msgs[0].destination;
          amount = Number(tx.out_msgs[0].value) / 1000000000; // to TON
          type = 'send';
        }

        return {
          id,
          hash,
          type,
          amount,
          symbol: 'TON',
          timestamp: utime,
          from,
          to,
          status: 'completed', // Assuming completed for fetched history
        };
      });

      setTransactions(parsedTxs);
      setError(null);
    } catch (err: any) {
      console.error('Failed to fetch transactions:', err);
      setError(err);
    }
  }, [address, limit]);

  useEffect(() => {
    if (!address) {
      setTransactions([]);
      setIsLoading(false);
      return;
    }

    const initFetch = async () => {
      setIsLoading(true);
      await fetchTransactions();
      setIsLoading(false);
    };

    initFetch();

    // Refresh every 30 seconds for history
    const intervalId = setInterval(fetchTransactions, 30000);
    return () => clearInterval(intervalId);
  }, [address, fetchTransactions]);

  // Filter transactions based on search query
  const filteredTransactions = transactions.filter(tx => {
    if (!searchQuery) return true;
    const q = searchQuery.toLowerCase();
    return (
      (tx.from?.toLowerCase().includes(q)) ||
      (tx.to?.toLowerCase().includes(q)) ||
      (tx.hash?.toLowerCase().includes(q))
    );
  });

  return {
    transactions,
    filteredTransactions,
    searchQuery,
    setSearchQuery,
    isLoading,
    error,
    refresh: fetchTransactions,
  };
}
