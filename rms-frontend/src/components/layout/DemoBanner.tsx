import React, { useState, useEffect } from 'react';
import { useAppStore } from '../../store/useAppStore';
import { getDemoStorage, MAX_DEMO_CREATIONS } from '../../utils/demoStorage';
import { Sparkles, RotateCcw, AlertTriangle, LogOut, CheckCircle2 } from 'lucide-react';

export const DemoBanner: React.FC = () => {
  const { isDemoMode, disableDemoMode, resetDemoData } = useAppStore();
  const [creationCount, setCreationCount] = useState<number>(0);

  useEffect(() => {
    if (!isDemoMode) return;
    const updateCount = () => {
      const data = getDemoStorage();
      setCreationCount(data.creationCount);
    };

    updateCount();
    window.addEventListener('demo-storage-updated', updateCount);
    return () => window.removeEventListener('demo-storage-updated', updateCount);
  }, [isDemoMode]);

  if (!isDemoMode) return null;

  const isLimitReached = creationCount >= MAX_DEMO_CREATIONS;
  const percentage = Math.min(100, Math.round((creationCount / MAX_DEMO_CREATIONS) * 100));

  return (
    <div className="w-full bg-[#1F221D] text-white border-b border-[#FF7A10]/30 px-4 py-2.5 flex flex-wrap items-center justify-between gap-3 text-xs shadow-md z-40 select-none">
      {/* Left: Badge & Info */}
      <div className="flex items-center gap-3">
        <div className="flex items-center gap-1.5 bg-[#FF7A10] text-white px-2.5 py-1 rounded-lg font-bold uppercase tracking-wider text-[11px] shadow-sm">
          <Sparkles className="w-3.5 h-3.5" />
          <span>Demo Sandbox</span>
        </div>
        <span className="hidden sm:inline text-[#ECEAE7]/80 font-medium">
          Single item per category pre-loaded. Max 10 creations allowed per session.
        </span>
      </div>

      {/* Center: Counter & Progress Bar */}
      <div className="flex items-center gap-3 bg-[#2A2E28] px-3 py-1 rounded-xl border border-white/10">
        <div className="flex items-center gap-1.5">
          {isLimitReached ? (
            <AlertTriangle className="w-4 h-4 text-[#FF4D4D] animate-pulse" />
          ) : (
            <CheckCircle2 className="w-4 h-4 text-[#FF7A10]" />
          )}
          <span className="font-semibold text-white">
            Creations: <span className={isLimitReached ? 'text-[#FF4D4D] font-bold' : 'text-[#FF7A10] font-bold'}>{creationCount} / {MAX_DEMO_CREATIONS}</span>
          </span>
        </div>

        <div className="w-20 bg-white/10 rounded-full h-2 overflow-hidden hidden md:block">
          <div
            className={`h-full transition-all duration-300 ${
              isLimitReached ? 'bg-[#FF4D4D]' : 'bg-[#FF7A10]'
            }`}
            style={{ width: `${percentage}%` }}
          />
        </div>

        {isLimitReached && (
          <span className="bg-[#FF4D4D]/20 text-[#FF4D4D] text-[10px] font-bold px-2 py-0.5 rounded-md uppercase border border-[#FF4D4D]/40">
            Demo Ended
          </span>
        )}
      </div>

      {/* Right: Action Buttons */}
      <div className="flex items-center gap-2">
        <button
          onClick={() => {
            resetDemoData();
            setCreationCount(0);
          }}
          className="flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-white/10 hover:bg-white/20 text-white font-semibold transition-all border border-white/15 cursor-pointer text-xs"
          title="Reset sandbox data and restore default items"
        >
          <RotateCcw className="w-3.5 h-3.5 text-[#FF7A10]" />
          <span>Reset Sandbox</span>
        </button>

        <button
          onClick={disableDemoMode}
          className="flex items-center gap-1 px-2.5 py-1 rounded-lg bg-[#C62828]/20 hover:bg-[#C62828]/30 text-[#FF6B6B] font-semibold transition-all border border-[#C62828]/40 cursor-pointer text-xs"
          title="Exit demo mode"
        >
          <LogOut className="w-3.5 h-3.5" />
          <span>Exit Demo</span>
        </button>
      </div>
    </div>
  );
};

export default DemoBanner;
