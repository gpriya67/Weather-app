import React, { useEffect, useRef, useState } from "react";

export default function AtmosphericBackground({ condition = "Mostly Sunny" }) {
  const canvasRef = useRef(null);
  const [mousePos, setMousePos] = useState({ x: 0, y: 0 });

  // Track gentle mouse movement for organic sun & cloud parallax
  useEffect(() => {
    const handleMouseMove = (e) => {
      const x = (e.clientX / window.innerWidth - 0.5) * 20;
      const y = (e.clientY / window.innerHeight - 0.5) * 15;
      setMousePos({ x, y });
    };
    window.addEventListener("mousemove", handleMouseMove);
    return () => window.removeEventListener("mousemove", handleMouseMove);
  }, []);

  // Lightning canvas animation (for thunderstorm mode)
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    let animationFrameId;
    let isFlashing = false;
    let lightningBolts = [];
    let timeoutId;

    const resizeCanvas = () => {
      canvas.width = window.innerWidth;
      canvas.height = window.innerHeight;
    };
    resizeCanvas();
    window.addEventListener("resize", resizeCanvas);

    const createBolt = (startX, startY, endX, endY, branchLevel = 0) => {
      const segments = [];
      let currentX = startX;
      let currentY = startY;
      const steps = 14;
      const dx = (endX - startX) / steps;
      const dy = (endY - startY) / steps;

      for (let i = 0; i < steps; i++) {
        const nextX = currentX + dx + (Math.random() - 0.5) * 45;
        const nextY = currentY + dy + (Math.random() - 0.2) * 20;
        segments.push({ x1: currentX, y1: currentY, x2: nextX, y2: nextY });

        if (branchLevel < 2 && Math.random() < 0.25) {
          const branchAngle = (Math.random() - 0.5) * 1.2;
          const branchLength = 60 + Math.random() * 80;
          const branchEndX = nextX + Math.sin(branchAngle) * branchLength;
          const branchEndY = nextY + Math.cos(branchAngle) * branchLength;
          segments.push(...createBolt(nextX, nextY, branchEndX, branchEndY, branchLevel + 1));
        }

        currentX = nextX;
        currentY = nextY;
      }
      return segments;
    };

    const triggerLightning = () => {
      if (condition !== "Thunderstorms") return;

      const startX = canvas.width * 0.35 + Math.random() * (canvas.width * 0.4);
      const startY = Math.random() * 80;
      const endX = startX + (Math.random() - 0.5) * 200;
      const endY = canvas.height * 0.5 + Math.random() * (canvas.height * 0.25);

      lightningBolts = createBolt(startX, startY, endX, endY);
      isFlashing = true;

      setTimeout(() => {
        isFlashing = false;
        setTimeout(() => {
          if (Math.random() > 0.4) {
            isFlashing = true;
            setTimeout(() => {
              isFlashing = false;
              lightningBolts = [];
            }, 70);
          } else {
            lightningBolts = [];
          }
        }, 60);
      }, 100);

      const nextDelay = 4000 + Math.random() * 6000;
      timeoutId = setTimeout(triggerLightning, nextDelay);
    };

    if (condition === "Thunderstorms") {
      timeoutId = setTimeout(triggerLightning, 2000);
    }

    const render = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height);

      if (isFlashing && condition === "Thunderstorms") {
        const gradient = ctx.createRadialGradient(
          canvas.width * 0.55,
          canvas.height * 0.4,
          50,
          canvas.width * 0.55,
          canvas.height * 0.4,
          canvas.width * 0.7
        );
        gradient.addColorStop(0, "rgba(220, 235, 255, 0.45)");
        gradient.addColorStop(0.5, "rgba(140, 175, 225, 0.2)");
        gradient.addColorStop(1, "rgba(10, 15, 25, 0)");
        ctx.fillStyle = gradient;
        ctx.fillRect(0, 0, canvas.width, canvas.height);

        if (lightningBolts.length > 0) {
          ctx.save();
          ctx.lineCap = "round";
          ctx.strokeStyle = "rgba(255, 255, 255, 0.95)";
          ctx.lineWidth = 2.5;
          ctx.shadowColor = "#8ec5fc";
          ctx.shadowBlur = 18;

          ctx.beginPath();
          lightningBolts.forEach((seg) => {
            ctx.moveTo(seg.x1, seg.y1);
            ctx.lineTo(seg.x2, seg.y2);
          });
          ctx.stroke();

          ctx.lineWidth = 6;
          ctx.strokeStyle = "rgba(165, 205, 255, 0.4)";
          ctx.stroke();
          ctx.restore();
        }
      }

      animationFrameId = requestAnimationFrame(render);
    };

    render();

    return () => {
      window.removeEventListener("resize", resizeCanvas);
      cancelAnimationFrame(animationFrameId);
      clearTimeout(timeoutId);
    };
  }, [condition]);

  const isSunny = condition === "Mostly Sunny" || condition === "Clear" || condition === "Sunny";
  const showRain = condition === "Thunderstorms" || condition === "Rain" || condition === "Drizzle";
  const rainDrops = Array.from({ length: 65 });

  return (
    <div className="fixed inset-0 overflow-hidden pointer-events-none select-none z-0">
      {/* ================= CLOUD BACKGROUND PHOTO LAYER ================= */}
      <div
        className="absolute inset-0 bg-cover bg-center transition-all duration-1000 scale-105 animate-cloud-drift-1"
        style={{
          backgroundImage: isSunny
            ? `url('https://images.unsplash.com/photo-1598188306155-25e400eb5078?q=80&w=2400&auto=format&fit=crop')`
            : `url('https://images.unsplash.com/photo-1534088568595-a066f410bcda?q=80&w=2400&auto=format&fit=crop')`,
          filter: isSunny
            ? "brightness(0.85) contrast(1.1) saturate(1.15)"
            : "brightness(0.55) contrast(1.25) saturate(0.85)",
          transform: `translate(${mousePos.x * 0.5}px, ${mousePos.y * 0.5}px)`,
        }}
      />

      {/* ================= RADIANT ANIMATED MOVING SUN (FOR MOSTLY SUNNY) ================= */}
      {isSunny && (
        <div
          className="absolute inset-0 flex items-center justify-center pointer-events-none transition-opacity duration-1000"
          style={{
            transform: `translate(${mousePos.x * 1.5}px, ${mousePos.y * 1.5}px)`,
          }}
        >
          {/* Moving Sun Container positioned at upper-center matching Dribbble shot */}
          <div className="relative w-full h-full animate-sun-float">
            
            {/* Center Sun Anchor (around 52% horizontally, 44% vertically) */}
            <div className="absolute left-[52%] top-[42%] -translate-x-1/2 -translate-y-1/2">
              
              {/* 1. Deep Volumetric Golden Sunlight Atmosphere Glow */}
              <div
                className="w-[700px] h-[700px] -translate-x-1/2 -translate-y-1/2 absolute rounded-full animate-sun-pulse"
                style={{
                  background:
                    "radial-gradient(circle, rgba(254, 240, 138, 0.45) 0%, rgba(251, 191, 36, 0.28) 35%, rgba(245, 158, 11, 0.12) 60%, transparent 80%)",
                }}
              />

              {/* 2. Rotating Radiant Sunbeams (Lens Flares & Ray Spikes) */}
              <div className="absolute left-0 top-0 w-[620px] h-[620px] animate-sun-rays opacity-80 mix-blend-screen pointer-events-none">
                <svg viewBox="0 0 400 400" className="w-full h-full">
                  <defs>
                    <linearGradient id="rayGrad" x1="0%" y1="0%" x2="0%" y2="100%">
                      <stop offset="0%" stopColor="rgba(255, 255, 255, 0.9)" />
                      <stop offset="25%" stopColor="rgba(254, 240, 138, 0.65)" />
                      <stop offset="60%" stopColor="rgba(251, 191, 36, 0.25)" />
                      <stop offset="100%" stopColor="rgba(251, 146, 60, 0)" />
                    </linearGradient>
                  </defs>
                  {/* Array of sunbeam triangles radiating from center */}
                  {Array.from({ length: 18 }).map((_, i) => (
                    <polygon
                      key={i}
                      points="197,200 203,200 201,15 199,15"
                      fill="url(#rayGrad)"
                      transform={`rotate(${i * 20} 200 200)`}
                      opacity={i % 2 === 0 ? 0.9 : 0.5}
                    />
                  ))}
                  {/* Wider soft rays */}
                  {Array.from({ length: 8 }).map((_, i) => (
                    <polygon
                      key={`wide-${i}`}
                      points="194,200 206,200 215,30 185,30"
                      fill="url(#rayGrad)"
                      transform={`rotate(${i * 45 + 12} 200 200)`}
                      opacity="0.35"
                    />
                  ))}
                </svg>
              </div>

              {/* 3. Brilliant Solar Core Disc */}
              <div
                className="w-40 h-40 -translate-x-1/2 -translate-y-1/2 absolute rounded-full shadow-[0_0_90px_rgba(254,240,138,0.95)]"
                style={{
                  background:
                    "radial-gradient(circle, #ffffff 15%, #fef08a 45%, #fbbf24 75%, rgba(245, 158, 11, 0.4) 100%)",
                }}
              />

              {/* 4. Diagonal Cinema Lens Flare Ring */}
              <div
                className="w-20 h-20 rounded-full absolute translate-x-28 translate-y-28 opacity-45 mix-blend-screen pointer-events-none"
                style={{
                  background: "radial-gradient(circle, rgba(251, 191, 36, 0.6) 0%, transparent 70%)",
                }}
              />
              <div
                className="w-12 h-12 rounded-full absolute -translate-x-32 -translate-y-24 opacity-35 mix-blend-screen pointer-events-none"
                style={{
                  background: "radial-gradient(circle, rgba(147, 197, 253, 0.5) 0%, transparent 70%)",
                }}
              />
            </div>
          </div>
        </div>
      )}

      {/* ================= SECONDARY VOLUMETRIC DRIFTING CLOUDS ================= */}
      <div
        className="absolute inset-0 bg-cover bg-center opacity-30 mix-blend-screen animate-cloud-drift-2 pointer-events-none"
        style={{
          backgroundImage: `url('https://images.unsplash.com/photo-1509114397022-ed747cca3f65?q=80&w=2000&auto=format&fit=crop')`,
          filter: isSunny ? "brightness(1.1) contrast(1.1)" : "brightness(0.7) contrast(1.3)",
          transform: `translate(${mousePos.x * -0.4}px, ${mousePos.y * -0.4}px)`,
        }}
      />

      {/* ================= ATMOSPHERIC TINT OVERLAY ================= */}
      <div
        className="absolute inset-0 transition-all duration-1000"
        style={{
          background: isSunny
            ? "radial-gradient(circle at 55% 42%, rgba(254, 240, 138, 0.15) 0%, rgba(59, 130, 246, 0.12) 40%, rgba(15, 23, 42, 0.75) 90%)"
            : "radial-gradient(circle at 60% 45%, rgba(68, 86, 115, 0.4) 0%, rgba(15, 19, 26, 0.95) 75%)",
        }}
      />

      {/* ================= LIGHTNING CANVAS ================= */}
      <canvas ref={canvasRef} className="absolute inset-0 w-full h-full pointer-events-none" />

      {/* ================= RAINDROPS LAYER ================= */}
      {showRain && (
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          {rainDrops.map((_, i) => (
            <div
              key={i}
              className="rain-drop"
              style={{
                left: `${Math.random() * 100}%`,
                top: `-${Math.random() * 20}%`,
                height: `${25 + Math.random() * 35}px`,
                opacity: 0.2 + Math.random() * 0.45,
                animationDuration: `${0.65 + Math.random() * 0.45}s`,
                animationDelay: `${Math.random() * 2}s`,
              }}
            />
          ))}
        </div>
      )}

      {/* ================= VIGNETTE BORDER ================= */}
      <div
        className="absolute inset-0 pointer-events-none"
        style={{
          background: "radial-gradient(circle at 50% 50%, transparent 40%, rgba(6, 9, 13, 0.75) 100%)",
        }}
      />
    </div>
  );
}
