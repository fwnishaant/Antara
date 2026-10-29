'use client';

import React from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import {
  LayoutDashboard,
  BrainCircuit,
  Users,
  Package,
  ShoppingBag,
  CreditCard,
  Target,
  LineChart,
  Activity,
  Settings,
  ArrowLeft,
  Store,
} from 'lucide-react';
import { Logo } from '@/components/common/Logo';

const NAV_ITEMS = [
  { name: 'Overview', href: '/dashboard', icon: LayoutDashboard },
  { name: 'AI Agents', href: '/dashboard/agents', icon: BrainCircuit, badge: '5 Active' },
  { name: 'Customers', href: '/dashboard/customers', icon: Users },
  { name: 'Products', href: '/dashboard/products', icon: Package },
  { name: 'Orders', href: '/dashboard/orders', icon: ShoppingBag },
  { name: 'Payments', href: '/dashboard/payments', icon: CreditCard, badge: 'Razorpay' },
  { name: 'Campaigns', href: '/dashboard/campaigns', icon: Target },
  { name: 'Analytics', href: '/dashboard/analytics', icon: LineChart },
  { name: 'Activity', href: '/dashboard/activity', icon: Activity },
  { name: 'Settings', href: '/dashboard/settings', icon: Settings },
];

export const Sidebar: React.FC = () => {
  const pathname = usePathname();

  return (
    <aside className="w-64 bg-white dark:bg-zinc-950 border-r border-zinc-200/80 dark:border-zinc-800 flex flex-col justify-between h-[calc(100vh-41px)] sticky top-[41px] font-sans shrink-0">
      <div className="p-5 overflow-y-auto">
        {/* Brand Header & Back Link */}
        <div className="mb-6 pb-4 border-b border-zinc-100 dark:border-zinc-800 space-y-3">
          <Link
            href="/"
            className="inline-flex items-center gap-1.5 text-xs font-bold text-zinc-500 hover:text-zinc-900 transition-colors group"
          >
            <ArrowLeft className="w-3.5 h-3.5 group-hover:-translate-x-0.5 transition-transform text-teal-600" />
            <span>Back to ANTARA</span>
          </Link>
          <Logo showTagline={true} />
        </div>

        {/* Navigation Section */}
        <div className="space-y-1">
          <span className="px-3 text-[10px] font-extrabold uppercase tracking-widest text-zinc-400 block mb-2">
            Merchant Engine
          </span>
          {NAV_ITEMS.map((item) => {
            const Icon = item.icon;
            const isActive =
              item.href === '/dashboard'
                ? pathname === '/dashboard' || pathname === '/dashboard/overview'
                : pathname?.startsWith(item.href);

            return (
              <Link
                key={item.href}
                href={item.href}
                className={`flex items-center justify-between px-3 py-2 rounded-xl text-xs font-semibold transition-all ${
                  isActive
                    ? 'bg-zinc-900 text-white dark:bg-zinc-100 dark:text-zinc-900 shadow-xs'
                    : 'text-zinc-600 dark:text-zinc-400 hover:text-zinc-900 hover:bg-zinc-100 dark:hover:bg-zinc-900'
                }`}
              >
                <div className="flex items-center gap-2.5">
                  <Icon className={`w-4 h-4 ${isActive ? 'text-teal-400 dark:text-teal-600' : 'text-zinc-400'}`} />
                  <span>{item.name}</span>
                </div>
                {item.badge && (
                  <span
                    className={`text-[10px] font-mono px-2 py-0.5 rounded-full ${
                      isActive
                        ? 'bg-teal-500/20 text-teal-300'
                        : 'bg-zinc-100 dark:bg-zinc-800 text-zinc-500'
                    }`}
                  >
                    {item.badge}
                  </span>
                )}
              </Link>
            );
          })}
        </div>
      </div>

      {/* Footer Profile & Demo Indicator */}
      <div className="p-4 border-t border-zinc-100 dark:border-zinc-900 bg-zinc-50/50 dark:bg-zinc-900/50">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-full bg-teal-700 text-white flex items-center justify-center font-bold text-xs">
            AC
          </div>
          <div className="flex flex-col min-w-0">
            <span className="text-xs font-bold text-zinc-900 dark:text-zinc-100 truncate">
              AeroCraft Store
            </span>
            <span className="text-[10px] text-zinc-500 flex items-center gap-1 font-mono">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
              AI Autonomy Level 2
            </span>
          </div>
        </div>

        <Link
          href="/shop"
          className="mt-3 w-full flex items-center justify-center gap-1.5 py-1.5 px-3 rounded-lg border border-zinc-200 dark:border-zinc-800 text-zinc-700 dark:text-zinc-300 text-xs font-medium hover:bg-white dark:hover:bg-zinc-800 transition-colors"
        >
          <Store className="w-3.5 h-3.5" />
          View Storefront
        </Link>
      </div>
    </aside>
  );
};
