import { create } from 'zustand';
import { EnvironmentModeId } from '../types/environment';
import environmentsData from '../data/environments.json';

interface ConfigState {
  currentSol: number;
  environmentMode: EnvironmentModeId;
  dimCabinNightMode: boolean;
  highContrastMode: boolean;
  reducedMotion: boolean;
  viewMode: '3d_holo' | '2d_blueprint';
  earthDistanceKm: number; // 0 to 400M km
  commDelaySeconds: number; // dynamic or environment-based
  isGuidedTourActive: boolean;

  setSol: (sol: number) => void;
  setEnvironmentMode: (mode: EnvironmentModeId) => void;
  toggleNightMode: () => void;
  toggleHighContrast: () => void;
  toggleReducedMotion: () => void;
  setViewMode: (mode: '3d_holo' | '2d_blueprint') => void;
  setEarthDistance: (km: number) => void;
  setGuidedTourActive: (active: boolean) => void;
}

export const useConfigStore = create<ConfigState>((set) => ({
  currentSol: 74,
  environmentMode: 'deep_space_transit',
  dimCabinNightMode: false,
  highContrastMode: false,
  reducedMotion: false,
  viewMode: '2d_blueprint',
  earthDistanceKm: 225000000, // Mars distance (~225M km)
  commDelaySeconds: 1274, // ~21m 14s
  isGuidedTourActive: false,

  setSol: (sol) => set({ currentSol: sol }),
  setEnvironmentMode: (mode) => {
    const env = environmentsData.environments.find((e) => e.id === mode);
    set({
      environmentMode: mode,
      commDelaySeconds: env ? env.nominalCommDelaySeconds : 0.5,
    });
  },
  toggleNightMode: () => set((state) => ({ dimCabinNightMode: !state.dimCabinNightMode })),
  toggleHighContrast: () => set((state) => ({ highContrastMode: !state.highContrastMode })),
  toggleReducedMotion: () => set((state) => ({ reducedMotion: !state.reducedMotion })),
  setViewMode: (mode) => set({ viewMode: mode }),
  setEarthDistance: (km) => {
    // Speed of light: 300,000 km/s. Round-trip comm delay = (2 * km) / 300,000
    // One-way delay: km / 300000
    const oneWaySeconds = km / 299792;
    set({ earthDistanceKm: km, commDelaySeconds: Math.round(oneWaySeconds) });
  },
  setGuidedTourActive: (active) => set({ isGuidedTourActive: active }),
}));
