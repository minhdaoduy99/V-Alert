import React, { useEffect, useState, useRef } from 'react';
import {
  MapContainer, TileLayer, Marker, Popup,
  Circle, GeoJSON, Polygon, useMapEvents, useMap
} from 'react-leaflet';
import 'leaflet/dist/leaflet.css';
import L from 'leaflet';
import './Map.css';
import { useStore } from '../../store/useStore';

import icon from 'leaflet/dist/images/marker-icon.png';
import iconShadow from 'leaflet/dist/images/marker-shadow.png';

const DefaultIcon = L.icon({ iconUrl: icon, shadowUrl: iconShadow, iconAnchor: [12, 41] });
L.Marker.prototype.options.icon = DefaultIcon;

// ── Fly only on explicit search (no mount trigger) ─────────────────────────────
function SearchFlyTo() {
  const map = useMap();
  const { searchLocation } = useStore();
  const prev = useRef<string>('');
  useEffect(() => {
    if (!searchLocation) return;
    const key = searchLocation.join(',');
    if (key === prev.current) return;
    prev.current = key;
    map.flyTo(searchLocation, 14, { duration: 1.5 });
  }, [searchLocation, map]);
  return null;
}

// ── Smooth initial center on geolocation — uses setView (no animation) ─────────
function InitialView({ coord }: { coord: [number, number] | null }) {
  const map = useMap();
  const applied = useRef(false);
  useEffect(() => {
    if (coord && !applied.current) {
      applied.current = true;
      // setView instead of flyTo avoids the jarring tile-load bug
      map.setView(coord, 14, { animate: false });
      // force tile redraw after layout is stable
      requestAnimationFrame(() => map.invalidateSize());
    }
  }, [coord, map]);
  return null;
}

function MapClickHandler() {
  const { isReportMode, setDraftReportLocation } = useStore();
  useMapEvents({
    click(e) {
      if (isReportMode) setDraftReportLocation([e.latlng.lat, e.latlng.lng]);
    }
  });
  return null;
}

// ── Main component ─────────────────────────────────────────────────────────────
export interface MapViewProps {
  isDarkMode: boolean;
}

const MapView: React.FC<MapViewProps> = ({ isDarkMode }) => {
  const { alerts, isReportMode, draftReportLocation, setSelectedRegion, setUserLocation } = useStore();

  const [provincesData, setProvincesData] = useState<any>(null);
  const [maskPositions, setMaskPositions] = useState<any[]>([]);
  const [userCoord, setUserCoord] = useState<[number, number] | null>(null);

  // Geolocation — store result in both local state and global store
  useEffect(() => {
    const onSuccess = (p: GeolocationPosition) => {
      const coord: [number, number] = [p.coords.latitude, p.coords.longitude];
      setUserCoord(coord);
      setUserLocation(coord);
    };
    const onError = () => {
      const fallback: [number, number] = [21.0285, 105.8542];
      setUserCoord(fallback);
      setUserLocation(fallback);
    };
    navigator.geolocation?.getCurrentPosition(onSuccess, onError, { timeout: 8000 });
  }, [setUserLocation]);

  // Load GeoJSON + build native Leaflet hole mask
  useEffect(() => {
    (async () => {
      try {
        const res = await fetch('/Provinces.geojson');
        const data = await res.json();
        setProvincesData(data);

        // Outer ring covers entire Earth
        const world = [[-90, -360], [90, -360], [90, 360], [-90, 360]];
        const toLatLng = (ring: number[][]) => ring.map(c => [c[1], c[0]]);
        const holes: any[] = [];

        data.features.forEach((f: any) => {
          const g = f.geometry;
          if (g.type === 'Polygon') {
            holes.push(toLatLng(g.coordinates[0]));
          } else if (g.type === 'MultiPolygon') {
            g.coordinates.forEach((poly: any) => holes.push(toLatLng(poly[0])));
          }
        });

        setMaskPositions([world, ...holes]);
      } catch (e) {
        console.error('GeoJSON load error:', e);
      }
    })();
  }, []);

  const severityColor = (s: string) =>
    s === 'Đặc biệt nguy hiểm' ? '#ef4444' : s === 'Nguy cơ cao' ? '#f59e0b' : '#facc15';

  const onEachFeature = (feature: any, layer: L.Layer) => {
    layer.on({
      click: (e: any) => {
        if (isReportMode) return;
        L.DomEvent.stopPropagation(e);
        setSelectedRegion({
          name: feature.properties?.Name || feature.properties?.ten_tinh || feature.properties?.name || 'Tỉnh/TP',
          lat: e.latlng.lat,
          lng: e.latlng.lng
        });
        e.target._map?.flyTo([e.latlng.lat, e.latlng.lng], 9, { duration: 1 });
      },
      mouseover: (e: any) => e.target.setStyle({ weight: 1.5, color: '#3b82f6', fillOpacity: 0.12 }),
      mouseout:  (e: any) => e.target.setStyle({ weight: 0, color: 'transparent', fillOpacity: 0 })
    });
  };

  const TILE_LIGHT = 'https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png';
  const TILE_DARK  = 'https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png';
  const ATTR_OSM   = '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>';
  const ATTR_CARTO = '&copy; <a href="https://carto.com/">CARTO</a>';

  return (
    <div className={`map-wrapper ${isReportMode ? 'report-mode-active' : ''}`}>
      <MapContainer
        center={[16.047079, 108.206230]}
        zoom={6}
        scrollWheelZoom
        className="leaflet-container"
        zoomControl={false}
        minZoom={3}
        preferCanvas
      >
        <SearchFlyTo />
        <InitialView coord={userCoord} />
        <MapClickHandler />

        <TileLayer
          key={isDarkMode ? 'dark' : 'light'}
          attribution={isDarkMode ? ATTR_CARTO : ATTR_OSM}
          url={isDarkMode ? TILE_DARK : TILE_LIGHT}
          keepBuffer={50}
          updateWhenZooming={false}
          updateWhenIdle={true}
        />

        {/* Inverted Mask */}
        {maskPositions.length > 0 && (
          <Polygon
            positions={maskPositions}
            pathOptions={{
              fillColor: isDarkMode ? '#0d0d1a' : '#f3f4f6',
              fillOpacity: 1,
              stroke: false
            }}
            interactive={false}
          />
        )}

        {/* Interactive province layer */}
        {provincesData && (
          <GeoJSON
            data={provincesData}
            style={{ weight: 0, color: 'transparent', fillOpacity: 0 }}
            onEachFeature={onEachFeature}
          />
        )}

        {userCoord && (
          <Marker position={userCoord}>
            <Popup>📍 Vị trí hiện tại của bạn</Popup>
          </Marker>
        )}

        {draftReportLocation && (
          <Marker position={draftReportLocation}>
            <Popup>Vị trí báo cáo</Popup>
          </Marker>
        )}

        {alerts.map(alert => (
          <React.Fragment key={alert.id}>
            <Marker
              position={alert.location}
              eventHandlers={{
                click: (e) => e.target._map?.flyTo(alert.location, 14, { duration: 1.5 })
              }}
            >
              <Popup className="custom-popup">
                <div className="popup-content">
                  <h3>⚠ {alert.type}</h3>
                  <p style={{ color: severityColor(alert.severity), fontWeight: 600 }}>{alert.severity}</p>
                  <p>{alert.description}</p>
                  <p className="status">{alert.verified ? '✓ AI đã xác minh' : '⏳ Chờ xác minh'}</p>
                </div>
              </Popup>
            </Marker>
            <Circle
              center={alert.location}
              pathOptions={{ color: severityColor(alert.severity), fillColor: severityColor(alert.severity), fillOpacity: 0.18 }}
              radius={alert.severity === 'Đặc biệt nguy hiểm' ? 3000 : 1500}
            />
          </React.Fragment>
        ))}
      </MapContainer>
    </div>
  );
};

export default MapView;
