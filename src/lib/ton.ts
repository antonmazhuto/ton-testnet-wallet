import TonWeb from 'tonweb';

const TESTNET_ENDPOINT = 'https://testnet.toncenter.com/api/v2/jsonRPC';

/**
 * Initialized TonWeb instance connected to TON Testnet
 */
export const ton = new TonWeb(new TonWeb.HttpProvider(TESTNET_ENDPOINT));

/**
 * Helper to create a wallet instance from a public key.
 * Uses Wallet V4 R2 by default.
 * 
 * @param publicKey The public key as Uint8Array
 * @returns An initialized Wallet contract instance
 */
export const createWallet = (publicKey: Uint8Array) => {
  const WalletClass = ton.wallet.all['v4R2'];
  return new WalletClass(ton.provider, {
    publicKey,
    wc: 0, // Basechain (workchain 0)
  });
};

/**
 * Derives the address from a public key for a V4R2 wallet.
 * 
 * @param publicKey The public key as Uint8Array
 * @returns The non-bounceable testnet address string
 */
export const getWalletAddress = async (publicKey: Uint8Array): Promise<string> => {
  const wallet = createWallet(publicKey);
  const address = await wallet.getAddress();
  return address.toString(true, true, false, true); // isUserFriendly, isUrlSafe, isBounceable, isTestnet
};

/**
 * Sends a transaction from a wallet.
 * 
 * @param secretKey The secret key of the sender (64 bytes)
 * @param toAddress The recipient address
 * @param amount The amount in TON
 * @returns The result of the transaction broadcast
 */
export const sendTransaction = async (
  secretKey: Uint8Array,
  toAddress: string,
  amount: number
) => {
  const keyPair = {
    publicKey: secretKey.slice(32),
    secretKey: secretKey,
  };
  
  const wallet = createWallet(keyPair.publicKey);
  const seqno = (await (wallet as any).getSeqno()) || 0;
  
  const transfer = (wallet as any).methods.transfer({
    secretKey: keyPair.secretKey,
    toAddress: toAddress,
    amount: ton.utils.toNano(amount.toString()),
    seqno: seqno,
    payload: '', // Optional comment
    sendMode: 3, // Pay fees separately + ignore errors
  });
  
  return await transfer.send();
};

/**
 * Checks if an address has any transaction history.
 * 
 * @param address The address to check
 * @returns true if the address has no history
 */
export const isAddressNew = async (address: string): Promise<boolean> => {
  try {
    const txs = await ton.getTransactions(address, 1);
    return txs.length === 0;
  } catch (e) {
    console.error('Failed to check address history', e);
    return false; // Assume not new on error to avoid false positives
  }
};

export default ton;
