export type SpaceflightHazardId = 
  | 'radiation'
  | 'isolation'
  | 'distance'
  | 'altered_gravity'
  | 'hostile_environment';

export type ConfidenceLevel = 'definitive_standard' | 'high_consensus' | 'observational_evidence';

export type AutonomyTier = 'GREEN' | 'AMBER' | 'RED';

export interface HazardDefinition {
  id: SpaceflightHazardId;
  name: string;
  acronym: string;
  category: string;
  description: string;
  threatenedSystems: string[];
  primaryBiomarkers: string[];
  color: string;
  source: string;
  confidence: ConfidenceLevel;
  mitigationTactics: string[];
}

export interface OrganSystem {
  id: string;
  name: string;
  meshTarget: string;
  coordinates: { x: number; y: number; z: number };
  primaryHazards: SpaceflightHazardId[];
  clinicalFunction: string;
  spaceflightImpact: string;
  linkedBiomarkers: string[];
  source: string;
  confidence: ConfidenceLevel;
}

export interface MetricDefinition {
  id: string;
  name: string;
  unit: string;
  category: string;
  populationEnvelope: {
    minSafety: number;
    maxSafety: number;
    optimalMin: number;
    optimalMax: number;
  };
  spaceflightShift: {
    expectedDelta: number;
    explanation: string;
  };
  whatItIs: string;
  whyItMatters: string;
  linkedHazard: SpaceflightHazardId;
  onboardMeasurement: {
    device: string;
    howToMeasure: string;
  };
  escalationCriteria: string;
  source: string;
  confidence: ConfidenceLevel;
}

export interface BaselineStats {
  preFlightMean: number;
  preFlightStdDev: number;
  flightAdaptationMean: number;
  flightAdaptationStdDev: number;
}

export interface AstronautProfile {
  id: string;
  callsign: string;
  fullName: string;
  role: string;
  mission: string;
  spacecraft: string;
  currentMissionDay: number;
  totalMissionDays: number;
  age: number;
  bloodType: string;
  baselines: Record<string, BaselineStats>;
  source: string;
  confidence: ConfidenceLevel;
}
