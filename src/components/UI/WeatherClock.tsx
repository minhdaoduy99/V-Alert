import React, { useState, useEffect, useMemo } from 'react';
import './WeatherClock.css';

type TimeScene = 'dawn' | 'morning' | 'noon' | 'afternoon' | 'sunset' | 'evening' | 'night';
type WeatherType = 'clear' | 'cloudy' | 'rain' | 'storm' | 'fog' | 'heatwave' | 'windy' | 'flood';

function getTimeScene(h: number): TimeScene {
  if (h >= 5  && h < 7)    return 'dawn';
  if (h >= 7  && h < 11)   return 'morning';
  if (h >= 11 && h < 14)   return 'noon';
  if (h >= 14 && h < 17)   return 'afternoon';
  if (h >= 17 && h < 18.5) return 'sunset';
  if (h >= 18.5 && h < 22) return 'evening';
  return 'night';
}

/* ── Stars ── */
const Stars: React.FC<{ count?: number }> = ({ count = 32 }) => {
  const items = useMemo(() => Array.from({ length: count }, (_, i) => ({
    id: i,
    top:   `${3 + Math.random() * 68}%`,
    left:  `${Math.random() * 100}%`,
    size:  1 + Math.random() * 2.5,
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

/* ── Shooting stars ── */
const ShootingStars: React.FC = () => (
  <div className="wc-shooting" aria-hidden>
    <span className="wc-shoot wc-shoot-1" />
    <span className="wc-shoot wc-shoot-2" />
  </div>
);

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
          left: d.left,
          height: d.len,
          opacity: d.opacity,
          animationDelay: d.delay,
          animationDuration: d.dur,
        }} />
      ))}
    </div>
  );
};

/* Snow component removed (unused) */


const WindStreaks: React.FC = () => {
  const streaks = useMemo(() => Array.from({ length: 14 }, (_, i) => ({
    id: i,
    top:   `${5 + Math.random() * 90}%`,
    width: 20 + Math.random() * 50,
    delay: `${(Math.random() * 1.5).toFixed(2)}s`,
    dur:   `${(0.5 + Math.random() * 0.6).toFixed(2)}s`,
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

const DEMO_WEATHERS: WeatherType[] = ['clear', 'cloudy', 'rain', 'storm', 'fog', 'heatwave', 'windy', 'flood'];

const WEATHER_LABELS: Record<WeatherType, string> = {
  clear:    'TRỜI QUANG', cloudy:   'CÓ MÂY',    rain:    'MƯA NHỎ',
  storm:    'BÃO / SẤM', fog:      'SƯƠNG MÙ',   heatwave:'NẮNG NÓNG',
  windy:    'GIÓ MẠNH',  flood:    'NGẬP LỤT',
};

/* ── Main widget ── */
interface Props { isDarkMode: boolean; onToggleDark: (v: boolean) => void; }

const WeatherClock: React.FC<Props> = ({ isDarkMode, onToggleDark }) => {
  const [now, setNow]           = useState(new Date());
  const [weatherIdx, setWIdx]   = useState(0);

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
  const date = now.toLocaleDateString('vi-VN', { weekday: 'short', day:'2-digit', month:'2-digit', year:'numeric' });

  return (
    <div className="wc-widget">
      <div className={`wc-circle wc-scene--${scene} wc-wx--${weather}`}>

        {/* ── Deep gradient sky (pure CSS, no shapes) ── */}
        <div className="wc-sky" />

        {/* ── Ambient colour orbs (large blurred blobs for depth) ── */}
        <div className="wc-orb wc-orb-a" />
        <div className="wc-orb wc-orb-b" />

        {/* ── Celestial: sun radial or moon crescent ── */}
        <div className={`wc-celestial ${isNight ? 'wc-moon' : 'wc-sun'}`}>
          {isNight && <div className="wc-moon-crescent" />}
        </div>

        {/* ── Stars / shooting stars ── */}
        {(scene === 'night' || scene === 'dawn') && <Stars />}
        {scene === 'night' && <ShootingStars />}

        {/* ── Cloud layers (pure blur-blob, no border tricks) ── */}
        <div className="wc-cloud-layer wc-cloud-layer-1" />
        <div className="wc-cloud-layer wc-cloud-layer-2" />
        {(weather === 'cloudy' || weather === 'storm' || weather === 'rain') && (
          <div className="wc-cloud-layer wc-cloud-layer-storm" />
        )}

        {/* ── Weather overlays ── */}
        {(weather === 'rain' || weather === 'flood')  && <Rain />}
        {weather === 'storm'    && <><Rain heavy /><div className="wc-lightning" /></>}
        {weather === 'fog'      && <div className="wc-fog" />}
        {weather === 'heatwave' && <div className="wc-heat" />}
        {weather === 'windy'    && <WindStreaks />}
        {weather === 'flood'    && <div className="wc-flood"><div className="wc-wave" /><div className="wc-wave wc-wave-2" /></div>}

        {/* ── Horizon vignette (bottom fade) ── */}
        <div className="wc-vignette" />

        {/* ── Clock text ── */}
        <div className="wc-clock">
          <div className="wc-hm-wrap">
            <span className="wc-hm">{hm}</span>
            <span className="wc-sec">{sec}</span>
          </div>
          <div className="wc-date">{date}</div>
          <div className="wc-wx-label">{WEATHER_LABELS[weather]}</div>
        </div>
      </div>

      {/* ── Controls ── */}
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
          onClick={() => setWIdx(i => (i + 1) % DEMO_WEATHERS.length)}
          title="Demo thời tiết"
        >
          🌦 Demo
        </button>
      </div>
    </div>
  );
};

export default WeatherClock;
