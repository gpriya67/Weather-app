import React, { useState, useEffect } from "react";

export default function SunTracker({
  sunrise = "05:48",
  sunset = "18:32",
  sunriseTimestamp = null,
  sunsetTimestamp = null,
  timezoneOffset = 0, // timezone in seconds from API
}) {
  // Calculate sun position progress strictly from API timestamps
  const calculateApiProgress = () => {
    if (sunriseTimestamp && sunsetTimestamp) {
      // Local time in target city based on timezone
      const nowUtc = Math.floor(Date.now() / 1000);
      const targetNow = nowUtc; // or nowUtc + timezoneOffset if using city-local time

      if (targetNow <= sunriseTimestamp) {
        return 0.06; // Pre-sunrise
      }
      if (targetNow >= sunsetTimestamp) {
        return 0.94; // Post-sunset
      }
      const totalDaylight = sunsetTimestamp - sunriseTimestamp;
      const elapsed = targetNow - sunriseTimestamp;
      const ratio = elapsed / totalDaylight;
      // Clamp between 0.06 and 0.94 along the arc
      return Math.min(Math.max(ratio, 0.06), 0.94);
    }
    // Fallback: estimate based on current local hours
    const now = new Date();
    const currentMins = now.getHours() * 60 + now.getMinutes();
    const [srH, srM] = sunrise.split(":").map(Number);
    const [ssH, ssM] = sunset.split(":").map(Number);
    const srTotal = (srH || 6) * 60 + (srM || 0);
    const ssTotal = (ssH || 18) * 60 + (ssM || 0);
    if (currentMins <= srTotal) return 0.06;
    if (currentMins >= ssTotal) return 0.94;
    return (currentMins - srTotal) / (ssTotal - srTotal);
  };

  const [currentProgress, setCurrentProgress] = useState(calculateApiProgress);
  const [isLiveApiMode, setIsLiveApiMode] = useState(true);

  // Keep progress in sync when API data updates
  useEffect(() => {
    const apiProg = calculateApiProgress();
    setCurrentProgress(apiProg);
  }, [sunriseTimestamp, sunsetTimestamp, sunrise, sunset]);

  // Subtle live floating pulse around real API sun position
  useEffect(() => {
    if (!isLiveApiMode) return;
    const interval = setInterval(() => {
      const base = calculateApiProgress();
      // gentle organic micro-pulse around the true API position
      setCurrentProgress(base);
    }, 15000);
    return () => clearInterval(interval);
  }, [isLiveApiMode, sunriseTimestamp, sunsetTimestamp]);

  // Polar coordinates for semicircle: center (120, 90), radius 70
  // angle goes from Math.PI (sunrise) to 0 (sunset)
  const angle = Math.PI - currentProgress * Math.PI;
  const cx = 120;
  const cy = 90;
  const r = 70;
  const sunX = cx + r * Math.cos(angle);
  const sunY = cy - r * Math.sin(angle);

  // Daylight remaining or status from API
  const getDaylightStatus = () => {
    const nowSec = Math.floor(Date.now() / 1000);
    if (sunsetTimestamp && nowSec < sunsetTimestamp && nowSec > sunriseTimestamp) {
      const remainingHours = Math.floor((sunsetTimestamp - nowSec) / 3600);
      const remainingMins = Math.floor(((sunsetTimestamp - nowSec) % 3600) / 60);
      return `${remainingHours}h ${remainingMins}m daylight left`;
    } else if (sunsetTimestamp && nowSec >= sunsetTimestamp) {
      return "Nighttime • After Sunset";
    }
    return "Daylight Active";
  };

  return (
    <div className="glass-card rounded-2xl p-5 relative overflow-hidden group hover:border-white/20 transition-all duration-300">
      {/* Top glare line */}
      <div className="absolute top-0 left-0 right-0 h-[1px] bg-gradient-to-r from-transparent via-white/25 to-transparent" />

      {/* Header with API Sunrise and Sunset */}
      <div className="flex items-center justify-between mb-1">
        {/* API Sunrise */}
        <div className="flex items-center gap-1.5">
          <svg
            className="w-4 h-4 text-amber-300"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
          >
            <path d="M12 2v6" />
            <path d="M4.93 10.93l4.24-4.24" />
            <path d="M2 18h20" />
            <path d="M20 18a8 8 0 1 0-16 0" />
          </svg>
          <span className="text-xs font-medium tracking-wide text-slate-300">
            Sunrise <span className="text-slate-400 font-normal">↗</span>
          </span>
          <span className="text-[11px] text-amber-200 font-mono ml-1">{sunrise}</span>
        </div>

        {/* API Sunset */}
        <div className="flex items-center gap-1.5">
          <span className="text-[11px] text-orange-200 font-mono mr-1">{sunset}</span>
          <span className="text-xs font-medium tracking-wide text-slate-300">
            Sunset <span className="text-slate-400 font-normal">↘</span>
          </span>
          <svg
            className="w-4 h-4 text-orange-400"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
          >
            <path d="M12 10v6" />
            <path d="M12 16l-3-3" />
            <path d="M12 16l3-3" />
            <path d="M2 18h20" />
            <path d="M20 18a8 8 0 1 0-16 0" />
          </svg>
        </div>
      </div>

      {/* Semicircle Arc Tracker */}
      <div className="relative h-24 flex items-center justify-center">
        <svg viewBox="0 0 240 105" className="w-full h-full overflow-visible">
          <defs>
            <linearGradient id="arcGlowActive" x1="0%" y1="0%" x2="100%" y2="0%">
              <stop offset="0%" stopColor="#f59e0b" stopOpacity="0.3" />
              <stop offset="60%" stopColor="#fef08a" stopOpacity="0.8" />
              <stop offset="100%" stopColor="#ffffff" stopOpacity="1" />
            </linearGradient>
            <radialGradient id="movingSunAura" cx="50%" cy="50%" r="50%">
              <stop offset="0%" stopColor="#ffffff" />
              <stop offset="35%" stopColor="#fef08a" />
              <stop offset="70%" stopColor="#f59e0b" stopOpacity="0.4" />
              <stop offset="100%" stopColor="#f59e0b" stopOpacity="0" />
            </radialGradient>
          </defs>

          {/* Dotted Arch Track */}
          <path
            d="M 50,90 A 70,70 0 0,1 190,90"
            fill="none"
            stroke="rgba(255, 255, 255, 0.18)"
            strokeWidth="1.8"
            strokeDasharray="4 4"
          />

          {/* Active traversed golden trail */}
          <path
            d={`M 50,90 A 70,70 0 0,1 ${sunX},${sunY}`}
            fill="none"
            stroke="url(#arcGlowActive)"
            strokeWidth="2.5"
            strokeLinecap="round"
          />

          {/* Horizon Base Line */}
          <line
            x1="35"
            y1="90"
            x2="205"
            y2="90"
            stroke="rgba(255, 255, 255, 0.14)"
            strokeWidth="1.2"
          />

          {/* Center Stylized Horizon Sun Icon */}
          <g transform="translate(120, 90)">
            <path
              d="M -15,0 A 15,15 0 0,1 15,0 Z"
              fill="rgba(255, 255, 255, 0.08)"
              stroke="rgba(255, 255, 255, 0.35)"
              strokeWidth="1.2"
            />
            <path
              d="M -23,0 A 23,23 0 0,1 23,0"
              fill="none"
              stroke="rgba(255, 255, 255, 0.18)"
              strokeWidth="1"
              strokeDasharray="2 3"
            />
          </g>

          {/* Sunrise horizon anchor dot */}
          <circle cx="50" cy="90" r="2.5" fill="#fde68a" />

          {/* Sunset horizon anchor dot */}
          <circle cx="190" cy="90" r="2.5" fill="#fdba74" />

          {/* ============ REAL API CALCULATED MOVING SUN ORB ============ */}
          <circle
            cx={sunX}
            cy={sunY}
            r="16"
            fill="url(#movingSunAura)"
            className="animate-pulse"
          />

          <line
            x1={sunX - 7}
            y1={sunY}
            x2={sunX + 7}
            y2={sunY}
            stroke="#ffffff"
            strokeWidth="1"
            opacity="0.8"
          />
          <line
            x1={sunX}
            y1={sunY - 7}
            x2={sunX}
            y2={sunY + 7}
            stroke="#ffffff"
            strokeWidth="1"
            opacity="0.8"
          />

          <circle
            cx={sunX}
            cy={sunY}
            r="5"
            fill="#ffffff"
            filter="drop-shadow(0 0 6px #fde047)"
          />
          <circle
            cx={sunX}
            cy={sunY}
            r="9"
            fill="none"
            stroke="rgba(254, 240, 138, 0.6)"
            strokeWidth="1.5"
          />
        </svg>

        {/* Live Sun Progress Badge */}
        <div className="absolute bottom-1 px-2.5 py-0.5 rounded-full bg-white/10 backdrop-blur-md border border-white/15 text-[10px] text-amber-200 font-mono flex items-center gap-1 shadow-sm">
          <span>☀️ {getDaylightStatus()}</span>
        </div>
      </div>

      {/* Real API Status indicator */}
      <div className="flex items-center justify-between mt-1 px-2 text-[10px] text-slate-400">
        <span className="flex items-center gap-1">
          <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-ping" />
          Real API Solar Sync
        </span>
        <span className="font-mono text-slate-300">
          Day Progress: {Math.round(currentProgress * 100)}%
        </span>
      </div>
    </div>
  );
}
