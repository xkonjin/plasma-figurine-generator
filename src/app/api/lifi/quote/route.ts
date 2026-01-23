import { NextRequest, NextResponse } from 'next/server';
import { getLiFiQuote, getQuoteForUSDT0 } from '@/lib/lifi-integration';

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { fromChainId, fromTokenAddress, fromAmount, fromAddress, toUSDT0 } = body;

    if (!fromChainId || !fromTokenAddress || !fromAmount) {
      return NextResponse.json(
        { error: 'Missing required fields: fromChainId, fromTokenAddress, fromAmount' },
        { status: 400 }
      );
    }

    let quote;
    
    if (toUSDT0) {
      // Get quote for swapping to USDT0 on Plasma
      quote = await getQuoteForUSDT0(
        fromChainId,
        fromTokenAddress,
        fromAmount,
        fromAddress
      );
    } else {
      // Get custom quote
      const { toChainId, toTokenAddress } = body;
      if (!toChainId || !toTokenAddress) {
        return NextResponse.json(
          { error: 'Missing required fields: toChainId, toTokenAddress' },
          { status: 400 }
        );
      }

      quote = await getLiFiQuote({
        fromChain: fromChainId,
        toChain: toChainId,
        fromToken: fromTokenAddress,
        toToken: toTokenAddress,
        fromAmount,
        fromAddress,
        toAddress: fromAddress,
      });
    }

    return NextResponse.json(quote);
  } catch (error) {
    console.error('LiFi quote error:', error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Failed to get quote' },
      { status: 500 }
    );
  }
}

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  
  const fromChainId = searchParams.get('fromChainId');
  const fromTokenAddress = searchParams.get('fromTokenAddress');
  const fromAmount = searchParams.get('fromAmount');
  const fromAddress = searchParams.get('fromAddress');

  if (!fromChainId || !fromTokenAddress || !fromAmount) {
    return NextResponse.json(
      { error: 'Missing required parameters: fromChainId, fromTokenAddress, fromAmount' },
      { status: 400 }
    );
  }

  try {
    const quote = await getQuoteForUSDT0(
      parseInt(fromChainId),
      fromTokenAddress,
      fromAmount,
      fromAddress || undefined
    );

    return NextResponse.json(quote);
  } catch (error) {
    console.error('LiFi quote error:', error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Failed to get quote' },
      { status: 500 }
    );
  }
}
