import React, { useEffect, useRef } from 'react';
import lottie from 'lottie-web';
import type { AnimationItem } from 'lottie-web';
import { Loader2, RefreshCw } from 'lucide-react';

interface LottieCanvasProps {
  lottieData: any;
  isLoading: boolean;
}

export const LottieCanvas: React.FC<LottieCanvasProps> = ({ lottieData, isLoading }) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const animRef = useRef<AnimationItem | null>(null);

  useEffect(() => {
    if (!containerRef.current || !lottieData) return;

    if (animRef.current) {
      animRef.current.destroy();
    }

    try {
      animRef.current = lottie.loadAnimation({
        container: containerRef.current,
        renderer: 'svg',
        loop: true,
        autoplay: true,
        animationData: JSON.parse(JSON.stringify(lottieData))
      });
    } catch (err) {
      console.error('Lottie load error:', err);
    }

    return () => {
      if (animRef.current) {
        animRef.current.destroy();
      }
    };
  }, [lottieData]);

  return (
    <div className="relative w-full max-w-[280px] sm:max-w-[320px] aspect-square mx-auto my-2 rounded-3xl glass-panel p-4 flex flex-col items-center justify-center border border-cyan-500/20 shadow-xl shadow-cyan-500/10">
      <div className="absolute inset-0 bg-gradient-to-tr from-cyan-500/10 via-purple-500/5 to-pink-500/10 rounded-3xl pointer-events-none" />

      {isLoading && (
        <div className="absolute inset-0 bg-slate-950/75 backdrop-blur-sm rounded-3xl z-10 flex flex-col items-center justify-center gap-2">
          <Loader2 className="w-8 h-8 text-cyan-400 animate-spin" />
          <span className="text-xs font-semibold text-cyan-300">Stiker yangilanmoqda...</span>
        </div>
      )}

      <div ref={containerRef} className="w-full h-full flex items-center justify-center z-0" />

      <div className="absolute bottom-2 text-[10px] font-semibold text-slate-400 bg-slate-900/80 px-2.5 py-0.5 rounded-full border border-slate-800 flex items-center gap-1">
        <RefreshCw className="w-3 h-3 text-cyan-400 animate-spin-slow" />
        <span>Jonli Preview (60 FPS Vector)</span>
      </div>
    </div>
  );
};
