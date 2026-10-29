'use client';

import React, { useEffect, useState } from 'react';
import { Activity, BrainCircuit, Sparkles, UserCheck, ShieldAlert, CheckCircle2 } from 'lucide-react';
import { store } from '@/lib/db/store';
import { formatINR, formatDate } from '@/lib/utils';
import { AgentAction, CommerceEvent } from '@/types';
import { ExplainabilityDrawer } from '@/components/common/ExplainabilityDrawer';

export default function ActivityDashboardPage() {
  const [actions, setActions] = useState<AgentAction[]>(store.getActions());
  const [events, setEvents] = useState<CommerceEvent[]>(store.getEvents());
  const [selectedAction, setSelectedAction] = useState<AgentAction | null>(null);

  useEffect(() => {
    const unsub = store.subscribe(() => {
      setActions(store.getActions());
      setEvents(store.getEvents());
    });
    return unsub;
  }, []);

  return (
    <div className="space-y-8 font-sans pb-12">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-zinc-200/80 dark:border-zinc-800 pb-5">
        <div>
          <div className="flex items-center gap-2 text-xs font-semibold text-teal-700 dark:text-teal-400 mb-1">
            <Activity className="w-4 h-4" />
            <span>Event Stream & Agent Decisions</span>
          </div>
          <h1 className="text-2xl font-black text-zinc-900 dark:text-zinc-100 tracking-tight">
            Real-Time Agent Activity Timeline
          </h1>
          <p className="text-xs text-zinc-500 mt-0.5">
            Chronological audit of customer events, agent decisions, Razorpay payment links, and revenue attribution.
          </p>
        </div>
      </div>

      {/* Activity Timeline List */}
      <div className="bg-white dark:bg-zinc-900 border border-zinc-200/80 dark:border-zinc-800 rounded-2xl overflow-hidden shadow-subtle">
        <div className="p-4 border-b border-zinc-100 dark:border-zinc-800">
          <h3 className="text-sm font-bold text-zinc-900 dark:text-zinc-100">
            Log Activity Feed
          </h3>
        </div>

        <div className="divide-y divide-zinc-100 dark:divide-zinc-800">
          {actions.map((act) => (
            <div
              key={act.id}
              onClick={() => setSelectedAction(act)}
              className="p-5 flex flex-col md:flex-row md:items-center justify-between gap-4 hover:bg-teal-50/20 transition-colors cursor-pointer group"
            >
              <div className="flex items-start gap-4">
                <div className="p-2.5 rounded-xl bg-teal-50 text-teal-700 shrink-0 mt-0.5">
                  <BrainCircuit className="w-5 h-5 stroke-[2]" />
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <span className="text-xs font-extrabold text-zinc-900 dark:text-zinc-100">
                      {act.title}
                    </span>
                    <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-zinc-100 text-zinc-600">
                      {act.agentName}
                    </span>
                  </div>
                  <p className="text-xs text-zinc-500 mt-1">
                    Customer: <strong>{act.customerName}</strong> • {act.reason}
                  </p>
                </div>
              </div>

              <div className="text-right shrink-0">
                <span className="text-sm font-black text-emerald-600 block">
                  +{formatINR(act.attributedRevenue || act.expectedRevenue)}
                </span>
                <span className="text-[10px] text-zinc-400 font-mono block mt-0.5">
                  {formatDate(act.timestamp)}
                </span>
              </div>
            </div>
          ))}
        </div>
      </div>

      <ExplainabilityDrawer
        action={selectedAction}
        isOpen={!!selectedAction}
        onClose={() => setSelectedAction(null)}
      />
    </div>
  );
}
