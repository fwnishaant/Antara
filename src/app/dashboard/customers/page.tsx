'use client';

import React, { useEffect, useState } from 'react';
import { Users, Search, Filter, ShieldAlert, Sparkles, ShoppingCart, ArrowRight, Eye, ChevronRight } from 'lucide-react';
import { store } from '@/lib/db/store';
import { formatINR, formatDate } from '@/lib/utils';
import { Customer, CustomerSegment } from '@/types';

export default function CustomersDashboardPage() {
  const [customers, setCustomers] = useState<Customer[]>(store.getCustomers());
  const [segments, setSegments] = useState<CustomerSegment[]>(store.getSegments());
  const [selectedCustomer, setSelectedCustomer] = useState<Customer | null>(customers[0]);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedSegmentFilter, setSelectedSegmentFilter] = useState<string>('All');

  useEffect(() => {
    const unsub = store.subscribe(() => {
      setCustomers(store.getCustomers());
      setSegments(store.getSegments());
    });
    return unsub;
  }, []);

  const filteredCustomers = customers.filter((c) => {
    const matchesQuery = c.name.toLowerCase().includes(searchQuery.toLowerCase()) || c.email.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesSegment = selectedSegmentFilter === 'All' || c.segment === selectedSegmentFilter;
    return matchesQuery && matchesSegment;
  });

  return (
    <div className="space-y-8 font-sans pb-12">
      {/* Page Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-zinc-200/80 dark:border-zinc-800 pb-5">
        <div>
          <div className="flex items-center gap-2 text-xs font-semibold text-teal-700 dark:text-teal-400 mb-1">
            <Users className="w-4 h-4" />
            <span>Behavioral Profiling & Segment Intelligence</span>
          </div>
          <h1 className="text-2xl font-black text-zinc-900 dark:text-zinc-100 tracking-tight">
            Customer Intent Intelligence
          </h1>
          <p className="text-xs text-zinc-500 mt-0.5">
            Real-time intent scores, cart history, and AI-driven growth interventions per shopper profile.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <div className="relative">
            <Search className="w-4 h-4 text-zinc-400 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              placeholder="Search by name or email..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-9 pr-4 py-1.5 rounded-xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 text-xs font-medium focus:outline-none focus:ring-2 focus:ring-teal-500 w-64"
            />
          </div>
        </div>
      </div>

      {/* Customer Segments Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {segments.map((seg) => {
          const isSelected = selectedSegmentFilter === seg.name;
          return (
            <div
              key={seg.id}
              onClick={() => setSelectedSegmentFilter(isSelected ? 'All' : seg.name)}
              className={`p-5 rounded-2xl bg-white dark:bg-zinc-900 border transition-all cursor-pointer shadow-subtle ${
                isSelected ? 'border-teal-500 ring-2 ring-teal-500/20 bg-teal-50/20' : 'border-zinc-200/80 dark:border-zinc-800 hover:border-zinc-300'
              }`}
            >
              <div className="flex items-center justify-between text-xs font-bold text-zinc-500">
                <span className="uppercase tracking-wider">{seg.name}</span>
                <span className="font-mono bg-zinc-100 dark:bg-zinc-800 px-2 py-0.5 rounded text-zinc-700 dark:text-zinc-300">
                  {seg.customerCount} customers
                </span>
              </div>

              <div className="mt-3 flex items-baseline justify-between">
                <div>
                  <span className="text-lg font-extrabold text-zinc-900 dark:text-zinc-100 block">
                    {formatINR(seg.averageOrderValue)}
                  </span>
                  <span className="text-[11px] text-zinc-400 font-medium">Avg Order Value</span>
                </div>
                <div className="text-right">
                  <span className="text-xs font-extrabold text-emerald-600 block">
                    {seg.conversionRate}%
                  </span>
                  <span className="text-[11px] text-zinc-400 font-medium">Conv Rate</span>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Main Customers List & Detail Split Screen */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Customers Table */}
        <div className="lg:col-span-2 bg-white dark:bg-zinc-900 border border-zinc-200/80 dark:border-zinc-800 rounded-2xl overflow-hidden shadow-subtle">
          <div className="p-4 border-b border-zinc-100 dark:border-zinc-800 flex items-center justify-between">
            <h3 className="text-sm font-bold text-zinc-900 dark:text-zinc-100">
              Customer Profiles ({filteredCustomers.length})
            </h3>
            {selectedSegmentFilter !== 'All' && (
              <span className="text-xs text-teal-600 font-semibold">
                Filter: {selectedSegmentFilter} (
                <button onClick={() => setSelectedSegmentFilter('All')} className="underline">
                  Clear
                </button>
                )
              </span>
            )}
          </div>

          <div className="divide-y divide-zinc-100 dark:divide-zinc-800">
            {filteredCustomers.map((cust) => {
              const isSelected = selectedCustomer?.id === cust.id;
              return (
                <div
                  key={cust.id}
                  onClick={() => setSelectedCustomer(cust)}
                  className={`p-4 flex items-center justify-between hover:bg-zinc-50 dark:hover:bg-zinc-800/50 transition-colors cursor-pointer ${
                    isSelected ? 'bg-teal-50/40 dark:bg-teal-950/30 border-l-4 border-l-teal-600' : ''
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <div className="w-9 h-9 rounded-full bg-zinc-900 text-white font-bold text-xs flex items-center justify-center shrink-0">
                      {cust.name.substring(0, 2).toUpperCase()}
                    </div>
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="text-xs font-bold text-zinc-900 dark:text-zinc-100">
                          {cust.name}
                        </span>
                        {cust.hasFailedPayment && (
                          <span className="text-[10px] font-bold px-1.5 py-0.5 rounded bg-rose-100 text-rose-700">
                            Failed Payment
                          </span>
                        )}
                      </div>
                      <span className="text-[11px] text-zinc-500 block mt-0.5">
                        {cust.email} • {cust.segment}
                      </span>
                    </div>
                  </div>

                  <div className="flex items-center gap-6 text-right">
                    <div>
                      <span className="text-xs font-mono font-black text-teal-600 block">
                        Intent {cust.intentScore}/100
                      </span>
                      <span className="text-[10px] text-zinc-400">
                        {cust.intentCategory || 'Browsing'}
                      </span>
                    </div>
                    <div className="hidden sm:block">
                      <span className="text-xs font-extrabold text-zinc-900 dark:text-zinc-100 block">
                        {formatINR(cust.lifetimeValue)}
                      </span>
                      <span className="text-[10px] text-zinc-400">{cust.ordersCount} orders</span>
                    </div>
                    <ChevronRight className="w-4 h-4 text-zinc-400" />
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Selected Customer Profile Detail Drawer */}
        {selectedCustomer && (
          <div className="bg-white dark:bg-zinc-900 border border-zinc-200/80 dark:border-zinc-800 rounded-2xl p-6 shadow-subtle flex flex-col justify-between">
            <div>
              <div className="flex items-center justify-between pb-4 border-b border-zinc-100 dark:border-zinc-800">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-full bg-teal-700 text-white font-black text-sm flex items-center justify-center">
                    {selectedCustomer.name.substring(0, 2).toUpperCase()}
                  </div>
                  <div>
                    <h3 className="text-sm font-bold text-zinc-900 dark:text-zinc-100">
                      {selectedCustomer.name}
                    </h3>
                    <span className="text-xs text-zinc-500 font-mono">{selectedCustomer.id}</span>
                  </div>
                </div>
                <span className="text-xs font-extrabold text-teal-700 font-mono px-2.5 py-1 rounded-full bg-teal-50 border border-teal-200">
                  {selectedCustomer.intentScore} Intent Score
                </span>
              </div>

              {/* Customer Stats Grid */}
              <div className="grid grid-cols-2 gap-3 my-5">
                <div className="p-3 rounded-xl bg-zinc-50 dark:bg-zinc-800/40 border border-zinc-200 dark:border-zinc-800">
                  <span className="text-[10px] text-zinc-400 uppercase font-bold block">Lifetime Value</span>
                  <span className="text-base font-extrabold text-zinc-900 dark:text-zinc-100 mt-0.5 block">
                    {formatINR(selectedCustomer.lifetimeValue)}
                  </span>
                </div>

                <div className="p-3 rounded-xl bg-zinc-50 dark:bg-zinc-800/40 border border-zinc-200 dark:border-zinc-800">
                  <span className="text-[10px] text-zinc-400 uppercase font-bold block">AI Attributed</span>
                  <span className="text-base font-extrabold text-emerald-600 mt-0.5 block">
                    {formatINR(selectedCustomer.aiAttributedRevenue)}
                  </span>
                </div>
              </div>

              {/* Behavioral Profile Details */}
              <div className="space-y-4 text-xs">
                <div>
                  <span className="font-bold text-zinc-900 dark:text-zinc-100 block mb-1">
                    Price Sensitivity
                  </span>
                  <span className="capitalize font-mono px-2 py-0.5 rounded bg-zinc-100 dark:bg-zinc-800 text-zinc-700 dark:text-zinc-300">
                    {selectedCustomer.priceSensitivity} Sensitivity
                  </span>
                </div>

                <div>
                  <span className="font-bold text-zinc-900 dark:text-zinc-100 block mb-1">
                    Recently Viewed Products
                  </span>
                  <div className="space-y-1">
                    {selectedCustomer.viewedProductIds.map((pId) => {
                      const prod = store.getProductById(pId);
                      return (
                        <div key={pId} className="p-2 rounded bg-zinc-50 dark:bg-zinc-800/50 flex items-center justify-between">
                          <span className="truncate">{prod ? prod.name : pId}</span>
                          <span className="font-bold text-zinc-700">{prod ? formatINR(prod.price) : ''}</span>
                        </div>
                      );
                    })}
                  </div>
                </div>

                {selectedCustomer.hasFailedPayment && (
                  <div className="p-3.5 rounded-xl bg-rose-50 border border-rose-200 text-rose-900 space-y-1">
                    <span className="font-bold flex items-center gap-1.5 text-xs text-rose-700">
                      <ShieldAlert className="w-4 h-4" />
                      Failed Payment Recovery Opportunity
                    </span>
                    <p className="text-[11px] leading-relaxed">
                      Attempted ₹{selectedCustomer.failedPaymentAmount?.toLocaleString('en-IN')} checkout. Razorpay Payment Link recovery initiated.
                    </p>
                  </div>
                )}
              </div>
            </div>

            <div className="pt-4 border-t border-zinc-100 dark:border-zinc-800 text-[11px] text-zinc-400 flex items-center justify-between">
              <span>Segment: {selectedCustomer.segment}</span>
              <span>Last Active: {formatDate(selectedCustomer.lastActive)}</span>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
