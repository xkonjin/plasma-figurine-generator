// LiFi Protocol Integration for Payment Agnosticism
// Enables users to pay with any token via automatic cross-chain swaps to USDT0

import { PLASMA_CONFIG } from './plasma-config';

export interface LiFiQuoteRequest {
  fromChain: string | number;
  toChain: string | number;
  fromToken: string;
  toToken: string;
  fromAmount: string;
  fromAddress?: string;
  toAddress?: string;
}

export interface LiFiQuoteResponse {
  id: string;
  type: string;
  tool: string;
  action: {
    fromChainId: number;
    toChainId: number;
    fromToken: {
      address: string;
      symbol: string;
      decimals: number;
      chainId: number;
      name: string;
      priceUSD: string;
    };
    toToken: {
      address: string;
      symbol: string;
      decimals: number;
      chainId: number;
      name: string;
      priceUSD: string;
    };
    fromAmount: string;
    toAmount: string;
    slippage: number;
  };
  estimate: {
    fromAmount: string;
    toAmount: string;
    toAmountMin: string;
    approvalAddress: string;
    executionDuration: number;
    feeCosts: Array<{
      name: string;
      description: string;
      token: {
        address: string;
        symbol: string;
        decimals: number;
        chainId: number;
        name: string;
        priceUSD: string;
      };
      amount: string;
      amountUSD: string;
    }>;
    gasCosts: Array<{
      type: string;
      price: string;
      estimate: string;
      limit: string;
      amount: string;
      amountUSD: string;
      token: {
        address: string;
        symbol: string;
        decimals: number;
        chainId: number;
        name: string;
        priceUSD: string;
      };
    }>;
  };
  transactionRequest?: {
    from: string;
    to: string;
    chainId: number;
    data: string;
    value: string;
    gasPrice: string;
    gasLimit: string;
  };
}

const LIFI_API_URL = 'https://li.fi/v1';

export async function getLiFiQuote(request: LiFiQuoteRequest): Promise<LiFiQuoteResponse> {
  const params = new URLSearchParams({
    fromChain: request.fromChain.toString(),
    toChain: request.toChain.toString(),
    fromToken: request.fromToken,
    toToken: request.toToken,
    fromAmount: request.fromAmount,
    ...(request.fromAddress && { fromAddress: request.fromAddress }),
    ...(request.toAddress && { toAddress: request.toAddress }),
  });

  const response = await fetch(`${LIFI_API_URL}/quote?${params}`, {
    method: 'GET',
    headers: {
      'Content-Type': 'application/json',
    },
  });

  if (!response.ok) {
    throw new Error(`LiFi API error: ${response.statusText}`);
  }

  return response.json();
}

export async function getQuoteForUSDT0(
  fromChainId: number,
  fromTokenAddress: string,
  fromAmount: string,
  fromAddress?: string
): Promise<LiFiQuoteResponse> {
  return getLiFiQuote({
    fromChain: fromChainId,
    toChain: PLASMA_CONFIG.CHAIN_ID,
    fromToken: fromTokenAddress,
    toToken: PLASMA_CONFIG.USDT0_ADDRESS,
    fromAmount,
    fromAddress,
    toAddress: fromAddress, // Same address on destination chain
  });
}

export interface SupportedChain {
  id: number;
  key: string;
  name: string;
  coin: string;
  mainnet: boolean;
  logoURI: string;
  tokenlistUrl: string;
  multicallAddress: string;
  metamask: {
    chainId: string;
    blockExplorerUrls: string[];
    chainName: string;
    nativeCurrency: {
      name: string;
      symbol: string;
      decimals: number;
    };
    rpcUrls: string[];
  };
}

export async function getSupportedChains(): Promise<SupportedChain[]> {
  const response = await fetch(`${LIFI_API_URL}/chains`, {
    method: 'GET',
    headers: {
      'Content-Type': 'application/json',
    },
  });

  if (!response.ok) {
    throw new Error(`LiFi API error: ${response.statusText}`);
  }

  const data = await response.json();
  return data.chains || [];
}

export interface Token {
  address: string;
  symbol: string;
  decimals: number;
  chainId: number;
  name: string;
  coinKey: string;
  logoURI: string;
  priceUSD: string;
}

export async function getTokensForChain(chainId: number): Promise<Token[]> {
  const response = await fetch(`${LIFI_API_URL}/tokens?chains=${chainId}`, {
    method: 'GET',
    headers: {
      'Content-Type': 'application/json',
    },
  });

  if (!response.ok) {
    throw new Error(`LiFi API error: ${response.statusText}`);
  }

  const data = await response.json();
  return data.tokens?.[chainId] || [];
}

// Execute a swap using LiFi
export async function executeLiFiSwap(
  quote: LiFiQuoteResponse,
  _userAddress: string
): Promise<{ txHash: string; status: string }> {
  if (!quote.transactionRequest) {
    throw new Error('No transaction request in quote');
  }

  // In production, this would use wagmi/viem to execute the transaction
  // For now, return a mock response
  return {
    txHash: '0x' + Math.random().toString(16).substring(2),
    status: 'pending',
  };
}

// Check swap status
export async function checkSwapStatus(txHash: string, chainId: number): Promise<{
  status: 'pending' | 'completed' | 'failed';
  toAmount?: string;
}> {
  const response = await fetch(`${LIFI_API_URL}/status?txHash=${txHash}&bridge=lifi&fromChain=${chainId}`, {
    method: 'GET',
    headers: {
      'Content-Type': 'application/json',
    },
  });

  if (!response.ok) {
    throw new Error(`LiFi API error: ${response.statusText}`);
  }

  const data = await response.json();
  
  return {
    status: data.status === 'DONE' ? 'completed' : data.status === 'FAILED' ? 'failed' : 'pending',
    toAmount: data.receiving?.amount,
  };
}
