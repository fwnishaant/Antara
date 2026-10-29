'use client';

import React, { useEffect, useState } from 'react';
import {
  BrainCircuit,
  Sparkles,
  TrendingUp,
  ShieldAlert,
  LineChart,
  ShieldCheck,
  CheckCircle2,
  Sliders,
  ArrowRight,
  Info,
} from 'lucide-react';
import { store } from '@/lib/db/store';
import { formatINR } from '@/lib/utils';
import { AgentInfo, SystemSettings } from '@/types';

export default function AgentsDashboardPage() {
  const [agents, setAgents] = useState<AgentInfo[]>(store.getAgents());
  const [settings, setSettings] = useState<SystemSettings>(store.getSettings());
  const [selectedAgent, setSelectedAgent] = useState<AgentInfo | null>(agents[0]);

  useEffect(() => {
    const unsub = store.subscribe(() => {
      setAgents(store.getAgents());
      setSettings(store.getSettings());
    });
    return unsub;
  }, []);

  const handleAutonomyChange = (level: 1 | 2 | 3) => {
    store.updateSettings({ autonomyLevel: level });
  };

  const getAgentIcon = (id: string) => {
    switch (id) {
      case 'intent-agent':
        return BrainCircuit;
      case 'recommendation-agent':
        return Sparkles;
      case 'growth-agent':
        return TrendingUp;
      case 'recovery-agent':
        return ShieldAlert;
      case 'analyst-agent':
        return LineChart;
      default:
        return BrainCircuit;
    }
  };

  return (
    <div className="space-y-8 font-sans pb-12">
      {/* Page Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-zinc-200/80 dark:border-zinc-800 pb-5">
        <div>
          <div className="flex items-center gap-2 text-xs font-semibold text-teal-700 dark:text-teal-400 mb-1">
            <BrainCircuit className="w-4 h-4" />
            <span>Multi-Agent Architecture Monitoring</span>
          </div>
          <h1 className="text-2xl font-black text-zinc-900 dark:text-zinc-100 tracking-tight">
            AI Agent Command Center
          </h1>
          <p className="text-xs text-zinc-500 mt-0.5">
            5 specialized autonomous commerce agents working in unison to maximize merchant revenue.
          </p>
        </div>

        <div className="flex items-center gap-2 font-mono text-xs px-3 py-1.5 rounded-xl bg-teal-50 text-teal-700 border border-teal-200">
          <span className="w-2 h-2 rounded-full bg-teal-500 animate-pulse" />
          5 / 5 Specialized Agents Active
        </div>
      </div>

      {/* Responsible AI Human-in-the-Loop Autonomy Selector */}
      <div className="p-6 rounded-2xl bg-white dark:bg-zinc-900 border border-zinc-200/80 dark:border-zinc-800 shadow-subtle">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h3 className="text-base font-bold text-zinc-900 dark:text-zinc-100 tracking-tight flex items-center gap-2">
              <Sliders className="w-4 h-4 text-teal-600" />
              Responsible AI Autonomy Governance Level
            </h3>
            <p className="text-xs text-zinc-500 mt-0.5">
              Control the boundary between autonomous execution and required human approval
            </p>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {[
            {
              level: 1 as const,
              title: 'Level 1: Recommendation Only',
              desc: 'AI agents calculate decisions & show recommendations in dashboard. No actions execute without manual approval.',
            },
            {
              level: 2 as const,
              title: 'Level 2: Recommend + Merchant Approval',
              desc: 'AI prepares campaigns & Razorpay links automatically. High-value actions require 1-click merchant confirmation.',
            },
            {
              level: 3 as const,
              title: 'Level 3: Full Low-Risk Autonomy',
              desc: 'AI automatically executes low-risk cart recovery & accessory bundles. High-risk campaigns remain gated.',
            },
          ].map((item) => {
            const isSelected = settings.autonomyLevel === item.level;
            return (
              <button
                key={item.level}
                onClick={() => handleAutonomyChange(item.level)}
                className={`p-4 rounded-xl border text-left transition-all ${
                  isSelected
                    ? 'border-teal-600 bg-teal-50/40 dark:bg-teal-950/20 ring-2 ring-teal-500/20'
                    : 'border-zinc-200 dark:border-zinc-800 bg-zinc-50/50 hover:border-zinc-300'
                }`}
              >
                <div className="flex items-center justify-between mb-2">
                  <span className="text-xs font-bold text-zinc-900 dark:text-zinc-100">
                    {item.title}
                  </span>
                  {isSelected && <CheckCircle2 className="w-4 h-4 text-teal-600" />}
                </div>
                <p className="text-xs text-zinc-500 leading-relaxed">{item.desc}</p>
              </button>
            );
          })}
        </div>
      </div>

      {/* Agents Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {agents.map((ag) => {
          const Icon = getAgentIcon(ag.id);
          const isSelected = selectedAgent?.id === ag.id;

          return (
            <div
              key={ag.id}
              onClick={() => setSelectedAgent(ag)}
              className={`p-6 rounded-2xl bg-white dark:bg-zinc-900 border transition-all cursor-pointer shadow-subtle flex flex-col justify-between ${
                isSelected
                  ? 'border-teal-500 ring-2 ring-teal-500/20 scale-[1.01]'
                  : 'border-zinc-200/80 dark:border-zinc-800 hover:border-zinc-400'
              }`}
            >
              <div>
                <div className="flex items-center justify-between mb-4">
                  <div className="p-3 rounded-xl bg-zinc-100 dark:bg-zinc-800 text-zinc-900 dark:text-zinc-100">
                    <Icon className="w-6 h-6 stroke-[2]" />
                  </div>
                  <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-mono font-bold bg-emerald-50 text-emerald-700 border border-emerald-200">
                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                    Active
                  </span>
                </div>

                <h3 className="text-base font-extrabold text-zinc-900 dark:text-zinc-100">
                  {ag.name}
                </h3>
                <span className="text-xs text-teal-700 dark:text-teal-400 font-semibold block mt-0.5">
                  {ag.role}
                </span>

                <p className="text-xs text-zinc-500 mt-3 leading-relaxed">
                  {ag.description}
                </p>
              </div>

              <div className="mt-6 pt-4 border-t border-zinc-100 dark:border-zinc-800 grid grid-cols-3 gap-2 text-center">
                <div>
                  <span className="text-[10px] text-zinc-400 uppercase font-bold block">
                    Confidence
                  </span>
                  <span className="text-sm font-black text-teal-600 mt-0.5 block">
                    {ag.confidence}%
                  </span>
                </div>
                <div>
                  <span className="text-[10px] text-zinc-400 uppercase font-bold block">
                    Decisions
                  </span>
                  <span className="text-sm font-extrabold text-zinc-900 dark:text-zinc-100 mt-0.5 block">
                    {ag.totalDecisions.toLocaleString('en-IN')}
                  </span>
                </div>
                <div>
                  <span className="text-[10px] text-zinc-400 uppercase font-bold block">
                    Attributed Rev
                  </span>
                  <span className="text-sm font-extrabold text-emerald-600 mt-0.5 block">
                    {formatINR(ag.attributedRevenue)}
                  </span>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Selected Agent Specifications Deep Dive */}
      {selectedAgent && (
        <div className="p-6 rounded-2xl bg-zinc-900 text-white border border-zinc-800 shadow-xl">
          <div className="flex items-center justify-between pb-4 border-b border-zinc-800">
            <div>
              <span className="text-xs font-mono text-teal-400 uppercase tracking-widest font-bold">
                Agent Architecture Specs
              </span>
              <h3 className="text-lg font-black mt-0.5">{selectedAgent.name}</h3>
            </div>
            <span className="text-xs font-mono px-3 py-1 rounded-full bg-zinc-800 text-zinc-300">
              Confidence Benchmark: {selectedAgent.confidence}%
            </span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-6">
            <div>
              <span className="text-xs font-bold text-zinc-400 uppercase tracking-wider block mb-2">
                Primary Tool Capability Set
              </span>
              <ul className="space-y-1.5 text-xs text-zinc-300 font-mono">
                <li className="flex items-center gap-2">
                  <span className="w-1.5 h-1.5 rounded-full bg-teal-400" />
                  searchProducts() & getProductDetails()
                </li>
                <li className="flex items-center gap-2">
                  <span className="w-1.5 h-1.5 rounded-full bg-teal-400" />
                  calculateConversionProbability()
                </li>
                <li className="flex items-center gap-2">
                  <span className="w-1.5 h-1.5 rounded-full bg-teal-400" />
                  logAgentAction() & calculateExpectedRevenue()
                </li>
              </ul>
            </div>

            <div>
              <span className="text-xs font-bold text-zinc-400 uppercase tracking-wider block mb-2">
                Input Signals Processed
              </span>
              <p className="text-xs text-zinc-300 leading-relaxed">
                Natural language query semantics, session view duration, cart value tier, historical purchase frequency, price sensitivity, and gateway timeout logs.
              </p>
            </div>

            <div>
              <span className="text-xs font-bold text-zinc-400 uppercase tracking-wider block mb-2">
                Attributed Revenue Contribution
              </span>
              <span className="text-2xl font-black text-emerald-400 block">
                {formatINR(selectedAgent.attributedRevenue)}
              </span>
              <span className="text-xs text-zinc-400 mt-1 block">
                Directly generated across {selectedAgent.totalDecisions} logged decisions
              </span>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
