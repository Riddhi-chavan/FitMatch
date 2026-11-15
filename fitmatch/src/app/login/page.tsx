'use client';

import Link from 'next/link';
import { useRouter } from 'next/navigation';

export default function LoginPage() {
  const router = useRouter();

  const handleGoogleLogin = () => {
    // In dev mode without configured OAuth keys, redirect gracefully to onboarding
    router.push('/onboarding');
  };

  return (
    <div className="min-h-screen bg-[#F6F3EE] flex flex-col justify-between px-6 py-8 md:px-16 max-w-md mx-auto">
      <header className="border-b border-[#E8E2D8] pb-4">
        <Link href="/" className="text-xs uppercase tracking-[0.18em] text-[#0E0E0E] hover:text-[#8C1D2F]">
          &larr; Back
        </Link>
      </header>

      <main className="my-auto py-12 space-y-8 text-center">
        <div>
          <span className="text-[10px] uppercase tracking-[0.2em] text-[#8C1D2F] font-semibold">
            S2 · Member Access
          </span>
          <h1 className="font-serif text-3xl md:text-4xl text-[#0E0E0E] font-normal mt-1">
            Welcome to FitMatch
          </h1>
          <p className="text-xs text-[#5C5852] mt-2">
            Save your sizes across devices, or continue with complete anonymity.
          </p>
        </div>

        <div className="space-y-4 pt-4">
          <button
            type="button"
            onClick={handleGoogleLogin}
            className="w-full py-4 bg-white border border-[#0E0E0E] text-[#0E0E0E] text-xs uppercase tracking-[0.2em] font-medium hover:bg-[#E8E2D8] transition-colors flex items-center justify-center gap-3"
          >
            <span className="font-serif font-bold text-sm">G</span>
            <span>Continue with Google</span>
          </button>

          <div className="flex items-center gap-4 my-4">
            <div className="flex-1 h-px bg-[#E8E2D8]"></div>
            <span className="text-[10px] uppercase tracking-widest text-[#5C5852]">or</span>
            <div className="flex-1 h-px bg-[#E8E2D8]"></div>
          </div>

          <Link
            href="/onboarding"
            className="block w-full py-4 bg-[#0E0E0E] text-white text-xs uppercase tracking-[0.2em] font-medium hover:bg-[#8C1D2F] transition-colors text-center"
          >
            Continue as Guest
          </Link>
          <span className="text-[10px] text-[#5C5852] block">
            Guests keep their profile only for this session.
          </span>
        </div>
      </main>

      <footer className="border-t border-[#E8E2D8] pt-6 text-center text-[10px] text-[#5C5852]">
        By continuing you accept our Terms of Service &amp; Privacy Policy.
      </footer>
    </div>
  );
}
