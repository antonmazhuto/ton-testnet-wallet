'use client';

import { useState } from 'react';
import { createNewWallet, importWallet, WalletData } from '@/lib/wallet';
import { toast } from 'sonner';

interface WalletActionsProps {
  onWalletChange: (wallet: WalletData | null) => void;
}

export default function WalletActions({ onWalletChange }: WalletActionsProps) {
  const [mnemonicInput, setMnemonicInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const handleCreate = async () => {
    setIsLoading(true);
    try {
      const wallet = await createNewWallet();
      onWalletChange(wallet);
      toast.success('New wallet created successfully!');
    } catch (err: any) {
      toast.error(err.message || 'Failed to create wallet');
    } finally {
      setIsLoading(false);
    }
  };

  const handleImport = async () => {
    if (!mnemonicInput.trim()) {
      toast.error('Please enter a mnemonic phrase');
      return;
    }
    
    setIsLoading(true);
    try {
      const wallet = await importWallet(mnemonicInput);
      onWalletChange(wallet);
      setMnemonicInput('');
      toast.success('Wallet imported successfully!');
    } catch (err: any) {
      toast.error(err.message || 'Invalid mnemonic phrase');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      <div className="p-6 rounded-2xl bg-white border border-gray-100 shadow-sm space-y-4">
        <h2 className="text-lg font-bold text-gray-900">Get Started</h2>
        <p className="text-sm text-gray-500">
          Create a new TON wallet or import an existing one using your 24-word recovery phrase.
        </p>
        
        <button
          onClick={handleCreate}
          disabled={isLoading}
          className="w-full h-12 bg-black text-white rounded-xl font-medium hover:bg-gray-800 transition-colors disabled:opacity-50 flex items-center justify-center"
        >
          {isLoading ? (
            <div className="animate-spin h-5 w-5 border-b-2 border-white rounded-full"></div>
          ) : (
            'Create New Wallet'
          )}
        </button>

        <div className="relative">
          <div className="absolute inset-0 flex items-center">
            <span className="w-full border-t border-gray-100" />
          </div>
          <div className="relative flex justify-center text-xs uppercase">
            <span className="bg-white px-2 text-gray-400">or</span>
          </div>
        </div>

        <div className="space-y-2">
          <textarea
            value={mnemonicInput}
            onChange={(e) => setMnemonicInput(e.target.value)}
            placeholder="Enter your 24-word mnemonic phrase..."
            className="w-full p-3 rounded-xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 min-h-[100px] text-sm resize-none"
            disabled={isLoading}
          />
          <button
            onClick={handleImport}
            disabled={isLoading}
            className="w-full h-12 bg-gray-100 text-gray-900 rounded-xl font-medium hover:bg-gray-200 transition-colors disabled:opacity-50 flex items-center justify-center"
          >
            {isLoading ? (
              <div className="animate-spin h-5 w-5 border-b-2 border-black rounded-full"></div>
            ) : (
              'Import Wallet'
            )}
          </button>
        </div>
      </div>
    </div>
  );
}
