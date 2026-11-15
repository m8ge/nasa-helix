export interface BiometricReading {
  id: string;
  timestamp: string;          // ISO string
  missionDay: number;         // 1 to 90
  systolicBP: number;         // mmHg
  diastolicBP: number;        // mmHg
  restingHR: number;          // bpm
  bodyTemp: number;           // °C
  bloodGlucose: number;       // mg/dL
  sleepHours: number;         // hrs
  sleepEfficiency: number;    // %
  spO2: number;               // %
  bodyMass: number;           // kg
  radiationDoseCum: number;   // mSv
  radiationDailyRate: number; // mSv/day
  pvtReactionTimeMs: number;  // ms
  pvtLapses: number;          // count
  moodValence: number;        // 1-5
  stressLevel: number;        // 1-5
  fatigueScore: number;       // 1-5
  exerciseCompliance: number; // %
  notes?: string;
  sourceType?: 'sensor_auto' | 'manual_entry' | 'pvt_test';
}

export interface MetricEvaluation {
  metricId: string;
  value: number;
  personalZScore: number;
  personalDelta: number;
  populationStatus: 'optimal' | 'acceptable' | 'breach';
  personalStatus: 'optimal' | 'drift_mild' | 'drift_severe';
  overallTier: 'GREEN' | 'AMBER' | 'RED';
}
