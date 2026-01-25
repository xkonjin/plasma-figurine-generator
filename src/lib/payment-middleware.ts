// Payment Middleware for Plasma USDT0
// Handles x402 payment flow with EIP-3009 authorization

import { NextRequest, NextResponse } from 'next/server';
import { getToken } from 'next-auth/jwt';
import { v4 as uuidv4 } from 'uuid';
import { PLASMA_CONFIG, calculateProtocolFee } from './plasma-config';
import { calculateTotalCost, logCostBreakdown } from './cost-calculator';

const AUTH_SECRET = process.env.AUTH_SECRET;
const ALLOW_INSECURE_PAYMENT = process.env.ALLOW_INSECURE_PAYMENT === 'true';

export interface PaymentOption {
  network: string;
  chainId: number;
  token: string;
  tokenSymbol: string;
  amount: string;
  decimals: number;
  recipient: string;
  scheme: string;
  nonce: string;
  deadline: number;
  feeBreakdown: {
    amount: string;
    percentBps: number;
    percentFee: string;
    totalFee: string;
  };
}

export interface PaymentRequired {
  invoiceId: string;
  timestamp: number;
  paymentOptions: PaymentOption[];
  description: string;
}

// In-memory invoice store (in production, use Redis or database)
const invoiceStore = new Map<string, { status: string; txHash?: string }>();

export async function paymentMiddleware(req: NextRequest): Promise<NextResponse | null> {
  // Check if user is authenticated with plasma.to email
  const token = await getToken({ req, secret: AUTH_SECRET });
  
  if (token && token.email && (token.email as string).endsWith('@plasma.to')) {
    // plasma.to users get free access
    return null; // Continue to next middleware/handler
  }

  // Check for payment signature in headers
  const paymentSignature = req.headers.get('payment-signature');
  
  if (paymentSignature) {
    if (process.env.NODE_ENV === 'production' && !ALLOW_INSECURE_PAYMENT) {
      console.warn('Payment verification not configured in production');
      return NextResponse.json(
        { error: 'Payment verification not configured' },
        { status: 402 }
      );
    }

    // Verify payment (simplified - in production, verify signature on-chain)
    try {
      const paymentData = JSON.parse(Buffer.from(paymentSignature, 'base64').toString('utf-8'));
      const invoiceId = paymentData.invoiceId;
      
      if (invoiceStore.has(invoiceId)) {
        const invoice = invoiceStore.get(invoiceId);
        if (invoice?.status === 'confirmed') {
          // Payment confirmed, allow access
          return null;
        }
      }
      
      // In production, verify the signature and settle the payment here
      // For now, mark as confirmed
      invoiceStore.set(invoiceId, { status: 'confirmed', txHash: '0x...' });
      return null;
    } catch (error) {
      console.error('Payment verification error:', error);
    }
  }

  // No valid payment, return 402 Payment Required
  const costBreakdown = calculateTotalCost();
  logCostBreakdown(costBreakdown);
  
  const paymentRequired = buildPaymentRequired(
    costBreakdown.totalCost,
    'Generate personalized figurine'
  );

  return NextResponse.json(paymentRequired, { 
    status: 402,
    headers: {
      'Content-Type': 'application/json',
      'Payment-Required': Buffer.from(JSON.stringify(paymentRequired)).toString('base64'),
    },
  });
}

function buildPaymentRequired(amountAtomic: bigint, description: string): PaymentRequired {
  const now = Math.floor(Date.now() / 1000);
  const deadline = now + PLASMA_CONFIG.DEFAULT_DEADLINE_SECS;
  const invoiceId = uuidv4();

  const { feeAmount } = calculateProtocolFee(amountAtomic);

  const plasmaOption: PaymentOption = {
    network: 'plasma',
    chainId: PLASMA_CONFIG.CHAIN_ID,
    token: PLASMA_CONFIG.USDT0_ADDRESS,
    tokenSymbol: PLASMA_CONFIG.USDT0_SYMBOL,
    amount: amountAtomic.toString(),
    decimals: PLASMA_CONFIG.USDT0_DECIMALS,
    recipient: PLASMA_CONFIG.MERCHANT_ADDRESS,
    scheme: PLASMA_CONFIG.X402_SCHEME,
    nonce: uuidv4().replace(/-/g, '').padEnd(64, '0'),
    deadline,
    feeBreakdown: {
      amount: amountAtomic.toString(),
      percentBps: PLASMA_CONFIG.PLATFORM_FEE_BPS,
      percentFee: feeAmount.toString(),
      totalFee: feeAmount.toString(),
    },
  };

  return {
    invoiceId,
    timestamp: now,
    paymentOptions: [plasmaOption],
    description,
  };
}

export function getInvoiceStatus(invoiceId: string): { status: string; txHash?: string } | null {
  return invoiceStore.get(invoiceId) || null;
}

export function confirmInvoice(invoiceId: string, txHash: string): void {
  invoiceStore.set(invoiceId, { status: 'confirmed', txHash });
}
