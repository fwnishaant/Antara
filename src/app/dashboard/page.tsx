'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import {
  TrendingUp,
  Sparkles,
  DollarSign,
  ShoppingCart,
  Users,
  ShieldCheck,
  ArrowUpRight,
  BrainCircuit,
  AlertCircle,
  Clock,
  ChevronRight,
  ArrowLeft,
} from 'lucide-react';
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from 'recharts';
import { store } from '@/lib/db/store';
import { formatINR, formatTimeAgo } from '@/lib/utils';
import { AgentAction, AnalyticsSummary, GrowthOpportunity } from '@/types';
import { ExplainabilityDrawer } from '@/components/common/ExplainabilityDrawer';
import { AgentFlowDiagram } from '@/components/common/AgentFlowDiagram';

const MOCK_REVENUE_CHART = [
  { day: 'Mon', totalRevenue: 54000, aiAttributed: 9800 },
  { day: 'Tue', totalRevenue: 62000, aiAttributed: 12400 },
  { day: 'Wed', totalRevenue: 78000, aiAttributed: 18900 },
  { day: 'Thu', totalRevenue: 71000, aiAttributed: 14200 },
  { day: 'Fri', totalRevenue: 89000, aiAttributed: 21500 },
  { day: 'Sat', totalRevenue: 94000, aiAttributed: 24800 },
  { day: 'Sun', totalRevenue: 108000, aiAttributed: 31200 },
];

export default function DashboardOverviewPage() {
  const [analytics, setAnalytics] = useState<AnalyticsSummary>(store.getAnalytics());
  const [actions, setActions] = useState<AgentAction[]>(store.getActions());
  const [opportunities, setOpportunities] = useState<GrowthOpportunity[]>(store.getOpportunities());
  const [selectedAction, setSelectedAction] = useState<AgentAction | null>(null);
  const [timeFilter, setTimeFilter] = useState<'7d' | '30d' | '90d'>('7d');

  useEffect(() => {
    const unsub = store.subscribe(() => {
      setAnalytics(store.getAnalytics());
      setActions(store.getActions());
      setOpportunities(store.getOpportunities());
    });
    return unsub;
  }, []);

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 space-y-8 font-sans pb-16">
      {/* Back to ANTARA & Page Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-zinc-200/80 dark:border-zinc-800 pb-5">
        <div className="space-y-1">
          <Link
            href="/"
            className="inline-flex items-center gap-1.5 text-xs font-bold text-zinc-500 hover:text-zinc-900 transition-colors mb-1 group"
          >
            <ArrowLeft className="w-3.5 h-3.5 group-hover:-translate-x-0.5 transition-transform" />
            <span>Back to ANTARA</span>
          </Link>
          <div className="flex items-center gap-2 text-xs font-semibold text-teal-700 dark:text-teal-400">
            <Sparkles className="w-4 h-4 text-teal-600" />
            <span>Autonomous AI Growth Command</span>
          </div>
          <h1 className="text-2xl font-black text-zinc-900 dark:text-zinc-100 tracking-tight">
            Revenue Performance Overview
          </h1>
          <p className="text-xs text-zinc-500">
            Turn every customer interaction into an intelligent growth opportunity.
          </p>
        </div>

        {/* Time Filter Tabs */}
        <div className="flex items-center gap-1.5 bg-white dark:bg-zinc-900 p-1 rounded-xl border border-zinc-200 dark:border-zinc-800 shadow-xs self-start md:self-auto">
          {(['7d', '30d', '90d'] as const).map((filter) => (
            <button
              key={filter}
              onClick={() => setTimeFilter(filter)}
              className={`px-3 py-1 rounded-lg text-xs font-bold transition-all ${
                timeFilter === filter
                  ? 'bg-zinc-900 text-white dark:bg-zinc-100 dark:text-zinc-900'
                  : 'text-zinc-500 hover:text-zinc-900'
              }`}
            >
              {filter.toUpperCase()}
            </button>
          ))}
        </div>
      </div>

      {/* Top Metrics Cards Grid - Visually Stable & Consistent */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-6 gap-4">
        {/* Card 1: Total Revenue */}
        <div className="p-5 rounded-2xl bg-white dark:bg-zinc-900 border border-zinc-200/80 dark:border-zinc-800 shadow-subtle flex flex-col justify-between h-32">
          <div className="flex items-center justify-between text-zinc-500">
            <span className="text-xs font-bold uppercase tracking-wider">Total Revenue</span>
            <DollarSign className="w-4 h-4 text-zinc-400" />
          </div>
          <div>
            <span className="text-xl font-extrabold text-zinc-900 dark:text-zinc-100 block">
              {formatINR(analytics.totalRevenue)}
            </span>
            <div className="flex items-center gap-1 text-[11px] font-semibold text-emerald-600 mt-1">
              <TrendingUp className="w-3.5 h-3.5" />
              <span>+18.4% vs last period</span>
            </div>
          </div>
        </div>

        {/* Card 2: AI-Attributed Revenue */}
        <div className="p-5 rounded-2xl bg-white dark:bg-zinc-900 border border-teal-500/30 dark:border-teal-500/30 shadow-subtle flex flex-col justify-between h-32">
          <div className="flex items-center justify-between text-teal-700 dark:text-teal-400">
            <span className="text-xs font-bold uppercase tracking-wider">AI Revenue</span>
            <Sparkles className="w-4 h-4 text-teal-600" />
          </div>
          <div>
            <span className="text-xl font-black text-teal-950 dark:text-teal-100 block">
              {formatINR(analytics.aiAttributedRevenue)}
            </span>
            <div className="flex items-center gap-1.5 text-[11px] font-bold text-teal-700 dark:text-teal-300 mt-1 font-mono">
              <span>{analytics.aiRevenueContributionPercentage}% total revenue</span>
            </div>
          </div>
        </div>

        {/* Card 3: Conversion Rate */}
        <div className="p-5 rounded-2xl bg-white dark:bg-zinc-900 border border-zinc-200/80 dark:border-zinc-800 shadow-subtle flex flex-col justify-between h-32">
          <div className="flex items-center justify-between text-zinc-500">
            <span className="text-xs font-bold uppercase tracking-wider">Conversion</span>
            <ShoppingCart className="w-4 h-4 text-zinc-400" />
          </div>
          <div>
            <span className="text-xl font-extrabold text-zinc-900 dark:text-zinc-100 block">
              {analytics.conversionRate}%
            </span>
            <div className="flex items-center gap-1 text-[11px] font-semibold text-emerald-600 mt-1">
              <TrendingUp className="w-3.5 h-3.5" />
              <span>+1.4% AI lift</span>
            </div>
          </div>
        </div>

        {/* Card 4: Average Order Value */}
        <div className="p-5 rounded-2xl bg-white dark:bg-zinc-900 border border-zinc-200/80 dark:border-zinc-800 shadow-subtle flex flex-col justify-between h-32">
          <div className="flex items-center justify-between text-zinc-500">
            <span className="text-xs font-bold uppercase tracking-wider">Avg Order (AOV)</span>
            <DollarSign className="w-4 h-4 text-zinc-400" />
          </div>
          <div>
            <span className="text-xl font-extrabold text-zinc-900 dark:text-zinc-100 block">
              {formatINR(analytics.averageOrderValue)}
            </span>
            <div className="flex items-center gap-1 text-[11px] font-semibold text-emerald-600 mt-1">
              <span>+₹499 bundle lift</span>
            </div>
          </div>
        </div>

        {/* Card 5: Recovered Revenue */}
        <div className="p-5 rounded-2xl bg-white dark:bg-zinc-900 border border-amber-500/30 dark:border-amber-500/30 shadow-subtle flex flex-col justify-between h-32">
          <div className="flex items-center justify-between text-amber-800 dark:text-amber-300">
            <span className="text-xs font-bold uppercase tracking-wider">Recovered Rev</span>
            <ShieldCheck className="w-4 h-4 text-amber-600" />
          </div>
          <div>
            <span className="text-xl font-black text-amber-950 dark:text-amber-100 block">
              {formatINR(analytics.recoveredRevenue)}
            </span>
            <div className="text-[11px] font-semibold text-amber-700 dark:text-amber-300 mt-1">
              246 payment links
            </div>
          </div>
        </div>

        {/* Card 6: Active AI Agents */}
        <div className="p-5 rounded-2xl bg-white dark:bg-zinc-900 border border-zinc-200/80 dark:border-zinc-800 shadow-subtle flex flex-col justify-between h-32">
          <div className="flex items-center justify-between text-zinc-500">
            <span className="text-xs font-bold uppercase tracking-wider">Active Agents</span>
            <BrainCircuit className="w-4 h-4 text-teal-600" />
          </div>
          <div>
            <span className="text-xl font-extrabold text-zinc-900 dark:text-zinc-100 block">
              {analytics.activeAgentsCount} / 5
            </span>
            <div className="flex items-center gap-1 text-[11px] font-semibold text-teal-600 mt-1">
              <span className="w-2 h-2 rounded-full bg-teal-500" />
              <span>100% active</span>
            </div>
          </div>
        </div>
      </div>

      {/* Interactive Agent Architecture Diagram */}
      <AgentFlowDiagram activeStepId="growth" />

      {/* Main Revenue Chart & Growth Opportunities Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Revenue Trend Chart */}
        <div className="lg:col-span-2 bg-white dark:bg-zinc-900 border border-zinc-200/80 dark:border-zinc-800 rounded-2xl p-6 shadow-subtle">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h3 className="text-base font-bold text-zinc-900 dark:text-zinc-100 tracking-tight">
                Revenue & AI Contribution Trend
              </h3>
              <p className="text-xs text-zinc-500">
                Comparing total revenue against incremental AI-attributed sales
              </p>
            </div>
            <div className="flex items-center gap-4 text-xs font-medium">
              <div className="flex items-center gap-1.5">
                <span className="w-3 h-3 rounded-full bg-zinc-900 dark:bg-zinc-100" />
                <span>Total Revenue</span>
              </div>
              <div className="flex items-center gap-1.5">
                <span className="w-3 h-3 rounded-full bg-teal-500" />
                <span>AI Revenue</span>
              </div>
            </div>
          </div>

          <div className="h-72 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={MOCK_REVENUE_CHART} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                <defs>
                  <linearGradient id="colorTotal" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#18181b" stopOpacity={0.15} />
                    <stop offset="95%" stopColor="#18181b" stopOpacity={0} />
                  </linearGradient>
                  <linearGradient id="colorAi" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#0f766e" stopOpacity={0.3} />
                    <stop offset="95%" stopColor="#0f766e" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                <XAxis dataKey="day" axisLine={false} tickLine={false} tick={{ fontSize: 12, fill: '#64748b' }} />
                <YAxis axisLine={false} tickLine={false} tick={{ fontSize: 12, fill: '#64748b' }} tickFormatter={(v) => `₹${v / 1000}k`} />
                <Tooltip
                  formatter={(value: any) => [formatINR(Number(value)), '']}
                  contentStyle={{ borderRadius: '12px', borderColor: '#e2e8f0', boxShadow: '0 4px 12px rgba(0,0,0,0.05)' }}
                />
                <Area type="monotone" dataKey="totalRevenue" stroke="#18181b" strokeWidth={2.5} fillOpacity={1} fill="url(#colorTotal)" />
                <Area type="monotone" dataKey="aiAttributed" stroke="#0f766e" strokeWidth={2.5} fillOpacity={1} fill="url(#colorAi)" />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* AI Growth Opportunities Panel */}
        <div className="bg-white dark:bg-zinc-900 border border-zinc-200/80 dark:border-zinc-800 rounded-2xl p-6 shadow-subtle flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between mb-4 pb-3 border-b border-zinc-100 dark:border-zinc-800">
              <h3 className="text-base font-bold text-zinc-900 dark:text-zinc-100 tracking-tight flex items-center gap-2">
                <Sparkles className="w-4 h-4 text-teal-600" />
                AI Growth Opportunities
              </h3>
              <span className="text-[10px] font-mono font-bold px-2 py-0.5 rounded bg-teal-50 text-teal-700 border border-teal-200">
                Live Data Rules
              </span>
            </div>

            <div className="space-y-3">
              {opportunities.map((opp) => (
                <div
                  key={opp.id}
                  className="p-3.5 rounded-xl bg-zinc-50 dark:bg-zinc-800/40 border border-zinc-200 dark:border-zinc-700/60 hover:border-teal-400 transition-all"
                >
                  <div className="flex items-center justify-between text-xs">
                    <span
                      className={`font-extrabold uppercase text-[10px] px-2 py-0.5 rounded ${
                        opp.priority === 'high'
                          ? 'bg-rose-100 text-rose-700'
                          : 'bg-amber-100 text-amber-700'
                      }`}
                    >
                      {opp.priority} Priority
                    </span>
                    <span className="font-extrabold text-teal-700 dark:text-teal-400">
                      +{formatINR(opp.potentialRevenue)}
                    </span>
                  </div>

                  <p className="text-xs font-bold text-zinc-900 dark:text-zinc-100 mt-2 leading-snug">
                    {opp.title}
                  </p>

                  <p className="text-[11px] text-zinc-500 mt-1 leading-relaxed">
                    {opp.recommendedAction}
                  </p>
                </div>
              ))}
            </div>
          </div>

          <button
            onClick={() => (window.location.href = '/dashboard/campaigns')}
            className="mt-4 w-full py-2 px-4 rounded-xl bg-zinc-900 hover:bg-zinc-800 text-white font-bold text-xs flex items-center justify-center gap-1.5 transition-colors shadow-xs"
          >
            Execute Growth Campaigns
            <ArrowUpRight className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>

      {/* Recent AI Activity & Decision Explainability Stream */}
      <div className="bg-white dark:bg-zinc-900 border border-zinc-200/80 dark:border-zinc-800 rounded-2xl p-6 shadow-subtle">
        <div className="flex items-center justify-between mb-6 pb-4 border-b border-zinc-100 dark:border-zinc-800">
          <div>
            <h3 className="text-base font-bold text-zinc-900 dark:text-zinc-100 tracking-tight flex items-center gap-2">
              <BrainCircuit className="w-4 h-4 text-teal-600" />
              Live AI Agent Decisions & Actions
            </h3>
            <p className="text-xs text-zinc-500">
              Click any agent decision to inspect the "Why this action?" details drawer
            </p>
          </div>

          <button
            onClick={() => (window.location.href = '/dashboard/activity')}
            className="text-xs font-bold text-teal-700 hover:underline flex items-center gap-1"
          >
            View Full Timeline →
          </button>
        </div>

        <div className="space-y-3">
          {actions.slice(0, 4).map((act) => (
            <div
              key={act.id}
              onClick={() => setSelectedAction(act)}
              className="p-4 rounded-xl border border-zinc-200 dark:border-zinc-800 hover:border-teal-500 bg-white dark:bg-zinc-900 hover:bg-teal-50/20 transition-all cursor-pointer flex flex-col sm:flex-row sm:items-center justify-between gap-3 group"
            >
              <div className="flex items-start gap-3">
                <div className="p-2 rounded-lg bg-teal-50 dark:bg-teal-950/60 text-teal-700 shrink-0 mt-0.5">
                  <BrainCircuit className="w-4 h-4 stroke-[2]" />
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <span className="text-xs font-bold text-zinc-900 dark:text-zinc-100">
                      {act.title}
                    </span>
                    <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-zinc-100 text-zinc-600">
                      {act.agentName}
                    </span>
                  </div>
                  <p className="text-xs text-zinc-500 mt-1 line-clamp-1">
                    Customer: {act.customerName} • {act.reason}
                  </p>
                </div>
              </div>

              <div className="flex items-center justify-between sm:justify-end gap-4 shrink-0">
                <div className="text-right">
                  <span className="text-xs font-extrabold text-emerald-600 block">
                    +{formatINR(act.attributedRevenue || act.expectedRevenue)}
                  </span>
                  <span className="text-[10px] text-zinc-400 font-mono">
                    {act.confidence}% confidence
                  </span>
                </div>
                <ChevronRight className="w-4 h-4 text-zinc-400 group-hover:translate-x-0.5 transition-transform" />
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Explainability Drawer */}
      <ExplainabilityDrawer
        action={selectedAction}
        isOpen={!!selectedAction}
        onClose={() => setSelectedAction(null)}
      />
    </div>
  );
}
