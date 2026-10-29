import { NextRequest, NextResponse } from 'next/server';
import { GrowthAgent } from '@/lib/agents/growthAgent';

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { customerId, cartItems } = body;

    const growthOutput = await GrowthAgent.evaluateGrowthIntervention(
      customerId || 'cust_1042',
      cartItems || []
    );

    return NextResponse.json({ success: true, growthAction: growthOutput });
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
