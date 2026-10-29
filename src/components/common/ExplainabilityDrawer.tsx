'use client';

import React from 'react';
import { X, Sparkles, HelpCircle, CheckCircle2, TrendingUp, ShieldAlert, ArrowUpRight } from 'lucide-react';
import { AgentAction } from '@/types';
import { formatINR, formatDate } from '@/lib/utils';

interface ExplainabilityDrawerProps {
  action: AgentAction | null;
  isOpen: boolean;
  onClose: () => void;
}

export const ExplainabilityDrawer: React.FC<ExplainabilityDrawerProps> = ({
  action,
  isOpen,
  onClose,
}) => {
  if (!isOpen || !action) return null;

  return (
    <div className="fixed inset-0 z-50 overflow-hidden font-sans">
      <div className="absolute inset-0 bg-black/40 backdrop-blur-xs transition-opacity" onClick={onClose} />

      <div className="fixed inset-y-0 right-0 max-w-full flex pl-10">
        <div className="w-screen max-w-md bg-white dark:bg-zinc-900 border-l border-zinc-200 dark:border-zinc-800 shadow-2xl p-6 overflow-y-auto flex flex-col justify-between">
          <div>
            {/* Header */}
            <div className="flex items-center justify-between pb-4 border-b border-zinc-100 dark:border-zinc-800">
              <div className="flex items-center gap-2">
                <div className="p-2 rounded-lg bg-teal-50 text-teal-700 dark:bg-teal-950/60 dark:text-teal-400">
                  <Sparkles className="w-4 h-4 stroke-[2]" />
                </div>
                <div>
                  <h3 className="text-sm font-bold text-zinc-900 dark:text-zinc-100 tracking-tight">
                    AI Decision Explainability
                  </h3>
                  <p className="text-[11px] text-zinc-500 font-mono">Action ID: {action.id}</p>
                </div>
              </div>
              <button
                onClick={onClose}
                className="p-1.5 rounded-lg text-zinc-400 hover:text-zinc-600 hover:bg-zinc-100 transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Main Action Overview */}
            <div className="mt-6 space-y-4">
              <div className="p-4 rounded-xl bg-zinc-50 dark:bg-zinc-800/50 border border-zinc-200 dark:border-zinc-700">
                <span className="text-[10px] font-bold uppercase tracking-wider text-teal-700 dark:text-teal-400">
                  {action.agentName}
                </span>
                <h4 className="text-base font-extrabold text-zinc-900 dark:text-zinc-100 mt-1">
                  {action.title}
                </h4>
                <p className="text-xs text-zinc-600 dark:text-zinc-300 mt-1 leading-relaxed">
                  {action.description}
                </p>
              </div>

              {/* Rationale & Signals */}
              <div className="space-y-3">
                <h5 className="text-xs font-bold text-zinc-900 dark:text-zinc-100 uppercase tracking-wider flex items-center gap-1.5">
                  <HelpCircle className="w-3.5 h-3.5 text-zinc-500" />
                  Why did the agent decide this?
                </h5>

                <div className="p-3.5 rounded-xl bg-amber-500/10 border border-amber-500/20 text-xs text-amber-900 dark:text-amber-200 leading-relaxed font-medium">
                  &ldquo;{action.reason}&rdquo;
                </div>

                <div className="p-4 rounded-xl border border-zinc-200 dark:border-zinc-800 space-y-2">
                  <span className="text-[11px] font-semibold text-zinc-500 block">Observed Behavioral Signals</span>
                  <ul className="space-y-1.5">
                    {action.metadata?.signals?.map((sig: string, idx: number) => (
                      <li key={idx} className="text-xs text-zinc-700 dark:text-zinc-300 flex items-center gap-2">
                        <span className="w-1.5 h-1.5 rounded-full bg-teal-500" />
                        {sig}
                      </li>
                    )) || (
                      <li className="text-xs text-zinc-500">High purchase intent decoded from cart & search history</li>
                    )}
                  </ul>
                </div>
              </div>

              {/* Performance Metrics Grid */}
              <div className="grid grid-cols-2 gap-3 pt-2">
                <div className="p-3 rounded-xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900">
                  <span className="text-[10px] text-zinc-500 font-medium uppercase tracking-wider block">
                    Agent Confidence
                  </span>
                  <span className="text-lg font-black text-teal-600 dark:text-teal-400 mt-0.5 block">
                    {action.confidence}%
                  </span>
                </div>

                <div className="p-3 rounded-xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900">
                  <span className="text-[10px] text-zinc-500 font-medium uppercase tracking-wider block">
                    Expected Revenue
                  </span>
                  <span className="text-lg font-black text-zinc-900 dark:text-zinc-100 mt-0.5 block">
                    {formatINR(action.expectedRevenue)}
                  </span>
                </div>
              </div>

              {/* Result & Attribution */}
              <div className="p-4 rounded-xl bg-emerald-500/10 border border-emerald-500/20 space-y-1">
                <div className="flex items-center justify-between text-xs font-bold text-emerald-800 dark:text-emerald-300">
                  <span className="flex items-center gap-1.5">
                    <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                    Action Status: {action.status.toUpperCase()}
                  </span>
                </div>
                <div className="flex items-center justify-between pt-2 border-t border-emerald-500/20 text-xs">
                  <span className="text-zinc-600 dark:text-zinc-400">Attributed Incremental Revenue:</span>
                  <span className="font-extrabold text-emerald-700 dark:text-emerald-400">
                    {formatINR(action.attributedRevenue || action.expectedRevenue)}
                  </span>
                </div>
              </div>
            </div>
          </div>

          <div className="pt-4 border-t border-zinc-100 dark:border-zinc-800 text-[11px] text-zinc-500 flex items-center justify-between">
            <span>Customer: {action.customerName}</span>
            <span>{formatDate(action.timestamp)}</span>
          </div>
        </div>
      </div>
    </div>
  );
};
