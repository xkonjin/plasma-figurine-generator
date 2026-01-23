import { NextResponse } from 'next/server';
import { getSupportedChains } from '@/lib/lifi-integration';

export async function GET() {
  try {
    const chains = await getSupportedChains();
    return NextResponse.json({ chains });
  } catch (error) {
    console.error('LiFi chains error:', error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Failed to get chains' },
      { status: 500 }
    );
  }
}
