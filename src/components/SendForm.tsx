'use client';

import { useState, useRef, useEffect } from 'react';
import { sendTransaction, isAddressNew } from '@/lib/ton';
import * as storage from '@/lib/storage';
import TonWeb from 'tonweb';
import { toast } from 'sonner';

interface SendFormProps {
  senderSecretKey: Uint8Array;
  onSuccess?: () => void;
  onClose?: () => void;
}

type Step = 'input' | 'confirm' | 'success';

export default function SendForm({ senderSecretKey, onSuccess, onClose }: SendFormProps) {
  const [recipient, setRecipient] = useState('');
  const [amount, setAmount] = useState('');
  const [step, setStep] = useState<Step>('input');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isPasted, setIsPasted] = useState(false);
  const [isNewRecipient, setIsNewRecipient] = useState<boolean | null>(null);
  const [recentAddresses, setRecentAddresses] = useState<storage.RecentAddress[]>([]);
  const [showRecent, setShowRecent] = useState(false);

  useEffect(() => {
    setRecentAddresses(storage.getRecentAddresses());
  }, []);

  const lastAppCopiedValue = useRef<string | null>(null);

  const validate = () => {
    if (!recipient.trim()) return 'Recipient address is required';
    if (!TonWeb.Address.isValid(recipient)) return 'Invalid TON address format';
    
    const numAmount = parseFloat(amount);
    if (isNaN(numAmount) || numAmount <= 0) return 'Please enter a valid positive amount';
    
    return null;
  };

  const handleNext = async () => {
    const validationError = validate();
    if (validationError) {
      toast.error(validationError);
      return;
    }

    setIsLoading(true);
    setError(null);
    try {
      const isNew = await isAddressNew(recipient);
      setIsNewRecipient(isNew);
      setStep('confirm');
    } catch (err: any) {
      toast.error('Failed to verify address history');
    } finally {
      setIsLoading(false);
    }
  };

  const handleSend = async () => {
    setIsLoading(true);
    setError(null);

    try {
      await sendTransaction(senderSecretKey, recipient, parseFloat(amount));
      storage.addRecentAddress(recipient);
      setStep('success');
      toast.success('Transaction sent successfully!');
      if (onSuccess) {
        setTimeout(onSuccess, 3000);
      }
    } catch (err: any) {
      console.error('Transaction failed:', err);
      const msg = err.message || 'Transaction failed. Please check your balance and try again.';
      setError(msg);
      toast.error(msg);
    } finally {
      setIsLoading(false);
    }
  };

  const onPaste = (e: React.ClipboardEvent) => {
    const pastedData = e.clipboardData.getData('text');
    setIsPasted(true);
    // Simple check: if we have a locally copied value and it differs, it's highly suspicious
    if (lastAppCopiedValue.current && lastAppCopiedValue.current !== pastedData) {
      toast.warning('WARNING: Pasted address differs from what you copied in this app!');
    }
  };

  if (step === 'success') {
    return (
      <div className="p-8 rounded-2xl bg-white border border-gray-100 shadow-xl text-center space-y-4 animate-in fade-in zoom-in duration-300">
        <div className="w-16 h-16 bg-green-50 text-green-500 rounded-full flex items-center justify-center mx-auto">
          <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
          </svg>
        </div>
        <h2 className="text-xl font-bold text-gray-900">Transaction Sent!</h2>
        <p className="text-sm text-gray-500">
          Your transfer of <span className="font-bold text-gray-900">{amount} TON</span> is being processed.
        </p>
        <button 
          onClick={onClose}
          className="w-full h-12 bg-gray-100 text-gray-900 rounded-xl font-bold hover:bg-gray-200 transition-colors"
        >
          Close
        </button>
      </div>
    );
  }

  if (step === 'confirm') {
    return (
      <div className="p-6 rounded-2xl bg-white border border-gray-100 shadow-xl space-y-6 animate-in slide-in-from-right duration-300">
        <div className="flex items-center gap-3 text-amber-600 bg-amber-50 p-4 rounded-xl border border-amber-100">
          <svg className="w-6 h-6 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
          </svg>
          <div className="text-sm font-semibold">Please confirm transaction details carefully.</div>
        </div>

        <div className="space-y-4">
          <div className="p-4 bg-gray-50 rounded-xl border border-gray-100 space-y-3">
            <div>
              <div className="text-[10px] uppercase tracking-wider font-bold text-gray-400 mb-1">Recipient</div>
              <div className="text-xs font-mono break-all text-gray-700 font-medium">{recipient}</div>
            </div>
            <div>
              <div className="text-[10px] uppercase tracking-wider font-bold text-gray-400 mb-1">Amount</div>
              <div className="text-xl font-bold text-gray-900">{amount} TON</div>
            </div>
          </div>

          {isNewRecipient && (
            <div className="p-3 bg-red-50 text-red-600 rounded-xl border border-red-100 flex gap-2 items-start animate-pulse">
              <svg className="w-4 h-4 shrink-0 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              <div className="text-[11px] leading-tight">
                <strong>WARNING:</strong> This address has NO transaction history. Please double-check every character before sending.
              </div>
            </div>
          )}

          {isPasted && (
            <div className="p-3 bg-amber-50 text-amber-700 rounded-xl border border-amber-100 flex gap-2 items-start">
              <svg className="w-4 h-4 shrink-0 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2v-1M8 5a2 2 0 002 2h2a2 2 0 002-2M8 5a2 2 0 012-2h2a2 2 0 012 2" />
              </svg>
              <div className="text-[11px] leading-tight">
                Address was pasted from clipboard. Verify it matches your intended recipient.
              </div>
            </div>
          )}
        </div>

        <div className="grid grid-cols-2 gap-3 pt-2">
          <button
            onClick={() => setStep('input')}
            disabled={isLoading}
            className="h-12 bg-gray-100 text-gray-900 rounded-xl font-bold hover:bg-gray-200 transition-colors disabled:opacity-50"
          >
            Back
          </button>
          <button
            onClick={handleSend}
            disabled={isLoading}
            className="h-12 bg-black text-white rounded-xl font-bold hover:bg-gray-800 transition-colors disabled:opacity-50 flex items-center justify-center"
          >
            {isLoading ? <div className="animate-spin h-5 w-5 border-b-2 border-white rounded-full" /> : 'Confirm Send'}
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="p-6 rounded-2xl bg-white border border-gray-100 shadow-xl space-y-6 animate-in slide-in-from-left duration-300">
      <div className="flex items-center justify-between">
        <h2 className="text-lg font-bold text-gray-900">Send TON</h2>
        {onClose && (
          <button 
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 transition-colors"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        )}
      </div>

      <div className="space-y-4">
        <div className="space-y-2">
          <div className="flex justify-between items-center">
            <label className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">
              Recipient Address
            </label>
            {recentAddresses.length > 0 && (
              <button
                onClick={() => setShowRecent(!showRecent)}
                className="text-[10px] font-bold text-blue-500 hover:text-blue-600 uppercase tracking-widest"
              >
                {showRecent ? 'Hide Recent' : 'Show Recent'}
              </button>
            )}
          </div>
          
          {showRecent && recentAddresses.length > 0 && (
            <div className="space-y-1 mb-2">
              {recentAddresses.map((recent) => (
                <button
                  key={recent.address}
                  onClick={() => {
                    setRecipient(recent.address);
                    setShowRecent(false);
                  }}
                  className="w-full p-2 text-left text-[11px] font-mono bg-blue-50 hover:bg-blue-100 rounded-lg border border-blue-100 text-blue-700 transition-colors truncate"
                >
                  {recent.address}
                </button>
              ))}
            </div>
          )}

          <div className="relative group">
            <input
              type="text"
              value={recipient}
              onPaste={onPaste}
              onChange={(e) => {
                setRecipient(e.target.value);
                setIsPasted(false);
                setError(null);
              }}
              placeholder="EQ..."
              className={`w-full p-4 rounded-xl border bg-gray-50 focus:outline-none focus:ring-4 transition-all text-sm font-mono ${
                recipient && !TonWeb.Address.isValid(recipient)
                  ? 'border-red-200 ring-red-500/10 focus:border-red-500'
                  : 'border-gray-100 ring-blue-500/10 focus:border-blue-500'
              }`}
              disabled={isLoading}
            />
            {recipient && !TonWeb.Address.isValid(recipient) && (
              <div className="absolute right-3 top-1/2 -translate-y-1/2 text-red-500">
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
            )}
          </div>
        </div>

        <div className="space-y-2">
          <label className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">
            Amount (TON)
          </label>
          <div className="relative">
            <input
              type="number"
              step="any"
              value={amount}
              onChange={(e) => {
                setAmount(e.target.value);
                setError(null);
              }}
              placeholder="0.00"
              className="w-full p-4 pr-14 rounded-xl border border-gray-100 bg-gray-50 focus:outline-none focus:ring-4 focus:ring-blue-500/10 focus:border-blue-500 text-base font-bold"
              disabled={isLoading}
            />
            <span className="absolute right-4 top-1/2 -translate-y-1/2 text-xs font-black text-gray-400">
              TON
            </span>
          </div>
        </div>

        {error && (
          <div className="p-4 text-xs font-bold text-red-600 bg-red-50 rounded-xl border border-red-100 animate-bounce">
            {error}
          </div>
        )}

        <button
          onClick={handleNext}
          disabled={isLoading || !recipient || !amount}
          className="w-full h-14 bg-black text-white rounded-xl font-black hover:bg-gray-800 transition-all disabled:opacity-20 flex items-center justify-center shadow-xl shadow-black/10 active:scale-95"
        >
          {isLoading ? <div className="animate-spin h-6 w-6 border-b-2 border-white rounded-full" /> : 'Continue to Confirm'}
        </button>
      </div>

      <div className="text-[10px] text-gray-400 text-center uppercase tracking-[0.2em] font-black">
        Testnet Security Active
      </div>
    </div>
  );
}
