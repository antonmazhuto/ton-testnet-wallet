import { useState } from 'react';
import { formatAddress, formatCurrency } from '@/lib/utils';
import { Wallet } from '@/lib/types';
import { toast } from 'sonner';

interface WalletBalanceProps {
  wallet: Wallet;
  mnemonic?: string[];
  onLogout?: () => void;
}

export default function WalletBalance({ wallet, mnemonic, onLogout }: WalletBalanceProps) {
  const [showMnemonic, setShowMnemonic] = useState(false);

  const handleCopyAddress = () => {
    navigator.clipboard.writeText(wallet.address);
    toast.success('Address copied to clipboard');
  };

  const handleCopyMnemonic = () => {
    if (!mnemonic) return;
    navigator.clipboard.writeText(mnemonic.join(' '));
    toast.success('Recovery phrase copied to clipboard');
  };

  return (
    <div className="space-y-4">
      <div className="p-6 rounded-2xl bg-white border border-gray-100 shadow-sm relative group">
        <div className="text-sm text-gray-500 mb-1">Total Balance</div>
        <div className="text-3xl font-bold mb-4 tracking-tight">
          {formatCurrency(wallet.balance, wallet.symbol)}
        </div>
        <div className="flex items-center gap-2">
          <span className="text-xs font-mono bg-gray-50 px-2 py-1 rounded text-gray-600">
            {formatAddress(wallet.address)}
          </span>
          <button 
            className="text-xs text-blue-600 hover:text-blue-700 font-medium"
            onClick={handleCopyAddress}
          >
            Copy
          </button>
        </div>
        
        {onLogout && (
          <button
            onClick={onLogout}
            className="absolute top-4 right-4 text-xs text-gray-400 hover:text-red-500 transition-colors"
          >
            Logout
          </button>
        )}
      </div>

      {mnemonic && (
        <div className="p-4 rounded-xl bg-blue-50/50 border border-blue-100/50">
          <div className="flex items-center justify-between mb-2">
            <button
              onClick={() => setShowMnemonic(!showMnemonic)}
              className="text-xs font-medium text-blue-600 hover:text-blue-700 flex items-center gap-1"
            >
              {showMnemonic ? 'Hide Recovery Phrase' : 'View Recovery Phrase'}
            </button>
            {showMnemonic && (
              <button
                onClick={handleCopyMnemonic}
                className="text-[10px] text-blue-400 hover:text-blue-600 transition-colors uppercase font-bold tracking-wider"
              >
                Copy Phrase
              </button>
            )}
          </div>
          
          {showMnemonic && (
            <div className="mt-3 grid grid-cols-3 gap-2">
              {mnemonic.map((word, i) => (
                <div key={i} className="flex gap-2 items-center bg-white p-1.5 rounded border border-blue-100 shadow-sm">
                  <span className="text-[10px] text-blue-300 font-mono w-4 text-right">{i + 1}</span>
                  <span className="text-xs text-blue-900 font-medium">{word}</span>
                </div>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
}
