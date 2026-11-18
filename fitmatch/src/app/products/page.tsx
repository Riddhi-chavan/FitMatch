'use client';

import { Suspense, useEffect, useState } from 'react';
import Link from 'next/link';
import { useSearchParams } from 'next/navigation';
import { useStore } from '@/store';

function ProductCatalogContent() {
  const searchParams = useSearchParams();
  const profile = useStore((s) => s.profile);

  const [products, setProducts] = useState<any[]>([]);
  const [brands, setBrands] = useState<any[]>([]);
  const [recommendations, setRecommendations] = useState<Record<string, { size: string; confidence: string }>>({});

  const [selectedCategory, setSelectedCategory] = useState<string>(searchParams.get('category') || '');
  const [selectedBrand, setSelectedBrand] = useState<string>(searchParams.get('brand') || '');
  const [selectedFit, setSelectedFit] = useState<string>(searchParams.get('fit') || '');

  // Load brands
  useEffect(() => {
    fetch('/api/brands')
      .then((res) => res.json())
      .then((data) => setBrands(data))
      .catch(console.error);
  }, []);

  // Fetch filtered products
  useEffect(() => {
    const params = new URLSearchParams();
    if (selectedCategory) params.set('category', selectedCategory);
    if (selectedBrand) params.set('brand', selectedBrand);
    if (selectedFit) params.set('fit', selectedFit);
    if (profile?.gender) params.set('gender', profile.gender);

    fetch(`/api/products?${params.toString()}`)
      .then((res) => res.json())
      .then((data) => {
        if (data.products) {
          setProducts(data.products);
          if (profile && data.products.length > 0) {
            fetch('/api/recommend/batch', {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({
                productIds: data.products.map((p: any) => p._id),
                profile,
              }),
            })
              .then((r) => r.json())
              .then((recs) => setRecommendations(recs))
              .catch(console.error);
          }
        }
      })
      .catch(console.error);
  }, [selectedCategory, selectedBrand, selectedFit, profile]);

  return (
    <div className="min-h-screen bg-[#F6F3EE] px-6 py-8 md:px-16 max-w-6xl mx-auto flex flex-col justify-between">
      {/* Top Bar */}
      <header className="flex justify-between items-center border-b border-[#E8E2D8] pb-4 mb-8">
        <div>
          <Link href="/home" className="font-serif tracking-widest text-xl font-bold uppercase">
            FitMatch
          </Link>
          <span className="block text-[10px] tracking-[0.2em] uppercase text-[#5C5852]">
            Garment Catalog
          </span>
        </div>
        <div className="flex gap-4">
          <Link
            href="/home"
            className="text-xs uppercase tracking-[0.16em] text-[#0E0E0E] hover:text-[#8C1D2F]"
          >
            &larr; Studio
          </Link>
          <Link
            href="/profile"
            className="text-xs uppercase tracking-[0.16em] text-[#0E0E0E] hover:text-[#8C1D2F]"
          >
            Profile
          </Link>
        </div>
      </header>

      {/* Filter Bar */}
      <div className="bg-white border border-[#E8E2D8] p-4 mb-8 space-y-4">
        <div className="flex flex-wrap gap-4 items-center justify-between">
          {/* Category Chips */}
          <div className="flex items-center gap-2">
            <span className="text-[10px] uppercase tracking-wider text-[#5C5852] font-semibold mr-1">
              Category:
            </span>
            {['', 'jeans', 'tshirt'].map((cat) => (
              <button
                key={cat}
                type="button"
                onClick={() => setSelectedCategory(cat)}
                className={`px-3 py-1.5 text-xs uppercase tracking-wider border ${
                  selectedCategory === cat
                    ? 'bg-[#0E0E0E] text-white border-[#0E0E0E]'
                    : 'bg-white text-[#0E0E0E] border-[#E8E2D8]'
                }`}
              >
                {cat || 'All'}
              </button>
            ))}
          </div>

          {/* Brand Filter */}
          <div className="flex items-center gap-2">
            <span className="text-[10px] uppercase tracking-wider text-[#5C5852] font-semibold mr-1">
              Brand:
            </span>
            <select
              value={selectedBrand}
              onChange={(e) => setSelectedBrand(e.target.value)}
              className="px-3 py-1.5 bg-white border border-[#E8E2D8] text-xs uppercase tracking-wider text-[#0E0E0E]"
            >
              <option value="">All Brands</option>
              {brands.map((b) => (
                <option key={b.slug} value={b.slug}>
                  {b.name}
                </option>
              ))}
            </select>
          </div>
        </div>

        {/* Fit Type Filter */}
        <div className="flex flex-wrap items-center gap-2 pt-2 border-t border-[#E8E2D8]">
          <span className="text-[10px] uppercase tracking-wider text-[#5C5852] font-semibold mr-1">
            Fit Cut:
          </span>
          {['', 'skinny', 'slim', 'straight', 'relaxed', 'baggy'].map((fit) => (
            <button
              key={fit}
              type="button"
              onClick={() => setSelectedFit(fit)}
              className={`px-2.5 py-1 text-[11px] uppercase tracking-wider border ${
                selectedFit === fit
                  ? 'bg-[#8C1D2F] text-white border-[#8C1D2F]'
                  : 'bg-white text-[#5C5852] border-[#E8E2D8] hover:border-[#0E0E0E]'
              }`}
            >
              {fit || 'All Cuts'}
            </button>
          ))}
        </div>
      </div>

      {/* Product Grid */}
      <main className="flex-1">
        {products.length === 0 ? (
          <div className="p-12 text-center text-sm text-[#5C5852] border border-dashed border-[#E8E2D8]">
            No garments match this filter criteria.
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6">
            {products.map((prod) => {
              const rec = recommendations[prod._id];
              return (
                <Link
                  key={prod._id}
                  href={`/products/${prod._id}`}
                  className="bg-white border border-[#E8E2D8] p-4 flex flex-col justify-between hover:border-[#0E0E0E] transition-all group"
                >
                  <div className="aspect-3/4 bg-[#E8E2D8] mb-4 relative overflow-hidden">
                    {prod.images?.[0] ? (
                      <img
                        src={prod.images[0]}
                        alt={prod.name}
                        className="w-full h-full object-cover object-top transition-transform duration-500 group-hover:scale-105"
                      />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center">
                        <span className="text-xs uppercase tracking-[0.2em] text-[#5C5852]">
                          {prod.brandId?.name}
                        </span>
                      </div>
                    )}
                    {rec && 'size' in rec && (
                      <div className="absolute top-2 right-2 bg-[#0E0E0E] text-white px-2.5 py-1 text-[10px] uppercase tracking-widest font-bold shadow-xs">
                        Size {rec.size}
                      </div>
                    )}
                    <div className="absolute bottom-2 left-2 bg-white/90 backdrop-blur-xs px-2 py-0.5 text-[9px] uppercase tracking-wider font-semibold text-[#0E0E0E]">
                      {prod.brandId?.name}
                    </div>
                  </div>
                  <div>
                    <span className="text-[10px] uppercase tracking-wider text-[#5C5852]">
                      {prod.brandId?.name} · {prod.fitType} cut
                      {prod.stretch ? ' · stretch' : ''}
                    </span>
                    <h3 className="font-serif text-lg font-normal text-[#0E0E0E] group-hover:text-[#8C1D2F] transition-colors mt-0.5">
                      {prod.name}
                    </h3>
                  </div>
                </Link>
              );
            })}
          </div>
        )}
      </main>

      <footer className="border-t border-[#E8E2D8] pt-6 mt-12 text-center text-[10px] text-[#5C5852] uppercase tracking-widest">
        FitMatch Studio · Showing {products.length} Garments
      </footer>
    </div>
  );
}

export default function ProductCatalogPage() {
  return (
    <Suspense fallback={<div className="p-12 text-center text-xs uppercase tracking-widest text-[#5C5852]">Loading catalog...</div>}>
      <ProductCatalogContent />
    </Suspense>
  );
}
