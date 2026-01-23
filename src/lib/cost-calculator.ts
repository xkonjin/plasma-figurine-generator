// Dynamic cost calculation for figurine generation
// Calculates exact API costs + gas fees

import { toAtomicUnits, fromAtomicUnits } from './plasma-config';

export interface CostBreakdown {
  geminiApiCost: bigint; // in atomic units (6 decimals)
  gasFeeBuffer: bigint; // in atomic units
  platformFee: bigint; // in atomic units
  totalCost: bigint; // in atomic units
  totalCostUSD: string; // human-readable USD amount
}

// Gemini API costs (estimated, update based on actual usage)
const GEMINI_COSTS = {
  // Gemini 2.0 Flash pricing per 1M tokens
  inputTokensPer1M: 0.075, // $0.075 per 1M input tokens
  outputTokensPer1M: 0.30, // $0.30 per 1M output tokens
  
  // Estimated tokens for figurine generation
  estimatedInputTokens: 1000, // Prompt + image analysis
  estimatedOutputTokens: 0, // Image generation doesn't count as output tokens
  
  // Image generation cost (estimated)
  imageGenerationCost: 0.02, // $0.02 per image
};

// Gas fee estimates for Plasma USDT0 transactions
const GAS_FEE_ESTIMATES = {
  // EIP-3009 transferWithAuthorization gas cost
  gasUnits: 50000,
  
  // Plasma gas price (very low, often free with gasless API)
  gasPriceGwei: 0.001,
  
  // USDT0 price (assume $1 for stablecoin)
  usdt0PriceUSD: 1.0,
  
  // Buffer multiplier for safety
  bufferMultiplier: 1.5,
};

export function calculateGeminiCost(): bigint {
  // Calculate token costs
  const inputCost = (GEMINI_COSTS.estimatedInputTokens / 1_000_000) * GEMINI_COSTS.inputTokensPer1M;
  const outputCost = (GEMINI_COSTS.estimatedOutputTokens / 1_000_000) * GEMINI_COSTS.outputTokensPer1M;
  
  // Add image generation cost
  const totalCostUSD = inputCost + outputCost + GEMINI_COSTS.imageGenerationCost;
  
  // Convert to atomic units (6 decimals)
  return toAtomicUnits(totalCostUSD.toFixed(6));
}

export function calculateGasFee(): bigint {
  // Calculate gas cost in ETH
  const gasCostETH = (GAS_FEE_ESTIMATES.gasUnits * GAS_FEE_ESTIMATES.gasPriceGwei) / 1_000_000_000;
  
  // Convert to USD (simplified - in production, use price oracle)
  const gasCostUSD = gasCostETH * 3000; // Assume $3000 ETH price
  
  // Apply buffer multiplier
  const bufferedCostUSD = gasCostUSD * GAS_FEE_ESTIMATES.bufferMultiplier;
  
  // Convert to atomic units
  return toAtomicUnits(bufferedCostUSD.toFixed(6));
}

export function calculatePlatformFee(amount: bigint, feeBps: number = 10): bigint {
  return (amount * BigInt(feeBps)) / BigInt(10000);
}

export function calculateTotalCost(): CostBreakdown {
  const geminiApiCost = calculateGeminiCost();
  const gasFeeBuffer = calculateGasFee();
  
  // Calculate subtotal
  const subtotal = geminiApiCost + gasFeeBuffer;
  
  // Calculate platform fee (0.1% = 10 bps)
  const platformFee = calculatePlatformFee(subtotal, 10);
  
  // Calculate total
  const totalCost = subtotal + platformFee;
  
  return {
    geminiApiCost,
    gasFeeBuffer,
    platformFee,
    totalCost,
    totalCostUSD: fromAtomicUnits(totalCost),
  };
}

// Get cost for environment variable or calculate dynamically
export function getFigurineCost(): bigint {
  const envPrice = process.env.FIGURINE_PRICE;
  
  if (envPrice) {
    // Use fixed price from environment
    return toAtomicUnits(envPrice);
  }
  
  // Calculate dynamically
  const breakdown = calculateTotalCost();
  return breakdown.totalCost;
}

// Log cost breakdown for monitoring
export function logCostBreakdown(breakdown: CostBreakdown): void {
  console.log('Cost Breakdown:');
  console.log(`  Gemini API: $${fromAtomicUnits(breakdown.geminiApiCost)}`);
  console.log(`  Gas Fee Buffer: $${fromAtomicUnits(breakdown.gasFeeBuffer)}`);
  console.log(`  Platform Fee: $${fromAtomicUnits(breakdown.platformFee)}`);
  console.log(`  Total: $${breakdown.totalCostUSD}`);
}
