import React, { useState, useEffect } from 'react';
import { Cloud, Sun, CloudRain, CloudSnow, CloudLightning, Wind, Droplets, AlertTriangle, PackageOpen, Loader2, RefreshCw, MapPin, Thermometer } from 'lucide-react';

const WMO = {
  0:  { desc: 'Clear Sky',            icon: 'sun',     sev: 0 },
  1:  { desc: 'Mainly Clear',         icon: 'sun',     sev: 0 },
  2:  { desc: 'Partly Cloudy',        icon: 'cloud',   sev: 0 },
  3:  { desc: 'Overcast',             icon: 'cloud',   sev: 1 },
  45: { desc: 'Foggy',                icon: 'cloud',   sev: 1 },
  48: { desc: 'Icy Fog',              icon: 'cloud',   sev: 2 },
  51: { desc: 'Light Drizzle',        icon: 'rain',    sev: 1 },
  53: { desc: 'Moderate Drizzle',     icon: 'rain',    sev: 1 },
  55: { desc: 'Dense Drizzle',        icon: 'rain',    sev: 2 },
  61: { desc: 'Slight Rain',          icon: 'rain',    sev: 1 },
  63: { desc: 'Moderate Rain',        icon: 'rain',    sev: 2 },
  65: { desc: 'Heavy Rain',           icon: 'rain',    sev: 3 },
  71: { desc: 'Light Snow',           icon: 'snow',    sev: 2 },
  73: { desc: 'Moderate Snow',        icon: 'snow',    sev: 2 },
  75: { desc: 'Heavy Snow',           icon: 'snow',    sev: 3 },
  80: { desc: 'Slight Showers',       icon: 'rain',    sev: 1 },
  81: { desc: 'Moderate Showers',     icon: 'rain',    sev: 2 },
  82: { desc: 'Violent Showers',      icon: 'rain',    sev: 3 },
  95: { desc: 'Thunderstorm',         icon: 'thunder', sev: 3 },
  96: { desc: 'Thunderstorm + Hail',  icon: 'thunder', sev: 3 },
  99: { desc: 'Heavy Hail Storm',     icon: 'thunder', sev: 3 },
};

const WeatherIcon = ({ icon, className = 'w-6 h-6' }) => {
  if (icon === 'sun')    return <Sun     className={`${className} text-yellow-400`} />;
  if (icon === 'rain')   return <CloudRain   className={`${className} text-blue-400`} />;
  if (icon === 'snow')   return <CloudSnow   className={`${className} text-sky-300`} />;
  if (icon === 'thunder') return <CloudLightning className={`${className} text-yellow-500`} />;
  return <Cloud className={`${className} text-gray-400`} />;
};

const getPacking = (forecast) => {
  if (!forecast.length) return [];
  const maxT = Math.max(...forecast.map(d => d.tempMax));
  const minT = Math.min(...forecast.map(d => d.tempMin));
  const avgT = forecast.reduce((s, d) => s + (d.tempMax + d.tempMin) / 2, 0) / forecast.length;
  const hasRain = forecast.some(d => [51,53,55,61,63,65,80,81,82].includes(d.weatherCode));
  const hasHeavy = forecast.some(d => [65,82].includes(d.weatherCode));
  const hasSnow  = forecast.some(d => [71,73,75].includes(d.weatherCode));
  const hasStorm = forecast.some(d => [95,96,99].includes(d.weatherCode));
  const hasWind  = forecast.some(d => d.windMax > 40);

  const items = [];
  if (maxT >= 30)        items.push({ e: '🕶️', t: 'Sunglasses & hat — UV is intense' });
  if (maxT >= 28)        items.push({ e: '🧴', t: 'Sunscreen SPF 50+ daily' });
  if (maxT >= 26)        items.push({ e: '👕', t: 'Light, breathable clothing' });
  if (avgT <= 15)        items.push({ e: '🧥', t: 'Warm jacket or coat' });
  if (minT <= 8)         items.push({ e: '🧤', t: 'Gloves & thermal layers' });
  if (minT <= 3)         items.push({ e: '🧣', t: 'Heavy winter gear & scarf' });
  if (maxT - minT > 12) items.push({ e: '👔', t: 'Layer up — big daily temp swings' });
  if (hasRain)           items.push({ e: '☂️', t: 'Compact travel umbrella' });
  if (hasHeavy)          items.push({ e: '🌧️', t: 'Waterproof rain jacket' });
  if (hasSnow)           items.push({ e: '👢', t: 'Waterproof snow boots' });
  if (hasStorm)          items.push({ e: '⚡', t: 'Stay indoors during storm alerts' });
  if (hasWind)           items.push({ e: '💨', t: 'Windbreaker jacket' });
  items.push({ e: '💧', t: 'Stay hydrated — carry a water bottle' });
  return items.slice(0, 7);
};

const getBestDay = (forecast) => {
  if (!forecast.length) return null;
  const best = forecast
    .map((d, i) => ({
      ...d, i,
      score: (WMO[d.weatherCode]?.sev === 0 ? 10 : WMO[d.weatherCode]?.sev === 1 ? 5 : 0)
           + (d.tempMax <= 28 && d.tempMax >= 18 ? 8 : d.tempMax < 35 ? 4 : 0)
           + (d.precipProb < 20 ? 5 : d.precipProb < 40 ? 2 : 0),
    }))
    .reduce((a, b) => b.score > a.score ? b : a);
  const label = best.i === 0 ? 'Today'
    : new Date(best.date).toLocaleDateString('en-US', { weekday:'long', month:'short', day:'numeric', timeZone:'UTC' });
  return `${label} — ${WMO[best.weatherCode]?.desc || 'Fair'} with highs of ${Math.round(best.tempMax)}°C`;
};

export const WeatherView = ({ tripDestination }) => {
  const [loading, setLoading]   = useState(true);
  const [error, setError]       = useState(null);
  const [forecast, setForecast] = useState([]);
  const [locName, setLocName]   = useState('');
  const [alerts, setAlerts]     = useState([]);

  const load = async () => {
    if (!tripDestination) { setError('No destination set for this trip.'); setLoading(false); return; }
    setLoading(true); setError(null);
    try {
      let lat, lng, name, country;
      const searchTerm = encodeURIComponent(tripDestination.split(',')[0].trim());

      // Geocode with Open-Meteo's own geocoding API (no key needed)
      const gRes = await fetch(
        `https://geocoding-api.open-meteo.com/v1/search?name=${searchTerm}&count=1&language=en&format=json`
      );
      const gData = await gRes.json();

      if (gData.results?.length) {
        ({ latitude: lat, longitude: lng, name, country } = gData.results[0]);
        setLocName(`${name}${country ? `, ${country}` : ''}`);
      } else {
        // Fallback to Nominatim API for places Open-Meteo misses (like states or small towns)
        const nRes = await fetch(
          `https://nominatim.openstreetmap.org/search?q=${searchTerm}&format=json&limit=1`,
          { headers: { 'Accept-Language': 'en-US,en;q=0.9' } }
        );
        const nData = await nRes.json();
        
        if (!nData?.length) {
          throw new Error(`No weather data found for "${tripDestination}". Try using just the city name.`);
        }
        
        lat = parseFloat(nData[0].lat);
        lng = parseFloat(nData[0].lon);
        name = nData[0].name;
        
        const displayParts = nData[0].display_name.split(',');
        country = displayParts.length > 1 ? displayParts[displayParts.length - 1].trim() : '';
        setLocName(`${name}${country ? `, ${country}` : ''}`);
      }

      // Fetch 7-day forecast
      const wRes = await fetch(
        `https://api.open-meteo.com/v1/forecast?latitude=${lat}&longitude=${lng}&daily=weather_code,temperature_2m_max,temperature_2m_min,precipitation_probability_max,wind_speed_10m_max&timezone=auto&forecast_days=7`
      );
      const wData = await wRes.json();
      if (!wData.daily) throw new Error('Invalid weather data from API.');

      const { daily: d } = wData;
      const days = d.time.map((date, i) => ({
        date, weatherCode: d.weather_code[i],
        tempMax: d.temperature_2m_max[i], tempMin: d.temperature_2m_min[i],
        precipProb: d.precipitation_probability_max[i], windMax: d.wind_speed_10m_max[i],
      }));
      setForecast(days);

      const newAlerts = days
        .filter(d => (WMO[d.weatherCode]?.sev >= 3) || d.windMax > 60)
        .map(d => {
          const lbl = new Date(d.date).toLocaleDateString('en-US', { weekday:'short', month:'short', day:'numeric', timeZone:'UTC' });
          return `${lbl}: ${WMO[d.weatherCode]?.desc || 'Severe weather'}${d.windMax > 60 ? ` · Winds up to ${Math.round(d.windMax)} km/h` : ''}`;
        });
      setAlerts(newAlerts);
    } catch (err) {
      setError(err.message || 'Failed to fetch weather.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { load(); }, [tripDestination]);

  if (loading) return (
    <div className="flex flex-col items-center justify-center h-48 gap-3 animate-fadeIn">
      <Loader2 className="w-8 h-8 text-primary animate-spin" />
      <p className="text-sm font-bold text-gray-400">Fetching forecast for {tripDestination}…</p>
    </div>
  );

  if (error) return (
    <div className="bg-white rounded-2xl shadow-sm p-8 text-center space-y-4 animate-fadeIn">
      <AlertTriangle className="w-8 h-8 text-orange-400 mx-auto" />
      <p className="text-sm text-gray-500">{error}</p>
      <button onClick={load} className="bg-accent/10 text-accent font-bold text-sm px-4 py-2 rounded-xl hover:bg-accent/20">Retry</button>
    </div>
  );

  const packingItems = getPacking(forecast);
  const bestDay = getBestDay(forecast);
  const allTemps = forecast.flatMap(d => [d.tempMax, d.tempMin]);
  const tempRange = Math.max(...allTemps) - Math.min(...allTemps) || 1;
  const tempMin = Math.min(...allTemps);

  return (
    <div className="space-y-4 animate-fadeIn">
      {/* Header */}
      <div className="bg-white rounded-2xl shadow-sm p-4 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="p-2.5 bg-blue-50 rounded-xl"><Cloud className="w-5 h-5 text-blue-500" /></div>
          <div>
            <h2 className="font-extrabold text-primary text-lg tracking-tight">7-Day Weather Forecast</h2>
            <div className="flex items-center gap-1.5 mt-0.5">
              <MapPin className="w-3 h-3 text-gray-400" />
              <p className="text-xs text-gray-400 font-medium">{locName || tripDestination}</p>
            </div>
          </div>
        </div>
        <button onClick={load} className="p-2 hover:bg-slate-100 rounded-xl transition-colors" title="Refresh">
          <RefreshCw className="w-4 h-4 text-gray-400" />
        </button>
      </div>

      {/* Alerts */}
      {alerts.length > 0 && (
        <div className="bg-red-50 border border-red-100 rounded-2xl p-4 space-y-1.5">
          <div className="flex items-center gap-2 mb-1">
            <AlertTriangle className="w-4 h-4 text-red-500" />
            <h3 className="text-sm font-extrabold text-red-600">Weather Alerts</h3>
          </div>
          {alerts.map((a, i) => <p key={i} className="text-xs text-red-500 font-medium pl-6">{a}</p>)}
        </div>
      )}

      {/* 7-day grid */}
      <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-7 gap-3">
        {forecast.map((day, i) => {
          const wmo = WMO[day.weatherCode] || { desc: 'Unknown', icon: 'cloud', sev: 0 };
          const dayName = new Date(day.date).toLocaleDateString('en-US', { weekday:'short', timeZone:'UTC' });
          const dayNum  = new Date(day.date).toLocaleDateString('en-US', { day:'numeric', month:'short', timeZone:'UTC' });
          return (
            <div key={day.date} className={`bg-white rounded-2xl shadow-sm p-3.5 flex flex-col items-center gap-2 border transition-all hover:-translate-y-0.5 hover:shadow-md cursor-default ${i===0 ? 'border-primary/20 ring-2 ring-primary/10' : 'border-transparent'}`}>
              <div className="text-center">
                <div className={`text-xs font-extrabold ${i===0 ? 'text-primary' : 'text-gray-400'}`}>{i===0 ? 'Today' : dayName}</div>
                <div className="text-[10px] text-gray-400">{dayNum}</div>
              </div>
              <WeatherIcon icon={wmo.icon} className="w-7 h-7" />
              <div className="text-[10px] text-gray-500 font-medium text-center leading-tight">{wmo.desc}</div>
              <div className="flex items-center gap-1 text-xs font-bold">
                <span className="text-red-400">{Math.round(day.tempMax)}°</span>
                <span className="text-gray-300">/</span>
                <span className="text-blue-400">{Math.round(day.tempMin)}°</span>
              </div>
              <div className="flex items-center gap-2 text-[10px] text-gray-400">
                <span className="flex items-center gap-0.5"><Droplets className="w-2.5 h-2.5 text-blue-300" />{day.precipProb}%</span>
                <span className="flex items-center gap-0.5"><Wind className="w-2.5 h-2.5 text-gray-300" />{Math.round(day.windMax)}</span>
              </div>
              {wmo.sev >= 2 && <span className="text-[9px] bg-orange-50 text-orange-500 font-bold px-1.5 py-0.5 rounded-full">⚠ Alert</span>}
            </div>
          );
        })}
      </div>

      {/* Best day suggestion */}
      {bestDay && (
        <div className="bg-emerald-50 border border-emerald-100 rounded-2xl p-4 flex items-center gap-3">
          <Sun className="w-4 h-4 text-emerald-500 flex-shrink-0" />
          <p className="text-xs text-emerald-700 font-medium"><span className="font-extrabold">Best day to explore:</span> {bestDay}</p>
        </div>
      )}

      {/* Bottom Row: Packing + Temp Chart */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        {/* Packing */}
        <div className="bg-white rounded-2xl shadow-sm p-5">
          <div className="flex items-center gap-2 mb-4">
            <PackageOpen className="w-4 h-4 text-accent" />
            <h3 className="font-extrabold text-primary text-sm">Packing Recommendations</h3>
          </div>
          <div className="space-y-2">
            {packingItems.map((item, i) => (
              <div key={i} className="flex items-center gap-2.5 bg-slate-50 rounded-xl px-3 py-2.5">
                <span className="text-lg leading-none">{item.e}</span>
                <span className="text-xs font-medium text-gray-700">{item.t}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Temperature chart */}
        <div className="bg-white rounded-2xl shadow-sm p-5">
          <div className="flex items-center gap-2 mb-4">
            <Thermometer className="w-4 h-4 text-red-400" />
            <h3 className="font-extrabold text-primary text-sm">Temperature Trend (°C)</h3>
          </div>
          <div className="flex items-end gap-1.5 h-24 px-1">
            {forecast.map((day, i) => {
              const h = ((day.tempMax - tempMin) / tempRange) * 80;
              const l = ((day.tempMin - tempMin) / tempRange) * 80;
              const lbl = i===0 ? 'Today' : new Date(day.date).toLocaleDateString('en-US', { weekday:'short', timeZone:'UTC' });
              return (
                <div key={day.date} className="flex-1 flex flex-col items-center gap-1 group cursor-default" title={`${Math.round(day.tempMax)}° / ${Math.round(day.tempMin)}°`}>
                  <div className="relative w-full flex items-end justify-center" style={{ height: '88px' }}>
                    <div className="w-full rounded-t-lg bg-red-100 group-hover:bg-red-200 transition-colors absolute bottom-0" style={{ height:`${Math.max(h,4)}px` }} />
                    <div className="w-3/5 rounded-t-lg bg-blue-100 group-hover:bg-blue-200 transition-colors absolute bottom-0 opacity-80" style={{ height:`${Math.max(l,2)}px` }} />
                  </div>
                  <span className="text-[9px] text-gray-400 font-bold truncate w-full text-center">{lbl}</span>
                </div>
              );
            })}
          </div>
          <div className="flex gap-4 mt-2 text-[10px] font-bold text-gray-400">
            <span className="flex items-center gap-1"><span className="w-3 h-2.5 rounded bg-red-100 inline-block" />High</span>
            <span className="flex items-center gap-1"><span className="w-3 h-2.5 rounded bg-blue-100 inline-block" />Low</span>
          </div>
        </div>
      </div>
    </div>
  );
};
