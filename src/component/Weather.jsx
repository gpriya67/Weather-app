import React, { useState, useEffect } from "react";
import axios from "axios";
import AtmosphericBackground from "./AtmosphericBackground";
import WindChart from "./WindChart";
import SunTracker from "./SunTracker";
import ForecastRow from "./ForecastRow";
import { soundManager } from "./AudioSynthesizer";

const API_KEY = "4f2214a60bd7949dcb5650c052f42ea8";

export default function Weather() {
  // Live weather states matching the Dribbble screenshot exactly
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
  
  // Sunrise & Sunset solar times
  const [sunriseTime, setSunriseTime] = useState("05:48");
  const [sunsetTime, setSunsetTime] = useState("18:32");
  const [sunriseTimestamp, setSunriseTimestamp] = useState(null);
  const [sunsetTimestamp, setSunsetTimestamp] = useState(null);
  const [timezoneOffset, setTimezoneOffset] = useState(0);

  // Status & Error handling states
  const [loading, setLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");
  const [isAudioPlaying, setIsAudioPlaying] = useState(false);
  const [currentTime, setCurrentTime] = useState("11:52");
  const [currentDate, setCurrentDate] = useState("28 Aug");
  const [selectedDay, setSelectedDay] = useState("Thursday");

  // Forecast list matching the screenshot
  const [forecastList, setForecastList] = useState([
    { day: "Monday", temp: "26°", tempNum: 26, condition: "Mostly Sunny", icon: "sun-cloud" },
    { day: "Tuesday", temp: "28°", tempNum: 28, condition: "Mostly Sunny", icon: "sun-cloud" },
    { day: "Wednesday", temp: "24°", tempNum: 24, condition: "Thunderstorms", icon: "storm" },
    { day: "Thursday", temp: "26°", tempNum: 26, condition: "Sunny", icon: "sunny" },
    { day: "Friday", temp: "23°", tempNum: 23, condition: "Rain", icon: "rain" },
    { day: "Saturday", temp: "26°", tempNum: 26, condition: "Cloudy", icon: "cloudy" },
    { day: "Sunday", temp: "27°", tempNum: 27, condition: "Mostly Sunny", icon: "sun-cloud" },
  ]);

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

      const mainCondition = data.weather[0].main;
      const desc = data.weather[0].description;
      const capitalizedDesc = desc.charAt(0).toUpperCase() + desc.slice(1);

      if (mainCondition.toLowerCase().includes("thunder")) {
        setWeatherCondition("Thunderstorms");
        setSubCondition("intense weather conditions");
        setDescription(`${capitalizedDesc}. Heavy rain, strong winds, and occasional lightning expected. Sudden downpours may lead to localized flooding in some areas.`);
      } else if (mainCondition.toLowerCase().includes("rain") || mainCondition.toLowerCase().includes("drizzle")) {
        setWeatherCondition("Rain Showers");
        setSubCondition("active precipitation");
        setDescription(`${capitalizedDesc}. Continuous rainfall throughout the area. Light winds keep temperatures cool.`);
      } else if (mainCondition.toLowerCase().includes("clear")) {
        setWeatherCondition("Mostly Sunny");
        setSubCondition("clear sunlit atmosphere");
        setDescription(`${capitalizedDesc}. Clear skies with occasional clouds. Light winds keep temperatures comfortable, warm afternoons.`);
      } else {
        setWeatherCondition("Mostly Sunny");
        setSubCondition("partly cloudy skies");
        setDescription(`${capitalizedDesc}. Clear skies with occasional clouds. Light winds keep temperatures comfortable.`);
      }

      if (data.sys) {
        setSunriseTimestamp(data.sys.sunrise);
        setSunsetTimestamp(data.sys.sunset);
        setTimezoneOffset(data.timezone || 0);

        const srDate = new Date((data.sys.sunrise + data.timezone - new Date().getTimezoneOffset() * -60) * 1000);
        const ssDate = new Date((data.sys.sunset + data.timezone - new Date().getTimezoneOffset() * -60) * 1000);

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
    } catch (e) {
      console.warn("UV fetch warning:", e);
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

  return (
    <div className="relative min-h-screen w-full flex items-center justify-center p-2 sm:p-6 lg:p-10 select-none overflow-x-hidden font-sans">
      
      {/* Dynamic atmospheric cloud background matching screenshot */}
      <AtmosphericBackground condition={weatherCondition} />

      {/* Main Glassmorphism Dashboard Card (1:1 Dribbble Design) */}
      <main className="glass-panel relative z-10 w-full max-w-[1040px] rounded-[32px] p-6 sm:p-9 lg:p-11 flex flex-col justify-between shadow-2xl backdrop-blur-2xl transition-all duration-300">

        {/* ================= TOP HEADER BAR ================= */}
        <header className="flex flex-wrap items-center justify-between gap-4 mb-7 relative">
          
          {/* Left: forecast.now Brand */}
          <div
            className="flex items-center gap-2.5 cursor-pointer group"
            onClick={() => {
              setWeatherCondition(weatherCondition === "Thunderstorms" ? "Mostly Sunny" : "Thunderstorms");
            }}
            title="Click to toggle Thunderstorm / Sunny mode"
          >
            <svg className="w-5 h-5 text-white/90" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M17.5 19H9a7 7 0 1 1 6.71-9h1.79a4.5 4.5 0 1 1 0 9Z" />
            </svg>
            <span className="text-sm tracking-wider font-normal text-slate-100">
              forecast<span className="text-slate-400">.</span>now
            </span>
          </div>

          {/* Center: Minimalist Floating Pill (Exact 4 icons from Dribbble shot) */}
          <div className="relative">
            {!isSearchOpen ? (
              <nav className="glass-pill flex items-center px-3.5 py-1.5 rounded-full gap-3 shadow-inner">
                {/* 1. Home Icon */}
                <button
                  onClick={() => setIsSearchOpen(false)}
                  className="text-white hover:opacity-100 transition-opacity"
                  title="Dashboard"
                >
                  <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <path d="m3 9 9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z" />
                    <polyline points="9 22 9 12 15 12 15 22" />
                  </svg>
                </button>

                {/* 2. Search Icon (opens expandable search textbox & button) */}
                <button
                  onClick={() => setIsSearchOpen(true)}
                  className="text-slate-400 hover:text-white transition-colors"
                  title="Search City"
                >
                  <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <circle cx="11" cy="11" r="8" />
                    <path d="m21 21-4.3-4.3" />
                  </svg>
                </button>

                {/* 3. Bookmarks / Cards Icon */}
                <button
                  onClick={() => {
                    setWeatherCondition(weatherCondition === "Thunderstorms" ? "Mostly Sunny" : "Thunderstorms");
                  }}
                  className="text-slate-400 hover:text-white transition-colors"
                  title="Toggle Weather Condition"
                >
                  <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <rect width="18" height="18" x="3" y="3" rx="2" />
                    <path d="M3 9h18" />
                    <path d="M9 21V9" />
                  </svg>
                </button>

                {/* 4. Bell Notification / Sound Icon */}
                <button
                  onClick={toggleAudio}
                  className={`transition-colors ${isAudioPlaying ? "text-cyan-300 animate-pulse" : "text-slate-400 hover:text-white"}`}
                  title={isAudioPlaying ? "Mute Ambient Sound" : "Play Ambient Rain & Thunder"}
                >
                  <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <path d="M6 8a6 6 0 0 1 12 0c0 7 3 9 3 9H3s3-2 3-9" />
                    <path d="M10.3 21a1.94 1.94 0 0 0 3.4 0" />
                  </svg>
                </button>
              </nav>
            ) : (
              /* Expandable search textbox and button fulfilling Requirements 4 & 10 */
              <form
                onSubmit={handleSearchSubmit}
                className="glass-pill flex items-center px-2 py-1 rounded-full gap-1.5 shadow-xl animate-fade-in border border-white/25"
              >
                <input
                  type="text"
                  autoFocus
                  value={cityInput}
                  onChange={(e) => setCityInput(e.target.value)}
                  placeholder="Enter city..."
                  className="bg-transparent text-white placeholder-slate-400 text-xs px-2.5 py-1 focus:outline-none w-36 sm:w-48"
                />
                <button
                  type="submit"
                  disabled={loading}
                  className="px-2.5 py-1 bg-white/20 hover:bg-white/30 text-white text-xs font-medium rounded-full transition-all disabled:opacity-50"
                >
                  {loading ? "..." : "Get Report"}
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

          {/* Right: Date & Time + User Profile Avatar */}
          <div className="flex items-center gap-3 sm:gap-4">
            {/* Live Clock: 28 Aug | 11:52 */}
            <div className="text-xs font-mono text-slate-300 tracking-wider">
              <span>{currentDate}</span>
              <span className="mx-1.5 opacity-40">|</span>
              <span className="text-white font-medium">{currentTime}</span>
            </div>

            {/* Profile Avatar */}
            <div className="flex items-center gap-2 pl-3 border-l border-white/10">
              <img
                src="https://images.unsplash.com/photo-1534528741775-53994a69daeb?q=80&w=120&auto=format&fit=crop"
                alt="Sam Ross"
                className="w-7 h-7 rounded-full object-cover ring-1 ring-white/30"
              />
              <div className="flex flex-col text-left">
                <span className="text-[11px] font-medium text-white leading-tight flex items-center gap-1">
                  Sam Ross
                  <svg className="w-2.5 h-2.5 text-slate-400" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <polyline points="6 9 12 15 18 9" />
                  </svg>
                </span>
                <span className="text-[9px] text-slate-400 font-light">Admin</span>
              </div>
            </div>
          </div>
        </header>

        {/* Error notification if city is not found */}
        {errorMessage && (
          <div className="mb-4 px-3.5 py-2 rounded-xl bg-rose-500/20 border border-rose-500/40 text-rose-200 text-xs flex items-center justify-between">
            <span>{errorMessage}</span>
            <button onClick={() => setErrorMessage("")} className="text-rose-300 hover:text-white ml-2">✕</button>
          </div>
        )}

        {/* ================= MIDDLE HERO CONTENT ================= */}
        <section className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start mb-8">
          
          {/* Left Column: Weather Title & Stats */}
          <article className="lg:col-span-7 flex flex-col justify-between space-y-6">
            <div>
              <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold text-white tracking-tight leading-none mb-2">
                {weatherCondition}
              </h1>

              <p className="text-base sm:text-lg text-slate-300 font-light italic mb-3">
                {subCondition}
              </p>

              <p className="text-xs sm:text-sm text-slate-400 leading-relaxed max-w-lg font-light">
                {description}
              </p>
            </div>

            {/* Giant Temperature & Badges */}
            <div className="pt-2">
              <div className="flex items-baseline gap-2">
                <span className="text-6xl sm:text-7xl lg:text-8xl font-light text-white tracking-tighter">
                  {temp}°
                </span>
                <button
                  onClick={toggleTempUnit}
                  className="text-lg text-slate-400 hover:text-white px-2 py-0.5 rounded-md hover:bg-white/10 transition-colors font-mono font-light cursor-pointer"
                  title="Toggle °C / °F"
                >
                  +/-
                </button>
              </div>

              {/* Location & UV Badges (exact match to screenshot) */}
              <div className="flex items-center gap-3 mt-3">
                <button
                  onClick={() => setIsSearchOpen(true)}
                  className="flex items-center gap-1.5 text-xs text-slate-300 hover:text-white bg-white/5 hover:bg-white/10 px-3 py-1.5 rounded-full border border-white/10 transition-colors cursor-pointer"
                  title="Click to search another city"
                >
                  <svg className="w-3.5 h-3.5 text-slate-300" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <path d="M20 10c0 6-8 12-8 12s-8-6-8-12a8 8 0 0 1 16 0Z" />
                    <circle cx="12" cy="10" r="3" />
                  </svg>
                  <span>{currentCity}</span>
                </button>

                <div className="flex items-center gap-1 text-xs text-slate-400 bg-white/5 px-3 py-1.5 rounded-full border border-white/10">
                  <span className="text-slate-300 font-medium">UV Ind.</span>
                  <span className="text-white">{uvIndex}</span>
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
              timezoneOffset={timezoneOffset}
            />
          </aside>
        </section>

        {/* ================= BOTTOM 7-DAY FORECAST ================= */}
        <footer className="w-full">
          <ForecastRow
            forecastData={forecastList}
            selectedDay={selectedDay}
            onSelectDay={(dayItem) => setSelectedDay(dayItem.day)}
          />
        </footer>

      </main>
    </div>
  );
}
