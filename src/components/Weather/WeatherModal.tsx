import React, { useEffect, useState } from 'react';
import { useStore } from '../../store/useStore';
import { LineChart, Line, XAxis, YAxis, Tooltip, ResponsiveContainer } from 'recharts';
import { X, CloudRain, Sun } from 'lucide-react';
import './WeatherModal.css';

const WeatherModal: React.FC = () => {
  const { selectedRegion, setSelectedRegion } = useStore();
  const [data, setData] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!selectedRegion) return;

    const fetchWeather = async () => {
      setLoading(true);
      try {
        // Fetch from Open-Meteo
        const res = await fetch(`https://api.open-meteo.com/v1/forecast?latitude=${selectedRegion.lat}&longitude=${selectedRegion.lng}&hourly=temperature_2m,precipitation_probability,weathercode&current_weather=true&timezone=Asia%2FBangkok`);
        const result = await res.json();

        // Parse next 12 hours
        const hourlyData = [];
        for (let i = 0; i < 12; i++) {
          hourlyData.push({
            time: new Date(result.hourly.time[i]).toLocaleTimeString('vi-VN', { hour: '2-digit', minute: '2-digit' }),
            temp: result.hourly.temperature_2m[i],
            precip: result.hourly.precipitation_probability[i],
            code: result.hourly.weathercode[i]
          });
        }
        setData(hourlyData);
      } catch (err) {
        console.error('Lỗi thời tiết:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchWeather();
  }, [selectedRegion]);

  if (!selectedRegion) return null;

  return (
    <div className="weather-modal glass-panel">
      <div className="weather-header">
        <div>
          <h3>Thời tiết {selectedRegion.name}</h3>
          <p className="weather-subtitle">Dự báo 12 giờ tới</p>
        </div>
        <button className="btn-icon" onClick={() => setSelectedRegion(null)}>
          <X size={18} />
        </button>
      </div>

      {loading ? (
        <div className="weather-loading">Đang tải dữ liệu...</div>
      ) : (
        <div className="weather-content">
          <div className="current-weather">
            <span className="current-temp">{data[0]?.temp}°C</span>
            <span className="current-desc">
              {data[0]?.precip > 50 ? <><CloudRain size={20}/> Có mưa</> : <><Sun size={20}/> Nắng ráo</>}
            </span>
          </div>
          
          <div className="chart-container">
            <ResponsiveContainer width="100%" height={150}>
              <LineChart data={data}>
                <XAxis dataKey="time" stroke="#94a3b8" fontSize={10} tickMargin={8} />
                <YAxis hide domain={['dataMin - 2', 'dataMax + 2']} />
                <Tooltip 
                  contentStyle={{ background: '#1e293b', border: 'none', borderRadius: '8px', color: '#fff' }}
                  itemStyle={{ color: '#fff' }}
                  labelStyle={{ color: '#cbd5e1' }}
                />
                <Line type="monotone" dataKey="temp" stroke="#f59e0b" strokeWidth={3} dot={{ r: 4, fill: '#f59e0b', strokeWidth: 0 }} />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>
      )}
    </div>
  );
};

export default WeatherModal;
