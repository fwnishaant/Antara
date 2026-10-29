import { NextRequest, NextResponse } from 'next/server';
import { RecommendationAgent } from '@/lib/agents/recommendationAgent';

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { customerId, targetCategory, currentProductId } = body;

    const recommendations = await RecommendationAgent.getRecommendations(
      customerId || 'cust_1042',
      targetCategory,
      currentProductId
    );

    return NextResponse.json({ success: true, recommendations });
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
