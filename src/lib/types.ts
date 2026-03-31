export interface Transaction {
  id: string;
  hash: string;
  type: 'receive' | 'send';
  amount: number;
  symbol: string;
  timestamp: number;
  from?: string;
  to?: string;
  status: 'pending' | 'completed' | 'failed';
}

export interface Wallet {
  address: string;
  balance: number;
  symbol: string;
}
