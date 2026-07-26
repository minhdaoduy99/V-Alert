import './App.css';
import { useState } from 'react';
import MapView from './components/Map/MapView';
import DashboardSidebar from './components/Dashboard/DashboardSidebar';
import AgentStatusMonitor from './components/Swarm/AgentStatusMonitor';
import SearchBar from './components/UI/SearchBar';
import WeatherClock from './components/UI/WeatherClock';
import CitizenReporter from './components/EdgeAI/EdgeAIUploader';

function App() {
  const [isDarkMode, setIsDarkMode] = useState(false);

  return (
    <div className={`app-container ${isDarkMode ? 'app-dark' : ''}`}>
      <MapView isDarkMode={isDarkMode} />

      <div className="ui-layer">
        {/* Left column: SearchBar + Sidebar perfectly aligned */}
        <div className="top-left-panel">
          <SearchBar />
          <DashboardSidebar />
        </div>

        {/* Top-right: Circular animated WeatherClock */}
        <WeatherClock isDarkMode={isDarkMode} onToggleDark={setIsDarkMode} />

        {/* Bottom overlays */}
        <AgentStatusMonitor />
        <CitizenReporter />
      </div>
    </div>
  );
}

export default App;
