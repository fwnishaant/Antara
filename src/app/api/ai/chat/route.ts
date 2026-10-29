import { NextRequest, NextResponse } from 'next/server';
import { AgentOrchestrator } from '@/lib/agents/orchestrator';

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { query, customerId, cartItems } = body;

    if (!query || typeof query !== 'string') {
      return NextResponse.json({ error: 'Query parameter is required' }, { status: 400 });
    }

    const result = await AgentOrchestrator.orchestrate(query, customerId, cartItems);
    return NextResponse.json({ success: true, orchestration: result });
  } catch (err: any) {
    return NextResponse.json({ error: err.message || 'Orchestration failed' }, { status: 500 });
  }
}
