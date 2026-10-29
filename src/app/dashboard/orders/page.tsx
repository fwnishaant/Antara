'use client';

import React, { useEffect, useState } from 'react';
import { ShoppingBag, CheckCircle2, AlertTriangle, Sparkles, CreditCard, ArrowUpRight } from 'lucide-react';
import { store } from '@/lib/db/store';
import { formatINR, formatDate } from '@/lib/utils';
import { Order } from '@/types';

export default function OrdersDashboardPage() {
  const [orders, setOrders] = useState<Order[]>(store.getOrders());

  useEffect(() => {
    const unsub = store.subscribe(() => {
      setOrders(store.getOrders());
    });
    return unsub;
  }, []);

  return (
    <div className="space-y-8 font-sans pb-12">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-zinc-200/80 dark:border-zinc-800 pb-5">
        <div>
          <div className="flex items-center gap-2 text-xs font-semibold text-teal-700 dark:text-teal-400 mb-1">
            <ShoppingBag className="w-4 h-4" />
            <span>Commerce Order Audit & Attribution</span>
          </div>
          <h1 className="text-2xl font-black text-zinc-900 dark:text-zinc-100 tracking-tight">
            Merchant Order Stream
          </h1>
          <p className="text-xs text-zinc-500 mt-0.5">
            Audit customer orders, Razorpay payment verification statuses, and AI revenue attribution tags.
          </p>
        </div>
      </div>

      {/* Orders Table */}
      <div className="bg-white dark:bg-zinc-900 border border-zinc-200/80 dark:border-zinc-800 rounded-2xl overflow-hidden shadow-subtle">
        <div className="p-4 border-b border-zinc-100 dark:border-zinc-800 flex items-center justify-between">
          <h3 className="text-sm font-bold text-zinc-900 dark:text-zinc-100">
            Total Logged Orders ({orders.length})
          </h3>
        </div>

        <div className="divide-y divide-zinc-100 dark:divide-zinc-800">
          {orders.map((ord) => (
            <div key={ord.id} className="p-5 flex flex-col md:flex-row md:items-center justify-between gap-4">
              <div>
                <div className="flex items-center gap-3">
                  <span className="font-mono font-extrabold text-sm text-zinc-900 dark:text-zinc-100">
                    {ord.orderNumber}
                  </span>
                  <span
                    className={`text-[10px] font-bold uppercase px-2 py-0.5 rounded-full ${
                      ord.status === 'completed'
                        ? 'bg-emerald-100 text-emerald-800'
                        : ord.status === 'recovered'
                        ? 'bg-amber-100 text-amber-800'
                        : 'bg-rose-100 text-rose-800'
                    }`}
                  >
                    ● {ord.status}
                  </span>

                  {ord.isAiAttributed && (
                    <span className="text-[10px] font-bold font-mono px-2 py-0.5 rounded bg-teal-50 text-teal-700 border border-teal-200 flex items-center gap-1">
                      <Sparkles className="w-3 h-3 text-teal-600" />
                      AI Attributed ({ord.attributionType})
                    </span>
                  )}
                </div>

                <div className="text-xs text-zinc-500 mt-1.5 flex flex-wrap items-center gap-3">
                  <span>Customer: <strong className="text-zinc-700 dark:text-zinc-300">{ord.customerName}</strong></span>
                  <span>•</span>
                  <span>Method: {ord.paymentMethod}</span>
                  <span>•</span>
                  <span>Date: {formatDate(ord.createdAt)}</span>
                </div>

                <div className="mt-2 text-xs text-zinc-600 dark:text-zinc-400">
                  Items: {ord.items.map((i) => `${i.product.name} (x${i.quantity})`).join(', ')}
                </div>
              </div>

              <div className="text-right shrink-0">
                <span className="text-lg font-black text-zinc-900 dark:text-zinc-100 block">
                  {formatINR(ord.totalAmount)}
                </span>
                {ord.aiInfluencedAmount > 0 && (
                  <span className="text-xs font-bold text-emerald-600 block mt-0.5">
                    +{formatINR(ord.aiInfluencedAmount)} AI Lift
                  </span>
                )}
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
