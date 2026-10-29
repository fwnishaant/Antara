'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { ShoppingBag, Trash2, ArrowRight, Sparkles, ShieldCheck } from 'lucide-react';
import { formatINR } from '@/lib/utils';
import { Product } from '@/types';
import { Navbar } from '@/components/layout/Navbar';
import { ProductImage } from '@/components/common/ProductImage';
import { store } from '@/lib/db/store';
import { GrowthAgent } from '@/lib/agents/growthAgent';

export default function CartPage() {
  const router = useRouter();
  const [cartItems, setCartItems] = useState<Array<{ product: Product; quantity: number }>>([]);
  const [growthIntervention, setGrowthIntervention] = useState<any>(null);

  useEffect(() => {
    const raw = localStorage.getItem('antara_cart');
    if (raw) {
      try {
        const parsed = JSON.parse(raw);
        setCartItems(parsed);

        if (parsed.length > 0) {
          GrowthAgent.evaluateGrowthIntervention('cust_1042', parsed).then((res) => {
            setGrowthIntervention(res);
          });
        }
      } catch (err) {}
    } else {
      // Seed initial cart item if empty for smooth demo
      const seedProd = store.getProductById('prod_1')!;
      const initial = [{ product: seedProd, quantity: 1 }];
      setCartItems(initial);
      localStorage.setItem('antara_cart', JSON.stringify(initial));

      GrowthAgent.evaluateGrowthIntervention('cust_1042', initial).then((res) => {
        setGrowthIntervention(res);
      });
    }
  }, []);

  const updateQuantity = (idx: number, delta: number) => {
    const updated = [...cartItems];
    updated[idx].quantity += delta;
    if (updated[idx].quantity <= 0) {
      updated.splice(idx, 1);
    }
    setCartItems(updated);
    localStorage.setItem('antara_cart', JSON.stringify(updated));
  };

  const removeItem = (idx: number) => {
    const updated = cartItems.filter((_, i) => i !== idx);
    setCartItems(updated);
    localStorage.setItem('antara_cart', JSON.stringify(updated));
  };

  const subtotal = cartItems.reduce((sum, item) => sum + item.product.price * item.quantity, 0);

  return (
    <div className="min-h-screen bg-[#faf9f6] text-[#111318] font-sans pb-16">
      <Navbar />

      <main className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
        <h1 className="text-2xl sm:text-3xl font-black text-zinc-900 tracking-tight">
          Shopping Cart ({cartItems.length} items)
        </h1>

        {cartItems.length === 0 ? (
          <div className="bg-white border border-zinc-200 rounded-3xl p-12 text-center space-y-4">
            <ShoppingBag className="w-12 h-12 text-zinc-300 mx-auto" />
            <h3 className="text-base font-bold text-zinc-900">Your cart is currently empty</h3>
            <Link
              href="/shop"
              className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-zinc-900 text-white font-bold text-xs"
            >
              Browse Catalog Products
            </Link>
          </div>
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 items-start">
            {/* Left: Cart Items List */}
            <div className="lg:col-span-2 space-y-4">
              <div className="bg-white border border-zinc-200/80 rounded-2xl divide-y divide-zinc-100 shadow-subtle">
                {cartItems.map((item, idx) => (
                  <div key={idx} className="p-4 sm:p-5 flex items-center justify-between gap-4">
                    <div className="flex items-center gap-4">
                      <ProductImage
                        src={item.product.image}
                        alt={item.product.name}
                        category={item.product.category}
                        className="w-16 h-16 rounded-xl object-cover border border-zinc-100 shrink-0"
                      />
                      <div>
                        <h3 className="text-sm font-bold text-zinc-900 line-clamp-1">
                          {item.product.name}
                        </h3>
                        <span className="text-xs font-mono text-zinc-500 block mt-0.5">
                          {formatINR(item.product.price)} each
                        </span>
                      </div>
                    </div>

                    <div className="flex items-center gap-4 shrink-0">
                      <div className="flex items-center gap-2 border border-zinc-200 rounded-lg p-1 text-xs font-bold">
                        <button
                          onClick={() => updateQuantity(idx, -1)}
                          className="w-6 h-6 rounded hover:bg-zinc-100 flex items-center justify-center"
                        >
                          -
                        </button>
                        <span className="w-4 text-center font-mono">{item.quantity}</span>
                        <button
                          onClick={() => updateQuantity(idx, 1)}
                          className="w-6 h-6 rounded hover:bg-zinc-100 flex items-center justify-center"
                        >
                          +
                        </button>
                      </div>

                      <span className="text-sm font-extrabold text-zinc-900 w-20 text-right">
                        {formatINR(item.product.price * item.quantity)}
                      </span>

                      <button
                        onClick={() => removeItem(idx)}
                        className="p-1.5 text-zinc-400 hover:text-rose-600 transition-colors"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                ))}
              </div>

              {/* Dynamic Growth Intervention Card */}
              {growthIntervention && growthIntervention.action === 'recommend_bundle' && (
                <div className="p-5 rounded-2xl bg-teal-500/10 border border-teal-500/30 text-teal-950 space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold uppercase tracking-wider text-teal-700 flex items-center gap-1.5 font-mono">
                      <Sparkles className="w-4 h-4" />
                      Revenue Growth Agent Bundle Recommendation
                    </span>
                    <span className="text-xs font-extrabold text-teal-700">
                      +{formatINR(growthIntervention.expectedAdditionalRevenue)} AOV Lift
                    </span>
                  </div>

                  <p className="text-xs text-teal-900 font-medium leading-relaxed">
                    {growthIntervention.reasoning}
                  </p>
                </div>
              )}
            </div>

            {/* Right: Order Summary Card */}
            <div className="bg-white border border-zinc-200/80 rounded-2xl p-6 shadow-subtle space-y-6">
              <h3 className="text-base font-extrabold text-zinc-900">Order Summary</h3>

              <div className="space-y-3 text-xs">
                <div className="flex items-center justify-between text-zinc-600">
                  <span>Items Subtotal</span>
                  <span className="font-bold text-zinc-900">{formatINR(subtotal)}</span>
                </div>
                <div className="flex items-center justify-between text-zinc-600">
                  <span>Estimated Express Delivery</span>
                  <span className="font-bold text-emerald-600">FREE</span>
                </div>
                <div className="pt-3 border-t border-zinc-100 flex items-center justify-between text-sm font-black text-zinc-900">
                  <span>Total Amount</span>
                  <span className="text-lg">{formatINR(subtotal)}</span>
                </div>
              </div>

              <button
                onClick={() => router.push('/checkout')}
                className="w-full py-3.5 px-6 rounded-2xl bg-zinc-900 hover:bg-zinc-800 text-white font-extrabold text-sm flex items-center justify-center gap-2 shadow-lg transition-all"
              >
                Proceed to Checkout
                <ArrowRight className="w-4 h-4" />
              </button>
            </div>
          </div>
        )}
      </main>
    </div>
  );
}
