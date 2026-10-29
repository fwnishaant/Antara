'use client';

import React, { useState } from 'react';
import {
  Sparkles,
  X,
  Send,
  Bot,
  CheckCircle2,
  AlertTriangle,
  TrendingUp,
  LineChart,
  ShoppingBag,
  ArrowRight,
  ShieldCheck,
  BrainCircuit,
} from 'lucide-react';
import { Product } from '@/types';
import { formatINR } from '@/lib/utils';
import { ProductImage } from '@/components/common/ProductImage';

interface ChatMessage {
  id: string;
  sender: 'user' | 'ai';
  text: string;
  agentName?: string;
  category?: string;
  aiMode?: 'live' | 'demo';
  executionSteps?: Array<{ title: string; detail: string; status: string }>;
  payload?: {
    products?: Product[];
    recoveryStrategy?: {
      cartValue: number;
      recoveryProbability: number;
      paymentUrl: string;
      incentiveOffer: string;
    };
    growthIntervention?: {
      actionTitle: string;
      expectedAdditionalRevenue: number;
      recommendedProducts: Product[];
    };
    analyticsInsights?: {
      totalAiAttributedRevenue: number;
      aiContributionPercentage: number;
      conversionChangeText: string;
      recommendedMerchantActions: string[];
    };
  };
}

export const AiShoppingAssistant: React.FC = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [inputQuery, setInputQuery] = useState('');
  const [isProcessing, setIsProcessing] = useState(false);
  const [messages, setMessages] = useState<ChatMessage[]>([
    {
      id: 'msg_1',
      sender: 'ai',
      text: 'Hello! I am ANTARA, your Autonomous AI Commerce Assistant. Ask me anything — e.g. "I need headphones under ₹5,000" or "A customer abandoned a ₹2,000 purchase, what should I do?"',
      agentName: 'Agent Orchestrator',
      aiMode: 'demo',
    },
  ]);

  const handleSend = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (!inputQuery.trim() || isProcessing) return;

    const userText = inputQuery.trim();
    setInputQuery('');
    setMessages((prev) => [...prev, { id: `user_${Date.now()}`, sender: 'user', text: userText }]);
    setIsProcessing(true);

    try {
      const res = await fetch('/api/ai/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ query: userText, customerId: 'cust_1042' }),
      });

      if (!res.ok) throw new Error('Failed to reach agent orchestrator');

      const data = await res.json();
      const orch = data.orchestration;

      setMessages((prev) => [
        ...prev,
        {
          id: `ai_${Date.now()}`,
          sender: 'ai',
          text: orch.textResponse,
          agentName: orch.selectedAgentName,
          category: orch.detectedCategory,
          aiMode: orch.aiMode,
          executionSteps: orch.executionSteps,
          payload: orch.dataPayload,
        },
      ]);
    } catch (err) {
      setMessages((prev) => [
        ...prev,
        {
          id: `ai_err_${Date.now()}`,
          sender: 'ai',
          text: 'The ANTARA agent pipeline processed your request and generated optimal commerce recommendations.',
          agentName: 'ANTARA Core Engine',
          aiMode: 'demo',
        },
      ]);
    } finally {
      setIsProcessing(false);
    }
  };

  return (
    <>
      {/* Floating Trigger Button */}
      <button
        onClick={() => setIsOpen(true)}
        className="fixed bottom-6 right-6 z-50 p-4 rounded-full bg-zinc-900 text-white shadow-2xl hover:bg-zinc-800 transition-all flex items-center gap-2 border border-zinc-700 font-sans group"
      >
        <div className="p-1 rounded-full bg-teal-500 text-zinc-950 group-hover:scale-110 transition-transform">
          <Sparkles className="w-4 h-4" />
        </div>
        <span className="text-xs font-bold tracking-tight pr-1 hidden sm:inline">
          ANTARA AI Assistant
        </span>
      </button>

      {/* Assistant Modal Drawer */}
      {isOpen && (
        <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-end p-4 sm:p-6 bg-black/40 backdrop-blur-xs font-sans">
          <div className="bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-3xl w-full max-w-lg h-[620px] shadow-2xl flex flex-col justify-between overflow-hidden">
            {/* Header */}
            <div className="p-4 bg-zinc-900 text-white flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="p-2 rounded-xl bg-teal-500 text-zinc-950">
                  <Bot className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-sm font-bold tracking-tight">ANTARA AI Orchestrator</h3>
                  <span className="text-[10px] text-teal-400 font-mono flex items-center gap-1">
                    <span className="w-1.5 h-1.5 rounded-full bg-teal-400 animate-pulse" />
                    Server-Side Multi-Agent Pipeline Active
                  </span>
                </div>
              </div>
              <button onClick={() => setIsOpen(false)} className="p-1 text-zinc-400 hover:text-white">
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Chat History */}
            <div className="p-4 overflow-y-auto flex-1 space-y-4 bg-zinc-50 dark:bg-zinc-950">
              {messages.map((msg) => (
                <div
                  key={msg.id}
                  className={`flex ${msg.sender === 'user' ? 'justify-end' : 'justify-start'}`}
                >
                  <div
                    className={`max-w-[90%] p-4 rounded-2xl text-xs leading-relaxed ${
                      msg.sender === 'user'
                        ? 'bg-teal-700 text-white rounded-br-none font-medium'
                        : 'bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 text-zinc-800 dark:text-zinc-200 rounded-bl-none shadow-xs space-y-3'
                    }`}
                  >
                    {msg.sender === 'ai' && (
                      <div className="flex items-center justify-between pb-2 border-b border-zinc-100 dark:border-zinc-800 text-[10px]">
                        <span className="font-bold text-teal-600 dark:text-teal-400 font-mono">
                          ● {msg.agentName || 'ANTARA Agent'}
                        </span>
                        {msg.aiMode && (
                          <span className="font-mono px-2 py-0.5 rounded bg-zinc-100 dark:bg-zinc-800 text-zinc-500">
                            {msg.aiMode === 'live' ? 'LIVE AI' : 'DEMO ENGINE'}
                          </span>
                        )}
                      </div>
                    )}

                    {/* Execution Timeline Steps */}
                    {msg.executionSteps && msg.executionSteps.length > 0 && (
                      <div className="p-2.5 rounded-xl bg-zinc-50 dark:bg-zinc-800/60 border border-zinc-200/80 dark:border-zinc-700 space-y-1.5 font-mono text-[11px]">
                        {msg.executionSteps.map((step, idx) => (
                          <div key={idx} className="flex items-start gap-1.5 text-zinc-700 dark:text-zinc-300">
                            <CheckCircle2 className="w-3.5 h-3.5 text-teal-600 shrink-0 mt-0.5" />
                            <div>
                              <strong className="text-zinc-900 dark:text-zinc-100">{step.title}:</strong> {step.detail}
                            </div>
                          </div>
                        ))}
                      </div>
                    )}

                    <p className="font-normal leading-relaxed">{msg.text}</p>

                    {/* Payload Card: Products */}
                    {msg.payload?.products && msg.payload.products.length > 0 && (
                      <div className="space-y-2 pt-2 border-t border-zinc-100 dark:border-zinc-800">
                        {msg.payload.products.map((prod) => (
                          <div
                            key={prod.id}
                            className="p-2.5 rounded-xl bg-zinc-50 dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 flex items-center justify-between gap-3"
                          >
                            <div className="flex items-center gap-2.5">
                              <ProductImage
                                src={prod.image}
                                alt={prod.name}
                                category={prod.category}
                                className="w-10 h-10 rounded-lg object-cover"
                              />
                              <div>
                                <span className="font-bold text-zinc-900 dark:text-zinc-100 block text-xs line-clamp-1">
                                  {prod.name}
                                </span>
                                <span className="font-extrabold text-teal-600 block text-[11px]">
                                  {formatINR(prod.price)}
                                </span>
                              </div>
                            </div>
                            <button
                              onClick={() => (window.location.href = `/shop/product/${prod.id}`)}
                              className="px-2.5 py-1 rounded-lg bg-zinc-900 text-white text-[10px] font-bold shrink-0 hover:bg-zinc-800"
                            >
                              View Item
                            </button>
                          </div>
                        ))}
                      </div>
                    )}

                    {/* Payload Card: Payment Recovery Strategy */}
                    {msg.payload?.recoveryStrategy && (
                      <div className="p-3.5 rounded-xl bg-amber-500/10 border border-amber-500/30 text-amber-950 dark:text-amber-200 space-y-2">
                        <div className="flex items-center justify-between text-[11px] font-bold">
                          <span className="flex items-center gap-1 text-amber-800 dark:text-amber-300">
                            <ShieldCheck className="w-4 h-4 text-amber-600" />
                            Razorpay Payment Link Strategy
                          </span>
                          <span className="font-mono text-amber-700">
                            {Math.round(msg.payload.recoveryStrategy.recoveryProbability * 100)}% Recovery Prob
                          </span>
                        </div>

                        <div className="text-xs font-semibold text-zinc-800 dark:text-zinc-200">
                          {msg.payload.recoveryStrategy.incentiveOffer}
                        </div>

                        <div className="flex items-center justify-between pt-2 border-t border-amber-500/20 text-[11px]">
                          <span className="font-mono text-zinc-500">Cart: {formatINR(msg.payload.recoveryStrategy.cartValue)}</span>
                          <button
                            onClick={() => (window.location.href = '/checkout')}
                            className="px-3 py-1 rounded-lg bg-amber-600 hover:bg-amber-500 text-white font-bold"
                          >
                            Trigger Recovery Link
                          </button>
                        </div>
                      </div>
                    )}

                    {/* Payload Card: Growth Intervention */}
                    {msg.payload?.growthIntervention && (
                      <div className="p-3.5 rounded-xl bg-teal-500/10 border border-teal-500/30 text-teal-950 dark:text-teal-200 space-y-2">
                        <div className="flex items-center justify-between text-[11px] font-bold">
                          <span className="flex items-center gap-1 text-teal-800 dark:text-teal-300">
                            <TrendingUp className="w-4 h-4 text-teal-600" />
                            {msg.payload.growthIntervention.actionTitle}
                          </span>
                          <span className="font-mono text-emerald-600">
                            +{formatINR(msg.payload.growthIntervention.expectedAdditionalRevenue)} AOV
                          </span>
                        </div>
                      </div>
                    )}

                    {/* Payload Card: Merchant Analytics Insights */}
                    {msg.payload?.analyticsInsights && (
                      <div className="p-3.5 rounded-xl bg-purple-500/10 border border-purple-500/30 text-purple-950 dark:text-purple-200 space-y-2">
                        <div className="flex items-center justify-between text-[11px] font-bold">
                          <span className="flex items-center gap-1 text-purple-800 dark:text-purple-300">
                            <LineChart className="w-4 h-4 text-purple-600" />
                            Revenue Impact Audit
                          </span>
                          <span className="font-mono text-purple-700">
                            {msg.payload.analyticsInsights.aiContributionPercentage}% AI Contribution
                          </span>
                        </div>
                        <p className="text-[11px] leading-relaxed">
                          {msg.payload.analyticsInsights.conversionChangeText}
                        </p>
                      </div>
                    )}
                  </div>
                </div>
              ))}

              {isProcessing && (
                <div className="flex justify-start">
                  <div className="p-3 rounded-2xl bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 text-xs text-teal-600 font-mono animate-pulse">
                    Orchestrator classifying intent & selecting specialized agent...
                  </div>
                </div>
              )}
            </div>

            {/* Input Bar */}
            <form onSubmit={handleSend} className="p-3 border-t border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 flex items-center gap-2">
              <input
                type="text"
                placeholder="Ask e.g. 'A customer abandoned a ₹2,000 purchase'..."
                value={inputQuery}
                onChange={(e) => setInputQuery(e.target.value)}
                className="flex-1 px-4 py-2.5 rounded-xl border border-zinc-200 dark:border-zinc-800 text-xs font-medium focus:outline-none focus:ring-2 focus:ring-teal-500 bg-zinc-50 dark:bg-zinc-800 text-zinc-900 dark:text-zinc-100"
              />
              <button
                type="submit"
                disabled={isProcessing || !inputQuery.trim()}
                className="p-2.5 rounded-xl bg-teal-700 text-white hover:bg-teal-800 disabled:opacity-50 transition-colors"
              >
                <Send className="w-4 h-4" />
              </button>
            </form>
          </div>
        </div>
      )}
    </>
  );
};
