'use client';

import React, { Suspense } from 'react';
import Link from 'next/link';
import { useSearchParams } from 'next/navigation';
import { CheckCircle2, Sparkles, ShoppingBag, LayoutDashboard } from 'lucide-react';
import { Navbar } from '@/components/layout/Navbar';

function OrderSuccessContent() {
  const searchParams = useSearchParams();
  const orderId = searchParams?.get('orderId') || 'ord_demo_901';

  return (
    <div className="space-y-6">
      <div className="w-16 h-16 rounded-full bg-emerald-100 text-emerald-600 flex items-center justify-center mx-auto shadow-md">
        <CheckCircle2 className="w-10 h-10 stroke-[2.5]" />
      </div>

      <h1 className="text-3xl font-black text-zinc-900 tracking-tight">
        Payment Authorized & Order Confirmed!
      </h1>

      <p className="text-xs text-zinc-500 max-w-md mx-auto leading-relaxed">
        Your payment was processed securely via Razorpay. Order reference: <strong className="font-mono text-zinc-800">{orderId}</strong>
      </p>

      {/* AI Revenue Attribution Badge */}
      <div className="p-4 rounded-2xl bg-teal-500/10 border border-teal-500/30 text-teal-950 text-xs text-left space-y-1 max-w-md mx-auto">
        <div className="flex items-center gap-1.5 font-bold text-teal-800 font-mono">
          <Sparkles className="w-4 h-4 text-teal-600" />
          AI Revenue Attribution Logged
        </div>
        <p className="text-[11px] text-teal-900 leading-relaxed font-medium">
          This transaction was influenced by ANTARA autonomous growth agents. Incremental revenue has been attributed to the merchant dashboard in real time!
        </p>
      </div>

      <div className="flex flex-col sm:flex-row items-center justify-center gap-3 pt-4">
        <Link
          href="/shop"
          className="w-full sm:w-auto px-6 py-3 rounded-xl bg-zinc-900 hover:bg-zinc-800 text-white font-bold text-xs flex items-center justify-center gap-2 shadow-sm"
        >
          <ShoppingBag className="w-4 h-4" />
          Continue Shopping
        </Link>

        <Link
          href="/dashboard"
          className="w-full sm:w-auto px-6 py-3 rounded-xl bg-teal-700 hover:bg-teal-800 text-white font-bold text-xs flex items-center justify-center gap-2 shadow-sm"
        >
          <LayoutDashboard className="w-4 h-4" />
          View Merchant Dashboard Impact
        </Link>
      </div>
    </div>
  );
}

export default function OrderSuccessPage() {
  return (
    <div className="min-h-screen bg-[#faf9f6] text-[#111318] font-sans pb-16">
      <Navbar />

      <main className="max-w-2xl mx-auto px-4 py-16 text-center">
        <Suspense fallback={<div className="text-xs font-mono text-zinc-500 animate-pulse">Loading order confirmation...</div>}>
          <OrderSuccessContent />
        </Suspense>
      </main>
    </div>
  );
}
