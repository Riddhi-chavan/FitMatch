'use client';

import { Suspense, use, useEffect, useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useStore } from '@/store';
import type { FitPref, SizeResult } from '@/types';

function ProductDetailContent({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = use(params);
  const router = useRouter();
  const profile = useStore((s) => s.profile);
  const setTryOnTop = useStore((s) => s.setTryOnTop);
  const setTryOnBottom = useStore((s) => s.setTryOnBottom);

  const [product, setProduct] = useState<any>(null);
  const [result, setResult] = useState<SizeResult | null>(null);
  const [overridePref, setOverridePref] = useState<FitPref>(profile?.fitPref || 'regular');
  const [loading, setLoading] = useState(true);
  const [showExplanation, setShowExplanation] = useState(false);
  const [saved, setSaved] = useState(false);

  // Load product
  useEffect(() => {
    fetch(`/api/products/${id}`)
      .then((res) => res.json())
      .then((prod) => {
        setProduct(prod);
      })
      .catch(console.error);
  }, [id]);

  // Request recommendation
  useEffect(() => {
    if (!product) return;

    // Use stored profile or fallback default guest profile
    const activeProfile = profile || {
      gender: product.gender,
      fitPref: 'regular',
      measurements: product.category === 'jeans' ? { waist: 82, hip: 97, inseam: 80 } : { chest: 94, shoulder: 46 },
    };

    setLoading(true);
    fetch('/api/recommend', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        productId: id,
        profile: activeProfile,
        fitPrefOverride: overridePref,
      }),
    })
      .then((res) => res.json())
      .then((data) => {
        if (!data.error) {
          setResult(data);
        }
      })
      .catch(console.error)
      .finally(() => setLoading(false));
  }, [product, id, profile, overridePref]);

  const handleTryOn = () => {
    if (product.category === 'tshirt' || product.category === 'shirt') {
      setTryOnTop(product._id);
    } else {
      setTryOnBottom(product._id);
    }
    router.push('/try-on');
  };

  if (!product) {
    return (
      <div className="min-h-screen bg-[#F6F3EE] flex items-center justify-center text-xs uppercase tracking-widest text-[#5C5852]">
        Loading garment details...
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#F6F3EE] px-6 py-8 md:px-16 max-w-4xl mx-auto flex flex-col justify-between">
      {/* Top Header */}
      <header className="flex justify-between items-center border-b border-[#E8E2D8] pb-4 mb-8">
        <Link href="/products" className="text-xs uppercase tracking-[0.18em] text-[#0E0E0E] hover:text-[#8C1D2F]">
          &larr; Back to Catalog
        </Link>
        <span className="font-serif tracking-widest text-lg font-bold uppercase">
          FitMatch
        </span>
      </header>

      <main className="grid grid-cols-1 md:grid-cols-2 gap-10 items-start flex-1">
        {/* Product Visual */}
        <div className="bg-white border border-[#E8E2D8] p-8 flex flex-col items-center justify-center">
          <div className="aspect-3/4 w-full bg-[#E8E2D8] flex flex-col items-center justify-center p-6 text-center">
            <span className="font-serif text-2xl text-[#0E0E0E]">{product.brandId?.name}</span>
            <span className="text-xs uppercase tracking-widest text-[#5C5852] mt-1">
              {product.fitType} Cut
            </span>
            {product.stretch && (
              <span className="text-[10px] text-[#8C1D2F] uppercase tracking-wider font-semibold mt-2">
                Stretch Fabric
              </span>
            )}
          </div>
          <span className="text-[11px] uppercase tracking-widest text-[#5C5852] mt-4">
            Studio Model #FM-{product._id.slice(-4)}
          </span>
        </div>

        {/* Product Details & Size Result */}
        <div className="space-y-6">
          <div>
            <span className="text-[11px] uppercase tracking-[0.2em] text-[#5C5852] font-semibold">
              {product.brandId?.name} · {product.gender}
            </span>
            <h1 className="font-serif text-3xl md:text-4xl text-[#0E0E0E] font-normal mt-1">
              {product.name}
            </h1>
            <p className="text-xs text-[#5C5852] mt-1 uppercase tracking-wider">
              Cut: {product.fitType} {product.stretch ? '· Comfort Stretch' : ''}
            </p>
          </div>

          {/* S8: SIZE RESULT CARD (Theme Atelier specs) */}
          <div className="bg-white border-2 border-[#0E0E0E] p-6 space-y-4">
            <div className="flex justify-between items-start">
              <div>
                <span className="text-[10px] uppercase tracking-[0.2em] text-[#5C5852] block mb-1">
                  Your Recommended Size
                </span>
                <span className="font-serif text-6xl text-[#8C1D2F] font-bold leading-none">
                  {loading ? '...' : result?.size || '—'}
                </span>
              </div>
              {result && (
                <span
                  className={`text-[10px] uppercase tracking-widest px-2.5 py-1 font-semibold border ${
                    result.confidence === 'high'
                      ? 'bg-[#0E0E0E] text-white border-[#0E0E0E]'
                      : 'bg-white text-[#5C5852] border-[#E8E2D8]'
                  }`}
                >
                  {result.confidence} Confidence
                </span>
              )}
            </div>

            <p className="text-xs text-[#0E0E0E] border-t border-[#E8E2D8] pt-3">
              {result?.note}
            </p>

            {/* 3-way Live Fit Preference Override Switch */}
            <div className="pt-2">
              <span className="text-[10px] uppercase tracking-widest text-[#5C5852] block mb-2 font-medium">
                Adjust Fit Preference for this item:
              </span>
              <div className="grid grid-cols-3 gap-2">
                {(['snug', 'regular', 'roomy'] as FitPref[]).map((pref) => (
                  <button
                    key={pref}
                    type="button"
                    onClick={() => setOverridePref(pref)}
                    className={`py-1.5 text-[11px] uppercase tracking-wider font-medium border ${
                      overridePref === pref
                        ? 'bg-[#0E0E0E] text-white border-[#0E0E0E]'
                        : 'bg-white text-[#5C5852] border-[#E8E2D8]'
                    }`}
                  >
                    {pref}
                  </button>
                ))}
              </div>
            </div>

            {/* Alternative Size Chips */}
            {result?.alternatives && (
              <div className="pt-2">
                <span className="text-[10px] uppercase tracking-widest text-[#5C5852] block mb-2 font-medium">
                  Alternative Sizes:
                </span>
                <div className="flex gap-2">
                  {result.alternatives.map((alt) => (
                    <div
                      key={alt.size}
                      className={`px-3 py-1.5 text-xs font-semibold uppercase tracking-wider border ${
                        alt.label === 'best'
                          ? 'bg-[#0E0E0E] text-white border-[#0E0E0E]'
                          : 'bg-[#F6F3EE] text-[#5C5852] border-[#E8E2D8]'
                      }`}
                    >
                      {alt.size} <span className="text-[9px] font-normal block text-center opacity-75">{alt.label}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* S9 Explanation Link */}
            <div className="pt-2">
              <button
                type="button"
                onClick={() => setShowExplanation(true)}
                className="text-xs text-[#8C1D2F] underline uppercase tracking-wider font-semibold hover:text-[#0E0E0E]"
              >
                Why this size? &rarr;
              </button>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex gap-3 pt-2">
            <button
              type="button"
              onClick={handleTryOn}
              className="w-2/3 py-4 bg-[#0E0E0E] text-white text-xs uppercase tracking-[0.2em] font-medium hover:bg-[#8C1D2F] transition-colors"
            >
              Try It On (Live)
            </button>
            <button
              type="button"
              onClick={() => setSaved(!saved)}
              className={`w-1/3 py-4 border text-xs uppercase tracking-[0.2em] font-medium transition-colors ${
                saved
                  ? 'bg-[#8C1D2F] text-white border-[#8C1D2F]'
                  : 'bg-white text-[#0E0E0E] border-[#0E0E0E] hover:bg-[#E8E2D8]'
              }`}
            >
              {saved ? 'Saved ✓' : 'Save'}
            </button>
          </div>
        </div>
      </main>

      {/* S9: SIZE EXPLANATION MODAL / SHEET */}
      {showExplanation && result && (
        <div className="fixed inset-0 bg-[#0E0E0E]/50 flex items-center justify-center p-4 z-50">
          <div className="bg-[#F6F3EE] border-2 border-[#0E0E0E] p-6 max-w-lg w-full space-y-6 max-h-[90vh] overflow-y-auto">
            <div className="flex justify-between items-start border-b border-[#E8E2D8] pb-3">
              <div>
                <span className="text-[10px] uppercase tracking-widest text-[#8C1D2F] font-semibold">
                  S9 Explanation
                </span>
                <h3 className="font-serif text-2xl text-[#0E0E0E]">Why Size {result.size}?</h3>
              </div>
              <button
                type="button"
                onClick={() => setShowExplanation(false)}
                className="text-lg font-bold text-[#0E0E0E] hover:text-[#8C1D2F]"
              >
                ✕
              </button>
            </div>

            {/* Cut explanation note */}
            <div className="bg-white p-3 border border-[#E8E2D8] text-xs text-[#0E0E0E]">
              <strong>Garment Cut:</strong> {product.fitType.toUpperCase()}.{' '}
              {product.fitType === 'baggy' || product.fitType === 'relaxed'
                ? 'Looser cuts lean toward the smaller size when you are between two sizes.'
                : 'Tighter cuts leave less room, so we lean toward the larger size when between two.'}
              {product.stretch && ' Stretch fabric allows a snugger fit comfortably.'}
            </div>

            {/* Measurement breakdown table */}
            <div>
              <span className="text-[10px] uppercase tracking-widest text-[#5C5852] font-semibold block mb-2">
                Measurement by Measurement
              </span>
              <table className="w-full text-xs text-left border-collapse">
                <thead>
                  <tr className="border-b border-[#E8E2D8] text-[#5C5852] uppercase text-[10px]">
                    <th className="py-2">Dimension</th>
                    <th className="py-2">Your Body</th>
                    <th className="py-2">Brand Range</th>
                    <th className="py-2">Fit Status</th>
                  </tr>
                </thead>
                <tbody>
                  {result.breakdown.map((row) => (
                    <tr key={row.measure} className="border-b border-[#E8E2D8]">
                      <td className="py-2.5 font-medium uppercase text-[#0E0E0E]">{row.measure}</td>
                      <td className="py-2.5 text-[#0E0E0E]">{row.user} cm</td>
                      <td className="py-2.5 text-[#5C5852]">{row.range.min}–{row.range.max} cm</td>
                      <td className="py-2.5">
                        <span
                          className={`px-2 py-0.5 text-[10px] uppercase font-bold ${
                            row.status === 'good'
                              ? 'bg-[#0E0E0E] text-white'
                              : 'bg-[#8C1D2F] text-white'
                          }`}
                        >
                          {row.status}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* Source info */}
            <div className="text-[10px] text-[#5C5852] pt-2 border-t border-[#E8E2D8] flex justify-between">
              <span>Source: {result.source.brand} Official Chart ({result.source.chartType})</span>
              <span>Updated: {result.source.lastChecked}</span>
            </div>

            <button
              type="button"
              onClick={() => setShowExplanation(false)}
              className="w-full py-3 bg-[#0E0E0E] text-white text-xs uppercase tracking-[0.2em] font-medium"
            >
              Done
            </button>
          </div>
        </div>
      )}

      <footer className="border-t border-[#E8E2D8] pt-6 mt-8 text-center text-[10px] text-[#5C5852] uppercase tracking-widest">
        FitMatch Studio · All data processed locally
      </footer>
    </div>
  );
}

export default function ProductDetailPage(props: { params: Promise<{ id: string }> }) {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen bg-[#F6F3EE] flex items-center justify-center text-xs uppercase tracking-widest text-[#5C5852]">
          Loading garment...
        </div>
      }
    >
      <ProductDetailContent {...props} />
    </Suspense>
  );
}
