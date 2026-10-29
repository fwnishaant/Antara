'use client';

import React, { useEffect, useState } from 'react';
import { CreditCard, ShieldCheck, AlertCircle, ArrowUpRight, Sparkles } from 'lucide-react';
import { store } from '@/lib/db/store';
import { formatINR, formatDate } from '@/lib/utils';
import { PaymentTransaction } from '@/types';

export default function PaymentsDashboardPage() {
  const [payments, setPayments] = useState<PaymentTransaction[]>(store.getPayments());

  useEffect(() => {
    const unsub = store.subscribe(() => {
      setPayments(store.getPayments());
    });
    return unsub;
  }, []);

  return (
    <div className="space-y-8 font-sans pb-12">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-zinc-200/80 dark:border-zinc-800 pb-5">
        <div>
          <div className="flex items-center gap-2 text-xs font-semibold text-teal-700 dark:text-teal-400 mb-1">
            <CreditCard className="w-4 h-4" />
            <span>Razorpay Gateway Integration & Recovery Audit</span>
          </div>
          <h1 className="text-2xl font-black text-zinc-900 dark:text-zinc-100 tracking-tight">
            Razorpay Transaction Logs
          </h1>
          <p className="text-xs text-zinc-500 mt-0.5">
            Real-time webhook events, payment captures, failure diagnostics, and payment link recoveries.
          </p>
        </div>

        <div className="flex items-center gap-2 font-mono text-xs px-3 py-1.5 rounded-xl bg-teal-50 text-teal-700 border border-teal-200">
          ● Razorpay Webhook Connected
        </div>
      </div>

      {/* Transactions List */}
      <div className="bg-white dark:bg-zinc-900 border border-zinc-200/80 dark:border-zinc-800 rounded-2xl overflow-hidden shadow-subtle">
        <div className="p-4 border-b border-zinc-100 dark:border-zinc-800 flex items-center justify-between">
          <h3 className="text-sm font-bold text-zinc-900 dark:text-zinc-100">
            Payment Event Stream ({payments.length})
          </h3>
        </div>

        <div className="divide-y divide-zinc-100 dark:divide-zinc-800">
          {payments.map((pay) => (
            <div key={pay.id} className="p-5 flex flex-col md:flex-row md:items-center justify-between gap-4">
              <div className="flex items-start gap-3">
                <div
                  className={`p-2.5 rounded-xl shrink-0 mt-0.5 ${
                    pay.status === 'captured'
                      ? 'bg-emerald-50 text-emerald-700'
                      : 'bg-rose-50 text-rose-700'
                  }`}
                >
                  <CreditCard className="w-5 h-5 stroke-[2]" />
                </div>

                <div>
                  <div className="flex items-center gap-2">
                    <span className="font-mono text-xs font-bold text-zinc-900 dark:text-zinc-100">
                      {pay.razorpayPaymentId}
                    </span>
                    <span
                      className={`text-[10px] font-bold uppercase px-2 py-0.5 rounded ${
                        pay.status === 'captured'
                          ? 'bg-emerald-100 text-emerald-800'
                          : 'bg-rose-100 text-rose-800'
                      }`}
                    >
                      {pay.status}
                    </span>
                    {pay.isRecovery && (
                      <span className="text-[10px] font-bold font-mono px-2 py-0.5 rounded bg-amber-100 text-amber-800 flex items-center gap-1">
                        <Sparkles className="w-3 h-3 text-amber-600" />
                        Recovered Payment Link
                      </span>
                    )}
                  </div>

                  <p className="text-xs text-zinc-500 mt-1">
                    Customer: <strong>{pay.customerName}</strong> • Order ID: {pay.razorpayOrderId} • Method: {pay.method.toUpperCase()}
                  </p>

                  {pay.errorDescription && (
                    <p className="text-xs font-mono text-rose-600 mt-1 bg-rose-50 p-2 rounded border border-rose-200">
                      Error [{pay.errorCode}]: {pay.errorDescription}
                    </p>
                  )}
                </div>
              </div>

              <div className="text-right shrink-0">
                <span className="text-base font-black text-zinc-900 dark:text-zinc-100 block">
                  {formatINR(pay.amount)}
                </span>
                <span className="text-[10px] text-zinc-400 font-mono block mt-0.5">
                  {formatDate(pay.createdAt)}
                </span>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
