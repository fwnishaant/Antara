'use client';

import React from 'react';
import Link from 'next/link';
import {
  Sparkles,
  ArrowRight,
  ShieldCheck,
  BrainCircuit,
  TrendingUp,
  CreditCard,
  LineChart,
  ShoppingBag,
  Zap,
  CheckCircle2,
  Lock,
} from 'lucide-react';
import { Logo } from '@/components/common/Logo';
import { Navbar } from '@/components/layout/Navbar';
import { AgentFlowDiagram } from '@/components/common/AgentFlowDiagram';

export default function LandingPage() {
  return (
    <div className="min-h-screen bg-[#faf9f6] text-[#111318] font-sans">
      <Navbar />

      {/* Hero Section */}
      <section className="relative pt-12 md:pt-20 pb-16 overflow-hidden">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center space-y-6">
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-teal-50 text-teal-800 text-xs font-bold border border-teal-200 shadow-xs">
            <Sparkles className="w-3.5 h-3.5 text-teal-600" />
            Razorpay AI Builder Track 1 — AI Growth & Agentic Commerce
          </div>

          <h1 className="text-4xl sm:text-6xl lg:text-7xl font-black text-zinc-900 tracking-tight leading-[1.08] max-w-5xl mx-auto">
            The agent between <span className="font-editorial text-teal-700 italic font-normal">intention</span> and <span className="underline decoration-teal-500/40 underline-offset-8">action</span>.
          </h1>

          <p className="text-sm sm:text-base text-zinc-600 max-w-2xl mx-auto leading-relaxed font-normal">
            ANTARA uses 5 specialized AI agents to decode customer purchase intent, recommend personalized bundles, recover failed Razorpay checkouts, and turn commerce events into measurable incremental revenue.
          </p>

          <div className="flex flex-col sm:flex-row items-center justify-center gap-4 pt-4">
            <Link
              href="/demo"
              className="w-full sm:w-auto px-7 py-3.5 rounded-2xl bg-zinc-900 hover:bg-zinc-800 text-white font-extrabold text-xs flex items-center justify-center gap-2 shadow-lg transition-all"
            >
              <Zap className="w-4 h-4 text-teal-400" />
              Open Guided AI Demo
              <ArrowRight className="w-4 h-4" />
            </Link>

            <Link
              href="/dashboard"
              className="w-full sm:w-auto px-7 py-3.5 rounded-2xl bg-teal-700 hover:bg-teal-800 text-white font-extrabold text-xs flex items-center justify-center gap-2 shadow-md transition-all"
            >
              <BrainCircuit className="w-4 h-4" />
              Explore Merchant Dashboard
            </Link>

            <Link
              href="/shop"
              className="w-full sm:w-auto px-7 py-3.5 rounded-2xl bg-white hover:bg-zinc-100 border border-zinc-300 text-zinc-800 font-extrabold text-xs flex items-center justify-center gap-2 shadow-xs transition-all"
            >
              <ShoppingBag className="w-4 h-4" />
              Try Shopping Storefront
            </Link>
          </div>
        </div>
      </section>

      {/* Interactive Agentic Architecture Pipeline */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="text-center mb-8">
          <span className="text-xs font-mono font-bold uppercase tracking-widest text-teal-700">
            System Architecture
          </span>
          <h2 className="text-2xl sm:text-3xl font-black text-zinc-900 tracking-tight mt-1">
            How ANTARA Multi-Agent Commerce Works
          </h2>
        </div>

        <AgentFlowDiagram activeStepId="growth" />
      </section>

      {/* The 5 Specialized Agents Grid */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="text-center mb-10">
          <h2 className="text-2xl sm:text-3xl font-black text-zinc-900 tracking-tight">
            5 Specialized AI Agents. Zero Generic Chatbots.
          </h2>
          <p className="text-xs text-zinc-500 mt-1">
            Each agent has explicit tools, structured JSON output schemas, and transparent attribution logic.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {[
            {
              name: 'Intent Intelligence Agent',
              role: 'NLP & Behavioral Decoding',
              desc: 'Analyzes search queries, product views, and session signals to decode purchase intent & budget tier.',
              icon: BrainCircuit,
            },
            {
              name: 'Commerce Recommendation Agent',
              role: 'Catalog & Cross-Sell Selection',
              desc: 'Evaluates catalog affinities to select optimal primary products and complementary accessories.',
              icon: Sparkles,
            },
            {
              name: 'Revenue Growth Agent',
              role: 'Dynamic Intervention Engine',
              desc: 'Evaluates purchase probability to offer high-value dynamic bundles and cross-sells (+15% AOV).',
              icon: TrendingUp,
            },
            {
              name: 'Revenue Recovery Agent',
              role: 'Checkout & Payment Link Recovery',
              desc: 'Detects bank gateway timeouts and payment failures, creating instant Razorpay Payment Links.',
              icon: ShieldCheck,
            },
            {
              name: 'Autonomous Growth Analyst',
              role: 'Performance & Attribution Synthesizer',
              desc: 'Audits merchant conversion trends and calculates exact AI-attributed revenue contribution.',
              icon: LineChart,
            },
            {
              name: 'Razorpay Integration Engine',
              role: 'Fintech Payment Infrastructure',
              desc: 'Handles server-side Razorpay order creation, signature verification, and webhook state updates.',
              icon: CreditCard,
            },
          ].map((agent, idx) => {
            const Icon = agent.icon;
            return (
              <div
                key={idx}
                className="p-6 rounded-2xl bg-white border border-zinc-200/80 shadow-subtle flex flex-col justify-between"
              >
                <div>
                  <div className="p-3 rounded-xl bg-teal-50 text-teal-700 w-fit mb-4">
                    <Icon className="w-6 h-6 stroke-[2]" />
                  </div>
                  <h3 className="text-base font-extrabold text-zinc-900">{agent.name}</h3>
                  <span className="text-xs text-teal-700 font-semibold block mt-0.5">{agent.role}</span>
                  <p className="text-xs text-zinc-500 mt-2 leading-relaxed">{agent.desc}</p>
                </div>
              </div>
            );
          })}
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-zinc-200 bg-white py-12 mt-16 text-center text-xs text-zinc-500 font-sans">
        <div className="max-w-7xl mx-auto px-4 flex flex-col sm:flex-row items-center justify-between gap-4">
          <Logo />
          <span>ANTARA — Built for Razorpay AI Builder Internship 2026</span>
          <div className="flex items-center gap-4 text-zinc-600 font-medium">
            <Link href="/shop" className="hover:underline">Storefront</Link>
            <Link href="/dashboard" className="hover:underline">Dashboard</Link>
            <Link href="/demo" className="hover:underline">Demo Panel</Link>
          </div>
        </div>
      </footer>
    </div>
  );
}
