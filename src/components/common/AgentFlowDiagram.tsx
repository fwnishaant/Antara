'use client';

import React, { useState } from 'react';
import {
  UserCheck,
  BrainCircuit,
  Sparkles,
  TrendingUp,
  CreditCard,
  CheckCircle2,
  LineChart,
  ChevronRight,
  ShieldCheck,
} from 'lucide-react';

interface FlowNode {
  id: string;
  name: string;
  role: string;
  icon: React.ComponentType<{ className?: string }>;
  color: string;
  description: string;
}

const FLOW_NODES: FlowNode[] = [
  {
    id: 'event',
    name: 'Customer Event',
    role: 'Trigger Signal',
    icon: UserCheck,
    color: 'border-zinc-300 text-zinc-700 bg-zinc-50 dark:bg-zinc-900',
    description: 'Search, product view, cart add, or payment failure event captured.',
  },
  {
    id: 'intent',
    name: 'Intent Agent',
    role: 'Understanding',
    icon: BrainCircuit,
    color: 'border-teal-500/40 text-teal-700 bg-teal-50 dark:bg-teal-950/40',
    description: 'Decodes intent semantics, budget tier, and customer preferences.',
  },
  {
    id: 'recommendation',
    name: 'Recommendation Agent',
    role: 'Product Selection',
    icon: Sparkles,
    color: 'border-indigo-500/40 text-indigo-700 bg-indigo-50 dark:bg-indigo-950/40',
    description: 'Selects optimal catalog choices & complementary accessories.',
  },
  {
    id: 'growth',
    name: 'Growth / Recovery Agent',
    role: 'Intervention',
    icon: TrendingUp,
    color: 'border-amber-500/40 text-amber-700 bg-amber-50 dark:bg-amber-950/40',
    description: 'Evaluates upsell vs recovery risk, creating dynamic bundles or Razorpay links.',
  },
  {
    id: 'payment',
    name: 'Razorpay Payment',
    role: 'Transaction',
    icon: CreditCard,
    color: 'border-blue-500/40 text-blue-700 bg-blue-50 dark:bg-blue-950/40',
    description: 'Executes Razorpay checkout or payment link verification.',
  },
  {
    id: 'attribution',
    name: 'Revenue Attribution',
    role: 'Attribution Engine',
    icon: CheckCircle2,
    color: 'border-emerald-500/40 text-emerald-700 bg-emerald-50 dark:bg-emerald-950/40',
    description: 'Attributes incremental bundle lift & recovered cart revenue.',
  },
  {
    id: 'analyst',
    name: 'Growth Analyst',
    role: 'Synthesis',
    icon: LineChart,
    color: 'border-purple-500/40 text-purple-700 bg-purple-50 dark:bg-purple-950/40',
    description: 'Audits conversion impact & generates automated growth campaigns.',
  },
];

interface AgentFlowDiagramProps {
  activeStepId?: string;
  interactive?: boolean;
}

export const AgentFlowDiagram: React.FC<AgentFlowDiagramProps> = ({
  activeStepId = 'growth',
  interactive = true,
}) => {
  const [selectedNode, setSelectedNode] = useState<FlowNode>(FLOW_NODES[1]);

  return (
    <div className="w-full bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-2xl p-6 shadow-subtle font-sans">
      <div className="flex items-center justify-between mb-6 pb-4 border-b border-zinc-100 dark:border-zinc-800">
        <div>
          <h3 className="text-base font-bold text-zinc-900 dark:text-zinc-100 tracking-tight flex items-center gap-2">
            <ShieldCheck className="w-4 h-4 text-teal-600" />
            Autonomous Agentic Commerce Pipeline
          </h3>
          <p className="text-xs text-zinc-500 mt-0.5">
            Real-time event stream orchestration from customer intent to revenue attribution
          </p>
        </div>
        <span className="text-[11px] font-mono px-2.5 py-1 rounded-full bg-teal-50 text-teal-700 font-semibold border border-teal-200">
          ● Event-Driven Multi-Agent Flow
        </span>
      </div>

      {/* Horizontal Flow Diagram */}
      <div className="grid grid-cols-1 md:grid-cols-7 gap-2 relative">
        {FLOW_NODES.map((node, index) => {
          const Icon = node.icon;
          const isActive = node.id === activeStepId;
          const isSelected = selectedNode.id === node.id;

          return (
            <div key={node.id} className="flex flex-col items-center group">
              <button
                onClick={() => interactive && setSelectedNode(node)}
                className={`w-full flex flex-col items-center p-3 rounded-xl border transition-all text-center relative ${node.color} ${
                  isSelected ? 'ring-2 ring-teal-500 shadow-md scale-105' : 'hover:border-zinc-400'
                } ${isActive ? 'animate-soft-pulse ring-2 ring-amber-400' : ''}`}
              >
                <div className="p-2 rounded-lg bg-white/80 dark:bg-zinc-800/80 mb-2 shadow-xs">
                  <Icon className="w-5 h-5 stroke-[2]" />
                </div>
                <span className="text-xs font-bold tracking-tight line-clamp-1">{node.name}</span>
                <span className="text-[10px] opacity-75 font-medium mt-0.5">{node.role}</span>

                {/* Arrow indicator for step flow */}
                {index < FLOW_NODES.length - 1 && (
                  <div className="hidden md:block absolute -right-3 top-1/2 -translate-y-1/2 z-10 text-zinc-400">
                    <ChevronRight className="w-4 h-4 stroke-[2]" />
                  </div>
                )}
              </button>
            </div>
          );
        })}
      </div>

      {/* Detail drawer for selected node */}
      {selectedNode && (
        <div className="mt-6 p-4 rounded-xl bg-zinc-50 dark:bg-zinc-800/50 border border-zinc-200 dark:border-zinc-700/60 flex items-start gap-4">
          <div className="p-2.5 rounded-lg bg-teal-600 text-white shrink-0 shadow-sm">
            <selectedNode.icon className="w-5 h-5 stroke-[2]" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h4 className="text-sm font-bold text-zinc-900 dark:text-zinc-100">{selectedNode.name}</h4>
              <span className="text-xs text-zinc-500 font-mono">({selectedNode.role})</span>
            </div>
            <p className="text-xs text-zinc-600 dark:text-zinc-300 mt-1 leading-relaxed">
              {selectedNode.description}
            </p>
          </div>
        </div>
      )}
    </div>
  );
};
