import React, { useState, useEffect, useMemo } from 'react';
import './WeatherClock.css';
import { useStore, DEMO_WEATHERS } from '../../store/useStore';
import type { WeatherType } from '../../store/useStore';

type TimeScene = 'dawn' | 'morning' | 'noon' | 'afternoon' | 'sunset' | 'evening' | 'night';


function getTimeScene(h: number): TimeScene {
  if (h >= 5  && h < 7)    return 'dawn';
  if (h >= 7  && h < 11)   return 'morning';
  if (h >= 11 && h < 14)   return 'noon';
  if (h >= 14 && h < 17)   return 'afternoon';
  if (h >= 17 && h < 18.5) return 'sunset';
  if (h >= 18.5 && h < 22) return 'evening';
  return 'night';
}

/* ── Stars (dot-only, no shooting sticks) ── */
const Stars: React.FC<{ count?: number }> = ({ count = 34 }) => {
  const items = useMemo(() => Array.from({ length: count }, (_, i) => ({
    id: i,
    top:   `${3 + Math.random() * 68}%`,
    left:  `${Math.random() * 100}%`,
    size:  1 + Math.random() * 2.2,
    delay: `${(Math.random() * 4).toFixed(2)}s`,
    dur:   `${(1.8 + Math.random() * 2.5).toFixed(2)}s`,
  })), [count]);
  return (
    <div className="wc-stars" aria-hidden>
      {items.map(s => (
        <span key={s.id} className="wc-star" style={{
          top: s.top, left: s.left,
          width: s.size, height: s.size,
          animationDelay: s.delay, animationDuration: s.dur,
        }} />
      ))}
    </div>
  );
};

/* ── Rain ── */
const Rain: React.FC<{ heavy?: boolean }> = ({ heavy }) => {
  const drops = useMemo(() => Array.from({ length: heavy ? 40 : 22 }, (_, i) => ({
    id: i,
    left:  `${Math.random() * 110 - 5}%`,
    delay: `${(Math.random() * 1).toFixed(2)}s`,
    dur:   `${heavy ? (0.25 + Math.random() * 0.15).toFixed(2) : (0.5 + Math.random() * 0.35).toFixed(2)}s`,
    len:   heavy ? 18 + Math.random() * 10 : 12 + Math.random() * 8,
    opacity: 0.5 + Math.random() * 0.4,
  })), [heavy]);
  return (
    <div className="wc-rain" aria-hidden>
      {drops.map(d => (
        <span key={d.id} className="wc-drop" style={{
          left: d.left, height: d.len, opacity: d.opacity,
          animationDelay: d.delay, animationDuration: d.dur,
        }} />
      ))}
    </div>
  );
};

/* ── Fluffy volumetric clouds (SVG + layered box-shadow) ── */
const FluffyClouds: React.FC<{ dark?: boolean }> = ({ dark }) => (
  <div className={`wc-fluffy-clouds ${dark ? 'wc-fluffy-dark' : ''}`} aria-hidden>
    {/* Cloud A — large, slow */}
    <div className="wc-cloud wc-cloud-a">
      <div className="wc-cloud-body">
        <div className="wc-puff wc-puff-1" />
        <div className="wc-puff wc-puff-2" />
        <div className="wc-puff wc-puff-3" />
        <div className="wc-cloud-base" />
      </div>
    </div>
    {/* Cloud B — medium, mid speed */}
    <div className="wc-cloud wc-cloud-b">
      <div className="wc-cloud-body">
        <div className="wc-puff wc-puff-1" />
        <div className="wc-puff wc-puff-2" />
        <div className="wc-cloud-base" />
      </div>
    </div>
    {/* Cloud C — small, fast */}
    <div className="wc-cloud wc-cloud-c">
      <div className="wc-cloud-body">
        <div className="wc-puff wc-puff-1" />
        <div className="wc-puff wc-puff-2" />
        <div className="wc-cloud-base" />
      </div>
    </div>
  </div>
);

/* ── Realistic drifting fog / mist ── */
const Fog: React.FC = () => (
  <div className="wc-fog-layer" aria-hidden>
    {/* SVG turbulence filter defined inline */}
    <svg width="0" height="0" style={{ position: 'absolute' }}>
      <defs>
        <filter id="fog-turbulence" x="0%" y="0%" width="100%" height="100%">
          <feTurbulence
            type="fractalNoise"
            baseFrequency="0.012 0.008"
            numOctaves="4"
            seed="3"
            result="noise"
          />
          <feDisplacementMap
            in="SourceGraphic"
            in2="noise"
            scale="18"
            xChannelSelector="R"
            yChannelSelector="G"
          />
        </filter>
      </defs>
    </svg>
    {/* Three mist bands at different speeds and opacities */}
    <div className="wc-mist wc-mist-1" />
    <div className="wc-mist wc-mist-2" />
    <div className="wc-mist wc-mist-3" />
    {/* Radial blobs moving sideways */}
    <div className="wc-mist-blob wc-mist-blob-1" />
    <div className="wc-mist-blob wc-mist-blob-2" />
    <div className="wc-mist-blob wc-mist-blob-3" />
  </div>
);

/* ── Dynamic flood with organic waves + floating debris ── */
const Flood: React.FC = () => (
  <div className="wc-flood" aria-hidden>
    {/* Sky reflection tint above water */}
    <div className="wc-flood-sky" />
    {/* Organic wave blobs */}
    <div className="wc-flood-wave wc-fw-1" />
    <div className="wc-flood-wave wc-fw-2" />
    <div className="wc-flood-wave wc-fw-3" />
    {/* Surface shimmer */}
    <div className="wc-flood-shimmer" />
    {/* Floating debris */}
    <div className="wc-debris wc-debris-1" />
    <div className="wc-debris wc-debris-2" />
    <div className="wc-debris wc-debris-3" />
  </div>
);

/* ── Wind streaks ── */
const WindStreaks: React.FC = () => {
  const streaks = useMemo(() => Array.from({ length: 14 }, (_, i) => ({
    id: i,
    top:     `${5 + Math.random() * 90}%`,
    width:   20 + Math.random() * 50,
    delay:   `${(Math.random() * 1.5).toFixed(2)}s`,
    dur:     `${(0.5 + Math.random() * 0.6).toFixed(2)}s`,
    opacity: 0.3 + Math.random() * 0.45,
  })), []);
  return (
    <div className="wc-wind" aria-hidden>
      {streaks.map(s => (
        <span key={s.id} className="wc-streak" style={{
          top: s.top, width: s.width, opacity: s.opacity,
          animationDelay: s.delay, animationDuration: s.dur,
        }} />
      ))}
    </div>
  );
};



const WEATHER_LABELS: Record<WeatherType, string> = {
  clear:    'TRỜI QUANG', cloudy:   'CÓ MÂY',
  rain:     'MƯA NHỎ',   storm:    'BÃO / SẤM',
  fog:      'SƯƠNG MÙ',  heatwave: 'NẮNG NÓNG',
  windy:    'GIÓ MẠNH',  flood:    'NGẬP LỤT',
};

interface Props { isDarkMode: boolean; onToggleDark: (v: boolean) => void; }

const WeatherClock: React.FC<Props> = ({ isDarkMode, onToggleDark }) => {
  const [now, setNow]           = useState(new Date());
  const { weatherIdx, setWeatherIdx } = useStore();

  useEffect(() => {
    const t = setInterval(() => setNow(new Date()), 1000);
    return () => clearInterval(t);
  }, []);

  const hour    = now.getHours() + now.getMinutes() / 60;
  const scene   = getTimeScene(hour);
  const weather = DEMO_WEATHERS[weatherIdx];
  const isNight = scene === 'night' || scene === 'evening';

  const pad  = (n: number) => String(n).padStart(2, '0');
  const hm   = `${pad(now.getHours())}:${pad(now.getMinutes())}`;
  const sec  = pad(now.getSeconds());
  const date = now.toLocaleDateString('vi-VN', { weekday:'short', day:'2-digit', month:'2-digit', year:'numeric' });

  const hasClouds = weather === 'cloudy' || weather === 'rain' || weather === 'storm';

  return (
    <div className="wc-widget">
      <div className={`wc-circle wc-scene--${scene} wc-wx--${weather}`}>

        {/* Sky gradient */}
        <div className="wc-sky" />

        {/* Ambient orbs */}
        <div className="wc-orb wc-orb-a" />
        <div className="wc-orb wc-orb-b" />

        {/* Celestial */}
        <div className={`wc-celestial ${isNight ? 'wc-moon' : 'wc-sun'}`}>
          {isNight && <div className="wc-moon-crescent" />}
        </div>

        {/* Stars only — NO shooting sticks */}
        {(scene === 'night' || scene === 'dawn') && <Stars />}

        {/* Fluffy volumetric clouds */}
        {hasClouds && <FluffyClouds dark={weather === 'storm'} />}
        {/* Light wisps always present for non-overcast weather */}
        {!hasClouds && (
          <>
            <div className="wc-cloud-layer wc-cloud-layer-1" />
            <div className="wc-cloud-layer wc-cloud-layer-2" />
          </>
        )}

        {/* Weather overlays */}
        {(weather === 'rain' || weather === 'flood') && <Rain />}
        {weather === 'storm'    && <><Rain heavy /><div className="wc-lightning" /></>}
        {weather === 'fog'      && <Fog />}
        {weather === 'heatwave' && <div className="wc-heat" />}
        {weather === 'windy'    && <WindStreaks />}
        {weather === 'flood'    && <Flood />}

        {/* Bottom vignette */}
        <div className="wc-vignette" />

        {/* Clock */}
        <div className="wc-clock">
          <div className="wc-hm-wrap">
            <span className="wc-hm">{hm}</span>
            <span className="wc-sec">{sec}</span>
          </div>
          <div className="wc-date">{date}</div>
          <div className="wc-wx-label">{WEATHER_LABELS[weather]}</div>
        </div>
      </div>

      {/* Controls */}
      <div className="wc-controls">
        <button
          className={`wc-toggle ${isDarkMode ? 'wc-toggle--night' : 'wc-toggle--day'}`}
          onClick={() => onToggleDark(!isDarkMode)}
          title="Chuyển sáng/tối"
        >
          <span>{isDarkMode ? '🌙' : '☀️'}</span>
          <span className="wc-tgl-lbl">{isDarkMode ? 'Ban đêm' : 'Ban ngày'}</span>
        </button>
        <button
          className="wc-demo-btn"
          onClick={() => setWeatherIdx(i => (i + 1) % DEMO_WEATHERS.length)}
          title="Demo thời tiết"
        >
          🌦 Demo
        </button>
      </div>
    </div>
  );
};

export default WeatherClock;
