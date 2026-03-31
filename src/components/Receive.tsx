'use client';

import { useState } from 'react';
import { toast } from 'sonner';
import { QRCodeCanvas } from 'qrcode.react';

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
    <div className="p-6 rounded-2xl bg-white border border-gray-100 shadow-sm space-y-6 animate-in fade-in zoom-in duration-300">
      <div className="flex items-center justify-between">
        <h2 className="text-lg font-bold text-gray-900">Receive TON</h2>
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

      <div className="flex flex-col items-center space-y-6">
        {/* QR Code */}
        <div className="p-4 bg-white rounded-2xl border border-gray-100 shadow-sm">
          <QRCodeCanvas 
            value={address} 
            size={180}
            level="H"
            includeMargin={false}
          />
        </div>

        <div className="space-y-4 w-full">
          <div className="text-sm text-gray-500 text-center">
            Scan or copy the address to receive funds
          </div>

          <div className="p-4 bg-gray-50 rounded-xl border border-gray-100 break-all text-center font-mono text-xs text-gray-600 leading-relaxed select-all">
            {address}
          </div>

          <button
            onClick={handleCopy}
            className={`w-full h-12 rounded-xl font-medium transition-all duration-200 flex items-center justify-center gap-2 ${
              copied 
                ? 'bg-green-500 text-white' 
                : 'bg-black text-white hover:bg-gray-800 shadow-lg shadow-black/10'
            }`}
          >
            {copied ? (
              <>
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                </svg>
                Copied!
              </>
            ) : (
              <>
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 5H6a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2v-1M8 5a2 2 0 002 2h2a2 2 0 002-2M8 5a2 2 0 012-2h2a2 2 0 012 2m0 0h2a2 2 0 012 2v3m2 4H10m0 0l3-3m-3 3l3 3" />
                </svg>
                Copy Address
              </>
            )}
          </button>
        </div>
      </div>

      <div className="text-[10px] text-gray-400 text-center uppercase tracking-widest font-medium">
        TON Testnet Address Only
      </div>
    </div>
  );
}
