'use client';

import { useState } from 'react';
import { QRCodeCanvas } from 'qrcode.react';
import { Copy, X, Check } from "lucide-react";
import { toast } from 'sonner';
import { cn } from "@/lib/utils";

interface ReceiveProps {
  address: string;
  onClose?: () => void;
}

export default function Receive({ address, onClose }: ReceiveProps) {
  const [copied, setCopied] = useState(false);

  const handleCopy = () => {
    navigator.clipboard.writeText(address);
    setCopied(true);
    toast.success('Address copied to clipboard');
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="bg-card border border-border rounded-3xl p-6 shadow-2xl animate-in slide-in-from-bottom duration-300">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h2 className="text-xl font-semibold text-foreground">Receive</h2>
          <p className="text-xs text-muted-foreground font-mono uppercase tracking-widest">TON Testnet</p>
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

      <div className="flex flex-col items-center gap-6">
        {/* QR Code Container */}
        <div className="p-4 bg-white rounded-2xl shadow-inner shadow-black/5">
          <QRCodeCanvas 
            value={address} 
            size={180}
            level="H"
            includeMargin={false}
            fgColor="#000000"
            bgColor="#FFFFFF"
          />
        </div>

        <div className="w-full space-y-4">
          <div className="text-center">
            <p className="text-sm text-muted-foreground">Scan or copy address to receive funds</p>
          </div>

          <div className="relative group">
            <div className="p-4 bg-muted/50 rounded-2xl border border-border break-all text-center font-mono text-xs text-foreground leading-relaxed select-all cursor-pointer hover:bg-muted transition-colors">
              {address}
            </div>
          </div>

          <button
            onClick={handleCopy}
            className={cn(
              "w-full h-14 rounded-2xl font-semibold transition-all duration-300 flex items-center justify-center gap-2 shadow-lg",
              copied 
                ? "bg-gain text-primary-foreground shadow-gain/20" 
                : "bg-primary text-primary-foreground hover:opacity-90 shadow-primary/20"
            )}
          >
            {copied ? (
              <>
                <Check size={18} />
                Copied!
              </>
            ) : (
              <>
                <Copy size={18} />
                Copy Address
              </>
            )}
          </button>
        </div>
      </div>

      <div className="mt-6 pt-4 border-t border-border/50 text-center">
        <p className="text-[10px] text-muted-foreground uppercase tracking-widest font-medium">
          Only send TON Testnet assets to this address
        </p>
      </div>
    </div>
  );
}
