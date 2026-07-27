import React, { useEffect, useState, useMemo } from 'react';
import { useStore, DEMO_WEATHERS } from '../../store/useStore';
import type { WeatherType } from '../../store/useStore';
import { Navigation, ShieldCheck, AlertTriangle, ShieldAlert, MapPin } from 'lucide-react';
import './Dashboard.css';

function haversineKm(lat1: number, lon1: number, lat2: number, lon2: number) {
  const R = 6371, dLat = ((lat2 - lat1) * Math.PI) / 180, dLon = ((lon2 - lon1) * Math.PI) / 180;
  const a = Math.sin(dLat/2)**2 + Math.cos(lat1*Math.PI/180)*Math.cos(lat2*Math.PI/180)*Math.sin(dLon/2)**2;
  return R * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));
}

type RegionType    = 'city' | 'rural' | 'mountain';
type ProximityState = 'safe' | 'warning' | 'danger';

function detectRegion(lat: number, lon: number, address: string): RegionType {
  const lc = address.toLowerCase();
  if (/sapa|lai châu|hà giang|cao bằng|lạng sơn|yên bái|tuyên quang|núi|vùng cao|lào cai/.test(lc)) return 'mountain';
  if (/hà nội|hồ chí minh|đà nẵng|hải phòng|cần thơ|quận|phường|thành phố/.test(lc)) return 'city';
  if (lat > 22 && lon < 104.5) return 'mountain';
  return 'rural';
}

/* ── Animated rain drops ──────────────────────────────────────────────────── */
const RainDrops: React.FC<{ heavy?: boolean }> = ({ heavy }) => {
  const drops = useMemo(() => Array.from({ length: heavy ? 44 : 26 }, (_, i) => ({
    id: i, left: Math.random()*115-5,
    delay: (Math.random()*1.4).toFixed(2),
    dur: heavy ? (0.2+Math.random()*0.12).toFixed(2) : (0.42+Math.random()*0.28).toFixed(2),
    len: heavy ? 22+Math.random()*14 : 14+Math.random()*9,
    opacity: 0.52+Math.random()*0.4,
  })), [heavy]);
  return (
    <div className="sc-rain" aria-hidden>
      {drops.map(d => (
        <span key={d.id} className={`sc-drop${heavy?' sc-drop--heavy':''}`} style={{
          left:`${d.left}%`, height:`${d.len}px`, opacity:d.opacity,
          animationDelay:`${d.delay}s`, animationDuration:`${d.dur}s`,
        }}/>
      ))}
    </div>
  );
};

/* ── Volumetric drifting clouds ──────────────────────────────────────────── */
const DriftingClouds: React.FC<{ dark?: boolean }> = ({ dark }) => (
  <div className={`sc-clouds${dark?' sc-clouds--dark':''}`} aria-hidden>
    <div className="sc-cloud sc-cloud-a"><div className="sc-puff sc-puff-1"/><div className="sc-puff sc-puff-2"/><div className="sc-puff sc-puff-3"/><div className="sc-cloud-base"/></div>
    <div className="sc-cloud sc-cloud-b"><div className="sc-puff sc-puff-1"/><div className="sc-puff sc-puff-2"/><div className="sc-cloud-base"/></div>
    <div className="sc-cloud sc-cloud-c"><div className="sc-puff sc-puff-1"/><div className="sc-puff sc-puff-2"/><div className="sc-cloud-base"/></div>
  </div>
);

const REGION_BG: Record<RegionType, string> = {
  city: './assets/city.jpg',
  rural: './assets/rural.jpg',
  mountain: './assets/mountain.jpg'
};

/* ── Weather overlays ────────────────────────────────────────────────────── */
const WeatherOverlay: React.FC<{ weather: WeatherType }> = ({ weather }) => (
  <>
    {(weather==='cloudy'||weather==='rain'||weather==='storm') && <DriftingClouds dark={weather==='storm'}/>}
    {(weather==='rain'||weather==='flood') && <RainDrops/>}
    {weather==='storm'    && <><RainDrops heavy/><div className="sc-lightning"/></>}
    {weather==='fog'      && <div className="sc-fog-veil"/>}
    {weather==='windy'    && <div className="sc-wind-veil"/>}
    {weather==='heatwave' && <div className="sc-heat-veil"/>}
    {weather==='flood'    && <div className="sc-flood-rise"/>}
  </>
);

/* ── Main Component ──────────────────────────────────────────────────────── */
const DashboardSidebar: React.FC = () => {
  const { alerts, userLocation, setSearchLocation, weatherIdx } = useStore();
  const weather: WeatherType = DEMO_WEATHERS[weatherIdx];

  const [proximity, setProximity] = useState<ProximityState>('safe');
  const [address, setAddress]     = useState<string>('Đang xác định vị trí…');
  const [region, setRegion]       = useState<RegionType>('city');

  useEffect(() => {
    if (!userLocation||alerts.length===0) return;
    const min = Math.min(...alerts.map(a=>haversineKm(userLocation[0],userLocation[1],a.location[0],a.location[1])));
    setProximity(min<5?'danger':min<10?'warning':'safe');
  }, [userLocation, alerts]);

  useEffect(() => {
    if (!userLocation) return;
    const [lat,lon] = userLocation;
    const ctrl = new AbortController();
    fetch(`https://nominatim.openstreetmap.org/reverse?format=json&lat=${lat}&lon=${lon}&accept-language=vi`,
      { signal:ctrl.signal, headers:{'Accept-Language':'vi'} })
      .then(r=>r.json())
      .then(data=>{
        const addr = data.address??{};
        const parts=[
          addr.suburb||addr.neighbourhood||addr.quarter||addr.village||addr.town,
          addr.city||addr.county||addr.municipality, addr.state,
        ].filter(Boolean);
        const readable=parts.length>0?parts.join(', '):(data.display_name?.split(',')[0]??'Không rõ địa chỉ');
        setAddress(readable);
        setRegion(detectRegion(lat,lon,data.display_name??readable));
      }).catch(()=>{});
    return ()=>ctrl.abort();
  }, [userLocation]);

  const cfg = {
    safe:    { label:'Bạn đang an toàn',          Icon:ShieldCheck,   iconColor:'#34d399' },
    warning: { label:'Nguy cơ rủi ro lân cận',    Icon:AlertTriangle, iconColor:'#fbbf24' },
    danger:  { label:'Bạn đang ở nơi nguy hiểm!', Icon:ShieldAlert,   iconColor:'#f87171' },
  }[proximity];

  return (
    <aside className="dashboard-sidebar">

      {/* ── Safety Banner
           Layer order: sc-bg (z:0) below safety-content (z:10)
           Banner is display:flex so content fills it naturally  ── */}
      <div className={`safety-banner safety-banner--${proximity}`}>

        {/* BACKGROUND: absolute, full bleed, z-index 0 */}
        <div className="sc-bg">
          {/* Neutral dark sky fallback (scene SVG paints its own sky on top) */}
          <div className="sc-sky"/>

          <img src={REGION_BG[region]} alt="" className="sc-bg-img" />

          <WeatherOverlay weather={weather}/>

          {/* Safety state tint */}
          <div className={`sc-tint sc-tint--${proximity}`}/>

          {/* Scan line sweep */}
          <div className="safety-scanline"/>

          {/* Ambient glow bloom */}
          <div className={`safety-glow safety-glow--${proximity}`}/>
        </div>

        {/* CONTENT: relative, z-index 10, fills banner via flex */}
        <div className="safety-content">
          {/* Icon ring */}
          <div className={`safety-icon-ring safety-ring--${proximity}`}>
            <cfg.Icon size={22} color={cfg.iconColor} strokeWidth={2.5}/>
          </div>

          {/* Text */}
          <div className="safety-text-group">
            <p className="safety-main-label">{cfg.label}</p>
            {/* MapPin SVG icon — no more emoji */}
            <p className="safety-addr-label">
              <MapPin size={12} strokeWidth={2} color="rgba(255,255,255,0.78)"/>
              <span>{address}</span>
            </p>
          </div>

          {/* Live pulse dot (absolutely positioned to prevent overflow breaks) */}
          <div className={`safety-pulse-dot pulse--${proximity}`}/>
        </div>
      </div>

      {/* ── Warning Center ── */}
      <div className="sidebar-body">
        <h2 className="sidebar-title">Trung tâm Cảnh báo</h2>
        <p className="sidebar-subtitle">
          <ShieldAlert size={13}/>&nbsp;Đang hoạt động ({alerts.length})
        </p>
        {alerts.map(alert=>(
          <div key={alert.id} className="alert-card">
            <div className="alert-header">
              <span className="alert-type">{alert.type}</span>
              <span className="alert-time">Vừa xong</span>
            </div>
            <p className="alert-desc">{alert.description}</p>
            <div className="alert-footer">
              <span className={`verification ${alert.verified?'verified':'unverified'}`}>
                {alert.verified?'✓ AI đã xác minh':'⚠ Chờ xác minh'}
              </span>
              <button className="btn-goto" onClick={()=>setSearchLocation(alert.location)}>
                <Navigation size={12}/> Đi tới
              </button>
            </div>
          </div>
        ))}
      </div>
    </aside>
  );
};

export default DashboardSidebar;
