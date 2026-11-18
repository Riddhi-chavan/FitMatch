'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useSession } from 'next-auth/react';
import { useStore } from '@/store';

export default function HomePage() {
  const router = useRouter();
  const profile = useStore((s) => s.profile);
  const setStoreProfile = useStore((s) => s.setProfile);
  const { data: session, status: authStatus } = useSession();

  const [featured, setFeatured] = useState<any[]>([]);
  const [recommendations, setRecommendations] = useState<Record<string, { size: string; confidence: string }>>({});
  const [isLoadingProfile, setIsLoadingProfile] = useState(true);

  // Initialize and check profile (from local store or MongoDB)
  useEffect(() => {
    let isMounted = true;

    async function loadProfile() {
      // 1. If profile is already in Zustand store (restored from localStorage)
      if (profile && Object.keys(profile.measurements || {}).length > 0) {
        if (isMounted) setIsLoadingProfile(false);
        return;
      }

      // 2. If authenticated with Google, attempt to fetch saved profile from DB
      if (authStatus === 'authenticated') {
        try {
          const res = await fetch('/api/me/profile');
          if (res.ok) {
            const data = await res.json();
            if (data?.profile && isMounted) {
              setStoreProfile(data.profile);
              setIsLoadingProfile(false);
              return;
            }
          }
        } catch (e) {
          console.error('Error fetching profile from cloud:', e);
        }
      }

      // 3. If finished loading auth and no profile anywhere -> redirect to onboarding
      if (authStatus !== 'loading' && isMounted) {
        setIsLoadingProfile(false);
        router.push('/onboarding');
      }
    }

    loadProfile();

    return () => {
      isMounted = false;
    };
  }, [profile, authStatus, router, setStoreProfile]);

  // Load featured products once profile is available
  useEffect(() => {
    if (!profile) return;

    fetch(`/api/products?gender=${profile.gender}&limit=6`)
      .then((res) => res.json())
      .then((data) => {
        if (data.products && data.products.length > 0) {
          setFeatured(data.products);
          const pIds = data.products.map((p: any) => p._id);
          fetch('/api/recommend/batch', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ productIds: pIds, profile }),
          })
            .then((r) => r.json())
            .then((recs) => setRecommendations(recs))
            .catch(console.error);
        } else {
          setFeatured([]);
        }
      })
      .catch(console.error);
  }, [profile]);

  if (isLoadingProfile || !profile) {
    return (
      <div className="min-h-screen bg-[#F6F3EE] flex items-center justify-center text-xs uppercase tracking-widest text-[#5C5852]">
        Loading your studio...
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#F6F3EE] flex flex-col justify-between px-6 py-8 md:px-16 max-w-5xl mx-auto">
      {/* Header */}
      <header className="flex justify-between items-center border-b border-[#E8E2D8] pb-4">
        <div>
          <span className="font-serif tracking-widest text-xl font-bold uppercase">FitMatch</span>
          <span className="block text-[10px] tracking-[0.2em] uppercase text-[#5C5852]">
            Studio
          </span>
        </div>
        <div className="flex items-center gap-5">
          <Link
            href="/products"
            className="text-xs uppercase tracking-[0.16em] text-[#0E0E0E] hover:text-[#8C1D2F]"
          >
            Catalog
          </Link>
          <Link
            href="/profile"
            className="text-xs uppercase tracking-[0.16em] text-[#0E0E0E] hover:text-[#8C1D2F] font-semibold flex items-center gap-2"
          >
            <span>Profile</span>
            {session?.user && (
              <span className="w-2 h-2 rounded-full bg-[#8C1D2F]" title="Google Account Synced" />
            )}
          </Link>
        </div>
      </header>

      {/* Guest Notice — ONLY show for unauthenticated guest sessions */}
      {!session?.user && (
        <div className="bg-[#E8E2D8] px-4 py-2.5 text-[11px] text-[#5C5852] flex justify-between items-center mt-4">
          <span>Guest mode · Profile saved on this device only.</span>
          <Link href="/login" className="text-[#8C1D2F] font-semibold uppercase tracking-wider text-[10px]">
            Sign in with Google to sync to cloud &rarr;
          </Link>
        </div>
      )}

      <main className="py-8 space-y-10 flex-1">
        {/* Profile Card */}
        <div className="bg-white border border-[#E8E2D8] p-6 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <span className="text-[10px] uppercase tracking-[0.2em] text-[#8C1D2F] font-semibold">
                Your Active Fit Profile
              </span>
              {session?.user && (
                <span className="text-[10px] uppercase tracking-wider text-[#5C5852] font-medium">
                  · Synced to {session.user.email}
                </span>
              )}
            </div>
            <h2 className="font-serif text-2xl text-[#0E0E0E]">
              Shopping for {profile.gender === 'men' ? 'Men' : 'Women'} · {profile.fitPref} fit
            </h2>
            <div className="flex gap-4 text-xs text-[#5C5852] mt-2">
              {profile.measurements.waist && <span>Waist: {profile.measurements.waist}cm</span>}
              {profile.measurements.hip && <span>Hip: {profile.measurements.hip}cm</span>}
              {profile.measurements.chest && <span>Chest: {profile.measurements.chest}cm</span>}
            </div>
          </div>
          <Link
            href="/onboarding?edit=true"
            className="px-4 py-2 border border-[#0E0E0E] text-xs uppercase tracking-[0.16em] font-medium hover:bg-[#0E0E0E] hover:text-white transition-colors"
          >
            Edit Profile
          </Link>
        </div>

        {/* Category Tiles (Jeans, T-Shirts, Shirts) */}
        <div>
          <span className="text-[11px] uppercase tracking-[0.2em] text-[#5C5852] font-semibold block mb-4">
            Select Category
          </span>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <Link
              href="/products?category=jeans"
              className="p-6 bg-white border border-[#E8E2D8] hover:border-[#0E0E0E] transition-all group"
            >
              <span className="font-serif text-2xl text-[#0E0E0E] block group-hover:text-[#8C1D2F] transition-colors">
                Jeans
              </span>
              <p className="text-xs text-[#5C5852] mt-1">
                Skinny, slim, straight &amp; relaxed cuts
              </p>
            </Link>

            <Link
              href="/products?category=tshirt"
              className="p-6 bg-white border border-[#E8E2D8] hover:border-[#0E0E0E] transition-all group"
            >
              <span className="font-serif text-2xl text-[#0E0E0E] block group-hover:text-[#8C1D2F] transition-colors">
                T-Shirts
              </span>
              <p className="text-xs text-[#5C5852] mt-1">
                Slim, regular &amp; oversized fits
              </p>
            </Link>

            <Link
              href="/products?category=shirt"
              className="p-6 bg-white border border-[#E8E2D8] hover:border-[#0E0E0E] transition-all group opacity-75"
            >
              <span className="font-serif text-2xl text-[#0E0E0E] block group-hover:text-[#8C1D2F] transition-colors">
                Shirts
              </span>
              <p className="text-xs text-[#5C5852] mt-1">
                Neck &amp; sleeve sizing (coming next)
              </p>
            </Link>
          </div>
        </div>

        {/* Recommended Garments Grid */}
        <div>
          <div className="flex justify-between items-baseline mb-4">
            <span className="text-[11px] uppercase tracking-[0.2em] text-[#5C5852] font-semibold">
              Curated for Your Fit ({profile.gender})
            </span>
            <Link
              href="/products"
              className="text-xs uppercase tracking-[0.16em] text-[#8C1D2F] font-semibold"
            >
              View All ({featured.length}) &rarr;
            </Link>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6">
            {featured.map((prod) => {
              const rec = recommendations[prod._id];
              return (
                <Link
                  key={prod._id}
                  href={`/products/${prod._id}`}
                  className="bg-white border border-[#E8E2D8] p-4 flex flex-col justify-between hover:border-[#0E0E0E] transition-all group"
                >
                  <div className="aspect-square bg-[#E8E2D8] flex items-center justify-center mb-4 relative overflow-hidden">
                    <span className="text-[11px] uppercase tracking-[0.2em] text-[#5C5852]">
                      {prod.brandId?.name || 'Garment'}
                    </span>
                    {rec && 'size' in rec && (
                      <div className="absolute top-2 right-2 bg-[#0E0E0E] text-white px-2 py-1 text-[10px] uppercase tracking-widest font-bold">
                        Size {rec.size}
                      </div>
                    )}
                  </div>
                  <div>
                    <span className="text-[10px] uppercase tracking-wider text-[#5C5852]">
                      {prod.brandId?.name} · {prod.fitType} fit
                    </span>
                    <h3 className="font-serif text-lg font-normal text-[#0E0E0E] group-hover:text-[#8C1D2F] transition-colors mt-0.5">
                      {prod.name}
                    </h3>
                  </div>
                </Link>
              );
            })}
          </div>
        </div>
      </main>

      <footer className="border-t border-[#E8E2D8] pt-6 text-center text-[10px] text-[#5C5852] uppercase tracking-widest">
        FitMatch Studio · Atelier Theme
      </footer>
    </div>
  );
}
