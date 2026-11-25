"use client";

import { Waves, Wind, Thermometer } from "lucide-react";
import type { WeatherTides } from "@/lib/types";

export function TidesWeatherWidget({ weather }: { weather: WeatherTides }) {
  const hourly = weather.hourly && weather.hourly.length >= 6 ? weather.hourly : null;
  const nowHour = new Date().getHours();

  let linePath = "M 0 65 Q 40 78, 80 45 T 160 20 T 240 68 T 320 26";
  let areaPath = `${linePath} L 320 90 L 0 90 Z`;
  let nowX = Math.round((nowHour / 23) * 320);
  let nowY = 48;

  if (hourly) {
    const heights = hourly.map((h) => h.height);
    const minH = Math.min(...heights);
    const maxH = Math.max(...heights);
    const span = Math.max(0.5, maxH - minH);
    const coords = hourly.map((h, i) => {
      const x = Number(((i / (hourly.length - 1)) * 320).toFixed(1));
      const y = Number((78 - ((h.height - minH) / span) * 62).toFixed(1));
      return { x, y, hour: h.hour };
    });
    linePath = coords
      .map((c, i) => `${i === 0 ? "M" : "L"} ${c.x} ${c.y}`)
      .join(" ");
    areaPath = `${linePath} L 320 90 L 0 90 Z`;
    const cur = coords.find((c) => c.hour === nowHour) || coords[Math.min(nowHour, coords.length - 1)];
    if (cur) {
      nowX = cur.x;
      nowY = cur.y;
    }
  }

  return (
    <section className="bento-card area-tides flex flex-col justify-between p-5">
      <div>
        <div className="mb-3 flex items-center justify-between gap-2">
          <div className="flex items-center gap-2">
            <Waves className="h-4 w-4 text-cyan-400" />
            <h2 className="text-sm font-semibold text-white">
              {weather.location} · Tides
            </h2>
          </div>
          <span className="rounded-full border border-emerald-500/30 bg-emerald-500/10 px-2.5 py-0.5 font-mono text-[11px] text-emerald-300">
            {weather.tideState}
          </span>
        </div>

        <div className="mb-4 grid grid-cols-3 gap-2 font-mono text-xs tabular-nums">
          <div className="rounded-xl border border-slate-800/80 bg-[#0b0e14]/70 p-2.5">
            <div className="flex items-center gap-1 text-[10px] text-slate-400">
              <Thermometer className="h-3 w-3 text-cyan-400" />
              Air / Sea
            </div>
            <div className="mt-1 text-sm font-semibold text-white">
              {weather.tempC}°C{" "}
              <span className="text-xs text-cyan-300">/ {weather.seaTempC}°C</span>
            </div>
          </div>

          <div className="rounded-xl border border-slate-800/80 bg-[#0b0e14]/70 p-2.5">
            <div className="flex items-center gap-1 text-[10px] text-slate-400">
              <Wind className="h-3 w-3 text-purple-400" />
              Wind
            </div>
            <div className="mt-1 text-sm font-semibold text-white">
              {weather.windKts} <span className="text-xs text-slate-400">kts</span>
            </div>
          </div>

          <div className="rounded-xl border border-slate-800/80 bg-[#0b0e14]/70 p-2.5">
            <div className="flex items-center gap-1 text-[10px] text-slate-400">
              <Waves className="h-3 w-3 text-emerald-400" />
              Waves
            </div>
            <div className="mt-1 text-sm font-semibold text-white">
              {weather.waveHeightM} <span className="text-xs text-slate-400">m</span>
            </div>
          </div>
        </div>
      </div>

      {/* Crisp SVG Tide Curve */}
      <div className="relative overflow-hidden rounded-xl border border-slate-800/80 bg-[#0b0e14]/90 p-3">
        <svg viewBox="0 0 320 90" className="h-20 w-full">
          <defs>
            <linearGradient id="tideFill" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="#22d3ee" stopOpacity="0.32" />
              <stop offset="100%" stopColor="#22d3ee" stopOpacity="0.0" />
            </linearGradient>
          </defs>
          <path d={areaPath} fill="url(#tideFill)" />
          <path
            d={linePath}
            fill="none"
            stroke="#22d3ee"
            strokeWidth="2.2"
          />
          <line
            x1={nowX}
            y1="8"
            x2={nowX}
            y2="86"
            stroke="#fbbf24"
            strokeWidth="1.2"
            strokeDasharray="3 3"
          />
          <circle cx={nowX} cy={nowY} r="3.5" fill="#fbbf24" />
        </svg>

        <div className="mt-1 flex flex-wrap justify-between gap-1 font-mono text-[10px] text-slate-400 tabular-nums">
          {weather.points.map((p, idx) => (
            <span key={idx}>
              {p.type === "high" ? "▲" : "▼"} {p.time} ({p.height}m)
            </span>
          ))}
        </div>
      </div>
    </section>
  );
}
