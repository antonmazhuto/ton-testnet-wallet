const MNEMONIC_KEY = 'ton_wallet_mnemonic';
const RECENT_ADDRESSES_KEY = 'ton_recent_addresses';
const MAX_RECENT_ADDRESSES = 5;

export interface StoredWallet {
  mnemonic: string;
}

export interface RecentAddress {
  address: string;
  timestamp: number;
}

/**
 * Saves the wallet mnemonic to localStorage.
 * 
 * @param mnemonic Space-separated 24-word mnemonic
 */
export const saveWallet = (mnemonic: string): void => {
  if (typeof window === 'undefined') return;
  localStorage.setItem(MNEMONIC_KEY, mnemonic);
};

/**
 * Retrieves the stored wallet mnemonic.
 * 
 * @returns The mnemonic string or null if not found
 */
export const getWallet = (): string | null => {
  if (typeof window === 'undefined') return null;
  return localStorage.getItem(MNEMONIC_KEY);
};

/**
 * Clears the stored wallet.
 */
export const clearWallet = (): void => {
  if (typeof window === 'undefined') return;
  localStorage.removeItem(MNEMONIC_KEY);
};

/**
 * Adds an address to the recent addresses list.
 * 
 * @param address The TON address to add
 */
export const addRecentAddress = (address: string): void => {
  if (typeof window === 'undefined') return;
  
  const currentRecent = getRecentAddresses();
  const filtered = currentRecent.filter(a => a.address.toLowerCase() !== address.toLowerCase());
  
  const updated = [
    { address, timestamp: Date.now() },
    ...filtered
  ].slice(0, MAX_RECENT_ADDRESSES);
  
  localStorage.setItem(RECENT_ADDRESSES_KEY, JSON.stringify(updated));
};

/**
 * Retrieves the list of recent addresses.
 * 
 * @returns Array of RecentAddress objects
 */
export const getRecentAddresses = (): RecentAddress[] => {
  if (typeof window === 'undefined') return [];
  
  try {
    const stored = localStorage.getItem(RECENT_ADDRESSES_KEY);
    return stored ? JSON.parse(stored) : [];
  } catch (e) {
    console.error('Failed to parse recent addresses', e);
    return [];
  }
};

/**
 * Clears the recent addresses list.
 */
export const clearRecentAddresses = (): void => {
  if (typeof window === 'undefined') return;
  localStorage.removeItem(RECENT_ADDRESSES_KEY);
};
