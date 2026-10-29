'use client';

import React, { useEffect, useState } from 'react';
import { Settings, ShieldCheck, Sliders, Key, CreditCard, Sparkles, RefreshCw } from 'lucide-react';
import { store } from '@/lib/db/store';
import { SystemSettings } from '@/types';

export default function SettingsDashboardPage() {
  const [settings, setSettings] = useState<SystemSettings>(store.getSettings());
  const [savedMsg, setSavedMsg] = useState('');

  useEffect(() => {
    const unsub = store.subscribe(() => {
      setSettings(store.getSettings());
    });
    return unsub;
  }, []);

  const handleToggleMode = () => {
    const newMode = settings.aiMode === 'demo' ? 'live' : 'demo';
    store.updateSettings({ aiMode: newMode });
    setSavedMsg(`Switched to ${newMode.toUpperCase()} mode`);
    setTimeout(() => setSavedMsg(''), 3000);
  };

  const handleAutonomyChange = (level: 1 | 2 | 3) => {
    store.updateSettings({ autonomyLevel: level });
    setSavedMsg(`Autonomy set to Level ${level}`);
    setTimeout(() => setSavedMsg(''), 3000);
  };

  return (
    <div className="space-y-8 font-sans pb-12 max-w-4xl">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-zinc-200/80 dark:border-zinc-800 pb-5">
        <div>
          <div className="flex items-center gap-2 text-xs font-semibold text-teal-700 dark:text-teal-400 mb-1">
            <Settings className="w-4 h-4" />
            <span>Platform Configuration & API Governance</span>
          </div>
          <h1 className="text-2xl font-black text-zinc-900 dark:text-zinc-100 tracking-tight">
            ANTARA Settings & Credentials
          </h1>
          <p className="text-xs text-zinc-500 mt-0.5">
            Configure AI execution mode, governance levels, Razorpay keys, and webhook integration endpoints.
          </p>
        </div>

        {savedMsg && (
          <span className="text-xs font-mono font-bold text-teal-600 bg-teal-50 px-3 py-1 rounded-lg border border-teal-200">
            {savedMsg}
          </span>
        )}
      </div>

      {/* AI Operating Mode */}
      <div className="p-6 rounded-2xl bg-white dark:bg-zinc-900 border border-zinc-200/80 dark:border-zinc-800 shadow-subtle space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="text-base font-bold text-zinc-900 dark:text-zinc-100 flex items-center gap-2">
              <Sparkles className="w-4 h-4 text-teal-600" />
              AI Agent Execution Mode
            </h3>
            <p className="text-xs text-zinc-500 mt-0.5">
              Switch between zero-config deterministic AI demo engine and live Gemini/OpenAI API mode
            </p>
          </div>

          <button
            onClick={handleToggleMode}
            className={`px-4 py-2 rounded-xl text-xs font-bold font-mono transition-all flex items-center gap-2 ${
              settings.aiMode === 'demo'
                ? 'bg-amber-500 text-white shadow-xs'
                : 'bg-teal-700 text-white shadow-xs'
            }`}
          >
            <RefreshCw className="w-3.5 h-3.5" />
            Mode: {settings.aiMode.toUpperCase()}
          </button>
        </div>
      </div>

      {/* Integration Credentials Status */}
      <div className="p-6 rounded-2xl bg-white dark:bg-zinc-900 border border-zinc-200/80 dark:border-zinc-800 shadow-subtle space-y-4">
        <h3 className="text-base font-bold text-zinc-900 dark:text-zinc-100 flex items-center gap-2">
          <Key className="w-4 h-4 text-teal-600" />
          Integration Credentials & Health Status
        </h3>

        <div className="space-y-3 text-xs">
          <div className="p-4 rounded-xl border border-zinc-200 dark:border-zinc-800 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <CreditCard className="w-5 h-5 text-teal-600" />
              <div>
                <span className="font-bold text-zinc-900 dark:text-zinc-100 block">
                  Razorpay Integration (Test Mode)
                </span>
                <span className="text-zinc-500 font-mono text-[11px]">
                  Key ID: rzp_test_antara_demo_key
                </span>
              </div>
            </div>
            <span className="px-2.5 py-1 rounded-full bg-emerald-50 text-emerald-700 font-mono font-bold text-[11px] border border-emerald-200">
              ● Connected (Test Simulator Active)
            </span>
          </div>

          <div className="p-4 rounded-xl border border-zinc-200 dark:border-zinc-800 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <Sparkles className="w-5 h-5 text-indigo-600" />
              <div>
                <span className="font-bold text-zinc-900 dark:text-zinc-100 block">
                  LLM Provider Credentials
                </span>
                <span className="text-zinc-500 font-mono text-[11px]">
                  Gemini / OpenAI API Key Status
                </span>
              </div>
            </div>
            <span className="px-2.5 py-1 rounded-full bg-amber-50 text-amber-700 font-mono font-bold text-[11px] border border-amber-200">
              ● Demo Fallback Active (Zero Config)
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}
