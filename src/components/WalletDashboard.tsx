'use client';

import { useState } from 'react';
import {
  ArrowDownLeft,
  ArrowUpRight,
  Copy,
  RefreshCw,
  LogOut,
  History
} from "lucide-react";
import { cn } from "@/lib/utils";
import Receive from '@/components/Receive';
import SendForm from '@/components/SendForm';
import Transactions from '@/components/Transactions';
import { WalletData } from '@/lib/wallet';
import { useBalance } from '@/hooks/useBalance';
import { formatAddress, formatCurrency } from '@/lib/utils';
import { toast } from 'sonner';

interface WalletDashboardProps {
  activeWallet: WalletData;
  onLogout: () => void;
}

export default function WalletDashboard({ activeWallet, onLogout }: WalletDashboardProps) {
  const [showReceive, setShowReceive] = useState(false);
  const [showSend, setShowSend] = useState(false);
  const [showMnemonic, setShowMnemonic] = useState(false);

  const { balance, isLoading: isBalanceLoading, refresh: refreshBalance } = useBalance(activeWallet.address);

  const handleCopyAddress = () => {
    navigator.clipboard.writeText(activeWallet.address);
    toast.success('Address copied to clipboard');
  };

  const handleCopyMnemonic = () => {
    navigator.clipboard.writeText(activeWallet.mnemonic.join(' '));
    toast.success('Recovery phrase copied to clipboard');
  };

  return (
    <div className="flex flex-col gap-0 min-h-screen bg-background text-foreground animate-in fade-in duration-500">
      {/* Header */}
      <header className="flex items-center justify-between px-5 pt-10 pb-4">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight text-foreground">Ton Testnet Wallet</h1>
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={refreshBalance}
            disabled={isBalanceLoading}
            className={cn(
              "w-9 h-9 rounded-full bg-surface border border-surface-border flex items-center justify-center text-muted-foreground hover:text-foreground transition-colors",
              isBalanceLoading && "animate-spin"
            )}
          >
            <RefreshCw size={15} />
          </button>
          <button
            onClick={onLogout}
            className="w-9 h-9 rounded-full bg-surface border border-surface-border flex items-center justify-center text-muted-foreground hover:text-destructive transition-colors"
          >
            <LogOut size={15} />
          </button>
        </div>
      </header>

      {/* Balance card */}
      <div className="mx-4 mt-2 rounded-2xl bg-card border border-border p-5 shadow-xl shadow-black/20">
        <p className="text-xs font-mono text-muted-foreground uppercase tracking-widest mb-2">Total Balance</p>
        <p className="text-4xl font-semibold tracking-tight text-foreground mb-1">
          {formatCurrency(balance, 'TON')}
        </p>
        <div className="flex items-center gap-2">
          <span className="text-xs text-muted-foreground">TON Testnet</span>
          {isBalanceLoading && <span className="text-[10px] text-primary animate-pulse uppercase font-bold tracking-tighter">Syncing...</span>}
        </div>

        {/* Address pill */}
        <div className="flex items-center gap-2 mt-4 bg-muted rounded-xl px-3 py-2">
          <span className="text-xs font-mono text-muted-foreground flex-1 truncate">
            {formatAddress(activeWallet.address)}
          </span>
          <button
            onClick={handleCopyAddress}
            className="text-muted-foreground hover:text-primary transition-colors"
          >
            <Copy size={13} />
          </button>
        </div>

        {/* CTA buttons */}
        <div className="grid grid-cols-2 gap-2.5 mt-4">
          <button
            onClick={() => setShowSend(true)}
            className="flex items-center justify-center gap-2 rounded-xl bg-primary text-primary-foreground py-3 text-sm font-medium hover:opacity-90 active:scale-95 transition-all shadow-lg shadow-primary/10"
          >
            <ArrowUpRight size={16} />
            Send
          </button>
          <button
            onClick={() => setShowReceive(true)}
            className="flex items-center justify-center gap-2 rounded-xl bg-secondary text-secondary-foreground py-3 text-sm font-medium hover:opacity-90 active:scale-95 transition-all border border-border"
          >
            <ArrowDownLeft size={16} />
            Receive
          </button>
        </div>
      </div>

      {/* Recovery Phrase Section */}
      <div className="px-4 mt-6">
        <div className="rounded-xl bg-card border border-border p-4">
          <div className="flex items-center justify-between mb-2">
            <button
              onClick={() => setShowMnemonic(!showMnemonic)}
              className="text-xs font-medium text-muted-foreground hover:text-foreground flex items-center gap-1.5 transition-colors"
            >
              <span className={cn("w-1.5 h-1.5 rounded-full", showMnemonic ? "bg-primary" : "bg-muted-foreground")} />
              {showMnemonic ? 'Hide Recovery Phrase' : 'Show Recovery Phrase'}
            </button>
            {showMnemonic && (
              <button
                onClick={handleCopyMnemonic}
                className="text-[10px] text-primary hover:opacity-80 transition-colors uppercase font-bold tracking-wider"
              >
                Copy Phrase
              </button>
            )}
          </div>

          {showMnemonic && (
            <div className="mt-3 grid grid-cols-3 gap-2 animate-in slide-in-from-top duration-300">
              {activeWallet.mnemonic.map((word, i) => (
                <div key={i} className="flex gap-2 items-center bg-muted/50 p-1.5 rounded border border-border">
                  <span className="text-[9px] text-muted-foreground font-mono w-3 text-right">{i + 1}</span>
                  <span className="text-xs text-foreground font-medium truncate">{word}</span>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Transactions */}
      <div className="px-4 mt-6 pb-10">
        <div className="flex items-center gap-2 mb-3">
          <History size={14} className="text-muted-foreground" />
          <p className="text-xs font-mono text-muted-foreground uppercase tracking-widest">Activity</p>
        </div>
        <Transactions address={activeWallet.address} />
      </div>

      {/* Overlays */}
      {showSend && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-background/80 backdrop-blur-sm">
          <div className="w-full max-w-md">
            <SendForm 
              senderSecretKey={activeWallet.secretKey} 
              balance={balance}
              onSuccess={() => {
                setShowSend(false);
                refreshBalance();
              }}
              onClose={() => setShowSend(false)}
            />
          </div>
        </div>
      )}

      {showReceive && (
        <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-4 bg-black/60 backdrop-blur-md transition-all duration-300">
          <div className="w-full max-w-md animate-in slide-in-from-bottom duration-300">
            <Receive
              address={activeWallet.address}
              onClose={() => setShowReceive(false)}
            />
          </div>
        </div>
      )}
    </div>
  );
}
