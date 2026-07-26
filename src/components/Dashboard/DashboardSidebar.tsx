import React, { useEffect, useState } from 'react';
import { useStore } from '../../store/useStore';
import { Navigation, ShieldCheck, AlertTriangle, ShieldAlert } from 'lucide-react';
import './Dashboard.css';

function haversineKm(lat1: number, lon1: number, lat2: number, lon2: number) {
  const R = 6371;
  const dLat = ((lat2 - lat1) * Math.PI) / 180;
  const dLon = ((lon2 - lon1) * Math.PI) / 180;
  const a = Math.sin(dLat / 2) ** 2 +
    Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) * Math.sin(dLon / 2) ** 2;
  return R * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
}

type ProximityState = 'safe' | 'warning' | 'danger';

const DashboardSidebar: React.FC = () => {
  const { alerts, userLocation, setSearchLocation } = useStore();
  const [proximity, setProximity] = useState<ProximityState>('safe');
  const [nearestDist, setNearestDist] = useState<number | null>(null);

  useEffect(() => {
    if (!userLocation || alerts.length === 0) return;
    const distances = alerts.map(a =>
      haversineKm(userLocation[0], userLocation[1], a.location[0], a.location[1])
    );
    const min = Math.min(...distances);
    setNearestDist(min);
    setProximity(min < 5 ? 'danger' : min < 10 ? 'warning' : 'safe');
  }, [userLocation, alerts]);

  const cfg = {
    safe: {
      label: 'Bạn đang an toàn',
      sub: 'Khu vực của bạn không có rủi ro.',
      Icon: ShieldCheck,
      iconColor: '#16a34a',
      symbol: '✔',
    },
    warning: {
      label: 'Nguy cơ rủi ro lân cận',
      sub: 'Có cảnh báo trong bán kính 10km.',
      Icon: AlertTriangle,
      iconColor: '#d97706',
      symbol: '!',
    },
    danger: {
      label: 'Bạn đang ở nơi nguy hiểm!',
      sub: 'Hãy sơ tán ngay lập tức!',
      Icon: ShieldAlert,
      iconColor: '#dc2626',
      symbol: '!',
    },
  }[proximity];

  return (
    <aside className="dashboard-sidebar">
      {/* ── High-tech Safety Banner ── */}
      <div className={`safety-banner safety-banner--${proximity}`}>
        {/* Glassmorphic tinted background */}
        <div className="safety-bg" />
        {/* Scan line sweep animation */}
        <div className="safety-scanline" />
        {/* Radial glow orb */}
        <div className="safety-glow" />

        <div className="safety-content">
          {/* Animated icon circle */}
          <div className={`safety-icon-ring safety-ring--${proximity}`}>
            <cfg.Icon size={24} color={cfg.iconColor} strokeWidth={2.5} />
          </div>

          <div className="safety-text-group">
            <p className="safety-main-label">{cfg.label}</p>
            <p className="safety-sub-label">{cfg.sub}</p>
            {nearestDist !== null && (
              <p className="safety-dist-label">
                ⟳ {nearestDist < 1 ? '< 1 km' : `${nearestDist.toFixed(1)} km`} từ vị trí bạn
              </p>
            )}
          </div>

          {/* Pulse dot */}
          <div className={`safety-pulse-dot pulse--${proximity}`} />
        </div>
      </div>

      {/* ── Warning Center ── */}
      <div className="sidebar-body">
        <h2 className="sidebar-title">Trung tâm Cảnh báo</h2>
        <p className="sidebar-subtitle">
          <ShieldAlert size={13} />&nbsp;Đang hoạt động ({alerts.length})
        </p>

        {alerts.map(alert => (
          <div key={alert.id} className="alert-card">
            <div className="alert-header">
              <span className="alert-type">{alert.type}</span>
              <span className="alert-time">Vừa xong</span>
            </div>
            <p className="alert-desc">{alert.description}</p>
            <div className="alert-footer">
              <span className={`verification ${alert.verified ? 'verified' : 'unverified'}`}>
                {alert.verified ? '✓ AI đã xác minh' : '⚠ Chờ xác minh'}
              </span>
              <button className="btn-goto" onClick={() => setSearchLocation(alert.location)}>
                <Navigation size={12} /> Đi tới
              </button>
            </div>
          </div>
        ))}
      </div>
    </aside>
  );
};

export default DashboardSidebar;
