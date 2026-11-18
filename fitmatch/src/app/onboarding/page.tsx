'use client';

import { Suspense, useState, useEffect } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import Link from 'next/link';
import { useSession } from 'next-auth/react';
import { useStore } from '@/store';
import type { Category, FitPref, Gender, Profile } from '@/types';

function OnboardingContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const isEditing = searchParams.get('edit') === 'true';
  const { data: session, status: authStatus } = useSession();

  const currentStoreProfile = useStore((s) => s.profile);
  const setStoreProfile = useStore((s) => s.setProfile);

  // If returning user and not in explicit edit mode, redirect straight to home
  useEffect(() => {
    if (isEditing) return;

    // 1. If profile already in local store
    if (currentStoreProfile && Object.keys(currentStoreProfile.measurements || {}).length > 0) {
      router.push('/home');
      return;
    }

    // 2. If logged in with Google, check cloud profile in MongoDB
    if (authStatus === 'authenticated') {
      fetch('/api/me/profile')
        .then((res) => (res.ok ? res.json() : null))
        .then((data) => {
          if (data?.profile) {
            setStoreProfile(data.profile);
            router.push('/home');
          }
        })
        .catch(console.error);
    }
  }, [isEditing, currentStoreProfile, authStatus, router, setStoreProfile]);

  // Step management (1: method & gender, 2: details, 3: preference & privacy)
  const [step, setStep] = useState<1 | 2 | 3>(1);
  const [method, setMethod] = useState<'reference' | 'measurements'>('reference');
  const [gender, setGender] = useState<Gender>(currentStoreProfile?.gender || 'men');

  // S4A: Reference size state
  const [brands, setBrands] = useState<{ _id: string; name: string; slug: string }[]>([]);
  const [selectedBrandSlug, setSelectedBrandSlug] = useState<string>('hm');
  const [refCategory, setRefCategory] = useState<Category>('jeans');
  const [availableSizes, setAvailableSizes] = useState<string[]>([]);
  const [selectedSize, setSelectedSize] = useState<string>('32');
  const [estimatedPreview, setEstimatedPreview] = useState<{ waist?: number; hip?: number; chest?: number } | null>(null);

  // S4B: Measurements state
  const [unit, setUnit] = useState<'cm' | 'in'>('cm');
  const [waist, setWaist] = useState<string>(currentStoreProfile?.measurements?.waist?.toString() || '82');
  const [hip, setHip] = useState<string>(currentStoreProfile?.measurements?.hip?.toString() || '97');
  const [inseam, setInseam] = useState<string>(currentStoreProfile?.measurements?.inseam?.toString() || '80');
  const [chest, setChest] = useState<string>(currentStoreProfile?.measurements?.chest?.toString() || '94');
  const [shoulder, setShoulder] = useState<string>(currentStoreProfile?.measurements?.shoulder?.toString() || '46');
  const [height, setHeight] = useState<string>(currentStoreProfile?.measurements?.height?.toString() || '175');
  const [weight, setWeight] = useState<string>(currentStoreProfile?.measurements?.weight?.toString() || '72');

  // S5: Fit Preference & Privacy
  const [fitPref, setFitPref] = useState<FitPref>(currentStoreProfile?.fitPref || 'regular');
  const [saveProfile, setSaveProfile] = useState<boolean>(true);
  const [loading, setLoading] = useState(false);

  // Load brands on mount
  useEffect(() => {
    fetch('/api/brands')
      .then((res) => res.json())
      .then((data) => {
        if (Array.isArray(data) && data.length > 0) {
          setBrands(data);
          setSelectedBrandSlug(data[0].slug);
        }
      })
      .catch(console.error);
  }, []);

  // Fetch size chart rows whenever brand, category, or gender changes
  useEffect(() => {
    if (!selectedBrandSlug) return;
    fetch(`/api/size-charts?brand=${selectedBrandSlug}&category=${refCategory}&gender=${gender}`)
      .then((res) => res.json())
      .then((chart) => {
        if (chart && chart.rows) {
          const labels = chart.rows.map((r: any) => r.label);
          setAvailableSizes(labels);
          if (labels.length > 0 && (!selectedSize || !labels.includes(selectedSize))) {
            setSelectedSize(labels[Math.min(2, labels.length - 1)]);
          }
        } else {
          setAvailableSizes([]);
          setEstimatedPreview(null);
        }
      })
      .catch(console.error);
  }, [selectedBrandSlug, refCategory, gender]);

  // Estimate measurements when reference selection changes
  useEffect(() => {
    if (method !== 'reference' || !selectedBrandSlug || !selectedSize) return;
    const selectedBrand = brands.find((b) => b.slug === selectedBrandSlug);
    if (!selectedBrand) return;

    fetch('/api/profile/from-reference', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        gender,
        references: [{ brandId: selectedBrand._id, category: refCategory, size: selectedSize }],
      }),
    })
      .then((res) => res.json())
      .then((data) => {
        if (data.measurements) {
          setEstimatedPreview(data.measurements);
        }
      })
      .catch(console.error);
  }, [method, selectedBrandSlug, refCategory, selectedSize, gender, brands]);

  const handleFinishOnboarding = async () => {
    setLoading(true);
    let finalMeasurements: Record<string, number> = {};

    if (method === 'reference' && estimatedPreview) {
      finalMeasurements = estimatedPreview;
    } else {
      const scale = unit === 'in' ? 2.54 : 1;
      if (waist) finalMeasurements.waist = Math.round(parseFloat(waist) * scale);
      if (hip) finalMeasurements.hip = Math.round(parseFloat(hip) * scale);
      if (inseam) finalMeasurements.inseam = Math.round(parseFloat(inseam) * scale);
      if (chest) finalMeasurements.chest = Math.round(parseFloat(chest) * scale);
      if (shoulder) finalMeasurements.shoulder = Math.round(parseFloat(shoulder) * scale);
      if (height) finalMeasurements.height = Math.round(parseFloat(height));
      if (weight) finalMeasurements.weight = Math.round(parseFloat(weight));
    }

    const selectedBrand = brands.find((b) => b.slug === selectedBrandSlug);
    const references =
      method === 'reference' && selectedBrand
        ? [{ brandId: selectedBrand._id, category: refCategory, size: selectedSize }]
        : undefined;

    const profile: Profile = {
      gender,
      fitPref,
      measurements: finalMeasurements,
      references,
    };

    setStoreProfile(profile);

    // If logged in with Google (or saveProfile is selected), sync profile to MongoDB!
    if (session?.user && saveProfile) {
      try {
        await fetch('/api/me/profile', {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(profile),
        });
      } catch (err) {
        console.error('Failed to sync profile to cloud:', err);
      }
    }

    router.push('/home');
  };

  return (
    <div className="min-h-screen bg-[#F6F3EE] flex flex-col justify-between px-6 py-8 md:px-16 max-w-xl mx-auto">
      {/* Header */}
      <header className="flex justify-between items-center border-b border-[#E8E2D8] pb-4">
        <Link href="/" className="font-serif tracking-widest text-lg font-bold uppercase">
          FitMatch
        </Link>
        <span className="text-xs uppercase tracking-[0.18em] text-[#5C5852]">
          Step {step} of 3
        </span>
      </header>

      {/* Progress Line */}
      <div className="w-full bg-[#E8E2D8] h-0.5 my-6">
        <div
          className="bg-[#0E0E0E] h-0.5 transition-all duration-300"
          style={{ width: `${(step / 3) * 100}%` }}
        />
      </div>

      <main className="flex-1 flex flex-col justify-center">
        {/* STEP 1: Method & Gender */}
        {step === 1 && (
          <div className="space-y-8">
            <div>
              <span className="text-[10px] uppercase tracking-[0.2em] text-[#8C1D2F] font-semibold">
                Setup your profile
              </span>
              <h2 className="font-serif text-3xl md:text-4xl font-normal text-[#0E0E0E] mt-1">
                Who are you shopping for?
              </h2>
            </div>

            {/* Gender Toggle */}
            <div className="grid grid-cols-2 gap-3">
              <button
                type="button"
                onClick={() => setGender('men')}
                className={`py-3 text-xs uppercase tracking-[0.18em] font-medium transition-colors border ${
                  gender === 'men'
                    ? 'bg-[#0E0E0E] text-white border-[#0E0E0E]'
                    : 'bg-transparent text-[#0E0E0E] border-[#E8E2D8] hover:border-[#0E0E0E]'
                }`}
              >
                Men
              </button>
              <button
                type="button"
                onClick={() => setGender('women')}
                className={`py-3 text-xs uppercase tracking-[0.18em] font-medium transition-colors border ${
                  gender === 'women'
                    ? 'bg-[#0E0E0E] text-white border-[#0E0E0E]'
                    : 'bg-transparent text-[#0E0E0E] border-[#E8E2D8] hover:border-[#0E0E0E]'
                }`}
              >
                Women
              </button>
            </div>

            <div className="pt-4 border-t border-[#E8E2D8]">
              <label className="text-[11px] uppercase tracking-[0.18em] text-[#5C5852] block mb-3 font-semibold">
                How do you want to tell us your size?
              </label>

              <div className="space-y-3">
                <button
                  type="button"
                  onClick={() => setMethod('reference')}
                  className={`w-full text-left p-4 border transition-all ${
                    method === 'reference'
                      ? 'border-[#0E0E0E] bg-white shadow-xs'
                      : 'border-[#E8E2D8] bg-transparent hover:border-[#5C5852]'
                  }`}
                >
                  <div className="flex justify-between items-center">
                    <span className="text-xs uppercase tracking-[0.16em] font-bold">
                      Use a size I already wear
                    </span>
                    <span className="text-[10px] text-[#8C1D2F] tracking-widest uppercase font-semibold">
                      Recommended · 30s
                    </span>
                  </div>
                  <p className="text-xs text-[#5C5852] mt-1">
                    Pick a brand &amp; garment you wear today. We convert it using their official size chart.
                  </p>
                </button>

                <button
                  type="button"
                  onClick={() => setMethod('measurements')}
                  className={`w-full text-left p-4 border transition-all ${
                    method === 'measurements'
                      ? 'border-[#0E0E0E] bg-white shadow-xs'
                      : 'border-[#E8E2D8] bg-transparent hover:border-[#5C5852]'
                  }`}
                >
                  <div className="flex justify-between items-center">
                    <span className="text-xs uppercase tracking-[0.16em] font-bold">
                      Enter my measurements
                    </span>
                    <span className="text-[10px] text-[#5C5852] tracking-widest uppercase">
                      Exact · 2 mins
                    </span>
                  </div>
                  <p className="text-xs text-[#5C5852] mt-1">
                    Waist, hip, chest and inseam in cm or inches.
                  </p>
                </button>
              </div>
            </div>

            <button
              type="button"
              onClick={() => setStep(2)}
              className="w-full py-4 bg-[#0E0E0E] text-white text-xs uppercase tracking-[0.2em] font-medium hover:bg-[#8C1D2F] transition-colors mt-6"
            >
              Continue
            </button>
          </div>
        )}

        {/* STEP 2A: Reference Item */}
        {step === 2 && method === 'reference' && (
          <div className="space-y-6">
            <div>
              <span className="text-[10px] uppercase tracking-[0.2em] text-[#8C1D2F] font-semibold">
                Step 2: Reference Fit
              </span>
              <h2 className="font-serif text-3xl font-normal text-[#0E0E0E] mt-1">
                Pick something that fits you well
              </h2>
            </div>

            {/* Brand Dropdown */}
            <div>
              <label className="text-[11px] uppercase tracking-[0.18em] text-[#5C5852] block mb-2 font-medium">
                Brand
              </label>
              <select
                value={selectedBrandSlug}
                onChange={(e) => setSelectedBrandSlug(e.target.value)}
                className="w-full p-3 bg-white border border-[#E8E2D8] text-xs uppercase tracking-wider text-[#0E0E0E] focus:outline-none focus:border-[#0E0E0E]"
              >
                {brands.map((b) => (
                  <option key={b.slug} value={b.slug}>
                    {b.name}
                  </option>
                ))}
              </select>
            </div>

            {/* Category Selector */}
            <div>
              <label className="text-[11px] uppercase tracking-[0.18em] text-[#5C5852] block mb-2 font-medium">
                Category
              </label>
              <div className="grid grid-cols-2 gap-2">
                <button
                  type="button"
                  onClick={() => setRefCategory('jeans')}
                  className={`py-2.5 text-xs uppercase tracking-[0.16em] font-medium border ${
                    refCategory === 'jeans'
                      ? 'bg-[#0E0E0E] text-white border-[#0E0E0E]'
                      : 'bg-white text-[#0E0E0E] border-[#E8E2D8]'
                  }`}
                >
                  Jeans
                </button>
                <button
                  type="button"
                  onClick={() => setRefCategory('tshirt')}
                  className={`py-2.5 text-xs uppercase tracking-[0.16em] font-medium border ${
                    refCategory === 'tshirt'
                      ? 'bg-[#0E0E0E] text-white border-[#0E0E0E]'
                      : 'bg-white text-[#0E0E0E] border-[#E8E2D8]'
                  }`}
                >
                  T-Shirt
                </button>
              </div>
            </div>

            {/* Size Chips */}
            <div>
              <label className="text-[11px] uppercase tracking-[0.18em] text-[#5C5852] block mb-2 font-medium">
                Your Size in this item
              </label>
              <div className="flex flex-wrap gap-2">
                {availableSizes.map((s) => (
                  <button
                    key={s}
                    type="button"
                    onClick={() => setSelectedSize(s)}
                    className={`min-w-12 px-4 py-2 text-xs font-semibold uppercase tracking-wider border ${
                      selectedSize === s
                        ? 'bg-[#0E0E0E] text-white border-[#0E0E0E]'
                        : 'bg-white text-[#0E0E0E] border-[#E8E2D8] hover:border-[#0E0E0E]'
                    }`}
                  >
                    {s}
                  </button>
                ))}
              </div>
            </div>

            {/* Live Estimation Card */}
            {estimatedPreview && (
              <div className="p-4 bg-white border border-[#E8E2D8] mt-4">
                <span className="text-[10px] uppercase tracking-[0.18em] text-[#8C1D2F] font-semibold block mb-1">
                  Estimated Measurements
                </span>
                <div className="flex gap-6 text-xs text-[#0E0E0E]">
                  {estimatedPreview.waist && (
                    <div>
                      <span className="text-[#5C5852] block text-[10px] uppercase">Waist</span>
                      <span className="font-bold">{estimatedPreview.waist} cm</span>
                    </div>
                  )}
                  {estimatedPreview.hip && (
                    <div>
                      <span className="text-[#5C5852] block text-[10px] uppercase">Hip</span>
                      <span className="font-bold">{estimatedPreview.hip} cm</span>
                    </div>
                  )}
                  {estimatedPreview.chest && (
                    <div>
                      <span className="text-[#5C5852] block text-[10px] uppercase">Chest</span>
                      <span className="font-bold">{estimatedPreview.chest} cm</span>
                    </div>
                  )}
                </div>
              </div>
            )}

            <div className="flex gap-3 pt-4">
              <button
                type="button"
                onClick={() => setStep(1)}
                className="w-1/3 py-4 border border-[#0E0E0E] text-xs uppercase tracking-[0.2em] font-medium"
              >
                Back
              </button>
              <button
                type="button"
                onClick={() => setStep(3)}
                className="w-2/3 py-4 bg-[#0E0E0E] text-white text-xs uppercase tracking-[0.2em] font-medium hover:bg-[#8C1D2F] transition-colors"
              >
                Continue
              </button>
            </div>
          </div>
        )}

        {/* STEP 2B: Direct Measurements (CM / IN Spacing Fixed) */}
        {step === 2 && method === 'measurements' && (
          <div className="space-y-6">
            <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 pb-3 border-b border-[#E8E2D8]">
              <div>
                <span className="text-[10px] uppercase tracking-[0.2em] text-[#8C1D2F] font-semibold block mb-1">
                  Step 2: Exact Measures
                </span>
                <h2 className="font-serif text-2xl sm:text-3xl font-normal text-[#0E0E0E]">
                  Your Body Measurements
                </h2>
              </div>
              <div className="flex items-center gap-2 self-start sm:self-auto shrink-0">
                <span className="text-[10px] uppercase tracking-wider text-[#5C5852] font-semibold">
                  Unit:
                </span>
                <div className="flex border border-[#0E0E0E] bg-white">
                  <button
                    type="button"
                    onClick={() => setUnit('cm')}
                    className={`px-3.5 py-1.5 text-xs font-bold uppercase transition-colors ${
                      unit === 'cm'
                        ? 'bg-[#0E0E0E] text-white'
                        : 'bg-white text-[#5C5852] hover:text-[#0E0E0E]'
                    }`}
                  >
                    cm
                  </button>
                  <button
                    type="button"
                    onClick={() => setUnit('in')}
                    className={`px-3.5 py-1.5 text-xs font-bold uppercase transition-colors ${
                      unit === 'in'
                        ? 'bg-[#0E0E0E] text-white'
                        : 'bg-white text-[#5C5852] hover:text-[#0E0E0E]'
                    }`}
                  >
                    in
                  </button>
                </div>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="text-[10px] uppercase tracking-wider text-[#5C5852] block mb-1.5 font-medium">
                  Waist * (Jeans)
                </label>
                <input
                  type="number"
                  value={waist}
                  onChange={(e) => setWaist(e.target.value)}
                  className="w-full p-3 bg-white border border-[#E8E2D8] text-sm text-[#0E0E0E] focus:outline-none focus:border-[#0E0E0E]"
                />
              </div>
              <div>
                <label className="text-[10px] uppercase tracking-wider text-[#5C5852] block mb-1.5 font-medium">
                  Hip * (Jeans)
                </label>
                <input
                  type="number"
                  value={hip}
                  onChange={(e) => setHip(e.target.value)}
                  className="w-full p-3 bg-white border border-[#E8E2D8] text-sm text-[#0E0E0E] focus:outline-none focus:border-[#0E0E0E]"
                />
              </div>
              <div>
                <label className="text-[10px] uppercase tracking-wider text-[#5C5852] block mb-1.5 font-medium">
                  Chest * (Tops)
                </label>
                <input
                  type="number"
                  value={chest}
                  onChange={(e) => setChest(e.target.value)}
                  className="w-full p-3 bg-white border border-[#E8E2D8] text-sm text-[#0E0E0E] focus:outline-none focus:border-[#0E0E0E]"
                />
              </div>
              <div>
                <label className="text-[10px] uppercase tracking-wider text-[#5C5852] block mb-1.5 font-medium">
                  Inseam
                </label>
                <input
                  type="number"
                  value={inseam}
                  onChange={(e) => setInseam(e.target.value)}
                  className="w-full p-3 bg-white border border-[#E8E2D8] text-sm text-[#0E0E0E] focus:outline-none focus:border-[#0E0E0E]"
                />
              </div>
              <div>
                <label className="text-[10px] uppercase tracking-wider text-[#5C5852] block mb-1.5 font-medium">
                  Height (cm)
                </label>
                <input
                  type="number"
                  value={height}
                  onChange={(e) => setHeight(e.target.value)}
                  className="w-full p-3 bg-white border border-[#E8E2D8] text-sm text-[#0E0E0E] focus:outline-none focus:border-[#0E0E0E]"
                />
              </div>
              <div>
                <label className="text-[10px] uppercase tracking-wider text-[#5C5852] block mb-1.5 font-medium">
                  Weight (kg)
                </label>
                <input
                  type="number"
                  value={weight}
                  onChange={(e) => setWeight(e.target.value)}
                  className="w-full p-3 bg-white border border-[#E8E2D8] text-sm text-[#0E0E0E] focus:outline-none focus:border-[#0E0E0E]"
                />
              </div>
            </div>

            <div className="flex gap-3 pt-4">
              <button
                type="button"
                onClick={() => setStep(1)}
                className="w-1/3 py-4 border border-[#0E0E0E] text-xs uppercase tracking-[0.2em] font-medium"
              >
                Back
              </button>
              <button
                type="button"
                onClick={() => setStep(3)}
                className="w-2/3 py-4 bg-[#0E0E0E] text-white text-xs uppercase tracking-[0.2em] font-medium hover:bg-[#8C1D2F] transition-colors"
              >
                Continue
              </button>
            </div>
          </div>
        )}

        {/* STEP 3: Fit Preference & Privacy */}
        {step === 3 && (
          <div className="space-y-6">
            <div>
              <span className="text-[10px] uppercase tracking-[0.2em] text-[#8C1D2F] font-semibold">
                Step 3: Preference &amp; Privacy
              </span>
              <h2 className="font-serif text-3xl font-normal text-[#0E0E0E] mt-1">
                How do you like clothes to fit?
              </h2>
            </div>

            {/* Preference Chips */}
            <div className="grid grid-cols-3 gap-3">
              {(['snug', 'regular', 'roomy'] as FitPref[]).map((pref) => (
                <button
                  key={pref}
                  type="button"
                  onClick={() => setFitPref(pref)}
                  className={`py-3 text-xs uppercase tracking-[0.18em] font-medium border ${
                    fitPref === pref
                      ? 'bg-[#0E0E0E] text-white border-[#0E0E0E]'
                      : 'bg-white text-[#0E0E0E] border-[#E8E2D8] hover:border-[#0E0E0E]'
                  }`}
                >
                  {pref}
                </button>
              ))}
            </div>

            {/* Privacy Controls */}
            <div className="p-4 bg-white border border-[#E8E2D8] space-y-3">
              <span className="text-[11px] uppercase tracking-[0.16em] font-bold text-[#0E0E0E] block">
                Data &amp; Privacy
              </span>
              <label className="flex items-start gap-3 cursor-pointer">
                <input
                  type="radio"
                  name="saveOption"
                  checked={saveProfile}
                  onChange={() => setSaveProfile(true)}
                  className="mt-0.5 accent-[#8C1D2F]"
                />
                <span className="text-xs text-[#0E0E0E]">
                  <strong>Save encrypted profile:</strong> Kept safely in your account for instant recommendations.
                </span>
              </label>

              <label className="flex items-start gap-3 cursor-pointer">
                <input
                  type="radio"
                  name="saveOption"
                  checked={!saveProfile}
                  onChange={() => setSaveProfile(false)}
                  className="mt-0.5 accent-[#8C1D2F]"
                />
                <span className="text-xs text-[#5C5852]">
                  <strong>This device only:</strong> Discard cloud storage and keep profile only on this browser.
                </span>
              </label>
            </div>

            <div className="flex gap-3 pt-2">
              <button
                type="button"
                onClick={() => setStep(2)}
                className="w-1/3 py-4 border border-[#0E0E0E] text-xs uppercase tracking-[0.2em] font-medium"
              >
                Back
              </button>
              <button
                type="button"
                disabled={loading}
                onClick={handleFinishOnboarding}
                className="w-2/3 py-4 bg-[#8C1D2F] text-white text-xs uppercase tracking-[0.2em] font-medium hover:bg-[#0E0E0E] transition-colors"
              >
                {loading ? 'Saving...' : 'Show My Sizes'}
              </button>
            </div>
          </div>
        )}
      </main>

      <footer className="text-center pt-6 text-[10px] text-[#5C5852] uppercase tracking-widest">
        FitMatch · Studio Atelier
      </footer>
    </div>
  );
}

export default function OnboardingPage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen bg-[#F6F3EE] flex items-center justify-center text-xs uppercase tracking-widest text-[#5C5852]">
          Loading onboarding...
        </div>
      }
    >
      <OnboardingContent />
    </Suspense>
  );
}
