import React, { useState, useEffect } from "react";
import axios from "axios";
import AtmosphericBackground from "./AtmosphericBackground";
import WindChart from "./WindChart";
import SunTracker from "./SunTracker";
import ForecastRow from "./ForecastRow";
import HourlyTimeline from "./HourlyTimeline";
import RadarWidget from "./RadarWidget";
import { soundManager } from "./AudioSynthesizer";

const API_KEY = "4f2214a60bd7949dcb5650c052f42ea8";

export default function Weather() {
  // Theme state: "frosted" | "cyber" | "aurora" | "sunset"
  const [currentTheme, setCurrentTheme] = useState("frosted");

  // Forecast mode: "7day" | "24hour"
  const [forecastMode, setForecastMode] = useState("7day");

  // Radar modal state
  const [isRadarOpen, setIsRadarOpen] = useState(false);

  // Weather States
  const [cityInput, setCityInput] = useState("");
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const [currentCity, setCurrentCity] = useState("New York");
  const [weatherCondition, setWeatherCondition] = useState("Thunderstorms");
  const [subCondition, setSubCondition] = useState("intense weather conditions");
  const [description, setDescription] = useState(
    "Heavy rain, strong winds, and occasional lightning expected. Sudden downpours may lead to localized flooding in some areas."
  );
  const [temp, setTemp] = useState(22);
  const [tempUnit, setTempUnit] = useState("C");
  const [windSpeed, setWindSpeed] = useState("7.61");
  const [uvIndex, setUvIndex] = useState("2");
  const [humidity, setHumidity] = useState("84");
  const [pressure, setPressure] = useState("1012");
  const [visibility, setVisibility] = useState("9.5");
  const [feelsLike, setFeelsLike] = useState("21");
  const [aqi, setAqi] = useState("28");

  // Sunrise & Sunset solar times
  const [sunriseTime, setSunriseTime] = useState("05:48");
  const [sunsetTime, setSunsetTime] = useState("18:32");
  const [sunriseTimestamp, setSunriseTimestamp] = useState(null);
  const [sunsetTimestamp, setSunsetTimestamp] = useState(null);

  // Status & Audio
  const [loading, setLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");
  const [isAudioPlaying, setIsAudioPlaying] = useState(false);
  const [currentTime, setCurrentTime] = useState("11:52");
  const [currentDate, setCurrentDate] = useState("28 Aug");
  const [selectedDay, setSelectedDay] = useState("Thursday");

  // 7-Day Forecast list
  const [forecastList, setForecastList] = useState([
    { day: "Monday", temp: "26°", tempNum: 26, condition: "Mostly Sunny", icon: "sun-cloud" },
    { day: "Tuesday", temp: "28°", tempNum: 28, condition: "Mostly Sunny", icon: "sun-cloud" },
    { day: "Wednesday", temp: "24°", tempNum: 24, condition: "Thunderstorms", icon: "storm" },
    { day: "Thursday", temp: "26°", tempNum: 26, condition: "Sunny", icon: "sunny" },
    { day: "Friday", temp: "23°", tempNum: 23, condition: "Rain", icon: "rain" },
    { day: "Saturday", temp: "26°", tempNum: 26, condition: "Cloudy", icon: "cloudy" },
    { day: "Sunday", temp: "27°", tempNum: 27, condition: "Mostly Sunny", icon: "sun-cloud" },
  ]);

  // Quick preset cities
  const popularCities = ["New York", "Tokyo", "London", "Paris", "Dubai", "Sydney"];

  // Weather condition presets for easy visual testing
  const weatherPresets = [
    { label: "☀️ Sunny", condition: "Mostly Sunny", sub: "clear sunlit atmosphere", desc: "Clear skies with light afternoon clouds. Mild winds and warm solar radiance." },
    { label: "⛈️ Storm", condition: "Thunderstorms", sub: "intense weather conditions", desc: "Heavy rain, strong winds, and occasional lightning expected. Sudden downpours may lead to localized flooding." },
    { label: "🌧️ Rain", condition: "Rain Showers", sub: "active precipitation", desc: "Continuous steady rainfall across the metro area with cool mist and damp roads." },
    { label: "❄️ Snow", condition: "Snow Flurries", sub: "sub-zero winter front", desc: "Gentle drifting snow crystals with cold polar winds. Roads may be icy." },
    { label: "🌫️ Mist", condition: "Misty Fog", sub: "low atmospheric visibility", desc: "Dense maritime fog layer drifting over the terrain. Visibility reduced." },
    { label: "☁️ Cloudy", condition: "Overcast Clouds", sub: "diffuse atmospheric cover", desc: "High cirrostratus cloud canopy filtering sunlight with calm conditions." },
  ];

  // Live dynamic clock
  useEffect(() => {
    const updateTime = () => {
      const now = new Date();
      const dayNum = now.getDate();
      const monthNames = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
      const month = monthNames[now.getMonth()];
      const hours = String(now.getHours()).padStart(2, "0");
      const minutes = String(now.getMinutes()).padStart(2, "0");

      setCurrentDate(`${dayNum} ${month}`);
      setCurrentTime(`${hours}:${minutes}`);
    };

    updateTime();
    const timer = setInterval(updateTime, 1000);
    return () => clearInterval(timer);
  }, []);

  // Fetch real weather from API
  const getWeather = async (queryCity) => {
    if (!queryCity.trim()) return;
    setLoading(true);
    setErrorMessage("");

    try {
      const apiUrl = `https://api.openweathermap.org/data/2.5/weather?q=${encodeURIComponent(
        queryCity
      )}&units=metric&appid=${API_KEY}`;

      const response = await axios.get(apiUrl);
      const data = response.data;

      setCurrentCity(data.name);
      setCityInput("");
      setIsSearchOpen(false);
      setTemp(Math.round(data.main.temp));
      setHumidity(data.main.humidity);
      setWindSpeed((data.wind.speed * 3.6).toFixed(2));
      setPressure(data.main.pressure ? data.main.pressure.toString() : "1013");
      setVisibility(data.visibility ? (data.visibility / 1000).toFixed(1) : "10.0");
      setFeelsLike(data.main.feels_like ? Math.round(data.main.feels_like).toString() : Math.round(data.main.temp).toString());

      const mainCondition = data.weather[0].main;
      const desc = data.weather[0].description;
      const capitalizedDesc = desc.charAt(0).toUpperCase() + desc.slice(1);

      if (mainCondition.toLowerCase().includes("thunder")) {
        setWeatherCondition("Thunderstorms");
        setSubCondition("intense weather conditions");
        setDescription(`${capitalizedDesc}. Heavy rain, strong winds, and occasional lightning expected.`);
      } else if (mainCondition.toLowerCase().includes("rain") || mainCondition.toLowerCase().includes("drizzle")) {
        setWeatherCondition("Rain Showers");
        setSubCondition("active precipitation");
        setDescription(`${capitalizedDesc}. Continuous rainfall throughout the area.`);
      } else if (mainCondition.toLowerCase().includes("snow")) {
        setWeatherCondition("Snow Flurries");
        setSubCondition("sub-zero winter front");
        setDescription(`${capitalizedDesc}. Gentle snowfall with crisp polar winds.`);
      } else if (mainCondition.toLowerCase().includes("mist") || mainCondition.toLowerCase().includes("fog") || mainCondition.toLowerCase().includes("haze")) {
        setWeatherCondition("Misty Fog");
        setSubCondition("low atmospheric visibility");
        setDescription(`${capitalizedDesc}. Fog bank reducing regional visibility.`);
      } else if (mainCondition.toLowerCase().includes("clear")) {
        setWeatherCondition("Mostly Sunny");
        setSubCondition("clear sunlit atmosphere");
        setDescription(`${capitalizedDesc}. Clear skies with warm solar radiance.`);
      } else {
        setWeatherCondition("Overcast Clouds");
        setSubCondition("diffuse cloud cover");
        setDescription(`${capitalizedDesc}. Moderate cloud cover with comfortable temperatures.`);
      }

      if (data.sys) {
        setSunriseTimestamp(data.sys.sunrise);
        setSunsetTimestamp(data.sys.sunset);

        const tz = data.timezone || 0;
        const srDate = new Date((data.sys.sunrise + tz - new Date().getTimezoneOffset() * -60) * 1000);
        const ssDate = new Date((data.sys.sunset + tz - new Date().getTimezoneOffset() * -60) * 1000);

        const srH = String(srDate.getUTCHours()).padStart(2, "0");
        const srM = String(srDate.getUTCMinutes()).padStart(2, "0");
        const ssH = String(ssDate.getUTCHours()).padStart(2, "0");
        const ssM = String(ssDate.getUTCMinutes()).padStart(2, "0");

        setSunriseTime(`${srH}:${srM}`);
        setSunsetTime(`${ssH}:${ssM}`);
      }

      if (data.coord) {
        fetchUVAndForecast(data.coord.lat, data.coord.lon);
      }
    } catch (err) {
      console.error("API Fetch Error:", err);
      if (err.response && err.response.status === 404) {
        setErrorMessage(`City "${queryCity}" not found. Please verify spelling.`);
      } else {
        setErrorMessage("Failed to fetch weather report. Please try again.");
      }
    } finally {
      setLoading(false);
    }
  };

  const fetchUVAndForecast = async (lat, lon) => {
    try {
      const meteoUrl = `https://api.open-meteo.com/v1/forecast?latitude=${lat}&longitude=${lon}&daily=temperature_2m_max,weathercode,uv_index_max&current=uv_index&timezone=auto`;
      const res = await axios.get(meteoUrl);
      const mData = res.data;

      if (mData.current && mData.current.uv_index !== undefined) {
        setUvIndex(Math.round(mData.current.uv_index).toString());
      }

      if (mData.daily && mData.daily.time) {
        const dayNames = ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"];
        const days = mData.daily.time.slice(0, 7).map((dateStr, idx) => {
          const d = new Date(dateStr);
          const dayName = dayNames[d.getDay()];
          const maxTemp = Math.round(mData.daily.temperature_2m_max[idx]);
          const wCode = mData.daily.weathercode[idx];

          let icon = "sunny";
          let condLabel = "Sunny";
          if (wCode >= 95) {
            icon = "storm";
            condLabel = "Thunderstorm";
          } else if (wCode >= 71 && wCode <= 77) {
            icon = "cloudy";
            condLabel = "Snow";
          } else if (wCode >= 51 && wCode <= 82) {
            icon = "rain";
            condLabel = "Rain";
          } else if (wCode >= 1 && wCode <= 3) {
            icon = "sun-cloud";
            condLabel = "Mostly Sunny";
          } else if (wCode >= 45) {
            icon = "cloudy";
            condLabel = "Overcast";
          }

          return {
            day: dayName,
            temp: `${maxTemp}°`,
            tempNum: maxTemp,
            condition: condLabel,
            icon,
          };
        });

        setForecastList(days);
      }
    } catch (e) {
      console.warn("UV / Forecast notice:", e);
    }
  };

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    if (cityInput.trim()) {
      getWeather(cityInput.trim());
    }
  };

  const toggleTempUnit = () => {
    if (tempUnit === "C") {
      setTemp(Math.round((temp * 9) / 5 + 32));
      setTempUnit("F");
    } else {
      setTemp(Math.round(((temp - 32) * 5) / 9));
      setTempUnit("C");
    }
  };

  const toggleAudio = () => {
    if (isAudioPlaying) {
      soundManager.stopRain();
      setIsAudioPlaying(false);
    } else {
      soundManager.startRain();
      soundManager.triggerThunder();
      setIsAudioPlaying(true);
    }
  };

  const applyWeatherPreset = (preset) => {
    setWeatherCondition(preset.condition);
    setSubCondition(preset.sub);
    setDescription(preset.desc);
    if (preset.condition.includes("Storm") && !isAudioPlaying) {
      soundManager.startRain();
      soundManager.triggerThunder();
      setIsAudioPlaying(true);
    }
  };

  const themeClasses = {
    frosted: "theme-frosted",
    cyber: "theme-cyber",
    aurora: "theme-aurora",
    sunset: "theme-sunset",
  };

  return (
    <div className={`relative min-h-screen w-full flex items-center justify-center p-2 sm:p-5 lg:p-8 select-none overflow-x-hidden font-sans ${themeClasses[currentTheme] || "theme-frosted"}`}>
      
      {/* Dynamic atmospheric background canvas reacting to weather condition & theme */}
      <AtmosphericBackground condition={weatherCondition} theme={currentTheme} />

      {/* Doppler Radar Modal */}
      <RadarWidget
        isOpen={isRadarOpen}
        onClose={() => setIsRadarOpen(false)}
        city={currentCity}
        condition={weatherCondition}
      />

      {/* Main Dashboard Panel */}
      <main className="glass-panel relative z-10 w-full max-w-[1080px] rounded-[36px] p-5 sm:p-8 lg:p-10 flex flex-col justify-between shadow-2xl backdrop-blur-2xl transition-all duration-300">

        {/* ================= TOP HEADER BAR ================= */}
        <header className="flex flex-wrap items-center justify-between gap-4 mb-6 relative">
          
          {/* Brand Logo & Interactive Weather Switcher */}
          <div className="flex items-center gap-3">
            <div
              className="flex items-center gap-2 cursor-pointer group"
              onClick={() => {
                setWeatherCondition(weatherCondition === "Thunderstorms" ? "Mostly Sunny" : "Thunderstorms");
              }}
              title="Click to toggle Sunny / Thunderstorm"
            >
              <div className="w-8 h-8 rounded-xl bg-white/10 flex items-center justify-center border border-white/15 group-hover:bg-white/20 transition-colors">
                <svg className="w-4 h-4 text-white" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="M17.5 19H9a7 7 0 1 1 6.71-9h1.79a4.5 4.5 0 1 1 0 9Z" />
                </svg>
              </div>
              <div className="flex flex-col text-left">
                <span className="text-sm font-semibold tracking-wide text-white">
                  forecast<span className="text-cyan-400">.now</span>
                </span>
                <span className="text-[10px] text-slate-400 font-mono -mt-0.5">Atmospheric Pro</span>
              </div>
            </div>

            {/* Theme Selector Dropdown / Pills */}
            <div className="hidden sm:flex items-center gap-1 bg-black/25 p-1 rounded-full border border-white/10 ml-2">
              {[
                { id: "frosted", name: "💎 Frosted" },
                { id: "cyber", name: "⚡ Cyber" },
                { id: "aurora", name: "🌌 Aurora" },
                { id: "sunset", name: "🌅 Sunset" },
              ].map((t) => (
                <button
                  key={t.id}
                  onClick={() => setCurrentTheme(t.id)}
                  className={`px-2.5 py-1 rounded-full text-[11px] font-medium transition-all ${
                    currentTheme === t.id
                      ? "bg-white/20 text-white shadow-sm border border-white/25"
                      : "text-slate-400 hover:text-white"
                  }`}
                  title={`Switch to ${t.name} visual style`}
                >
                  {t.name}
                </button>
              ))}
            </div>
          </div>

          {/* Center: Minimalist Floating Pill Navigation */}
          <div className="relative">
            {!isSearchOpen ? (
              <nav className="glass-pill flex items-center px-3.5 py-1.5 rounded-full gap-3 shadow-inner">
                {/* 1. Radar Map Button */}
                <button
                  onClick={() => setIsRadarOpen(true)}
                  className="text-cyan-400 hover:text-cyan-300 transition-colors flex items-center gap-1 text-xs"
                  title="Open Live Doppler Radar Map"
                >
                  <svg className="w-4 h-4 animate-spin" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <circle cx="12" cy="12" r="9" strokeDasharray="20 10" />
                  </svg>
                  <span className="hidden md:inline font-mono text-[10px]">RADAR</span>
                </button>

                {/* 2. Search City */}
                <button
                  onClick={() => setIsSearchOpen(true)}
                  className="text-slate-400 hover:text-white transition-colors"
                  title="Search any City"
                >
                  <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <circle cx="11" cy="11" r="8" />
                    <path d="m21 21-4.3-4.3" />
                  </svg>
                </button>

                {/* 3. Ambient Audio Toggle */}
                <button
                  onClick={toggleAudio}
                  className={`transition-colors flex items-center gap-1 ${
                    isAudioPlaying ? "text-cyan-300 animate-pulse" : "text-slate-400 hover:text-white"
                  }`}
                  title={isAudioPlaying ? "Mute Ambient Sound" : "Play Ambient Rain & Thunder"}
                >
                  <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <path d="M6 8a6 6 0 0 1 12 0c0 7 3 9 3 9H3s3-2 3-9" />
                    <path d="M10.3 21a1.94 1.94 0 0 0 3.4 0" />
                  </svg>
                  {isAudioPlaying && <span className="text-[10px] font-mono">ON</span>}
                </button>
              </nav>
            ) : (
              /* Expandable search form */
              <form
                onSubmit={handleSearchSubmit}
                className="glass-pill flex items-center px-2 py-1 rounded-full gap-1.5 shadow-xl animate-fade-in border border-white/25"
              >
                <input
                  type="text"
                  autoFocus
                  value={cityInput}
                  onChange={(e) => setCityInput(e.target.value)}
                  placeholder="Enter city (e.g. Tokyo, Paris)..."
                  className="bg-transparent text-white placeholder-slate-400 text-xs px-2.5 py-1 focus:outline-none w-40 sm:w-52"
                />
                <button
                  type="submit"
                  disabled={loading}
                  className="px-3 py-1 bg-white/20 hover:bg-white/30 text-white text-xs font-medium rounded-full transition-all disabled:opacity-50"
                >
                  {loading ? "..." : "Search"}
                </button>
                <button
                  type="button"
                  onClick={() => setIsSearchOpen(false)}
                  className="text-slate-400 hover:text-white text-xs px-1.5"
                >
                  ✕
                </button>
              </form>
            )}
          </div>

          {/* Right: Date, Live Clock & Profile */}
          <div className="flex items-center gap-3">
            <div className="text-xs font-mono text-slate-300 tracking-wider">
              <span>{currentDate}</span>
              <span className="mx-1.5 opacity-40">|</span>
              <span className="text-white font-medium">{currentTime}</span>
            </div>

            <div className="flex items-center gap-2 pl-2 border-l border-white/10">
              <img
                src="https://images.unsplash.com/photo-1534528741775-53994a69daeb?q=80&w=120&auto=format&fit=crop"
                alt="Sam Ross"
                className="w-7 h-7 rounded-full object-cover ring-1 ring-white/30"
              />
              <div className="hidden sm:flex flex-col text-left">
                <span className="text-[11px] font-medium text-white leading-tight">Sam Ross</span>
                <span className="text-[9px] text-slate-400 font-light">Meteorologist</span>
              </div>
            </div>
          </div>
        </header>

        {/* Popular Cities & Weather Presets Interactive Bar */}
        <div className="flex flex-wrap items-center justify-between gap-2 mb-6 pb-3 border-b border-white/10 text-xs">
          {/* Popular Cities */}
          <div className="flex items-center gap-1.5 overflow-x-auto py-1">
            <span className="text-[11px] text-slate-400 font-medium mr-1">Cities:</span>
            {popularCities.map((city) => (
              <button
                key={city}
                onClick={() => getWeather(city)}
                className={`px-2.5 py-0.5 rounded-full text-[11px] transition-all cursor-pointer whitespace-nowrap ${
                  currentCity.toLowerCase() === city.toLowerCase()
                    ? "bg-white/25 text-white font-semibold border border-white/30"
                    : "bg-white/5 hover:bg-white/15 text-slate-300 border border-white/5"
                }`}
              >
                {city}
              </button>
            ))}
          </div>

          {/* Weather Simulation Presets */}
          <div className="flex items-center gap-1.5 overflow-x-auto py-1">
            <span className="text-[11px] text-slate-400 font-medium mr-1">Simulate:</span>
            {weatherPresets.map((preset) => (
              <button
                key={preset.label}
                onClick={() => applyWeatherPreset(preset)}
                className={`px-2.5 py-0.5 rounded-full text-[11px] transition-all cursor-pointer whitespace-nowrap ${
                  weatherCondition === preset.condition
                    ? "bg-cyan-500/25 text-cyan-200 border border-cyan-400/40"
                    : "bg-white/5 hover:bg-white/10 text-slate-300 border border-white/5"
                }`}
                title={`Preview ${preset.condition}`}
              >
                {preset.label}
              </button>
            ))}
          </div>
        </div>

        {/* Error notification if city search fails */}
        {errorMessage && (
          <div className="mb-4 px-3.5 py-2 rounded-xl bg-rose-500/20 border border-rose-500/40 text-rose-200 text-xs flex items-center justify-between">
            <span>{errorMessage}</span>
            <button onClick={() => setErrorMessage("")} className="text-rose-300 hover:text-white ml-2">✕</button>
          </div>
        )}

        {/* ================= MIDDLE HERO CONTENT ================= */}
        <section className="grid grid-cols-1 lg:grid-cols-12 gap-7 items-start mb-6">
          
          {/* Left Column: Weather Title, Big Temperature & Telemetry Cards */}
          <article className="lg:col-span-7 flex flex-col justify-between space-y-5">
            <div>
              <div className="flex items-center gap-3 mb-1">
                <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold text-white tracking-tight leading-none">
                  {weatherCondition}
                </h1>
                <button
                  onClick={() => setIsRadarOpen(true)}
                  className="px-2.5 py-1 rounded-full bg-cyan-400/20 hover:bg-cyan-400/30 text-cyan-300 text-[10px] font-mono border border-cyan-400/30 transition-all flex items-center gap-1"
                >
                  <span>Radar View</span> ↗
                </button>
              </div>

              <p className="text-base sm:text-lg text-slate-300 font-light italic mb-2 capitalize">
                {subCondition}
              </p>

              <p className="text-xs sm:text-sm text-slate-400 leading-relaxed max-w-lg font-light">
                {description}
              </p>
            </div>

            {/* Giant Temperature & Badges */}
            <div className="pt-1">
              <div className="flex items-baseline gap-2">
                <span className="text-6xl sm:text-7xl lg:text-8xl font-light text-white tracking-tighter">
                  {temp}°
                </span>
                <button
                  onClick={toggleTempUnit}
                  className="text-lg text-slate-300 hover:text-white px-2.5 py-0.5 rounded-md hover:bg-white/10 transition-colors font-mono font-light border border-white/10"
                  title="Toggle °C / °F"
                >
                  °{tempUnit}
                </button>

                <div className="ml-3 text-xs text-slate-400 flex flex-col">
                  <span>Feels like: <strong className="text-white">{feelsLike}°{tempUnit}</strong></span>
                  <span>Dew point: <strong className="text-slate-300">{Math.round(temp - 3)}°{tempUnit}</strong></span>
                </div>
              </div>

              {/* Location Badge */}
              <div className="flex items-center gap-2 mt-3">
                <button
                  onClick={() => setIsSearchOpen(true)}
                  className="flex items-center gap-1.5 text-xs text-slate-200 hover:text-white bg-white/10 hover:bg-white/20 px-3.5 py-1.5 rounded-full border border-white/15 transition-colors cursor-pointer"
                  title="Click to search another city"
                >
                  <svg className="w-3.5 h-3.5 text-cyan-400" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <path d="M20 10c0 6-8 12-8 12s-8-6-8-12a8 8 0 0 1 16 0Z" />
                    <circle cx="12" cy="10" r="3" />
                  </svg>
                  <span className="font-medium">{currentCity}</span>
                  <span className="text-slate-400 text-[10px]">Change ↵</span>
                </button>
              </div>
            </div>

            {/* Detailed Atmospheric Telemetry Mini-Cards */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5 pt-2">
              {/* AQI */}
              <div className="glass-card p-2.5 rounded-xl flex flex-col justify-between">
                <div className="flex items-center justify-between text-[11px] text-slate-400">
                  <span>Air Quality</span>
                  <span className="w-2 h-2 rounded-full bg-emerald-400" />
                </div>
                <div className="mt-1 flex items-baseline gap-1">
                  <span className="text-lg font-bold text-white font-mono">{aqi}</span>
                  <span className="text-[10px] text-emerald-300 font-medium">Good</span>
                </div>
              </div>

              {/* Humidity */}
              <div className="glass-card p-2.5 rounded-xl flex flex-col justify-between">
                <div className="flex items-center justify-between text-[11px] text-slate-400">
                  <span>Humidity</span>
                  <span className="text-cyan-300">💧</span>
                </div>
                <div className="mt-1 flex items-baseline gap-1">
                  <span className="text-lg font-bold text-white font-mono">{humidity}%</span>
                  <span className="text-[10px] text-slate-400">Normal</span>
                </div>
              </div>

              {/* Pressure */}
              <div className="glass-card p-2.5 rounded-xl flex flex-col justify-between">
                <div className="flex items-center justify-between text-[11px] text-slate-400">
                  <span>Pressure</span>
                  <span className="text-amber-300">⏲️</span>
                </div>
                <div className="mt-1 flex items-baseline gap-1">
                  <span className="text-lg font-bold text-white font-mono">{pressure}</span>
                  <span className="text-[10px] text-slate-400">hPa</span>
                </div>
              </div>

              {/* Visibility */}
              <div className="glass-card p-2.5 rounded-xl flex flex-col justify-between">
                <div className="flex items-center justify-between text-[11px] text-slate-400">
                  <span>Visibility</span>
                  <span className="text-purple-300">👁️</span>
                </div>
                <div className="mt-1 flex items-baseline gap-1">
                  <span className="text-lg font-bold text-white font-mono">{visibility}</span>
                  <span className="text-[10px] text-slate-400">km</span>
                </div>
              </div>
            </div>
          </article>

          {/* Right Column: Widgets */}
          <aside className="lg:col-span-5 flex flex-col space-y-4">
            {/* Widget 1: Wind Status */}
            <WindChart windSpeed={windSpeed} windUnit="km/h" />

            {/* Widget 2: Sunrise & Sunset Arc */}
            <SunTracker
              sunrise={sunriseTime}
              sunset={sunsetTime}
              sunriseTimestamp={sunriseTimestamp}
              sunsetTimestamp={sunsetTimestamp}
            />
          </aside>
        </section>

        {/* ================= BOTTOM FORECAST SECTION ================= */}
        <footer className="w-full pt-2 border-t border-white/10">
          
          {/* Mode Switcher Tabs: 7-Day Forecast vs 24-Hour Timeline */}
          <div className="flex items-center justify-between mb-2">
            <div className="flex items-center gap-2">
              <button
                onClick={() => setForecastMode("7day")}
                className={`px-3 py-1 rounded-full text-xs font-medium transition-all ${
                  forecastMode === "7day"
                    ? "bg-white/20 text-white border border-white/25 shadow-sm"
                    : "text-slate-400 hover:text-white"
                }`}
              >
                📅 7-Day Overview
              </button>

              <button
                onClick={() => setForecastMode("24hour")}
                className={`px-3 py-1 rounded-full text-xs font-medium transition-all ${
                  forecastMode === "24hour"
                    ? "bg-white/20 text-white border border-white/25 shadow-sm"
                    : "text-slate-400 hover:text-white"
                }`}
              >
                ⏱️ 24-Hour Timeline
              </button>
            </div>

            <button
              onClick={() => setIsRadarOpen(true)}
              className="text-xs text-cyan-400 hover:text-cyan-300 transition-colors flex items-center gap-1"
            >
              <svg className="w-3.5 h-3.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <circle cx="12" cy="12" r="10" />
                <path d="M12 2a14.5 14.5 0 0 0 0 20 14.5 14.5 0 0 0 0-20" />
                <path d="M2 12h20" />
              </svg>
              <span>Satellite Radar Map</span>
            </button>
          </div>

          {forecastMode === "7day" ? (
            <ForecastRow
              forecastData={forecastList}
              selectedDay={selectedDay}
              onSelectDay={(dayItem) => setSelectedDay(dayItem.day)}
            />
          ) : (
            <HourlyTimeline currentTemp={temp} condition={weatherCondition} />
          )}
        </footer>

      </main>
    </div>
  );
}
