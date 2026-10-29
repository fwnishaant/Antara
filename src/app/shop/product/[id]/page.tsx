'use client';

import React, { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { Sparkles, Star, ShoppingBag, ArrowLeft, CheckCircle2, ShieldCheck, Tag } from 'lucide-react';
import { store } from '@/lib/db/store';
import { formatINR } from '@/lib/utils';
import { Product } from '@/types';
import { Navbar } from '@/components/layout/Navbar';
import { IntentAgent } from '@/lib/agents/intentAgent';

import { ProductImage } from '@/components/common/ProductImage';

export default function ProductDetailPage() {
  const params = useParams();
  const router = useRouter();
  const productId = params?.id as string;

  const [product, setProduct] = useState<Product | null>(null);
  const [bundleProducts, setBundleProducts] = useState<Product[]>([]);
  const [isAdded, setIsAdded] = useState(false);
  const [aiReason, setAiReason] = useState('');

  useEffect(() => {
    const found = store.getProductById(productId);
    if (found) {
      setProduct(found);

      // Record PRODUCT_VIEWED Event
      store.recordEvent({
        type: 'PRODUCT_VIEWED',
        customerId: 'cust_1042',
        customerName: 'Rahul Sharma',
        sessionId: `sess_${Date.now()}`,
        metadata: { productId: found.id, productName: found.name, price: found.price },
      });

      // Intent Agent Analysis
      IntentAgent.analyzeIntent('cust_1042', found.name, [found.id]).then((intent) => {
        setAiReason(intent.summary);
      });

      // Find complementary bundle products
      const compProducts = found.complementaryProductIds
        .map((id) => store.getProductById(id))
        .filter((p): p is Product => p !== undefined);

      setBundleProducts(compProducts.length > 0 ? compProducts : store.getProducts().slice(1, 3));
    }
  }, [productId]);

  if (!product) {
    return (
      <div className="min-h-screen bg-[#faf9f6] flex flex-col justify-between font-sans">
        <Navbar />
        <div className="max-w-md mx-auto py-24 text-center">
          <p className="text-sm font-bold text-zinc-600">Product item not found.</p>
          <button onClick={() => router.push('/shop')} className="mt-4 text-xs font-bold text-teal-700 underline">
            Return to Storefront
          </button>
        </div>
      </div>
    );
  }

  const handleAddToCart = (includeBundle = false) => {
    const existingCartRaw = localStorage.getItem('antara_cart');
    let cartItems: any[] = existingCartRaw ? JSON.parse(existingCartRaw) : [];

    cartItems.push({ product, quantity: 1 });

    if (includeBundle) {
      bundleProducts.forEach((b) => cartItems.push({ product: b, quantity: 1 }));
    }

    localStorage.setItem('antara_cart', JSON.stringify(cartItems));

    store.recordEvent({
      type: includeBundle ? 'AI_BUNDLE_ACCEPTED' : 'PRODUCT_ADDED_TO_CART',
      customerId: 'cust_1042',
      customerName: 'Rahul Sharma',
      sessionId: `sess_${Date.now()}`,
      metadata: { productId: product.id, includeBundle },
    });

    setIsAdded(true);
    setTimeout(() => {
      router.push('/cart');
    }, 800);
  };

  const bundleTotalValue = product.price + bundleProducts.reduce((sum, b) => sum + b.price, 0);
  const bundleDiscountPrice = Math.round(bundleTotalValue * 0.85);

  return (
    <div className="min-h-screen bg-[#faf9f6] text-[#111318] font-sans pb-16">
      <Navbar />

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
        <button
          onClick={() => router.push('/shop')}
          className="inline-flex items-center gap-1.5 text-xs font-bold text-zinc-600 hover:text-zinc-900 transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
          Back to Storefront
        </button>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-start">
          {/* Left: Product Image */}
          <div className="rounded-3xl bg-white border border-zinc-200/80 p-4 shadow-subtle overflow-hidden">
            <div className="aspect-4/3 relative rounded-2xl overflow-hidden bg-zinc-100">
              <ProductImage
                src={product.image}
                alt={product.name}
                category={product.category}
                className="w-full h-full object-cover"
              />
            </div>
          </div>

          {/* Right: Product Details & AI Interventions */}
          <div className="space-y-6">
            <div>
              <span className="text-xs font-mono font-bold uppercase tracking-wider text-teal-700 bg-teal-50 px-3 py-1 rounded-full border border-teal-200">
                {product.category}
              </span>

              <h1 className="text-2xl sm:text-3xl font-black text-zinc-900 tracking-tight mt-3">
                {product.name}
              </h1>

              <div className="flex items-center gap-2 mt-2 text-xs text-zinc-500 font-medium">
                <div className="flex items-center gap-1 text-amber-500 font-bold">
                  <Star className="w-4 h-4 fill-current" />
                  <span>{product.rating}</span>
                </div>
                <span>•</span>
                <span>{product.reviewsCount} Verified Reviews</span>
                <span>•</span>
                <span className="text-emerald-600 font-bold">In Stock ({product.inventory} units)</span>
              </div>
            </div>

            <div className="p-4 rounded-2xl bg-white border border-zinc-200 shadow-subtle space-y-2">
              <div className="flex items-baseline gap-3">
                <span className="text-3xl font-black text-zinc-900">
                  {formatINR(product.price)}
                </span>
                {product.originalPrice && (
                  <span className="text-sm text-zinc-400 line-through font-mono">
                    {formatINR(product.originalPrice)}
                  </span>
                )}
              </div>
              <p className="text-xs text-zinc-600 leading-relaxed">{product.description}</p>
            </div>

            {/* AI Intent Intelligence Note */}
            {aiReason && (
              <div className="p-4 rounded-2xl bg-teal-500/10 border border-teal-500/30 text-xs text-teal-900 space-y-1">
                <span className="font-bold uppercase text-[10px] tracking-wider text-teal-700 flex items-center gap-1.5">
                  <Sparkles className="w-3.5 h-3.5" />
                  AI Intent Agent Rationale
                </span>
                <p className="leading-relaxed font-medium">{aiReason}</p>
              </div>
            )}

            {/* AI Dynamic Bundle Cross-Sell Card */}
            {bundleProducts.length > 0 && (
              <div className="p-5 rounded-2xl bg-zinc-900 text-white shadow-xl space-y-4">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-mono font-bold uppercase tracking-widest text-teal-400 flex items-center gap-1.5">
                    <Tag className="w-4 h-4" />
                    AI Revenue Growth Bundle Offer (15% OFF)
                  </span>
                </div>

                <div className="space-y-2">
                  <div className="text-xs text-zinc-300 font-medium">
                    Combine <strong>{product.name}</strong> with complementary accessories:
                  </div>
                  {bundleProducts.map((b) => (
                    <div key={b.id} className="p-2.5 rounded-xl bg-zinc-800 flex items-center justify-between text-xs">
                      <span className="truncate">{b.name}</span>
                      <span className="font-bold text-teal-300 shrink-0 ml-2">{formatINR(b.price)}</span>
                    </div>
                  ))}
                </div>

                <div className="flex items-center justify-between pt-2 border-t border-zinc-800">
                  <div>
                    <span className="text-xs text-zinc-400 block font-mono">Bundle Special:</span>
                    <span className="text-xl font-black text-emerald-400">{formatINR(bundleDiscountPrice)}</span>
                    <span className="text-xs text-zinc-500 line-through ml-2 font-mono">{formatINR(bundleTotalValue)}</span>
                  </div>

                  <button
                    onClick={() => handleAddToCart(true)}
                    className="px-4 py-2.5 rounded-xl bg-teal-500 hover:bg-teal-400 text-zinc-950 font-extrabold text-xs transition-all shadow-md"
                  >
                    Add Complete Bundle
                  </button>
                </div>
              </div>
            )}

            {/* Standard Add to Cart CTA */}
            <button
              onClick={() => handleAddToCart(false)}
              disabled={isAdded}
              className="w-full py-3.5 px-6 rounded-2xl bg-zinc-900 hover:bg-zinc-800 text-white font-extrabold text-sm flex items-center justify-center gap-2 shadow-lg transition-all"
            >
              <ShoppingBag className="w-4 h-4" />
              {isAdded ? 'Added to Cart!' : 'Add Single Item to Cart'}
            </button>
          </div>
        </div>
      </main>
    </div>
  );
}
