import React, { useState, useEffect } from 'react';
import './ClockToggle.css';

interface Props {
  isDarkMode: boolean;
  onToggle: (val: boolean) => void;
}

const ClockToggle: React.FC<Props> = ({ isDarkMode, onToggle }) => {
  const [time, setTime] = useState(new Date());

  useEffect(() => {
    const id = setInterval(() => setTime(new Date()), 1000);
    return () => clearInterval(id);
  }, []);

  const pad = (n: number) => String(n).padStart(2, '0');
  const hours   = pad(time.getHours());
  const minutes = pad(time.getMinutes());
  const seconds = pad(time.getSeconds());
  const dateStr = time.toLocaleDateString('vi-VN', {
    weekday: 'short', day: '2-digit', month: '2-digit', year: 'numeric'
  });

  return (
    <div className={`clock-widget ${isDarkMode ? 'dark' : 'light'}`}>
      {/* Digital Clock */}
      <div className="clock-time">
        <span className="clock-hm">{hours}:{minutes}</span>
        <span className="clock-sec">{seconds}</span>
      </div>
      <div className="clock-date">{dateStr}</div>

      {/* Day / Night Toggle */}
      <div
        className={`dn-toggle ${isDarkMode ? 'is-night' : 'is-day'}`}
        onClick={() => onToggle(!isDarkMode)}
        title={isDarkMode ? 'Chuyển sang ban ngày' : 'Chuyển sang ban đêm'}
      >
        <div className="dn-track">
          {/* Day scenery */}
          <div className="dn-scene day-scene">
            <div className="cloud cloud-1" />
            <div className="cloud cloud-2" />
          </div>
          {/* Night scenery */}
          <div className="dn-scene night-scene">
            <span className="star" style={{ top: '22%', left: '55%' }} />
            <span className="star" style={{ top: '55%', left: '62%' }} />
            <span className="star" style={{ top: '35%', left: '78%' }} />
            <span className="star" style={{ top: '65%', left: '45%' }} />
            <div className="crescent" />
          </div>
          {/* Orb (sun / moon) */}
          <div className="dn-orb">
            {isDarkMode ? (
              <>
                <div className="moon-crater c1" />
                <div className="moon-crater c2" />
                <div className="moon-crater c3" />
              </>
            ) : null}
          </div>
        </div>
        <span className="dn-label">{isDarkMode ? 'Ban đêm' : 'Ban ngày'}</span>
      </div>
    </div>
  );
};

export default ClockToggle;
