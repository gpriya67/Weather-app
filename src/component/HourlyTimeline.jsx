import React, { useState } from "react";

export default function HourlyTimeline({ currentTemp = 22, condition = "Mostly Sunny" }) {
  const [activeHour, setActiveHour] = useState(3);

  // Generate 8 intervals covering next 24 hours
  const hoursData = [
    { time: "Now", temp: currentTemp, rainProb: 15, icon: "sun-cloud", wind: "12 km/h" },
    { time: "14:00", temp: currentTemp + 2, rainProb: 10, icon: "sunny", wind: "14 km/h" },
    { time: "16:00", temp: currentTemp + 3, rainProb: 20, icon: "sunny", wind: "16 km/h" },
    { time: "18:00", temp: currentTemp + 1, rainProb: 35, icon: "sun-cloud", wind: "15 km/h" },
    { time: "20:00", temp: currentTemp - 1, rainProb: 65, icon: "rain", wind: "18 km/h" },
    { time: "22:00", temp: currentTemp - 3, rainProb: 80, icon: "storm", wind: "22 km/h" },
    { time: "00:00", temp: currentTemp - 4, rainProb: 75, icon: "rain", wind: "19 km/h" },
    { time: "02:00", temp: currentTemp - 5, rainProb: 40, icon: "cloudy", wind: "14 km/h" },
  ];

  const renderIcon = (type) => {
    switch (type) {
      case "sunny":
        return <span className="text-amber-300">☀️</span>;
      case "storm":
        return <span className="text-cyan-300">⛈️</span>;
      case "rain":
        return <span className="text-blue-300">🌧️</span>;
      case "cloudy":
        return <span className="text-slate-300">☁️</span>;
      default:
        return <span className="text-amber-200">⛅</span>;
    }
  };

  return (
    <div className="w-full select-none pt-2">
      <div className="flex items-center justify-between mb-3 text-xs text-slate-300">
        <div className="flex items-center gap-2">
          <span className="w-2 h-2 rounded-full bg-cyan-400 animate-ping" />
          <span className="font-medium tracking-wide">Next 24 Hours • Hourly Precipitation & Temperature</span>
        </div>
        <span className="text-[11px] text-slate-400 font-mono">Scroll or click hour to inspect</span>
      </div>

      {/* Hourly Cards Row */}
      <div className="grid grid-cols-4 sm:grid-cols-8 gap-2 w-full">
        {hoursData.map((hr, idx) => {
          const isSelected = activeHour === idx;
          return (
            <div
              key={idx}
              onClick={() => setActiveHour(idx)}
              className={`flex flex-col items-center justify-between p-2.5 rounded-2xl transition-all duration-300 cursor-pointer ${
                isSelected
                  ? "bg-white/15 border border-white/30 shadow-lg scale-105"
                  : "bg-white/5 hover:bg-white/10 border border-white/5"
              }`}
            >
              <span className={`text-[11px] font-medium ${isSelected ? "text-white" : "text-slate-400"}`}>
                {hr.time}
              </span>

              <div className="text-lg my-1.5 transform transition-transform hover:scale-125">
                {renderIcon(hr.icon)}
              </div>

              <span className="text-base font-light text-white tracking-tight">
                {hr.temp}°
              </span>

              {/* Rain Probability Bar */}
              <div className="w-full mt-2 flex flex-col items-center gap-1">
                <div className="w-full bg-white/10 h-1.5 rounded-full overflow-hidden">
                  <div
                    className="h-full bg-gradient-to-r from-cyan-400 to-blue-500 rounded-full transition-all duration-500"
                    style={{ width: `${hr.rainProb}%` }}
                  />
                </div>
                <span className="text-[9px] text-cyan-300 font-mono">{hr.rainProb}%</span>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
