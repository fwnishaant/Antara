'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import { Search, Filter, Sparkles, Star, ShoppingBag, ArrowRight } from 'lucide-react';
import { store } from '@/lib/db/store';
import { formatINR } from '@/lib/utils';
import { Product } from '@/types';
import { Navbar } from '@/components/layout/Navbar';
import { AiShoppingAssistant } from '@/components/storefront/AiAssistant';
import { ProductImage } from '@/components/common/ProductImage';

export default function StorefrontPage() {
  const [products, setProducts] = useState<Product[]>(store.getProducts());
  const [selectedCategory, setSelectedCategory] = useState<string>('All');
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [maxPrice, setMaxPrice] = useState<number>(15000);

  useEffect(() => {
    const unsub = store.subscribe(() => {
      setProducts(store.getProducts());
    });
    return unsub;
  }, []);

  const categories = ['All', 'Electronics', 'Fashion', 'Fitness', 'Accessories', 'Home'];

  const filteredProducts = products.filter((p) => {
    const matchesCat = selectedCategory === 'All' || p.category === selectedCategory;
    const matchesQuery =
      p.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      p.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
      p.tags.some((t) => t.toLowerCase().includes(searchQuery.toLowerCase()));
    const matchesPrice = p.price <= maxPrice;
    return matchesCat && matchesQuery && matchesPrice;
  });

  return (
    <div className="min-h-screen bg-[#faf9f6] text-[#111318] font-sans pb-16">
      <Navbar />

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
        {/* Storefront Editorial Hero */}
        <div className="rounded-3xl bg-zinc-900 text-white p-8 md:p-12 relative overflow-hidden shadow-2xl">
          <div className="max-w-2xl relative z-10 space-y-4">
            <span className="text-xs font-mono font-bold uppercase tracking-widest text-teal-400 bg-teal-950/80 px-3 py-1 rounded-full border border-teal-500/30">
              ANTARA Intelligent Storefront Demo
            </span>
            <h1 className="text-3xl md:text-5xl font-black tracking-tight leading-tight">
              Curated High-Performance Gear & Smart Accessories
            </h1>
            <p className="text-xs md:text-sm text-zinc-300 leading-relaxed font-normal">
              Experience intent-driven shopping. Every search query and product view is analyzed in real time by autonomous AI agents to curate hyper-relevant catalog choices and dynamic bundle savings.
            </p>
          </div>
        </div>

        {/* Search & Filter Control Bar */}
        <div className="bg-white border border-zinc-200 rounded-2xl p-4 shadow-subtle flex flex-col md:flex-row items-center justify-between gap-4">
          {/* Category Tabs */}
          <div className="flex items-center gap-1.5 overflow-x-auto w-full md:w-auto pb-1 md:pb-0">
            {categories.map((cat) => (
              <button
                key={cat}
                onClick={() => setSelectedCategory(cat)}
                className={`px-4 py-2 rounded-xl text-xs font-bold transition-all whitespace-nowrap ${
                  selectedCategory === cat
                    ? 'bg-zinc-900 text-white shadow-xs'
                    : 'text-zinc-600 hover:text-zinc-900 hover:bg-zinc-100'
                }`}
              >
                {cat}
              </button>
            ))}
          </div>

          {/* Natural Language Search Input */}
          <div className="relative w-full md:w-80">
            <Search className="w-4 h-4 text-zinc-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              placeholder="Search or describe intent (e.g. running shoes)..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-10 pr-4 py-2 rounded-xl border border-zinc-200 text-xs font-medium focus:outline-none focus:ring-2 focus:ring-teal-500 bg-zinc-50"
            />
          </div>
        </div>

        {/* Catalog Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {filteredProducts.map((product) => (
            <Link
              key={product.id}
              href={`/shop/product/${product.id}`}
              className="bg-white border border-zinc-200/80 rounded-2xl overflow-hidden shadow-subtle hover:shadow-float hover:border-teal-500 transition-all group flex flex-col justify-between"
            >
              <div>
                <div className="aspect-4/3 relative bg-zinc-100 overflow-hidden">
                  <ProductImage
                    src={product.image}
                    alt={product.name}
                    category={product.category}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                  />
                  <span className="absolute top-3 left-3 bg-zinc-900/90 text-white font-mono text-[10px] font-bold px-2.5 py-0.5 rounded-full">
                    {product.category}
                  </span>
                  {product.originalPrice && (
                    <span className="absolute top-3 right-3 bg-teal-600 text-white font-mono text-[10px] font-bold px-2 py-0.5 rounded-full">
                      SAVE {formatINR(product.originalPrice - product.price)}
                    </span>
                  )}
                </div>

                <div className="p-5">
                  <div className="flex items-center gap-1 text-amber-500 text-xs font-bold mb-1">
                    <Star className="w-3.5 h-3.5 fill-current" />
                    <span>{product.rating}</span>
                    <span className="text-zinc-400 font-normal">({product.reviewsCount})</span>
                  </div>

                  <h3 className="text-sm font-extrabold text-zinc-900 group-hover:text-teal-700 transition-colors line-clamp-1">
                    {product.name}
                  </h3>
                  <p className="text-xs text-zinc-500 mt-1 line-clamp-2 leading-relaxed">
                    {product.description}
                  </p>
                </div>
              </div>

              <div className="p-5 pt-0 border-t border-zinc-100 flex items-center justify-between mt-2">
                <div>
                  <span className="text-base font-black text-zinc-900 block">
                    {formatINR(product.price)}
                  </span>
                  {product.originalPrice && (
                    <span className="text-xs text-zinc-400 line-through font-mono">
                      {formatINR(product.originalPrice)}
                    </span>
                  )}
                </div>

                <span className="p-2 rounded-xl bg-zinc-100 group-hover:bg-teal-700 group-hover:text-white transition-colors">
                  <ArrowRight className="w-4 h-4" />
                </span>
              </div>
            </Link>
          ))}
        </div>
      </main>

      <AiShoppingAssistant />
    </div>
  );
}
