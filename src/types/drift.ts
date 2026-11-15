import { AutonomyTier, SpaceflightHazardId } from './medical';

export interface DriftAlert {
  id: string;
  metricId: string;
  metricName: string;
  tier: AutonomyTier;
  timestamp: string;
  missionDay: number;
  currentValue: number;
  unit: string;
  baselineValue: number;
  zScore: number;
  slopePerDay: number;
  multiDayWindow: number; // e.g. 7 or 9 days
  concordantSignals?: string[];
  whyThisFired: string;
  physiologicalRisk: string;
  linkedHazard: SpaceflightHazardId;
  recommendedActions: string[];
  acknowledged: boolean;
  actionTaken?: string;
}

export interface ConcordanceProfile {
  id: string;
  name: string;
  tier: AutonomyTier;
  confidence: number;
  description: string;
  primaryDrivers: { metricId: string; contribution: string }[];
  clinicalSignificance: string;
  protocolAction: string;
}
