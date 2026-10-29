import { NextResponse } from 'next/server';
import { store } from '@/lib/db/store';
import { AnalystAgent } from '@/lib/agents/analystAgent';

export async function GET() {
  try {
    const analytics = store.getAnalytics();
    const insights = await AnalystAgent.analyzeMerchantPerformance();

    return NextResponse.json({
      success: true,
      analytics,
      insights,
    });
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
