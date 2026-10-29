'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { Play, RotateCcw, AlertTriangle, ShieldCheck, Sparkles } from 'lucide-react';
import { store } from '@/lib/db/store';
import { DemoScenarioRunner } from '@/lib/demo/scenario';

export const DemoBanner: React.FC = () => {
  const [isRunningDemo, setIsRunningDemo] = useState(false);
  const [statusMsg, setStatusMsg] = useState('');

  const handleRunGrowthDemo = async () => {
    setIsRunningDemo(true);
    setStatusMsg('Running AI Growth Scenario...');
    await DemoScenarioRunner.runGrowthDemo((step) => {
      setStatusMsg(`Step ${step.stepIndex}/${step.totalSteps}: ${step.title} (${step.agentName})`);
    });
    setStatusMsg('Scenario Complete! Dashboard metrics updated.');
    setTimeout(() => {
      setIsRunningDemo(false);
      setStatusMsg('');
    }, 4000);
  };

  const handleRunRecoveryDemo = async () => {
    setIsRunningDemo(true);
    setStatusMsg('Simulating Payment Failure & Recovery...');
    await DemoScenarioRunner.runRecoveryDemo((step) => {
      setStatusMsg(`Step ${step.stepIndex}/${step.totalSteps}: ${step.title}`);
    });
    setStatusMsg('Payment Recovery Complete! Recovered Revenue updated.');
    setTimeout(() => {
      setIsRunningDemo(false);
      setStatusMsg('');
    }, 4000);
  };

  const handleResetData = () => {
    store.resetDemoData();
    setStatusMsg('Demo Data Reset to Initial Seed State');
    setTimeout(() => setStatusMsg(''), 3000);
  };

  return (
    <div className="bg-zinc-900 text-zinc-100 px-4 py-2 text-xs border-b border-zinc-800 flex flex-wrap items-center justify-between gap-3 font-sans">
      <div className="flex items-center gap-2">
        <span className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded-full bg-teal-500/10 text-teal-400 font-medium border border-teal-500/20">
          <Sparkles className="w-3 h-3" />
          AI Demo Mode Active
        </span>
        <span className="hidden sm:inline text-zinc-400">
          Zero-config deterministic AI & Razorpay test simulation
        </span>
      </div>

      {statusMsg && (
        <div className="text-amber-400 font-mono font-medium animate-pulse text-xs">
          {statusMsg}
        </div>
      )}

      <div className="flex items-center gap-2">
        <button
          onClick={handleRunGrowthDemo}
          disabled={isRunningDemo}
          className="inline-flex items-center gap-1 px-2.5 py-1 rounded bg-teal-600 hover:bg-teal-500 text-white font-medium transition-colors disabled:opacity-50"
        >
          <Play className="w-3 h-3 fill-current" />
          Run Growth Demo
        </button>

        <button
          onClick={handleRunRecoveryDemo}
          disabled={isRunningDemo}
          className="inline-flex items-center gap-1 px-2.5 py-1 rounded bg-amber-600/90 hover:bg-amber-500 text-white font-medium transition-colors disabled:opacity-50"
        >
          <AlertTriangle className="w-3 h-3" />
          Simulate Payment Failure
        </button>

        <button
          onClick={handleResetData}
          title="Reset Demo Data"
          className="p-1 rounded bg-zinc-800 hover:bg-zinc-700 text-zinc-400 hover:text-zinc-200 transition-colors"
        >
          <RotateCcw className="w-3.5 h-3.5" />
        </button>

        <Link
          href="/demo"
          className="underline text-zinc-400 hover:text-white transition-colors ml-1"
        >
          Control Panel →
        </Link>
      </div>
    </div>
  );
};
