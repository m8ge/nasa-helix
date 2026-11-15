import { SpaceflightHazardId } from './medical';

export interface AnatomicalTarget {
  id: string;
  name: string;
  organSystemId: string;
  meshNodeName: string;
  position: [number, number, number];
  primaryHazards: SpaceflightHazardId[];
}

export interface TwinState {
  activeHazard: SpaceflightHazardId | 'all' | null;
  selectedOrganId: string | null;
  cameraFocusTarget: [number, number, number] | null;
  activeShields: Record<string, number>;
  pulseHeartRate: number;
  breathingRate: number;
}
