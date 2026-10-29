'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { Terminal, Play, AlertTriangle, RotateCcw, Sparkles, CheckCircle2, LayoutDashboard, ArrowRight } from 'lucide-react';
import { store } from '@/lib/db/store';
import { DemoScenarioRunner } from '@/lib/demo/scenario';
import { Navbar } from '@/components/layout/Navbar';

export default function DemoControlPanelPage() {
  const [logs, setLogs] = useState<string[]>([
    'ANTARA Demo Control Panel initialized.',
    'System operating mode: AI Demo Mode (Zero-config deterministic fallback + Razorpay Test Mode)',
  ]);
  const [isRunning, setIsRunning] = useState(false);

  const addLog = (msg: string) => {
    setLogs((prev) => [`[${new Date().toLocaleTimeString('en-IN')}] ${msg}`, ...prev]);
  };

  const handleRunGrowthScenario = async () => {
    setIsRunning(true);
    addLog('Starting 7-Step AI Growth Scenario...');
    await DemoScenarioRunner.runGrowthDemo((step) => {
      addLog(`Step ${step.stepIndex}/${step.totalSteps}: ${step.title} (${step.agentName})`);
    });
    addLog('AI Growth Scenario Completed! Incremental revenue attributed to Merchant Dashboard.');
    setIsRunning(false);
  };

  const handleRunRecoveryScenario = async () => {
    setIsRunning(true);
    addLog('Starting 5-Step Payment Failure & Recovery Scenario...');
    await DemoScenarioRunner.runRecoveryDemo((step) => {
      addLog(`Step ${step.stepIndex}/${step.totalSteps}: ${step.title}`);
    });
    addLog('Payment Recovery Scenario Completed! Recovered Revenue metric updated.');
    setIsRunning(false);
  };

  const handleResetData = () => {
    store.resetDemoData();
    addLog('Demo state reset to initial seed values (30 products, 50 customers, 100+ events).');
  };

  return (
    <div className="min-h-screen bg-[#faf9f6] text-[#111318] font-sans pb-16">
      <Navbar />

      <main className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
        <div className="flex items-center justify-between border-b border-zinc-200 pb-4">
          <div>
            <div className="flex items-center gap-2 text-xs font-semibold text-amber-700 mb-1">
              <Terminal className="w-4 h-4" />
              <span>Developer & Judge Demo Control Center</span>
            </div>
            <h1 className="text-2xl font-black text-zinc-900 tracking-tight">
              Guided Scenario Simulator
            </h1>
            <p className="text-xs text-zinc-500 mt-0.5">
              Instantly trigger complete agentic commerce workflows for live investor & judge demonstrations.
            </p>
          </div>

          <Link
            href="/dashboard"
            className="px-4 py-2 rounded-xl bg-teal-700 hover:bg-teal-800 text-white font-bold text-xs flex items-center gap-1.5 shadow-sm"
          >
            <LayoutDashboard className="w-3.5 h-3.5" />
            Open Merchant Dashboard
          </Link>
        </div>

        {/* Demo Triggers Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="p-6 rounded-2xl bg-white border border-zinc-200/80 shadow-subtle flex flex-col justify-between space-y-4">
            <div>
              <span className="text-xs font-mono font-bold uppercase tracking-wider text-teal-700 bg-teal-50 px-2.5 py-0.5 rounded border border-teal-200">
                Primary Demo Scenario 1
              </span>
              <h3 className="text-base font-extrabold text-zinc-900 mt-2">
                Run AI Growth Flow
              </h3>
              <p className="text-xs text-zinc-500 leading-relaxed mt-1">
                Walks through search intent → product recommendation → cart bundle cross-sell → Razorpay checkout → revenue attribution.
              </p>
            </div>

            <button
              onClick={handleRunGrowthScenario}
              disabled={isRunning}
              className="w-full py-3 px-4 rounded-xl bg-teal-700 hover:bg-teal-800 text-white font-extrabold text-xs flex items-center justify-center gap-2 shadow-sm transition-all disabled:opacity-50"
            >
              <Play className="w-3.5 h-3.5 fill-current" />
              Run Growth Scenario (60s)
            </button>
          </div>

          <div className="p-6 rounded-2xl bg-white border border-zinc-200/80 shadow-subtle flex flex-col justify-between space-y-4">
            <div>
              <span className="text-xs font-mono font-bold uppercase tracking-wider text-amber-800 bg-amber-50 px-2.5 py-0.5 rounded border border-amber-200">
                Primary Demo Scenario 2
              </span>
              <h3 className="text-base font-extrabold text-zinc-900 mt-2">
                Simulate Payment Failure & Recovery
              </h3>
              <p className="text-xs text-zinc-500 leading-relaxed mt-1">
                Simulates checkout payment failure → Recovery Agent trigger → Razorpay Payment Link generation → payment recovery completion.
              </p>
            </div>

            <button
              onClick={handleRunRecoveryScenario}
              disabled={isRunning}
              className="w-full py-3 px-4 rounded-xl bg-amber-600 hover:bg-amber-700 text-white font-extrabold text-xs flex items-center justify-center gap-2 shadow-sm transition-all disabled:opacity-50"
            >
              <AlertTriangle className="w-3.5 h-3.5" />
              Simulate Failed Payment
            </button>
          </div>

          <div className="p-6 rounded-2xl bg-white border border-zinc-200/80 shadow-subtle flex flex-col justify-between space-y-4">
            <div>
              <span className="text-xs font-mono font-bold uppercase tracking-wider text-zinc-600 bg-zinc-100 px-2.5 py-0.5 rounded">
                Reset Utility
              </span>
              <h3 className="text-base font-extrabold text-zinc-900 mt-2">
                Reset Demo Data State
              </h3>
              <p className="text-xs text-zinc-500 leading-relaxed mt-1">
                Restores store data to initial seeded baseline (30 products, 50 customers, 100+ events).
              </p>
            </div>

            <button
              onClick={handleResetData}
              disabled={isRunning}
              className="w-full py-3 px-4 rounded-xl border border-zinc-300 hover:bg-zinc-100 text-zinc-800 font-extrabold text-xs flex items-center justify-center gap-2 transition-all disabled:opacity-50"
            >
              <RotateCcw className="w-3.5 h-3.5" />
              Reset All Seed Data
            </button>
          </div>
        </div>

        {/* Live Execution Terminal Log */}
        <div className="rounded-2xl bg-zinc-950 text-zinc-100 border border-zinc-800 p-6 shadow-2xl space-y-3 font-mono">
          <div className="flex items-center justify-between pb-3 border-b border-zinc-800 text-xs">
            <span className="text-teal-400 font-bold flex items-center gap-2">
              <Terminal className="w-4 h-4" />
              Execution Output Stream Log
            </span>
            <span className="text-zinc-500 text-[10px]">Real-Time Diagnostics</span>
          </div>

          <div className="h-48 overflow-y-auto space-y-1.5 text-xs text-zinc-300">
            {logs.map((log, idx) => (
              <div key={idx} className="leading-relaxed">
                {log}
              </div>
            ))}
          </div>
        </div>
      </main>
    </div>
  );
}
