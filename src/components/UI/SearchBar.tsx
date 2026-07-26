import React, { useState, useEffect, useRef } from 'react';
import { Search, MapPin } from 'lucide-react';
import './UI.css';
import { useStore } from '../../store/useStore';

const SearchBar: React.FC = () => {
  const [query, setQuery] = useState('');
  const [results, setResults] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [showDropdown, setShowDropdown] = useState(false);
  const { setSearchLocation } = useStore();
  const dropdownRef = useRef<HTMLDivElement>(null);

  // Debounced Search
  useEffect(() => {
    const delayDebounceFn = setTimeout(async () => {
      if (query.length > 2) {
        setLoading(true);
        try {
          const res = await fetch(`https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(query)}&countrycodes=vn&limit=5&addressdetails=1`);
          const data = await res.json();
          setResults(data);
          setShowDropdown(true);
        } catch (error) {
          console.error('Lỗi tìm kiếm:', error);
        } finally {
          setLoading(false);
        }
      } else {
        setResults([]);
        setShowDropdown(false);
      }
    }, 500);

    return () => clearTimeout(delayDebounceFn);
  }, [query]);

  // Click outside to close
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setShowDropdown(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleSelect = (lat: string, lon: string, displayName: string) => {
    // Crucial fix: Make sure it's updating with a slightly different ref if same coords, 
    // or ensure MapUpdater reacts to it.
    setSearchLocation([parseFloat(lat), parseFloat(lon)]);
    setQuery(displayName.split(',')[0]); // Set just the main part
    setShowDropdown(false);
  };

  return (
    <div className="search-container" ref={dropdownRef}>
      <div className="search-bar glass-panel google-style">
        <Search size={20} className="search-icon" />
        <input 
          type="text" 
          placeholder="Tìm kiếm trên Google Maps (Việt Nam)..." 
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          onFocus={() => { if (results.length > 0) setShowDropdown(true); }}
        />
        {loading && <div className="loader-spinner"></div>}
      </div>

      {showDropdown && results.length > 0 && (
        <div className="search-dropdown glass-panel">
          {results.map((result) => (
            <div 
              key={result.place_id} 
              className="search-item"
              onClick={() => handleSelect(result.lat, result.lon, result.display_name)}
            >
              <div className="search-item-icon">
                <MapPin size={16} />
              </div>
              <div className="search-item-text">
                <div className="search-item-title">{result.display_name.split(',')[0]}</div>
                <div className="search-item-subtitle">{result.display_name.split(',').slice(1).join(',')}</div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default SearchBar;
