import React from "react";

export default function ForecastRow({ forecastData, selectedDay, onSelectDay }) {
  const defaultForecast = [
    { day: "Monday", temp: "26°", tempNum: 26, condition: "Mostly Sunny", icon: "sun-cloud" },
    { day: "Tuesday", temp: "28°", tempNum: 28, condition: "Mostly Sunny", icon: "sun-cloud" },
    { day: "Wednesday", temp: "24°", tempNum: 24, condition: "Thunderstorms", icon: "storm" },
    { day: "Thursday", temp: "26°", tempNum: 26, condition: "Sunny", icon: "sunny" },
    { day: "Friday", temp: "23°", tempNum: 23, condition: "Rain", icon: "rain" },
    { day: "Saturday", temp: "26°", tempNum: 26, condition: "Cloudy", icon: "cloudy" },
    { day: "Sunday", temp: "27°", tempNum: 27, condition: "Mostly Sunny", icon: "sun-cloud" },
  ];

  const days = forecastData && forecastData.length > 0 ? forecastData : defaultForecast;
  const currentActive = selectedDay || "Thursday";

  // Coordinates across an SVG width of 700
  // Days at x: 50, 150, 250, 350, 450, 550, 650
  const splinePoints = [
    { x: 50, y: 22 },   // Mon 26°
    { x: 150, y: 12 },  // Tue 28°
    { x: 250, y: 38 },  // Wed 24°
    { x: 350, y: 22 },  // Thu 26°
    { x: 450, y: 44 },  // Fri 23°
    { x: 550, y: 22 },  // Sat 26°
    { x: 650, y: 16 },  // Sun 27°
  ];

  const svgPath =
    "M 50,22 C 90,18 110,12 150,12 C 190,12 210,38 250,38 C 290,38 310,22 350,22 C 390,22 410,44 450,44 C 490,44 510,22 550,22 C 590,22 610,16 650,16";

  const renderWeatherIcon = (iconType, isSelected) => {
    switch (iconType) {
      case "sunny":
        return (
          <div className="relative">
            <svg className="w-5 h-5 text-amber-300" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <circle cx="12" cy="12" r="4" fill="#fbbf24" fillOpacity="0.5" />
              <path d="M12 2v2M12 20v2M4.93 4.93l1.41 1.41M17.66 17.66l1.41 1.41M2 12h2M20 12h2M6.34 17.66l-1.41 1.41M19.07 4.93l-1.41 1.41" />
            </svg>
            {isSelected && (
              <div className="absolute inset-0 bg-amber-400/50 rounded-full filter blur-sm -z-10 animate-ping" />
            )}
          </div>
        );
      case "sun-cloud":
        return (
          <svg className="w-5 h-5 text-amber-200" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8">
            <path d="M12 2v2" stroke="#fbbf24" />
            <path d="m4.93 4.93 1.41 1.41" stroke="#fbbf24" />
            <path d="M17.5 19H9a5 5 0 0 1-4.9-4 5 5 0 0 1 4.9-6 5.5 5.5 0 0 1 8.5 2 4.5 4.5 0 0 1 0 8Z" />
          </svg>
        );
      case "storm":
        return (
          <svg className="w-5 h-5 text-slate-200" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8">
            <path d="M17.5 19H9a7 7 0 1 1 6.71-9h1.79a4.5 4.5 0 1 1 0 9Z" />
            <path d="m13 14-2 4h3l-2 4" stroke="#93c5fd" />
          </svg>
        );
      case "rain":
        return (
          <svg className="w-5 h-5 text-blue-200" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8">
            <path d="M17.5 19H9a7 7 0 1 1 6.71-9h1.79a4.5 4.5 0 1 1 0 9Z" />
            <path d="M8 19v3" stroke="#60a5fa" strokeDasharray="2 2" />
            <path d="M12 19v3" stroke="#60a5fa" strokeDasharray="2 2" />
            <path d="M16 19v3" stroke="#60a5fa" strokeDasharray="2 2" />
          </svg>
        );
      case "cloudy":
      default:
        return (
          <svg className="w-5 h-5 text-slate-300" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8">
            <path d="M17.5 19H9a7 7 0 1 1 6.71-9h1.79a4.5 4.5 0 1 1 0 9Z" />
          </svg>
        );
    }
  };

  return (
    <div className="w-full pt-4 relative select-none">
      
      {/* 1. Day names & Big Temperatures Grid (Exact Dribbble hierarchy) */}
      <div className="grid grid-cols-7 gap-1 md:gap-2 w-full text-center mb-1">
        {days.map((item, idx) => {
          const isSelected = currentActive === item.day;
          return (
            <div
              key={idx}
              onClick={() => onSelectDay && onSelectDay(item)}
              className="flex flex-col items-center cursor-pointer group"
            >
              {/* Day name */}
              <span className={`text-[11px] sm:text-xs font-normal mb-1 transition-colors ${
                isSelected ? "text-white font-medium" : "text-slate-400 group-hover:text-slate-200"
              }`}>
                {item.day}
              </span>

              {/* Big temperature */}
              <span className="text-xl sm:text-2xl md:text-3xl font-light text-white tracking-tight">
                {item.temp}
              </span>
            </div>
          );
        })}
      </div>

      {/* 2. Continuous Wavy Temperature Spline with Node Points (Runs right under temperatures) */}
      <div className="relative h-12 w-full my-0.5">
        <svg viewBox="0 0 700 55" preserveAspectRatio="none" className="w-full h-full overflow-visible">
          <defs>
            <linearGradient id="forecastLineGrad" x1="0%" y1="0%" x2="100%" y2="0%">
              <stop offset="0%" stopColor="rgba(255, 255, 255, 0.25)" />
              <stop offset="50%" stopColor="rgba(255, 255, 255, 0.75)" />
              <stop offset="100%" stopColor="rgba(255, 255, 255, 0.3)" />
            </linearGradient>
            <radialGradient id="activeNodePulse" cx="50%" cy="50%" r="50%">
              <stop offset="0%" stopColor="#ffffff" />
              <stop offset="40%" stopColor="#fef08a" />
              <stop offset="100%" stopColor="rgba(251, 191, 36, 0)" />
            </radialGradient>
          </defs>

          {/* Connected wavy bezier path */}
          <path
            d={svgPath}
            fill="none"
            stroke="url(#forecastLineGrad)"
            strokeWidth="1.8"
            strokeLinecap="round"
          />

          {/* Node points on the spline */}
          {days.map((item, idx) => {
            const pt = splinePoints[idx] || { x: 50 + idx * 100, y: 22 };
            const isSelected = currentActive === item.day;

            return (
              <g key={idx} className="cursor-pointer" onClick={() => onSelectDay && onSelectDay(item)}>
                {/* Active vertical light beam rising up towards temperature */}
                {isSelected && (
                  <>
                    <line
                      x1={pt.x}
                      y1="-8"
                      x2={pt.x}
                      y2={pt.y}
                      stroke="rgba(254, 240, 138, 0.75)"
                      strokeWidth="1.5"
                      strokeDasharray="2 2"
                    />
                    <circle cx={pt.x} cy={pt.y} r="12" fill="url(#activeNodePulse)" className="animate-pulse" />
                  </>
                )}

                {/* Node point */}
                <circle
                  cx={pt.x}
                  cy={pt.y}
                  r={isSelected ? 5 : 3}
                  fill={isSelected ? "#ffffff" : "rgba(255, 255, 255, 0.6)"}
                  stroke={isSelected ? "#f59e0b" : "rgba(0, 0, 0, 0.4)"}
                  strokeWidth={isSelected ? 2 : 1}
                  className="transition-all duration-200 hover:scale-125"
                />
              </g>
            );
          })}
        </svg>
      </div>

      {/* 3. Weather Icons row (Positioned under the spline nodes matching Dribbble shot) */}
      <div className="grid grid-cols-7 gap-1 md:gap-2 w-full text-center">
        {days.map((item, idx) => {
          const isSelected = currentActive === item.day;
          return (
            <div
              key={idx}
              onClick={() => onSelectDay && onSelectDay(item)}
              className="flex justify-center items-center cursor-pointer py-1 transition-transform hover:scale-110"
            >
              {renderWeatherIcon(item.icon, isSelected)}
            </div>
          );
        })}
      </div>

    </div>
  );
}
