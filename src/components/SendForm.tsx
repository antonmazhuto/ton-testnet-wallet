'use client';

import { useState, useRef, useEffect } from 'react';
import { sendTransaction, isAddressNew } from '@/lib/ton';
import * as storage from '@/lib/storage';
import TonWeb from 'tonweb';
import { toast } from 'sonner';
import { 
  ArrowRight, 
  AlertTriangle, 
  X, 
  ChevronRight, 
  History,
  CheckCircle2,
  ShieldCheck,
  ClipboardCheck,
  RefreshCw
} from "lucide-react";
import { cn } from "@/lib/utils";

interface SendFormProps {
  senderSecretKey: Uint8Array;
  balance: number;
  onSuccess?: () => void;
  onClose?: () => void;
}

type Step = 'input' | 'confirm' | 'success';

export default function SendForm({ senderSecretKey, balance, onSuccess, onClose }: SendFormProps) {
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
    if (numAmount > balance) return `Insufficient balance (Max: ${balance} TON)`;
    
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
    if (lastAppCopiedValue.current && lastAppCopiedValue.current !== pastedData) {
      toast.warning('WARNING: Pasted address differs from what you copied in this app!');
    }
  };

  if (step === 'success') {
    return (
      <div className="bg-card border border-border rounded-3xl p-8 shadow-2xl text-center space-y-6 animate-in fade-in zoom-in duration-300">
        <div className="w-20 h-20 bg-gain/10 text-gain rounded-full flex items-center justify-center mx-auto shadow-inner">
          <CheckCircle2 size={40} />
        </div>
        <div>
          <h2 className="text-2xl font-bold text-foreground">Transaction Sent</h2>
          <p className="text-muted-foreground mt-2">
            Your transfer of <span className="font-bold text-foreground">{amount} TON</span> is being processed by the network.
          </p>
        </div>
        <button 
          onClick={onClose}
          className="w-full h-14 bg-secondary text-secondary-foreground rounded-2xl font-bold hover:bg-muted transition-all active:scale-95"
        >
          Done
        </button>
      </div>
    );
  }

  if (step === 'confirm') {
    return (
      <div className="bg-card border border-border rounded-3xl p-6 shadow-2xl space-y-6 animate-in slide-in-from-right duration-300">
        <div className="flex items-center justify-between">
          <h2 className="text-xl font-semibold text-foreground">Review Send</h2>
          <button onClick={() => setStep('input')} className="text-muted-foreground hover:text-foreground">
            <X size={20} />
          </button>
        </div>

        <div className="space-y-4">
          <div className="p-5 bg-surface rounded-2xl border border-surface-border space-y-4 shadow-inner">
            <div className="flex flex-col">
              <span className="text-[10px] uppercase tracking-widest font-bold text-muted-foreground mb-1.5">Recipient</span>
              <span className="text-xs font-mono break-all text-foreground leading-relaxed">{recipient}</span>
            </div>
            <div className="pt-3 border-t border-surface-border flex justify-between items-end">
              <div>
                <span className="text-[10px] uppercase tracking-widest font-bold text-muted-foreground mb-1">Amount</span>
                <p className="text-2xl font-bold text-foreground leading-none">{amount} <span className="text-sm font-medium text-muted-foreground">TON</span></p>
              </div>
              <div className="text-right">
                <span className="text-[10px] uppercase tracking-widest font-bold text-muted-foreground mb-1">Network Fee</span>
                <p className="text-sm font-medium text-muted-foreground leading-none">~0.01 TON</p>
              </div>
            </div>
          </div>

          <div className="space-y-2.5">
            {isNewRecipient && (
              <div className="p-4 bg-loss/10 text-loss rounded-2xl border border-loss/20 flex gap-3 items-start animate-pulse shadow-sm shadow-loss/5">
                <AlertTriangle size={18} className="shrink-0 mt-0.5" />
                <div className="text-[11px] leading-relaxed">
                  <strong className="block mb-0.5">UNVERIFIED RECIPIENT</strong>
                  This address has no history on-chain. Please verify every character carefully.
                </div>
              </div>
            )}

            {isPasted && (
              <div className="p-4 bg-accent/10 text-accent-foreground rounded-2xl border border-accent/20 flex gap-3 items-start shadow-sm">
                <ClipboardCheck size={18} className="shrink-0 mt-0.5" />
                <div className="text-[11px] leading-relaxed">
                  <strong className="block mb-0.5">PASTED FROM CLIPBOARD</strong>
                  Ensure the address hasn't been modified by other applications.
                </div>
              </div>
            )}
            
            <div className="p-4 bg-gain/5 text-gain/80 rounded-2xl border border-gain/10 flex gap-3 items-start">
              <ShieldCheck size={18} className="shrink-0 mt-0.5" />
              <div className="text-[11px] leading-relaxed">
                <strong className="block mb-0.5">SECURE TRANSACTION</strong>
                Broadcasting via TON Testnet JsonRPC. All operations are local.
              </div>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-2 gap-3 pt-2">
          <button
            onClick={() => setStep('input')}
            disabled={isLoading}
            className="h-14 bg-secondary text-secondary-foreground rounded-2xl font-bold hover:bg-muted transition-all active:scale-95 disabled:opacity-50"
          >
            Cancel
          </button>
          <button
            onClick={handleSend}
            disabled={isLoading}
            className="h-14 bg-primary text-primary-foreground rounded-2xl font-bold hover:opacity-90 transition-all shadow-lg shadow-primary/20 flex items-center justify-center active:scale-95 disabled:opacity-50"
          >
            {isLoading ? <RefreshCw className="animate-spin" size={20} /> : 'Send Now'}
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-card border border-border rounded-3xl p-6 shadow-2xl space-y-6 animate-in slide-in-from-left duration-300">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-xl font-semibold text-foreground">Send</h2>
          <p className="text-xs text-muted-foreground font-mono uppercase tracking-widest">TON Assets</p>
        </div>
        {onClose && (
          <button 
            onClick={onClose}
            className="w-8 h-8 rounded-full bg-muted flex items-center justify-center text-muted-foreground hover:text-foreground transition-colors"
          >
            <X size={16} />
          </button>
        )}
      </div>

      <div className="space-y-5">
        <div className="space-y-2">
          <div className="flex justify-between items-center px-1">
            <label className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest">
              Recipient
            </label>
            {recentAddresses.length > 0 && (
              <button
                onClick={() => setShowRecent(!showRecent)}
                className="text-[10px] font-bold text-primary hover:opacity-80 flex items-center gap-1 transition-colors uppercase tracking-widest"
              >
                <History size={10} />
                {showRecent ? 'Hide' : 'Recent'}
              </button>
            )}
          </div>
          
          {showRecent && recentAddresses.length > 0 && (
            <div className="space-y-1.5 animate-in slide-in-from-top duration-200">
              {recentAddresses.map((recent) => (
                <button
                  key={recent.address}
                  onClick={() => {
                    setRecipient(recent.address);
                    setShowRecent(false);
                  }}
                  className="w-full p-3 text-left text-[11px] font-mono bg-surface hover:bg-muted rounded-xl border border-surface-border text-foreground transition-all flex items-center justify-between group"
                >
                  <span className="truncate flex-1">{recent.address}</span>
                  <ChevronRight size={12} className="text-muted-foreground group-hover:text-primary transition-colors" />
                </button>
              ))}
            </div>
          )}

          <div className="relative">
            <input
              type="text"
              value={recipient}
              onPaste={onPaste}
              onChange={(e) => {
                setRecipient(e.target.value);
                setIsPasted(false);
                setError(null);
              }}
              placeholder="Enter TON address..."
              className={cn(
                "w-full p-4 rounded-2xl border bg-surface text-sm font-mono transition-all outline-none ring-primary/20 focus:ring-4",
                recipient && !TonWeb.Address.isValid(recipient)
                  ? "border-loss ring-loss/10 focus:border-loss"
                  : "border-surface-border focus:border-primary"
              )}
              disabled={isLoading}
            />
            {isPasted && !error && (
              <span className="absolute right-3 top-1/2 -translate-y-1/2 text-[9px] font-bold bg-gain/10 text-gain px-2 py-1 rounded-full uppercase border border-gain/20">
                Pasted
              </span>
            )}
          </div>
        </div>

        <div className="space-y-2">
          <label className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest px-1">
            Amount
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
              className="w-full p-4 pr-16 rounded-2xl border border-surface-border bg-surface text-lg font-bold outline-none ring-primary/20 focus:ring-4 focus:border-primary transition-all"
              disabled={isLoading}
            />
            <span className="absolute right-4 top-1/2 -translate-y-1/2 text-xs font-black text-muted-foreground">
              TON
            </span>
          </div>
        </div>

        {error && (
          <div className="p-4 text-xs font-bold text-loss bg-loss/10 rounded-2xl border border-loss/20 animate-in shake-in duration-300">
            {error}
          </div>
        )}

        <button
          onClick={handleNext}
          disabled={isLoading || !recipient || !amount}
          className="w-full h-14 bg-primary text-primary-foreground rounded-2xl font-black hover:opacity-90 transition-all disabled:opacity-20 flex items-center justify-center shadow-xl shadow-primary/20 active:scale-95"
        >
          {isLoading ? <RefreshCw className="animate-spin" size={20} /> : (
            <span className="flex items-center gap-2">
              Next Step
              <ArrowRight size={18} />
            </span>
          )}
        </button>
      </div>

      <div className="text-[10px] text-muted-foreground text-center uppercase tracking-[0.2em] font-black opacity-50">
        Transaction Security Verified
      </div>
    </div>
  );
}
