import { SpaceflightHazardId } from './medical';

export type EnvironmentModeId = 'iss' | 'deep_space_transit' | 'lunar_base' | 'mars_habitat';

export interface EnvironmentMode {
  id: EnvironmentModeId;
  name: string;
  location: string;
  gravityG: number;
  gravityLabel: string;
  nominalCommDelaySeconds: number;
  commDelayDisplay: string;
  radiationLevel: string;
  hazardWeighting: Record<SpaceflightHazardId, number>;
  availableInstruments: string[];
  suggestedRoutineFocus: string;
  source: string;
  confidence: string;
}
