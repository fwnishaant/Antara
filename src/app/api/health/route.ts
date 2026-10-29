import { NextResponse } from 'next/server';
import { store } from '@/lib/db/store';

export async function GET() {
  const settings = store.getSettings();
  const analytics = store.getAnalytics();

  return NextResponse.json({
    status: 'ok',
    timestamp: new Date().toISOString(),
    version: '1.0.0',
    application: 'ANTARA — Autonomous AI Agentic Commerce Platform',
    mode: {
      demo: process.env.DEMO_MODE === 'true',
      ai: process.env.AI_MODE || 'demo',
      razorpayLive: !!(
        process.env.RAZORPAY_KEY_ID &&
        !process.env.RAZORPAY_KEY_ID.includes('demo') &&
        process.env.RAZORPAY_KEY_ID.startsWith('rzp_')
      ),
      llmConnected: !!(process.env.GEMINI_API_KEY || process.env.OPENAI_API_KEY),
      supabaseConnected: !!(process.env.NEXT_PUBLIC_SUPABASE_URL && process.env.SUPABASE_SERVICE_ROLE_KEY),
    },
    store: {
      products: store.getProducts().length,
      customers: store.getCustomers().length,
      orders: store.getOrders().length,
      agents: store.getAgents().length,
      totalRevenue: analytics.totalRevenue,
      aiAttributedRevenue: analytics.aiAttributedRevenue,
    },
  });
}
