import React, { useState } from "react";

export default function WindChart({ windSpeed = "7.90", windUnit = "km/h" }) {
  const [hoveredBar, setHoveredBar] = useState(null);

  // Equalizer bar heights matching the aesthetic in the Dribbble design
  const barData = [
    { time: "00:00", height: 18, speed: "5.4" },
    { time: "01:00", height: 26, speed: "6.2" },
    { time: "02:00", height: 14, speed: "4.8" },
    { time: "03:00", height: 32, speed: "7.1" },
    { time: "04:00", height: 42, speed: "8.0" },
    { time: "05:00", height: 28, speed: "6.5" },
    { time: "06:00", height: 50, speed: "8.9" },
    { time: "07:00", height: 38, speed: "7.4" },
    { time: "08:00", height: 22, speed: "5.8" },
    { time: "09:00", height: 48, speed: "8.5" },
    { time: "10:00", height: 60, speed: "9.8" },
    { time: "11:00", height: 44, speed: "7.9" },
    { time: "12:00", height: 52, speed: "8.7" },
    { time: "13:00", height: 36, speed: "6.9" },
    { time: "14:00", height: 68, speed: "10.4" },
    { time: "15:00", height: 54, speed: "8.8" },
    { time: "16:00", height: 40, speed: "7.2" },
    { time: "17:00", height: 28, speed: "6.1" },
    { time: "18:00", height: 35, speed: "6.8" },
    { time: "19:00", height: 24, speed: "5.5" },
  ];

  return (
    <div className="glass-card rounded-2xl p-5 relative overflow-hidden group hover:border-white/20 transition-all duration-300">
      {/* Subtle top glare */}
      <div className="absolute top-0 left-0 right-0 h-[1px] bg-gradient-to-r from-transparent via-white/25 to-transparent" />

      {/* Header */}
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center gap-2">
          {/* Wind icon */}
          <svg
            className="w-4 h-4 text-slate-300 opacity-80"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
          >
            <path d="M17.7 7.7a2.5 2.5 0 1 1 1.8 4.3H2" />
            <path d="M9.6 4.6A2 2 0 1 1 11 8H2" />
            <path d="M12.6 19.4A2 2 0 1 0 14 16H2" />
          </svg>
          <span className="text-xs font-medium tracking-wide text-slate-300">Wind status</span>
        </div>

        <div className="text-right">
          <span className="text-base font-semibold text-white tracking-tight">{windSpeed}</span>
          <span className="text-xs text-slate-400 ml-1 font-light">{windUnit}</span>
        </div>
      </div>

      {/* Wave Curve Chart (Smooth Bezier) */}
      <div className="relative h-14 my-1 w-full">
        <svg
          viewBox="0 0 320 60"
          preserveAspectRatio="none"
          className="w-full h-full overflow-visible"
        >
          <defs>
            <linearGradient id="waveGradient" x1="0%" y1="0%" x2="0%" y2="100%">
              <stop offset="0%" stopColor="rgba(255, 255, 255, 0.15)" />
              <stop offset="100%" stopColor="rgba(255, 255, 255, 0.0)" />
            </linearGradient>
            <linearGradient id="strokeGradient" x1="0%" y1="0%" x2="100%" y2="0%">
              <stop offset="0%" stopColor="rgba(255, 255, 255, 0.3)" />
              <stop offset="45%" stopColor="rgba(255, 255, 255, 0.95)" />
              <stop offset="75%" stopColor="rgba(255, 255, 255, 0.6)" />
              <stop offset="100%" stopColor="rgba(255, 255, 255, 0.3)" />
            </linearGradient>
          </defs>

          {/* Area fill */}
          <path
            d="M 0,42 C 30,48 50,22 80,24 C 110,26 130,45 160,35 C 190,25 210,12 240,16 C 270,20 295,38 320,32 L 320,60 L 0,60 Z"
            fill="url(#waveGradient)"
          />

          {/* Glowing Stroke line */}
          <path
            d="M 0,42 C 30,48 50,22 80,24 C 110,26 130,45 160,35 C 190,25 210,12 240,16 C 270,20 295,38 320,32"
            fill="none"
            stroke="url(#strokeGradient)"
            strokeWidth="2.2"
            strokeLinecap="round"
            className="animate-wave-glow"
          />

          {/* Current peak indicator dot */}
          <circle cx="240" cy="16" r="3.5" fill="#ffffff" className="animate-pulse" />
          <circle cx="240" cy="16" r="7" fill="none" stroke="rgba(255,255,255,0.4)" strokeWidth="1" />
        </svg>
      </div>

      {/* Vertical Equalizer-Style Gust Bars */}
      <div className="flex items-end justify-between h-9 px-1 pt-1 gap-1">
        {barData.map((bar, idx) => {
          const isSelected = hoveredBar === idx;
          return (
            <div
              key={idx}
              className="flex-1 flex flex-col items-center justify-end h-full cursor-pointer group/bar relative"
              onMouseEnter={() => setHoveredBar(idx)}
              onMouseLeave={() => setHoveredBar(null)}
            >
              {/* Tooltip on hover */}
              {isSelected && (
                <div className="absolute -top-7 px-2 py-0.5 rounded bg-black/80 border border-white/20 text-[10px] text-white whitespace-nowrap z-20 pointer-events-none shadow-lg">
                  {bar.time}: {bar.speed} {windUnit}
                </div>
              )}

              {/* Bar */}
              <div
                className={`w-[2.5px] rounded-full transition-all duration-200 ${
                  isSelected
                    ? "bg-white shadow-[0_0_8px_rgba(255,255,255,0.9)] scale-y-110"
                    : "bg-slate-400/35 hover:bg-slate-200/70"
                }`}
                style={{ height: `${bar.height}%` }}
              />
            </div>
          );
        })}
      </div>
    </div>
  );
}
