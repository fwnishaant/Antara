'use client';

import React, { useEffect, useState } from 'react';
import { LineChart, Sparkles, TrendingUp, Filter, BarChart2, PieChart } from 'lucide-react';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  PieChart as RePieChart,
  Pie,
  Cell,
} from 'recharts';
import { store } from '@/lib/db/store';
import { formatINR } from '@/lib/utils';
import { AnalyticsSummary } from '@/types';

const ATTRIBUTION_BREAKDOWN = [
  { name: 'Accessory Bundles', value: 42800, color: '#0f766e' },
  { name: 'Razorpay Payment Links', value: 31450, color: '#f59e0b' },
  { name: 'Cross-Sell Addons', value: 13070, color: '#6366f1' },
];

export default function AnalyticsDashboardPage() {
  const [analytics, setAnalytics] = useState<AnalyticsSummary>(store.getAnalytics());

  useEffect(() => {
    const unsub = store.subscribe(() => {
      setAnalytics(store.getAnalytics());
    });
    return unsub;
  }, []);

  return (
    <div className="space-y-8 font-sans pb-12">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-zinc-200/80 dark:border-zinc-800 pb-5">
        <div>
          <div className="flex items-center gap-2 text-xs font-semibold text-teal-700 dark:text-teal-400 mb-1">
            <LineChart className="w-4 h-4" />
            <span>Revenue Breakdown & Conversion Metrics</span>
          </div>
          <h1 className="text-2xl font-black text-zinc-900 dark:text-zinc-100 tracking-tight">
            Revenue Analytics & Attribution
          </h1>
          <p className="text-xs text-zinc-500 mt-0.5">
            Deep-dive revenue analysis by AI intervention channel, conversion funnels, and cart recovery rates.
          </p>
        </div>
      </div>

      {/* Attribution Pie Chart & Funnel Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Pie Breakdown */}
        <div className="bg-white dark:bg-zinc-900 border border-zinc-200/80 dark:border-zinc-800 rounded-2xl p-6 shadow-subtle">
          <h3 className="text-base font-bold text-zinc-900 dark:text-zinc-100 mb-1">
            AI Revenue Contribution Channels
          </h3>
          <p className="text-xs text-zinc-500 mb-6">
            Total AI Attributed: {formatINR(analytics.aiAttributedRevenue)}
          </p>

          <div className="h-64 w-full flex items-center justify-center">
            <ResponsiveContainer width="100%" height="100%">
              <RePieChart>
                <Pie
                  data={ATTRIBUTION_BREAKDOWN}
                  cx="50%"
                  cy="50%"
                  innerRadius={60}
                  outerRadius={90}
                  paddingAngle={5}
                  dataKey="value"
                >
                  {ATTRIBUTION_BREAKDOWN.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip formatter={(value: any) => [formatINR(Number(value)), 'Revenue']} />
              </RePieChart>
            </ResponsiveContainer>
          </div>

          <div className="grid grid-cols-3 gap-2 mt-4 text-center">
            {ATTRIBUTION_BREAKDOWN.map((item) => (
              <div key={item.name} className="p-2 rounded-xl bg-zinc-50 dark:bg-zinc-800/40">
                <span className="w-2 h-2 rounded-full inline-block mr-1" style={{ backgroundColor: item.color }} />
                <span className="text-[10px] text-zinc-500 font-bold block">{item.name}</span>
                <span className="text-xs font-black text-zinc-900 dark:text-zinc-100">{formatINR(item.value)}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Funnel conversion stats */}
        <div className="bg-white dark:bg-zinc-900 border border-zinc-200/80 dark:border-zinc-800 rounded-2xl p-6 shadow-subtle flex flex-col justify-between">
          <div>
            <h3 className="text-base font-bold text-zinc-900 dark:text-zinc-100 mb-1">
              Autonomous Conversion Funnel
            </h3>
            <p className="text-xs text-zinc-500 mb-6">
              Conversion progression across intent detection to Razorpay order capture
            </p>

            <div className="space-y-4 text-xs font-sans">
              <div className="p-3.5 rounded-xl bg-zinc-50 dark:bg-zinc-800/40 border border-zinc-200 dark:border-zinc-800">
                <div className="flex justify-between font-bold text-zinc-900 dark:text-zinc-100 mb-1">
                  <span>Storefront Sessions & Search Queries</span>
                  <span>1,842 sessions</span>
                </div>
                <div className="w-full h-2 rounded-full bg-zinc-200 dark:bg-zinc-700">
                  <div className="h-2 rounded-full bg-zinc-900 dark:bg-zinc-100 w-full" />
                </div>
              </div>

              <div className="p-3.5 rounded-xl bg-teal-500/10 border border-teal-500/30">
                <div className="flex justify-between font-bold text-teal-900 dark:text-teal-200 mb-1">
                  <span>AI Intent Decoded & Bundle Offered</span>
                  <span>1,290 interventions</span>
                </div>
                <div className="w-full h-2 rounded-full bg-teal-200 dark:bg-teal-900">
                  <div className="h-2 rounded-full bg-teal-600 w-[70%]" />
                </div>
              </div>

              <div className="p-3.5 rounded-xl bg-amber-500/10 border border-amber-500/30">
                <div className="flex justify-between font-bold text-amber-900 dark:text-amber-200 mb-1">
                  <span>Razorpay Payment Links Deployed</span>
                  <span>246 links</span>
                </div>
                <div className="w-full h-2 rounded-full bg-amber-200 dark:bg-amber-900">
                  <div className="h-2 rounded-full bg-amber-600 w-[35%]" />
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
