import { NextRequest, NextResponse } from 'next/server';
import { getTokensForChain } from '@/lib/lifi-integration';

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const chainId = searchParams.get('chainId');

  if (!chainId) {
    return NextResponse.json(
      { error: 'Missing required parameter: chainId' },
      { status: 400 }
    );
  }

  try {
    const tokens = await getTokensForChain(parseInt(chainId));
    return NextResponse.json({ tokens });
  } catch (error) {
    console.error('LiFi tokens error:', error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Failed to get tokens' },
      { status: 500 }
    );
  }
}
