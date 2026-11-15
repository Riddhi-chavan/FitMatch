import Link from 'next/link';

export default function LandingPage() {
  return (
    <div className="min-h-screen flex flex-col justify-between px-6 py-8 md:px-16 md:py-12 max-w-5xl mx-auto">
      {/* Top Bar */}
      <header className="flex justify-between items-center border-b border-[#E8E2D8] pb-6">
        <div>
          <span className="font-serif tracking-widest text-2xl font-bold uppercase">
            FitMatch
          </span>
          <span className="block text-[10px] tracking-[0.2em] uppercase text-[#5C5852] mt-0.5">
            Atelier Edition
          </span>
        </div>
        <Link
          href="/login"
          className="text-xs uppercase tracking-[0.18em] text-[#0E0E0E] hover:text-[#8C1D2F] transition-colors font-medium border-b border-transparent hover:border-[#8C1D2F] pb-0.5"
        >
          Log in
        </Link>
      </header>

      {/* Hero Section */}
      <main className="my-auto py-12 md:py-20 flex flex-col items-center text-center">
        <span className="text-[11px] uppercase tracking-[0.22em] text-[#8C1D2F] font-semibold mb-4">
          Cross-Brand Size Finder & Virtual Trial Room
        </span>

        <h1 className="font-serif text-4xl sm:text-6xl md:text-7xl font-normal tracking-tight text-[#0E0E0E] max-w-3xl leading-[1.1]">
          Know your size in every brand.
        </h1>

        <p className="font-serif italic text-2xl sm:text-3xl md:text-4xl text-[#5C5852] mt-3 mb-10 max-w-2xl">
          Skip the trial room queue.
        </p>

        {/* Action Buttons */}
        <div className="flex flex-col sm:flex-row gap-4 w-full sm:w-auto mb-14">
          <Link
            href="/onboarding"
            className="px-8 py-4 bg-[#0E0E0E] text-white text-xs uppercase tracking-[0.2em] font-medium hover:bg-[#8C1D2F] transition-colors"
          >
            Find My Size
          </Link>
          <Link
            href="/onboarding?guest=true"
            className="px-8 py-4 bg-transparent border border-[#0E0E0E] text-[#0E0E0E] text-xs uppercase tracking-[0.2em] font-medium hover:bg-[#E8E2D8] transition-colors"
          >
            Continue as Guest
          </Link>
        </div>

        {/* Supported Brands */}
        <div className="w-full max-w-xl border-t border-b border-[#E8E2D8] py-5 mb-14">
          <p className="text-[10px] uppercase tracking-[0.2em] text-[#5C5852] mb-3">
            Calibrated for real size charts
          </p>
          <div className="flex justify-center items-center gap-6 sm:gap-10 font-serif text-sm tracking-wider text-[#0E0E0E]">
            <span className="font-bold">H&amp;M</span>
            <span>·</span>
            <span className="font-bold">ZARA</span>
            <span>·</span>
            <span className="font-bold">UNIQLO</span>
            <span>·</span>
            <span className="font-bold">LEVI&apos;S</span>
          </div>
        </div>

        {/* How It Works (3 Steps) */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 text-left max-w-3xl w-full">
          <div className="border-t border-[#E8E2D8] pt-4">
            <span className="font-serif text-2xl text-[#8C1D2F]">01</span>
            <h3 className="text-xs uppercase tracking-[0.16em] font-bold mt-2 mb-1">
              Tell us a size you wear
            </h3>
            <p className="text-xs text-[#5C5852] leading-relaxed">
              Pick a brand and item you already own, or enter your measurements once.
            </p>
          </div>

          <div className="border-t border-[#E8E2D8] pt-4">
            <span className="font-serif text-2xl text-[#8C1D2F]">02</span>
            <h3 className="text-xs uppercase tracking-[0.16em] font-bold mt-2 mb-1">
              Pick any garment
            </h3>
            <p className="text-xs text-[#5C5852] leading-relaxed">
              Our rules engine factors in product cut (skinny, baggy) and fabric stretch.
            </p>
          </div>

          <div className="border-t border-[#E8E2D8] pt-4">
            <span className="font-serif text-2xl text-[#8C1D2F]">03</span>
            <h3 className="text-xs uppercase tracking-[0.16em] font-bold mt-2 mb-1">
              See size &amp; live try-on
            </h3>
            <p className="text-xs text-[#5C5852] leading-relaxed">
              Get an instant confidence score, fit breakdown, and optional webcam preview.
            </p>
          </div>
        </div>
      </main>

      {/* Footer / Privacy Assurance */}
      <footer className="border-t border-[#E8E2D8] pt-6 flex flex-col sm:flex-row justify-between items-center text-xs text-[#5C5852] gap-2">
        <div className="flex items-center gap-2">
          <span className="inline-block w-2 h-2 rounded-full bg-[#8C1D2F]"></span>
          <span>Privacy first: Camera frames never leave your browser.</span>
        </div>
        <p className="text-[11px] tracking-wider uppercase text-[#5C5852]">
          FitMatch &copy; 2026
        </p>
      </footer>
    </div>
  );
}
