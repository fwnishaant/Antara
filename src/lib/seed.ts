/**
 * ANTARA — Database Seed Script
 *
 * This script seeds initial data into a configured Supabase database.
 * In DEMO MODE (no Supabase configured), the application uses the built-in
 * in-memory store which is pre-seeded from data.ts automatically.
 *
 * Usage:
 *   npm run seed
 *
 * Prerequisites:
 *   - SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY must be set in .env.local
 *   - Supabase tables must exist (see README for schema)
 */

import {
  SEEDED_PRODUCTS,
  SEEDED_CUSTOMERS,
  SEEDED_AGENTS,
  SEEDED_ACTIONS,
  SEEDED_ORDERS,
  SEEDED_PAYMENTS,
  SEEDED_CAMPAIGNS,
  SEEDED_OPPORTUNITIES,
  SEEDED_SEGMENTS,
} from './db/data';

const SUPABASE_URL = process.env.SUPABASE_URL || process.env.NEXT_PUBLIC_SUPABASE_URL;
const SUPABASE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.SUPABASE_ANON_KEY;

async function supabaseInsert(table: string, data: any[]) {
  if (!SUPABASE_URL || !SUPABASE_KEY) {
    console.warn(`[SEED] Skipping ${table} — Supabase not configured (DEMO MODE)`);
    return;
  }

  const response = await fetch(`${SUPABASE_URL}/rest/v1/${table}`, {
    method: 'POST',
    headers: {
      apikey: SUPABASE_KEY,
      Authorization: `Bearer ${SUPABASE_KEY}`,
      'Content-Type': 'application/json',
      Prefer: 'resolution=merge-duplicates',
    },
    body: JSON.stringify(data),
  });

  if (!response.ok) {
    const text = await response.text();
    console.error(`[SEED] Failed to seed ${table}: ${response.statusText} — ${text}`);
  } else {
    console.log(`[SEED] ✓ Seeded ${data.length} records into "${table}"`);
  }
}

async function main() {
  console.log('\n🌱 ANTARA Database Seed Script\n');

  if (!SUPABASE_URL || !SUPABASE_KEY) {
    console.log('⚠️  DEMO MODE: No Supabase credentials detected.');
    console.log('   The application uses its built-in in-memory store in demo mode.');
    console.log('   Set SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY in .env.local to enable live database seeding.\n');
    console.log('📦 Seed data ready for:');
    console.log(`   - Products: ${SEEDED_PRODUCTS.length} items`);
    console.log(`   - Customers: ${SEEDED_CUSTOMERS.length} records`);
    console.log(`   - Agents: ${SEEDED_AGENTS.length} agents`);
    console.log(`   - Agent Actions: ${SEEDED_ACTIONS.length} actions`);
    console.log(`   - Orders: ${SEEDED_ORDERS.length} orders`);
    console.log(`   - Payment Transactions: ${SEEDED_PAYMENTS.length} transactions`);
    console.log(`   - Campaigns: ${SEEDED_CAMPAIGNS.length} campaigns`);
    console.log(`   - Growth Opportunities: ${SEEDED_OPPORTUNITIES.length} opportunities`);
    console.log(`   - Customer Segments: ${SEEDED_SEGMENTS.length} segments`);
    return;
  }

  console.log(`🔗 Connected to Supabase: ${SUPABASE_URL}\n`);

  await supabaseInsert('products', SEEDED_PRODUCTS);
  await supabaseInsert('customers', SEEDED_CUSTOMERS);
  await supabaseInsert('agents', SEEDED_AGENTS);
  await supabaseInsert('agent_actions', SEEDED_ACTIONS);
  await supabaseInsert('orders', SEEDED_ORDERS);
  await supabaseInsert('payment_transactions', SEEDED_PAYMENTS);
  await supabaseInsert('campaigns', SEEDED_CAMPAIGNS);
  await supabaseInsert('growth_opportunities', SEEDED_OPPORTUNITIES);
  await supabaseInsert('customer_segments', SEEDED_SEGMENTS);

  console.log('\n✅ Seed complete.\n');
}

main().catch((err) => {
  console.error('Seed failed:', err);
  process.exit(1);
});
