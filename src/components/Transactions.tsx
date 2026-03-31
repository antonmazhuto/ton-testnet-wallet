'use client';

import { useTransactions } from '@/hooks/useTransactions';
import { formatCurrency, formatDate, formatAddress } from '@/lib/utils';

interface TransactionsProps {
  address: string | undefined;
}

export default function Transactions({ address }: TransactionsProps) {
  const { 
    filteredTransactions, 
    searchQuery, 
    setSearchQuery, 
    isLoading, 
    error 
  } = useTransactions(address);

  if (!address) return null;

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between px-1">
        <h2 className="text-lg font-semibold text-gray-900">Recent Activity</h2>
        {isLoading && (
          <div className="animate-spin h-4 w-4 border-b-2 border-blue-500 rounded-full"></div>
        )}
      </div>

      {/* Search Bar */}
      <div className="relative">
        <input
          type="text"
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          placeholder="Search by address or hash..."
          className="w-full p-3 pl-10 rounded-xl border border-gray-100 bg-white focus:outline-none focus:ring-2 focus:ring-blue-500/10 focus:border-blue-500 text-sm shadow-sm"
        />
        <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400">
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
          </svg>
        </span>
      </div>

      <div className="space-y-2">
        {error ? (
          <div className="p-4 text-center text-sm text-red-500 bg-red-50 rounded-xl">
            Failed to load transactions. Please try again later.
          </div>
        ) : filteredTransactions.length === 0 ? (
          <p className="text-center py-10 text-gray-500 bg-white rounded-xl border border-gray-100 shadow-sm">
            {searchQuery ? 'No matching transactions found.' : 'No activity yet.'}
          </p>
        ) : (
          filteredTransactions.map((tx) => (
            <div 
              key={tx.id} 
              className="flex items-center justify-between p-4 rounded-xl bg-white border border-gray-100 hover:bg-gray-50 transition-colors cursor-pointer group shadow-sm"
              onClick={() => window.open(`https://testnet.tonviewer.com/transaction/${tx.hash}`, '_blank')}
            >
              <div className="flex items-center gap-3">
                <div className={`w-10 h-10 rounded-full flex items-center justify-center ${
                  tx.type === 'receive' ? 'bg-green-50 text-green-600' : 'bg-blue-50 text-blue-600'
                }`}>
                  {tx.type === 'receive' ? (
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 14l-7 7m0 0l-7-7m7 7V3" />
                    </svg>
                  ) : (
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 10l7-7m0 0l7 7m-7-7v18" />
                    </svg>
                  )}
                </div>
                <div>
                  <div className="font-semibold text-gray-900 capitalize">
                    {tx.type} {tx.symbol}
                  </div>
                  <div className="text-xs text-gray-400 font-mono">
                    {tx.type === 'receive' ? `From: ${formatAddress(tx.from!)}` : `To: ${formatAddress(tx.to!)}`}
                  </div>
                </div>
              </div>
              <div className="text-right">
                <div className={`font-bold ${
                  tx.type === 'receive' ? 'text-green-600' : 'text-gray-900'
                }`}>
                  {tx.type === 'receive' ? '+' : '-'}{formatCurrency(tx.amount, tx.symbol)}
                </div>
                <div className="text-[10px] text-gray-400 uppercase tracking-wider font-medium">
                  {formatDate(tx.timestamp)}
                </div>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}
