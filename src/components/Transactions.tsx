'use client';

import { useTransactions } from '@/hooks/useTransactions';
import { formatDate, formatAddress } from '@/lib/utils';
import { Search, ExternalLink, ArrowDownLeft, ArrowUpRight, History } from "lucide-react";
import { cn } from "@/lib/utils";

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
      {/* Search Bar */}
      <div className="relative group">
        <input
          type="text"
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          placeholder="Search history..."
          className="w-full h-11 pl-10 pr-4 rounded-xl border border-border bg-surface text-sm font-medium outline-none ring-primary/20 focus:ring-4 focus:border-primary transition-all placeholder:text-muted-foreground/50"
        />
        <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 text-muted-foreground" size={16} />
        {isLoading && (
          <div className="absolute right-3 top-1/2 -translate-y-1/2">
            <div className="animate-spin h-4 w-4 border-b-2 border-primary rounded-full"></div>
          </div>
        )}
      </div>

      <div className="space-y-2">
        {error ? (
          <div className="p-4 text-center text-xs font-bold text-loss bg-loss/10 rounded-xl border border-loss/20">
            Failed to sync transactions.
          </div>
        ) : filteredTransactions.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-12 px-4 rounded-2xl bg-surface/50 border border-dashed border-border">
            <div className="w-12 h-12 rounded-full bg-muted flex items-center justify-center text-muted-foreground mb-3 opacity-20">
              <History size={24} />
            </div>
            <p className="text-xs font-medium text-muted-foreground">
              {searchQuery ? 'No matching activity' : 'No activity yet'}
            </p>
          </div>
        ) : (
          filteredTransactions.map((tx) => (
            <div
              key={tx.id}
              className="flex items-center justify-between p-4 rounded-2xl bg-card border border-border hover:bg-muted/30 transition-all cursor-pointer group shadow-sm active:scale-[0.98]"
              onClick={() => window.open(`https://testnet.tonviewer.com/transaction/${tx.hash}`, '_blank')}
            >
              <div className="flex items-center gap-3.5">
                <div className={cn(
                  "w-10 h-10 rounded-full flex items-center justify-center transition-colors shadow-inner",
                  tx.type === 'receive' ? "bg-gain/10 text-gain" : "bg-primary/10 text-primary"
                )}>
                  {tx.type === 'receive' ? <ArrowDownLeft size={18} /> : <ArrowUpRight size={18} />}
                </div>
                <div>
                  <div className="flex items-center gap-1.5">
                    <span className="font-semibold text-sm text-foreground capitalize tracking-tight">
                      {tx.type}
                    </span>
                    <ExternalLink size={10} className="text-muted-foreground opacity-0 group-hover:opacity-100 transition-opacity" />
                  </div>
                  <p className="text-[10px] text-muted-foreground font-mono mt-0.5">
                    {tx.type === 'receive' ? `From: ${formatAddress(tx.from!)}` : `To: ${formatAddress(tx.to!)}`}
                  </p>
                </div>
              </div>
              <div className="text-right">
                <p className={cn(
                  "font-bold text-sm tracking-tight",
                  tx.type === 'receive' ? "text-gain" : "text-foreground"
                )}>
                  {tx.type === 'receive' ? '+' : '-'}{tx.amount.toLocaleString(undefined, { minimumFractionDigits: 2 })} <span className="text-[10px] opacity-60">TON</span>
                </p>
                <p className="text-[9px] text-muted-foreground font-bold uppercase tracking-widest mt-1">
                  {formatDate(tx.timestamp)}
                </p>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}
