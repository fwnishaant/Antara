import { NextRequest, NextResponse } from 'next/server';
import { IntentAgent } from '@/lib/agents/intentAgent';

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { customerId, searchQuery, viewedProductIds } = body;

    const intentData = await IntentAgent.analyzeIntent(
      customerId || 'cust_1042',
      searchQuery,
      viewedProductIds || []
    );

    return NextResponse.json({ success: true, intent: intentData });
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
