'use client';

import React, { useEffect, useState } from 'react';
import { Package, Plus, Search, Filter, Edit, Trash2, CheckCircle2, Sparkles } from 'lucide-react';
import { store } from '@/lib/db/store';
import { formatINR } from '@/lib/utils';
import { Product } from '@/types';
import { ProductImage } from '@/components/common/ProductImage';

export default function ProductsDashboardPage() {
  const [products, setProducts] = useState<Product[]>(store.getProducts());
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('All');
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);

  // Form State
  const [newProductName, setNewProductName] = useState('');
  const [newProductPrice, setNewProductPrice] = useState(2999);
  const [newProductCategory, setNewProductCategory] = useState<Product['category']>('Electronics');
  const [newProductDesc, setNewProductDesc] = useState('');

  useEffect(() => {
    const unsub = store.subscribe(() => {
      setProducts(store.getProducts());
    });
    return unsub;
  }, []);

  const categories = ['All', 'Electronics', 'Fashion', 'Fitness', 'Accessories', 'Home'];

  const filteredProducts = products.filter((p) => {
    const matchesQuery = p.name.toLowerCase().includes(searchQuery.toLowerCase()) || p.tags.some((t) => t.toLowerCase().includes(searchQuery.toLowerCase()));
    const matchesCat = selectedCategory === 'All' || p.category === selectedCategory;
    return matchesQuery && matchesCat;
  });

  const handleAddProduct = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newProductName) return;

    store.addProduct({
      id: `prod_${Date.now()}`,
      name: newProductName,
      description: newProductDesc || 'High quality premium commerce item.',
      price: Number(newProductPrice),
      originalPrice: Math.round(Number(newProductPrice) * 1.3),
      category: newProductCategory,
      image: 'https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=800&q=80',
      rating: 4.8,
      reviewsCount: 1,
      inventory: 50,
      tags: ['new-arrival', newProductCategory.toLowerCase()],
      relatedProductIds: [],
      complementaryProductIds: [],
    });

    setIsAddModalOpen(false);
    setNewProductName('');
    setNewProductDesc('');
  };

  const handleDeleteProduct = (id: string) => {
    if (confirm('Are you sure you want to remove this product from the catalog?')) {
      store.deleteProduct(id);
    }
  };

  return (
    <div className="space-y-8 font-sans pb-12">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-zinc-200/80 dark:border-zinc-800 pb-5">
        <div>
          <div className="flex items-center gap-2 text-xs font-semibold text-teal-700 dark:text-teal-400 mb-1">
            <Package className="w-4 h-4" />
            <span>Catalog Management & Affinity Mapping</span>
          </div>
          <h1 className="text-2xl font-black text-zinc-900 dark:text-zinc-100 tracking-tight">
            Merchant Product Catalog
          </h1>
          <p className="text-xs text-zinc-500 mt-0.5">
            Manage catalog items, pricing, inventory levels, and AI complementary bundle affinities.
          </p>
        </div>

        <button
          onClick={() => setIsAddModalOpen(true)}
          className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-teal-700 hover:bg-teal-800 text-white font-bold text-xs shadow-sm transition-all self-start md:self-auto"
        >
          <Plus className="w-4 h-4" />
          Add New Product
        </button>
      </div>

      {/* Filter & Search Bar */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-4 bg-white dark:bg-zinc-900 p-4 rounded-2xl border border-zinc-200/80 dark:border-zinc-800 shadow-subtle">
        <div className="flex items-center gap-1.5 overflow-x-auto w-full sm:w-auto pb-1 sm:pb-0">
          {categories.map((cat) => (
            <button
              key={cat}
              onClick={() => setSelectedCategory(cat)}
              className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all whitespace-nowrap ${
                selectedCategory === cat
                  ? 'bg-zinc-900 text-white dark:bg-zinc-100 dark:text-zinc-900 shadow-xs'
                  : 'text-zinc-500 hover:text-zinc-900'
              }`}
            >
              {cat}
            </button>
          ))}
        </div>

        <div className="relative w-full sm:w-64">
          <Search className="w-4 h-4 text-zinc-400 absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder="Search products or tags..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-9 pr-4 py-1.5 rounded-xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 text-xs font-medium focus:outline-none focus:ring-2 focus:ring-teal-500"
          />
        </div>
      </div>

      {/* Products Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        {filteredProducts.map((product) => (
          <div
            key={product.id}
            className="bg-white dark:bg-zinc-900 border border-zinc-200/80 dark:border-zinc-800 rounded-2xl overflow-hidden shadow-subtle flex flex-col justify-between group hover:border-teal-500 transition-all"
          >
            <div>
              <div className="aspect-4/3 relative bg-zinc-100 dark:bg-zinc-800 overflow-hidden">
                <ProductImage
                  src={product.image}
                  alt={product.name}
                  category={product.category}
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                />
                <span className="absolute top-3 left-3 bg-zinc-900/90 text-white font-mono text-[10px] font-bold px-2 py-0.5 rounded-full backdrop-blur-xs">
                  {product.category}
                </span>
                <span className="absolute top-3 right-3 bg-emerald-500 text-white font-mono text-[10px] font-bold px-2 py-0.5 rounded-full shadow-xs">
                  Stock: {product.inventory}
                </span>
              </div>

              <div className="p-4">
                <h3 className="text-sm font-bold text-zinc-900 dark:text-zinc-100 line-clamp-1">
                  {product.name}
                </h3>
                <p className="text-xs text-zinc-500 mt-1 line-clamp-2 leading-relaxed">
                  {product.description}
                </p>

                <div className="mt-4 flex items-baseline gap-2">
                  <span className="text-lg font-black text-zinc-900 dark:text-zinc-100">
                    {formatINR(product.price)}
                  </span>
                  {product.originalPrice && (
                    <span className="text-xs text-zinc-400 line-through">
                      {formatINR(product.originalPrice)}
                    </span>
                  )}
                </div>
              </div>
            </div>

            <div className="p-4 pt-0 border-t border-zinc-100 dark:border-zinc-800 flex items-center justify-between text-xs mt-3">
              <span className="text-zinc-400 font-mono text-[10px]">
                {product.complementaryProductIds.length} Bundle Affinities
              </span>
              <button
                onClick={() => handleDeleteProduct(product.id)}
                className="p-1.5 rounded-lg text-rose-500 hover:bg-rose-50 dark:hover:bg-rose-950/40 transition-colors"
                title="Delete Product"
              >
                <Trash2 className="w-4 h-4" />
              </button>
            </div>
          </div>
        ))}
      </div>

      {/* Modal: Add Product */}
      {isAddModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-xs">
          <div className="bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-2xl max-w-md w-full p-6 shadow-2xl">
            <h3 className="text-base font-bold text-zinc-900 dark:text-zinc-100 mb-4">
              Add New Product to Catalog
            </h3>

            <form onSubmit={handleAddProduct} className="space-y-4 text-xs font-sans">
              <div>
                <label className="block font-bold text-zinc-700 dark:text-zinc-300 mb-1">
                  Product Name
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g. AeroFit Performance Watch Strap"
                  value={newProductName}
                  onChange={(e) => setNewProductName(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl border border-zinc-200 dark:border-zinc-800 bg-zinc-50 dark:bg-zinc-800 focus:outline-none focus:ring-2 focus:ring-teal-500 font-medium"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold text-zinc-700 dark:text-zinc-300 mb-1">
                    Price (INR ₹)
                  </label>
                  <input
                    type="number"
                    required
                    value={newProductPrice}
                    onChange={(e) => setNewProductPrice(Number(e.target.value))}
                    className="w-full px-3 py-2 rounded-xl border border-zinc-200 dark:border-zinc-800 bg-zinc-50 dark:bg-zinc-800 focus:outline-none focus:ring-2 focus:ring-teal-500 font-medium"
                  />
                </div>

                <div>
                  <label className="block font-bold text-zinc-700 dark:text-zinc-300 mb-1">
                    Category
                  </label>
                  <select
                    value={newProductCategory}
                    onChange={(e) => setNewProductCategory(e.target.value as any)}
                    className="w-full px-3 py-2 rounded-xl border border-zinc-200 dark:border-zinc-800 bg-zinc-50 dark:bg-zinc-800 focus:outline-none focus:ring-2 focus:ring-teal-500 font-medium"
                  >
                    {categories.filter((c) => c !== 'All').map((c) => (
                      <option key={c} value={c}>
                        {c}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              <div>
                <label className="block font-bold text-zinc-700 dark:text-zinc-300 mb-1">
                  Description
                </label>
                <textarea
                  rows={3}
                  placeholder="Key features, specifications, and warranty details..."
                  value={newProductDesc}
                  onChange={(e) => setNewProductDesc(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl border border-zinc-200 dark:border-zinc-800 bg-zinc-50 dark:bg-zinc-800 focus:outline-none focus:ring-2 focus:ring-teal-500 font-medium"
                />
              </div>

              <div className="flex items-center justify-end gap-3 pt-4 border-t border-zinc-100 dark:border-zinc-800">
                <button
                  type="button"
                  onClick={() => setIsAddModalOpen(false)}
                  className="px-4 py-2 rounded-xl border border-zinc-200 dark:border-zinc-800 text-zinc-600 dark:text-zinc-400 font-bold hover:bg-zinc-100"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 rounded-xl bg-teal-700 hover:bg-teal-800 text-white font-bold shadow-sm"
                >
                  Save Product
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
