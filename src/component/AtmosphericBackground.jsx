import React, { useEffect, useRef, useState } from "react";

export default function AtmosphericBackground({ condition = "Mostly Sunny", theme = "frosted" }) {
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
      if (!condition.toLowerCase().includes("thunder")) return;

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

      const nextDelay = 3500 + Math.random() * 5500;
      timeoutId = setTimeout(triggerLightning, nextDelay);
    };

    if (condition.toLowerCase().includes("thunder")) {
      timeoutId = setTimeout(triggerLightning, 1800);
    }

    const render = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height);

      if (isFlashing && condition.toLowerCase().includes("thunder")) {
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

  const condLower = condition.toLowerCase();
  const isSunny = condLower.includes("sun") || condLower.includes("clear");
  const isSnow = condLower.includes("snow");
  const showRain = condLower.includes("thunder") || condLower.includes("rain") || condLower.includes("drizzle");
  const isCloudy = condLower.includes("cloud") || condLower.includes("overcast");
  const isMist = condLower.includes("mist") || condLower.includes("fog") || condLower.includes("haze");

  // Determine background image based on condition and theme
  let bgImage = "https://images.unsplash.com/photo-1598188306155-25e400eb5078?q=80&w=2400&auto=format&fit=crop";
  if (theme === "aurora") {
    bgImage = "https://images.unsplash.com/photo-1531366936337-7c912a4589a7?q=80&w=2400&auto=format&fit=crop";
  } else if (theme === "sunset" || condLower.includes("sunset")) {
    bgImage = "https://images.unsplash.com/photo-1495616811223-4d98c6e9c869?q=80&w=2400&auto=format&fit=crop";
  } else if (isSnow) {
    bgImage = "https://images.unsplash.com/photo-1517299321909-20b349312556?q=80&w=2400&auto=format&fit=crop";
  } else if (showRain || condLower.includes("thunder")) {
    bgImage = "https://images.unsplash.com/photo-1534088568595-a066f410bcda?q=80&w=2400&auto=format&fit=crop";
  } else if (isMist) {
    bgImage = "https://images.unsplash.com/photo-1487621167305-5d248087c724?q=80&w=2400&auto=format&fit=crop";
  } else if (isCloudy) {
    bgImage = "https://images.unsplash.com/photo-1534088568595-a066f410bcda?q=80&w=2400&auto=format&fit=crop";
  }

  const rainDrops = Array.from({ length: 65 });
  const snowFlakes = Array.from({ length: 48 });

  return (
    <div className="fixed inset-0 overflow-hidden pointer-events-none select-none z-0">
      {/* ================= BACKGROUND PHOTO LAYER ================= */}
      <div
        className="absolute inset-0 bg-cover bg-center transition-all duration-1000 scale-105 animate-cloud-drift-1"
        style={{
          backgroundImage: `url('${bgImage}')`,
          filter: isSunny
            ? "brightness(0.85) contrast(1.1) saturate(1.15)"
            : isSnow
            ? "brightness(0.8) contrast(1.2) saturate(0.9)"
            : theme === "aurora"
            ? "brightness(0.65) contrast(1.3) saturate(1.4)"
            : "brightness(0.55) contrast(1.25) saturate(0.85)",
          transform: `translate(${mousePos.x * 0.5}px, ${mousePos.y * 0.5}px)`,
        }}
      />

      {/* ================= AURORA BOREALIS LAYER (For Aurora Theme) ================= */}
      {theme === "aurora" && (
        <div className="absolute inset-0 pointer-events-none mix-blend-screen opacity-70 overflow-hidden">
          <div
            className="absolute -top-32 -left-20 w-[140%] h-[70%] animate-aurora-1"
            style={{
              background:
                "radial-gradient(ellipse at 40% 50%, rgba(16, 185, 129, 0.45) 0%, rgba(139, 92, 246, 0.3) 45%, transparent 75%)",
              filter: "blur(50px)",
            }}
          />
          <div
            className="absolute top-10 -right-20 w-[130%] h-[60%] animate-aurora-2"
            style={{
              background:
                "radial-gradient(ellipse at 60% 40%, rgba(56, 189, 248, 0.4) 0%, rgba(16, 185, 129, 0.35) 50%, transparent 80%)",
              filter: "blur(60px)",
            }}
          />
        </div>
      )}

      {/* ================= CYBERPUNK GRID OVERLAY (For Cyber Theme) ================= */}
      {theme === "cyber" && (
        <div
          className="absolute inset-0 pointer-events-none opacity-20"
          style={{
            backgroundImage:
              "linear-gradient(rgba(0, 243, 255, 0.15) 1px, transparent 1px), linear-gradient(90deg, rgba(0, 243, 255, 0.15) 1px, transparent 1px)",
            backgroundSize: "60px 60px",
          }}
        />
      )}

      {/* ================= RADIANT ANIMATED MOVING SUN (FOR SUNNY / SUNSET) ================= */}
      {(isSunny || theme === "sunset") && (
        <div
          className="absolute inset-0 flex items-center justify-center pointer-events-none transition-opacity duration-1000"
          style={{
            transform: `translate(${mousePos.x * 1.5}px, ${mousePos.y * 1.5}px)`,
          }}
        >
          <div className="relative w-full h-full animate-sun-float">
            <div className="absolute left-[52%] top-[42%] -translate-x-1/2 -translate-y-1/2">
              <div
                className="w-[700px] h-[700px] -translate-x-1/2 -translate-y-1/2 absolute rounded-full animate-sun-pulse"
                style={{
                  background:
                    theme === "sunset"
                      ? "radial-gradient(circle, rgba(251, 146, 60, 0.55) 0%, rgba(244, 63, 94, 0.3) 35%, rgba(136, 19, 55, 0.15) 65%, transparent 80%)"
                      : "radial-gradient(circle, rgba(254, 240, 138, 0.45) 0%, rgba(251, 191, 36, 0.28) 35%, rgba(245, 158, 11, 0.12) 60%, transparent 80%)",
                }}
              />

              <div className="absolute left-0 top-0 w-[620px] h-[620px] animate-sun-rays opacity-80 mix-blend-screen pointer-events-none">
                <svg viewBox="0 0 400 400" className="w-full h-full">
                  <defs>
                    <linearGradient id="rayGradAtm" x1="0%" y1="0%" x2="0%" y2="100%">
                      <stop offset="0%" stopColor="rgba(255, 255, 255, 0.9)" />
                      <stop offset="25%" stopColor={theme === "sunset" ? "#fdba74" : "#fef08a"} stopOpacity="0.7" />
                      <stop offset="60%" stopColor={theme === "sunset" ? "#fb923c" : "#fbbf24"} stopOpacity="0.25" />
                      <stop offset="100%" stopColor="rgba(251, 146, 60, 0)" />
                    </linearGradient>
                  </defs>
                  {Array.from({ length: 18 }).map((_, i) => (
                    <polygon
                      key={i}
                      points="197,200 203,200 201,15 199,15"
                      fill="url(#rayGradAtm)"
                      transform={`rotate(${i * 20} 200 200)`}
                      opacity={i % 2 === 0 ? 0.9 : 0.5}
                    />
                  ))}
                </svg>
              </div>

              <div
                className="w-40 h-40 -translate-x-1/2 -translate-y-1/2 absolute rounded-full shadow-[0_0_90px_rgba(254,240,138,0.95)]"
                style={{
                  background:
                    theme === "sunset"
                      ? "radial-gradient(circle, #ffffff 15%, #fdba74 45%, #ea580c 75%, rgba(194, 65, 12, 0.4) 100%)"
                      : "radial-gradient(circle, #ffffff 15%, #fef08a 45%, #fbbf24 75%, rgba(245, 158, 11, 0.4) 100%)",
                }}
              />
            </div>
          </div>
        </div>
      )}

      {/* ================= VOLUMETRIC DRIFTING CLOUDS ================= */}
      <div
        className="absolute inset-0 bg-cover bg-center opacity-30 mix-blend-screen animate-cloud-drift-2 pointer-events-none"
        style={{
          backgroundImage: `url('https://images.unsplash.com/photo-1509114397022-ed747cca3f65?q=80&w=2000&auto=format&fit=crop')`,
          filter: isSunny ? "brightness(1.1) contrast(1.1)" : "brightness(0.7) contrast(1.3)",
          transform: `translate(${mousePos.x * -0.4}px, ${mousePos.y * -0.4}px)`,
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

      {/* ================= SNOW PARTICLES LAYER ================= */}
      {isSnow && (
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          {snowFlakes.map((_, i) => (
            <div
              key={i}
              className="snowflake"
              style={{
                left: `${Math.random() * 100}%`,
                top: `-${Math.random() * 20}%`,
                fontSize: `${10 + Math.random() * 16}px`,
                opacity: 0.35 + Math.random() * 0.55,
                animationDuration: `${3.5 + Math.random() * 5}s`,
                animationDelay: `${Math.random() * 3}s`,
              }}
            >
              ❄
            </div>
          ))}
        </div>
      )}

      {/* ================= MIST & FOG HAZE ================= */}
      {isMist && (
        <div
          className="absolute inset-0 pointer-events-none opacity-45 mix-blend-screen"
          style={{
            background:
              "radial-gradient(circle at 50% 50%, rgba(203, 213, 225, 0.45) 0%, rgba(148, 163, 184, 0.2) 60%, transparent 100%)",
            filter: "blur(40px)",
          }}
        />
      )}

      {/* ================= VIGNETTE BORDER ================= */}
      <div
        className="absolute inset-0 pointer-events-none"
        style={{
          background: "radial-gradient(circle at 50% 50%, transparent 40%, rgba(4, 7, 12, 0.8) 100%)",
        }}
      />
    </div>
  );
}
