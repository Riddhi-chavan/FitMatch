'use client';

import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useSession, signOut } from 'next-auth/react';
import { useStore } from '@/store';

export default function ProfilePage() {
  const router = useRouter();
  const { data: session } = useSession();
  const profile = useStore((s) => s.profile);
  const clearProfile = useStore((s) => s.clearProfile);

  const handleDeleteData = async () => {
    if (confirm('Are you sure you want to delete all stored profile data? This cannot be undone.')) {
      clearProfile();
      try {
        await fetch('/api/me/profile', { method: 'DELETE' });
      } catch (err) {
        console.error('Failed to delete cloud profile:', err);
      }
      alert('Profile data cleared.');
      router.push('/');
    }
  };

  const handleSignOut = async () => {
    await signOut({ callbackUrl: '/' });
  };

  return (
    <div className="min-h-screen bg-[#F6F3EE] px-6 py-8 md:px-16 max-w-3xl mx-auto flex flex-col justify-between">
      <header className="flex justify-between items-center border-b border-[#E8E2D8] pb-4 mb-8">
        <Link href="/home" className="text-xs uppercase tracking-[0.18em] text-[#0E0E0E] hover:text-[#8C1D2F]">
          &larr; Back to Studio
        </Link>
        <span className="font-serif tracking-widest text-lg font-bold uppercase">
          FitMatch Profile
        </span>
      </header>

      <main className="space-y-8 flex-1">
        <div className="flex justify-between items-end">
          <div>
            <span className="text-[10px] uppercase tracking-[0.2em] text-[#8C1D2F] font-semibold">
              S13 · Account &amp; Data
            </span>
            <h1 className="font-serif text-3xl md:text-4xl text-[#0E0E0E] font-normal mt-1">
              Fit Profile &amp; Privacy
            </h1>
          </div>
          {session?.user && (
            <button
              type="button"
              onClick={handleSignOut}
              className="text-xs uppercase tracking-wider text-[#5C5852] hover:text-[#8C1D2F] pb-1 border-b border-transparent hover:border-[#8C1D2F]"
            >
              Sign Out
            </button>
          )}
        </div>

        {session?.user && (
          <div className="bg-white border border-[#E8E2D8] px-6 py-4 flex items-center justify-between">
            <div>
              <span className="text-[10px] uppercase tracking-wider text-[#5C5852] block">
                Google Account
              </span>
              <span className="text-xs font-semibold text-[#0E0E0E]">
                {session.user.name} ({session.user.email})
              </span>
            </div>
            <span className="text-[10px] uppercase tracking-widest text-[#8C1D2F] font-bold px-2 py-0.5 bg-[#8C1D2F]/10">
              Cloud Synced
            </span>
          </div>
        )}

        {profile ? (
          <div className="bg-white border border-[#E8E2D8] p-6 space-y-6">
            <div className="flex justify-between items-start border-b border-[#E8E2D8] pb-4">
              <div>
                <span className="text-[10px] uppercase tracking-wider text-[#5C5852] block">
                  Active Shopper
                </span>
                <span className="font-serif text-xl font-bold uppercase text-[#0E0E0E]">
                  {profile.gender} · {profile.fitPref} Fit Preference
                </span>
              </div>
              <Link
                href="/onboarding?edit=true"
                className="px-3 py-1.5 border border-[#0E0E0E] text-[11px] uppercase tracking-wider hover:bg-[#0E0E0E] hover:text-white transition-colors"
              >
                Edit Measurements
              </Link>
            </div>

            <div>
              <span className="text-[11px] uppercase tracking-wider text-[#5C5852] font-semibold block mb-3">
                Saved Body Measurements
              </span>
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
                {Object.entries(profile.measurements).map(([key, val]) => (
                  <div key={key} className="bg-[#F6F3EE] p-3 border border-[#E8E2D8]">
                    <span className="text-[10px] uppercase text-[#5C5852] block">{key}</span>
                    <span className="font-bold text-sm text-[#0E0E0E]">{val} cm</span>
                  </div>
                ))}
              </div>
            </div>

            <div className="pt-4 border-t border-[#E8E2D8] space-y-4">
              <span className="text-[11px] uppercase tracking-wider text-[#8C1D2F] font-bold block">
                Privacy &amp; Data Erasure (FR1, Non-Functional)
              </span>
              <p className="text-xs text-[#5C5852] leading-relaxed">
                FitMatch encrypts saved profiles with AES-256-GCM. We never sell body measurements,
                and camera feeds are processed exclusively on this device.
              </p>
              <button
                type="button"
                onClick={handleDeleteData}
                className="px-6 py-3 border border-[#8C1D2F] text-[#8C1D2F] text-xs uppercase tracking-[0.18em] font-semibold hover:bg-[#8C1D2F] hover:text-white transition-colors"
              >
                Delete My Profile &amp; Data
              </button>
            </div>
          </div>
        ) : (
          <div className="bg-white border border-[#E8E2D8] p-8 text-center space-y-4">
            <p className="text-xs text-[#5C5852]">No profile is stored in this session.</p>
            <Link
              href="/onboarding"
              className="inline-block px-6 py-3 bg-[#0E0E0E] text-white text-xs uppercase tracking-widest"
            >
              Start Onboarding
            </Link>
          </div>
        )}
      </main>

      <footer className="border-t border-[#E8E2D8] pt-6 mt-12 text-center text-[10px] text-[#5C5852] uppercase tracking-widest">
        FitMatch · Full Privacy Guaranteed
      </footer>
    </div>
  );
}
