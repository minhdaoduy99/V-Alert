import { create } from 'zustand';

export type WeatherType = 'clear' | 'cloudy' | 'rain' | 'storm' | 'fog' | 'heatwave' | 'windy' | 'flood';
export const DEMO_WEATHERS: WeatherType[] = ['clear','cloudy','rain','storm','fog','heatwave','windy','flood'];

export interface Alert {
  id: string;
  type: 'Ngập lụt' | 'Sạt lở' | 'Cháy rừng';
  severity: 'Cảnh báo' | 'Nguy cơ cao' | 'Đặc biệt nguy hiểm';
  location: [number, number];
  description: string;
  timestamp: Date;
  verified: boolean;
}

interface AgentTask {
  id: string;
  description: string;
  status: 'pending' | 'processing' | 'completed';
  progress: number;
}

interface AppState {
  alerts: Alert[];
  addAlert: (alert: Alert) => void;
  updateAlert: (id: string, updates: Partial<Alert>) => void;
  
  agentTasks: AgentTask[];
  addAgentTask: (task: AgentTask) => void;
  updateAgentTask: (id: string, updates: Partial<AgentTask>) => void;
  removeAgentTask: (id: string) => void;

  searchLocation: [number, number] | null;
  setSearchLocation: (location: [number, number] | null) => void;

  userLocation: [number, number] | null;
  setUserLocation: (location: [number, number] | null) => void;

  isReportMode: boolean;
  setReportMode: (isReporting: boolean) => void;

  draftReportLocation: [number, number] | null;
  setDraftReportLocation: (location: [number, number] | null) => void;

  selectedRegion: { name: string; lat: number; lng: number } | null;
  setSelectedRegion: (region: { name: string; lat: number; lng: number } | null) => void;

  weatherIdx: number;
  setWeatherIdx: (idx: number | ((prev: number) => number)) => void;
}

export const useStore = create<AppState>((set) => ({
  alerts: [
    {
      id: 'mock-1',
      type: 'Ngập lụt',
      severity: 'Đặc biệt nguy hiểm',
      location: [16.047079, 108.206230],
      description: 'Mực nước sông Hàn lên nhanh, có nguy cơ ngập sâu.',
      timestamp: new Date(),
      verified: true
    }
  ],
  addAlert: (alert) => set((state) => ({ alerts: [...state.alerts, alert] })),
  updateAlert: (id, updates) => set((state) => ({
    alerts: state.alerts.map(a => a.id === id ? { ...a, ...updates } : a)
  })),

  agentTasks: [],
  addAgentTask: (task) => set((state) => ({ agentTasks: [...state.agentTasks, task] })),
  updateAgentTask: (id, updates) => set((state) => ({
    agentTasks: state.agentTasks.map(t => t.id === id ? { ...t, ...updates } : t)
  })),
  removeAgentTask: (id) => set((state) => ({ agentTasks: state.agentTasks.filter(t => t.id !== id) })),

  searchLocation: null,
  setSearchLocation: (location) => set({ searchLocation: location }),

  userLocation: null,
  setUserLocation: (location) => set({ userLocation: location }),

  isReportMode: false,
  setReportMode: (isReporting) => set({ isReportMode: isReporting, draftReportLocation: null }),

  draftReportLocation: null,
  setDraftReportLocation: (location) => set({ draftReportLocation: location }),

  selectedRegion: null,
  setSelectedRegion: (region) => set({ selectedRegion: region }),

  weatherIdx: 0,
  setWeatherIdx: (idx) => set((state) => ({
    weatherIdx: typeof idx === 'function' ? idx(state.weatherIdx) : idx
  })),
}));
