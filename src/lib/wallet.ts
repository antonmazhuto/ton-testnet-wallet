import * as mnemonic from 'tonweb-mnemonic';
import { getWalletAddress } from './ton';
import * as storage from './storage';

export interface WalletData {
  address: string;
  mnemonic: string[];
  secretKey: Uint8Array;
}

/**
 * Generates a new wallet and stores it in localStorage.
 * 
 * @returns WalletData containing the address and the mnemonic array
 */
export const createNewWallet = async (): Promise<WalletData> => {
  const words = await mnemonic.generateMnemonic();
  const keyPair = await mnemonic.mnemonicToKeyPair(words);
  const address = await getWalletAddress(keyPair.publicKey);
  
  storage.saveWallet(words.join(' '));
  
  return {
    address,
    mnemonic: words,
    secretKey: keyPair.secretKey,
  };
};

/**
 * Imports a wallet from a mnemonic string and stores it in localStorage.
 * 
 * @param mnemonicStr Space-separated 24-word mnemonic
 * @returns WalletData
 * @throws Error if mnemonic is invalid
 */
export const importWallet = async (mnemonicStr: string): Promise<WalletData> => {
  const words = mnemonicStr.trim().split(/\s+/);
  
  const isValid = await mnemonic.validateMnemonic(words);
  if (!isValid) {
    throw new Error('Invalid mnemonic');
  }
  
  const keyPair = await mnemonic.mnemonicToKeyPair(words);
  const address = await getWalletAddress(keyPair.publicKey);
  
  storage.saveWallet(words.join(' '));
  
  return {
    address,
    mnemonic: words,
    secretKey: keyPair.secretKey,
  };
};

/**
 * Loads the wallet from localStorage if it exists.
 * 
 * @returns WalletData or null if no wallet is stored
 */
export const loadStoredWallet = async (): Promise<WalletData | null> => {
  const stored = storage.getWallet();
  if (!stored) return null;
  
  try {
    return await importWallet(stored);
  } catch (e) {
    console.error('Failed to load stored wallet', e);
    return null;
  }
};

/**
 * Clears the stored wallet from localStorage.
 */
export const logoutWallet = () => {
  storage.clearWallet();
};
