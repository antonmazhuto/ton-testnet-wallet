'use client';

import { useState } from 'react';
import WalletBalance from '@/components/WalletBalance';
import Transactions from '@/components/Transactions';
import Receive from '@/components/Receive';
import SendForm from '@/components/SendForm';
import { WalletData } from '@/lib/wallet';
import { useBalance } from '@/hooks/useBalance';

interface WalletDashboardProps {
  activeWallet: WalletData;
  onLogout: () => void;
}

export default function WalletDashboard({ activeWallet, onLogout }: WalletDashboardProps) {
  const [showReceive, setShowReceive] = useState(false);
  const [showSend, setShowSend] = useState(false);
  
  const { balance, isLoading: isBalanceLoading, refresh: refreshBalance } = useBalance(activeWallet.address);

  return (
    <div className="space-y-8 animate-in fade-in duration-500">
      {/* Wallet Balance Card & Mnemonic View */}
      <WalletBalance 
        wallet={{
          address: activeWallet.address,
          balance: balance,
          symbol: 'TON'
        }} 
        mnemonic={activeWallet.mnemonic}
        onLogout={onLogout}
      />

      {/* Navigation / Action Buttons */}
      <div className="grid grid-cols-2 gap-4">
        <button 
          onClick={() => setShowSend(true)}
          className="flex flex-col items-center justify-center gap-2 h-24 bg-black text-white rounded-3xl font-bold hover:bg-gray-800 transition-all shadow-xl shadow-black/10 active:scale-95 group"
        >
          <div className="w-10 h-10 rounded-full bg-white/10 flex items-center justify-center group-hover:scale-110 transition-transform">
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M5 10l7-7m0 0l7 7m-7-7v18" />
            </svg>
          </div>
          <span className="text-xs uppercase tracking-widest">Send</span>
        </button>
        <button 
          onClick={() => setShowReceive(true)}
          className="flex flex-col items-center justify-center gap-2 h-24 bg-white text-gray-900 border border-gray-100 rounded-3xl font-bold hover:bg-gray-50 transition-all shadow-sm active:scale-95 group"
        >
          <div className="w-10 h-10 rounded-full bg-gray-50 flex items-center justify-center group-hover:scale-110 transition-transform">
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M19 14l-7 7m0 0l-7-7m7 7V3" />
            </svg>
          </div>
          <span className="text-xs uppercase tracking-widest text-gray-500">Receive</span>
        </button>
      </div>

      {/* Overlays */}
      {showSend && (
        <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-4 bg-black/40 backdrop-blur-sm transition-all duration-300">
          <div className="w-full max-w-md animate-in slide-in-from-bottom duration-300">
            <SendForm 
              senderSecretKey={activeWallet.secretKey}
              onSuccess={() => {
                refreshBalance();
                setTimeout(() => setShowSend(false), 2500);
              }}
              onClose={() => setShowSend(false)} 
            />
          </div>
        </div>
      )}

      {showReceive && (
        <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-4 bg-black/40 backdrop-blur-sm transition-all duration-300">
          <div className="w-full max-w-md animate-in slide-in-from-bottom duration-300">
            <Receive 
              address={activeWallet.address} 
              onClose={() => setShowReceive(false)} 
            />
          </div>
        </div>
      )}

      {/* Transaction History */}
      <Transactions address={activeWallet.address} />
    </div>
  );
}
