import React from 'react';

/**
 * HTML overlay UI — sticky top bar with state name,
 * and bottom instructions.
 */
export default function Overlay({ stateName }) {
  return (
    <div className="fixed inset-0 pointer-events-none z-10 select-none">
      {/* ─── Top bar ─── */}
      <div className="absolute top-0 left-0 right-0 flex justify-center pt-6">
        <div className="flex items-center gap-3 px-6 py-3 rounded-full bg-white/5 backdrop-blur-md border border-white/10">
          {/* Decorative dot */}
          <span className="w-2 h-2 rounded-full bg-valley-pink animate-pulse" />
          <span
            className="font-mono text-sm tracking-[0.3em] text-white/90 transition-all duration-500"
            key={stateName}
          >
            {stateName}
          </span>
          <span className="w-2 h-2 rounded-full bg-valley-pink animate-pulse" />
        </div>
      </div>

      {/* ─── Bottom instructions ─── */}
      <div className="absolute bottom-10 left-0 right-0 flex flex-col items-center gap-2">
        <p className="font-display text-sm text-white/40 italic tracking-widest">
          SCROLL TO CHASE THE BLOSSOMS
        </p>
        <div className="w-px h-6 bg-gradient-to-b from-white/30 to-transparent animate-bounce" />
        <p className="font-mono text-[10px] text-white/25 tracking-[0.2em] uppercase">
          Double Click to Reveal
        </p>
      </div>

      {/* ─── Side accent line ─── */}
      <div className="absolute left-6 top-1/2 -translate-y-1/2 flex flex-col gap-1 opacity-30">
        {[...Array(5)].map((_, i) => (
          <div
            key={i}
            className="w-px bg-valley-pink rounded-full"
            style={{
              height: `${12 + i * 4}px`,
              opacity: 0.3 + i * 0.15,
            }}
          />
        ))}
      </div>

      {/* ─── Corner decoration ─── */}
      <div className="absolute top-6 left-6 opacity-20">
        <div className="w-6 h-px bg-valley-pink" />
        <div className="w-px h-6 bg-valley-pink" />
      </div>
      <div className="absolute top-6 right-6 opacity-20 flex flex-col items-end">
        <div className="w-6 h-px bg-valley-pink" />
        <div className="w-px h-6 bg-valley-pink ml-auto" />
      </div>
    </div>
  );
}
