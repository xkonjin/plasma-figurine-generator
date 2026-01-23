import { NextRequest, NextResponse } from 'next/server';
import { confirmInvoice, getInvoiceStatus } from '@/lib/payment-middleware';
import { ethers } from 'ethers';
import { PLASMA_CONFIG, getEIP3009Domain, EIP3009_TYPES } from '@/lib/plasma-config';

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { invoiceId, signature, authorization } = body;

    if (!invoiceId || !signature || !authorization) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      );
    }

    // Verify EIP-3009 signature
    const domain = getEIP3009Domain();
    const types = EIP3009_TYPES;
    
    const recoveredAddress = ethers.verifyTypedData(
      domain,
      types,
      authorization,
      signature
    );

    if (recoveredAddress.toLowerCase() !== authorization.from.toLowerCase()) {
      return NextResponse.json(
        { error: 'Invalid signature' },
        { status: 401 }
      );
    }

    // In production, submit the transaction to Plasma chain here
    // For now, we'll simulate successful payment
    const txHash = `0x${Math.random().toString(16).substring(2)}`;
    
    // Mark invoice as confirmed
    confirmInvoice(invoiceId, txHash);

    return NextResponse.json({
      success: true,
      invoiceId,
      txHash,
      status: 'confirmed',
    });
  } catch (error) {
    console.error('Payment verification error:', error);
    return NextResponse.json(
      { error: 'Payment verification failed' },
      { status: 500 }
    );
  }
}

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const invoiceId = searchParams.get('invoiceId');

  if (!invoiceId) {
    return NextResponse.json(
      { error: 'Invoice ID required' },
      { status: 400 }
    );
  }

  const invoice = getInvoiceStatus(invoiceId);

  if (!invoice) {
    return NextResponse.json(
      { error: 'Invoice not found' },
      { status: 404 }
    );
  }

  return NextResponse.json(invoice);
}
