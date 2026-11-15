import { create } from 'zustand';
import { SpaceflightHazardId } from '../types/medical';
import { ShieldType } from '../types/quests';

interface TwinStoreState {
  activeHazard: SpaceflightHazardId | 'all' | null;
  selectedOrganId: string | null;
  cameraFocus: [number, number, number] | null;
  pulseBpm: number;
  breathingRateRpm: number;
  shieldGlows: Record<ShieldType, number>; // 0 to 100
  isHoloRotating: boolean;

  setActiveHazard: (hazard: SpaceflightHazardId | 'all' | null) => void;
  setSelectedOrganId: (organId: string | null) => void;
  setCameraFocus: (target: [number, number, number] | null) => void;
  setPulseBpm: (bpm: number) => void;
  setShieldGlow: (shield: ShieldType, level: number) => void;
  toggleHoloRotation: () => void;
}

export const useTwinStore = create<TwinStoreState>((set) => ({
  activeHazard: null,
  selectedOrganId: null,
  cameraFocus: null,
  pulseBpm: 64,
  breathingRateRpm: 14,
  shieldGlows: {
    cardiovascular: 85,
    musculoskeletal: 90,
    neuro_behavioral: 68,
    immune: 94,
  },
  isHoloRotating: true,

  setActiveHazard: (hazard) => set({ activeHazard: hazard }),
  setSelectedOrganId: (organId) => set({ selectedOrganId: organId }),
  setCameraFocus: (target) => set({ cameraFocus: target }),
  setPulseBpm: (bpm) => set({ pulseBpm: bpm }),
  setShieldGlow: (shield, level) =>
    set((state) => ({
      shieldGlows: { ...state.shieldGlows, [shield]: level },
    })),
  toggleHoloRotation: () => set((state) => ({ isHoloRotating: !state.isHoloRotating })),
}));
