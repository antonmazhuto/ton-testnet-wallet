'use client';

import { useState, useEffect } from 'react';
import WalletDashboard from '@/components/WalletDashboard';
import WalletActions from '@/components/WalletActions';
import { loadStoredWallet, logoutWallet, WalletData } from '@/lib/wallet';

export default function Home() {
  const [activeWallet, setActiveWallet] = useState<WalletData | null>(null);
  const [isInitializing, setIsInitializing] = useState(true);

  useEffect(() => {
    const init = async () => {
      const wallet = await loadStoredWallet();
      setActiveWallet(wallet);
      setIsInitializing(false);
    };
    init();
  }, []);

  const handleLogout = () => {
    logoutWallet();
    setActiveWallet(null);
  };

  if (isInitializing) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-primary"></div>
      </div>
    );
  }

  return (
    <main className="max-w-md mx-auto min-h-screen bg-background">
      {activeWallet ? (
        <WalletDashboard
          activeWallet={activeWallet}
          onLogout={handleLogout}
        />
      ) : (
        <div className="p-4 md:p-8 space-y-8">
          <header className="flex items-center justify-between pt-4">
            <h1 className="text-2xl font-black tracking-tighter text-foreground">TON WALLET</h1>
            <div className="w-10 h-10 rounded-full bg-card border border-border shadow-sm flex items-center justify-center text-foreground">
              <span className="text-xs font-black tracking-widest">OFF</span>
            </div>
          </header>
          <WalletActions onWalletChange={setActiveWallet} />
        </div>
      )}

      {/* Footer Info */}
      {!activeWallet && (
        <footer className="text-center py-8">
          <p className="text-[10px] font-black text-muted-foreground uppercase tracking-[0.3em]">
            TON TESTNET &bull; FRONTEND SECURED
          </p>
        </footer>
      )}
    </main>
  );
}
