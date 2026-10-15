import React, { useState } from "react";

export default function RadarWidget({ isOpen, onClose, city = "New York", condition = "Thunderstorms" }) {
  const [isPlaying, setIsPlaying] = useState(true);
  const [radarLayer, setRadarLayer] = useState("precipitation"); // precipitation, wind, clouds

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-md animate-fade-in">
      <div className="glass-panel w-full max-w-2xl rounded-3xl p-6 relative border border-white/20 shadow-2xl overflow-hidden flex flex-col gap-4">
        
        {/* Header */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-full bg-cyan-500/20 border border-cyan-400/40 flex items-center justify-center text-cyan-300">
              <svg className="w-4 h-4 animate-spin" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <circle cx="12" cy="12" r="10" strokeDasharray="30 10" />
              </svg>
            </div>
            <div>
              <h3 className="text-base font-bold text-white flex items-center gap-2">
                Live Doppler Weather Radar
                <span className="text-[10px] px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 font-normal">
                  LIVE STREAM
                </span>
              </h3>
              <p className="text-xs text-slate-400 font-light">
                Atmospheric Precipitation & Storm Tracking • {city}
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="w-8 h-8 rounded-full bg-white/10 hover:bg-white/20 text-slate-300 hover:text-white flex items-center justify-center transition-colors"
          >
            ✕
          </button>
        </div>

        {/* Radar Screen Visualizer */}
        <div className="relative w-full h-72 rounded-2xl bg-[#070d19] border border-cyan-500/30 overflow-hidden flex items-center justify-center">
          {/* Map Grid / Range Rings */}
          <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
            <div className="w-24 h-24 rounded-full border border-cyan-500/20" />
            <div className="w-44 h-44 rounded-full border border-cyan-500/20" />
            <div className="w-64 h-64 rounded-full border border-cyan-500/20" />
            <div className="absolute w-full h-[1px] bg-cyan-500/20" />
            <div className="absolute h-full w-[1px] bg-cyan-500/20" />
          </div>

          {/* Animated Sweeping Radar Beam */}
          {isPlaying && (
            <div className="absolute w-72 h-72 animate-radar-sweep pointer-events-none">
              <div
                className="w-1/2 h-1/2 origin-bottom-right"
                style={{
                  background: "conic-gradient(from 0deg at 100% 100%, rgba(0, 243, 255, 0.4) 0deg, rgba(0, 243, 255, 0.0) 65deg)",
                }}
              />
            </div>
          )}

          {/* Simulated Doppler Echo Clouds / Storm Blobs */}
          <div className="absolute inset-0 pointer-events-none overflow-hidden">
            <div
              className="absolute top-1/4 left-1/3 w-32 h-24 rounded-full blur-xl opacity-75 animate-pulse"
              style={{
                background:
                  radarLayer === "wind"
                    ? "radial-gradient(circle, #38bdf8 0%, #818cf8 50%, transparent 75%)"
                    : "radial-gradient(circle, #ef4444 0%, #f59e0b 45%, #10b981 70%, transparent 85%)",
              }}
            />
            <div
              className="absolute bottom-1/4 right-1/4 w-40 h-28 rounded-full blur-xl opacity-60"
              style={{
                background: "radial-gradient(circle, #f97316 0%, #10b981 50%, #38bdf8 75%, transparent 90%)",
              }}
            />
          </div>

          {/* Center City Target Marker */}
          <div className="relative z-10 flex flex-col items-center">
            <div className="w-3.5 h-3.5 rounded-full bg-cyan-400 ring-4 ring-cyan-400/30 animate-ping" />
            <span className="text-[11px] font-mono font-medium text-white bg-black/60 px-2 py-0.5 rounded-full mt-1 border border-white/20">
              {city} (Center)
            </span>
          </div>

          {/* Radar Intensity Scale Key */}
          <div className="absolute bottom-3 left-3 bg-black/60 backdrop-blur-md px-3 py-1.5 rounded-xl border border-white/10 flex items-center gap-2 text-[10px]">
            <span className="text-slate-400">Intensity:</span>
            <div className="flex h-2 w-28 rounded-full overflow-hidden bg-white/10">
              <span className="h-full w-1/4 bg-emerald-400" title="Light" />
              <span className="h-full w-1/4 bg-yellow-400" title="Moderate" />
              <span className="h-full w-1/4 bg-orange-500" title="Heavy" />
              <span className="h-full w-1/4 bg-rose-600" title="Severe" />
            </div>
            <span className="text-rose-400 font-mono">Severe</span>
          </div>
        </div>

        {/* Controls & Layer Switches */}
        <div className="flex flex-wrap items-center justify-between gap-3 pt-1">
          <div className="flex items-center gap-2">
            <button
              onClick={() => setIsPlaying(!isPlaying)}
              className="px-3.5 py-1.5 rounded-full bg-white/10 hover:bg-white/20 text-white text-xs font-medium flex items-center gap-1.5 transition-colors border border-white/10"
            >
              <span>{isPlaying ? "⏸ Pause Sweep" : "▶ Resume Sweep"}</span>
            </button>

            <span className="text-xs text-slate-400 font-mono">Sweep interval: 4.0s</span>
          </div>

          {/* Layer Selectors */}
          <div className="flex items-center gap-1 bg-white/5 p-1 rounded-full border border-white/10">
            {["precipitation", "wind", "clouds"].map((l) => (
              <button
                key={l}
                onClick={() => setRadarLayer(l)}
                className={`px-3 py-1 rounded-full text-xs capitalize transition-all ${
                  radarLayer === l
                    ? "bg-cyan-500 text-black font-semibold shadow-md"
                    : "text-slate-300 hover:text-white"
                }`}
              >
                {l}
              </button>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
