import { NextRequest, NextResponse } from 'next/server';
import { RecoveryAgent } from '@/lib/agents/recoveryAgent';

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { customerId, cartValue, failureReason } = body;

    const recoveryResult = await RecoveryAgent.analyzeRecoveryOpportunity(
      customerId || 'cust_1088',
      cartValue || 4299,
      failureReason || 'Payment failed at issuing bank gateway'
    );

    return NextResponse.json({ success: true, recovery: recoveryResult });
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
