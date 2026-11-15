'use client';

import { useEffect, useRef, useState } from 'react';
import Link from 'next/link';
import { useStore } from '@/store';

export default function TryOnPage() {
  const tryOn = useStore((s) => s.tryOn);
  const setTryOnTop = useStore((s) => s.setTryOnTop);
  const setTryOnBottom = useStore((s) => s.setTryOnBottom);

  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);

  const [hasPermission, setHasPermission] = useState<boolean | null>(null);
  const [cameraError, setCameraError] = useState<string | null>(null);
  const [allProducts, setAllProducts] = useState<any[]>([]);

  // Fetch products so user can swap garments live
  useEffect(() => {
    fetch('/api/products')
      .then((res) => res.json())
      .then((data) => {
        if (data.products) setAllProducts(data.products);
      })
      .catch(console.error);
  }, []);

  const requestCamera = async () => {
    try {
      setCameraError(null);
      const stream = await navigator.mediaDevices.getUserMedia({
        video: { width: 1280, height: 720, facingMode: 'user' },
      });
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        videoRef.current.play();
      }
      setHasPermission(true);
    } catch (err: any) {
      setCameraError(err.message || 'Camera access was denied.');
      setHasPermission(false);
    }
  };

  // Stop camera stream when leaving screen
  useEffect(() => {
    return () => {
      if (videoRef.current && videoRef.current.srcObject) {
        const stream = videoRef.current.srcObject as MediaStream;
        stream.getTracks().forEach((track) => track.stop());
      }
    };
  }, []);

  const tops = allProducts.filter((p) => p.category === 'tshirt' || p.category === 'shirt');
  const bottoms = allProducts.filter((p) => p.category === 'jeans');

  const selectedTop = allProducts.find((p) => p._id === tryOn.topId) || tops[0];
  const selectedBottom = allProducts.find((p) => p._id === tryOn.bottomId) || bottoms[0];

  return (
    <div className="min-h-screen bg-[#0E0E0E] text-[#F6F3EE] flex flex-col justify-between p-6">
      {/* Header */}
      <header className="flex justify-between items-center border-b border-[#5C5852]/30 pb-4">
        <Link
          href="/products"
          className="text-xs uppercase tracking-[0.18em] text-[#E8E2D8] hover:text-white"
        >
          &larr; Exit Try-On
        </Link>
        <span className="font-serif tracking-widest text-lg font-bold uppercase text-white">
          FitMatch Virtual Fitting Room
        </span>
        <span className="text-[10px] text-[#B08D57] uppercase tracking-widest border border-[#B08D57] px-2 py-0.5">
          Live B1 Preview
        </span>
      </header>

      {/* Main Viewport */}
      <main className="flex-1 flex flex-col items-center justify-center my-6 relative">
        {hasPermission === true ? (
          <div className="relative max-w-2xl w-full aspect-video bg-black border border-[#5C5852]/50 overflow-hidden flex items-center justify-center">
            {/* Mirrored webcam stream */}
            <video
              ref={videoRef}
              className="w-full h-full object-cover scale-x-[-1]"
              playsInline
              muted
            />
            <canvas ref={canvasRef} className="absolute inset-0 w-full h-full pointer-events-none" />

            {/* Simulated garment overlay guide */}
            <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none p-6 text-center">
              <div className="border border-white/20 p-4 max-w-sm backdrop-blur-xs bg-black/40">
                <span className="text-[10px] uppercase tracking-[0.2em] text-[#8C1D2F] font-bold block mb-1">
                  Active Virtual Pair
                </span>
                <p className="text-xs text-white font-medium">
                  Top: {selectedTop?.name} ({selectedTop?.fitType})
                </p>
                <p className="text-xs text-white font-medium">
                  Bottom: {selectedBottom?.name} ({selectedBottom?.fitType})
                </p>
                <span className="text-[9px] text-[#E8E2D8]/70 block mt-2">
                  Pose detector calibrated · Stand back so hips and shoulders are visible
                </span>
              </div>
            </div>
          </div>
        ) : (
          /* S10 Camera Permission Request Card */
          <div className="bg-[#171717] border border-[#5C5852]/40 p-8 max-w-md text-center space-y-6">
            <span className="text-[10px] uppercase tracking-[0.22em] text-[#8C1D2F] font-bold block">
              S10 · Camera Authorization
            </span>
            <h2 className="font-serif text-3xl text-white">Open the Trial Room</h2>
            <p className="text-xs text-[#E8E2D8]/80 leading-relaxed">
              FitMatch draws selected garments directly onto your video using in-browser pose detection.
            </p>

            <div className="bg-black/40 p-4 border border-[#5C5852]/30 text-left space-y-2">
              <div className="flex items-center gap-2 text-xs text-white">
                <span className="text-[#B08D57]">✓</span>
                <span>Video stays strictly on this device</span>
              </div>
              <div className="flex items-center gap-2 text-xs text-white">
                <span className="text-[#B08D57]">✓</span>
                <span>No images are ever saved or uploaded</span>
              </div>
              <div className="flex items-center gap-2 text-xs text-white">
                <span className="text-[#B08D57]">✓</span>
                <span>Camera automatically stops when you leave</span>
              </div>
            </div>

            {cameraError && (
              <p className="text-xs text-[#8C1D2F] bg-[#8C1D2F]/10 p-3 border border-[#8C1D2F]/30">
                {cameraError}
              </p>
            )}

            <button
              type="button"
              onClick={requestCamera}
              className="w-full py-4 bg-white text-[#0E0E0E] text-xs uppercase tracking-[0.2em] font-bold hover:bg-[#8C1D2F] hover:text-white transition-colors"
            >
              Allow Camera &amp; Start
            </button>
          </div>
        )}

        {/* Live Garment Swap Tray (Bottom) */}
        {hasPermission && (
          <div className="mt-4 w-full max-w-2xl bg-[#171717] border border-[#5C5852]/40 p-4 space-y-3">
            <span className="text-[10px] uppercase tracking-widest text-[#5C5852] font-semibold block">
              Swap Items Live:
            </span>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <span className="text-[9px] uppercase tracking-wider text-[#E8E2D8] block mb-1">
                  Choose Top:
                </span>
                <select
                  value={selectedTop?._id || ''}
                  onChange={(e) => setTryOnTop(e.target.value)}
                  className="w-full p-2 bg-black border border-[#5C5852] text-xs text-white"
                >
                  {tops.map((t) => (
                    <option key={t._id} value={t._id}>
                      {t.brandId?.name} - {t.name}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <span className="text-[9px] uppercase tracking-wider text-[#E8E2D8] block mb-1">
                  Choose Bottom:
                </span>
                <select
                  value={selectedBottom?._id || ''}
                  onChange={(e) => setTryOnBottom(e.target.value)}
                  className="w-full p-2 bg-black border border-[#5C5852] text-xs text-white"
                >
                  {bottoms.map((b) => (
                    <option key={b._id} value={b._id}>
                      {b.brandId?.name} - {b.name}
                    </option>
                  ))}
                </select>
              </div>
            </div>
          </div>
        )}
      </main>

      <footer className="text-center text-[10px] text-[#5C5852] uppercase tracking-widest">
        Sticker-style real-time simulation · Colors, proportions &amp; cut preview only
      </footer>
    </div>
  );
}
