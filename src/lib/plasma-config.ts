// Plasma USDT0 Configuration
// Based on xUSDT repository implementation

export const PLASMA_CONFIG = {
  // Network configuration
  CHAIN_ID: 9745,
  RPC_URL: process.env.PLASMA_RPC || 'https://rpc.plasma.to',
  NETWORK_NAME: 'Plasma',
  
  // USDT0 Token configuration
  USDT0_ADDRESS: '0xB8CE59FC3717ada4C02eaDF9682A9e934F625ebb',
  USDT0_NAME: 'USDT0',
  USDT0_SYMBOL: 'USDT0',
  USDT0_DECIMALS: 6,
  USDT0_VERSION: '1',
  
  // Merchant configuration
  MERCHANT_ADDRESS: process.env.MERCHANT_ADDRESS || '0x03BD07c84B6D9682E238ec865B34bECFE045d09A',
  
  // Payment configuration
  DEFAULT_DEADLINE_SECS: 600, // 10 minutes
  PLATFORM_FEE_BPS: 10, // 0.1%
  
  // x402 configuration
  X402_SCHEME: 'eip3009-transfer-with-auth',
  
  // Gasless API configuration (optional)
  GASLESS_API_URL: process.env.PLASMA_RELAYER_URL || 'https://api.plasma.to',
  GASLESS_API_SECRET: process.env.PLASMA_RELAYER_SECRET,
  USE_GASLESS_API: process.env.USE_GASLESS_API === 'true',
} as const;

// EIP-3009 domain for USDT0 on Plasma
export function getEIP3009Domain(chainId: number = PLASMA_CONFIG.CHAIN_ID) {
  return {
    name: PLASMA_CONFIG.USDT0_NAME,
    version: PLASMA_CONFIG.USDT0_VERSION,
    chainId,
    verifyingContract: PLASMA_CONFIG.USDT0_ADDRESS,
  };
}

// EIP-3009 TransferWithAuthorization type
export const EIP3009_TYPES = {
  TransferWithAuthorization: [
    { name: 'from', type: 'address' },
    { name: 'to', type: 'address' },
    { name: 'value', type: 'uint256' },
    { name: 'validAfter', type: 'uint256' },
    { name: 'validBefore', type: 'uint256' },
    { name: 'nonce', type: 'bytes32' },
  ],
};

// Convert decimal amount to atomic units (6 decimals)
export function toAtomicUnits(amount: number | string): bigint {
  const amountStr = typeof amount === 'number' ? amount.toString() : amount;
  const parts = amountStr.split('.');
  const integerPart = parts[0] || '0';
  const fractionalPart = (parts[1] || '').padEnd(6, '0').slice(0, 6);
  return BigInt(integerPart + fractionalPart);
}

// Convert atomic units to decimal amount (6 decimals)
export function fromAtomicUnits(atomicAmount: bigint | string): string {
  const atomicStr = typeof atomicAmount === 'bigint' ? atomicAmount.toString() : atomicAmount;
  const padded = atomicStr.padStart(7, '0');
  const integerPart = padded.slice(0, -6) || '0';
  const fractionalPart = padded.slice(-6);
  return `${integerPart}.${fractionalPart}`;
}

// Calculate protocol fee
export function calculateProtocolFee(amountAtomic: bigint): {
  feeAmount: bigint;
  totalAmount: bigint;
} {
  const feeAmount = (amountAtomic * BigInt(PLASMA_CONFIG.PLATFORM_FEE_BPS)) / BigInt(10000);
  const totalAmount = amountAtomic + feeAmount;
  return { feeAmount, totalAmount };
}
