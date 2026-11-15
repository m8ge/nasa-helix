import { BiometricReading } from '../types/telemetry';
import { generate90DayMissionDataset, generateSeedQuestLogs, initializeDatabaseWithSeedData } from './seedData';
import { db } from './dexieDb';

// In-memory cache ensures 100% instantaneous, zero-latency rendering
// and total resilience against IndexedDB restrictions in private windows or iframes.
let inMemoryReadings: BiometricReading[] = generate90DayMissionDataset();

export function getAllTelemetryReadings(): BiometricReading[] {
  return inMemoryReadings;
}

export function getTelemetryForSol(sol: number): BiometricReading {
  const clampedSol = Math.max(1, Math.min(90, sol));
  const reading = inMemoryReadings.find((r) => r.missionDay === clampedSol);
  return reading || inMemoryReadings[clampedSol - 1] || inMemoryReadings[0];
}

export async function updateTelemetryReading(
  sol: number,
  updates: Partial<BiometricReading>
): Promise<BiometricReading> {
  const index = inMemoryReadings.findIndex((r) => r.missionDay === sol);
  if (index !== -1) {
    inMemoryReadings[index] = { ...inMemoryReadings[index], ...updates };
  }

  // Sync to IndexedDB if available
  try {
    const existing = await db.readings.where('missionDay').equals(sol).first();
    if (existing) {
      await db.readings.update(existing.id, updates);
    }
  } catch (err) {
    console.warn('[TelemetryService] Dexie sync warning (falling back to memory):', err);
  }

  return getTelemetryForSol(sol);
}

export interface SolIncident {
  sol: number;
  tier: 'GREEN' | 'AMBER' | 'RED';
  tag: string;
  title: string;
  description: string;
  actionGuidance: string;
}

export function getIncidentForSol(sol: number): SolIncident {
  if (sol <= 5) {
    return {
      sol,
      tier: 'AMBER',
      tag: 'PHASE 1: FLUID SHIFT',
      title: 'Acute Microgravity Cephalad Fluid Redistribution',
      description:
        'Rapid upward fluid shift (~2L) from lower extremities to thorax/cranium. Baroreflex resetting and acute plasma volume contraction in progress.',
      actionGuidance: 'Execute Cephalad Counter-Fluid & Electrolyte Loading protocol. Monitor orthostatic blood pressure.',
    };
  }

  if (sol === 42) {
    return {
      sol,
      tier: 'RED',
      tag: 'CRITICAL ALERT: SOLAR STORM (SPE)',
      title: 'Solar Particle Event (SPE) Coronal Mass Ejection Spike',
      description:
        'Silicon active dosimeter (CPDS) detects acute radiation rate of 18.6 mSv/day (13.8x baseline). Sympathetic fight-or-flight response elevated.',
      actionGuidance:
        'IMMEDIATE ACTION: Retreat to Water Wall Radiation Storm Shelter (Module 3). Initiate Antioxidant / Choline prophylaxis.',
    };
  }

  if (sol === 43 || sol === 44) {
    return {
      sol,
      tier: 'AMBER',
      tag: 'POST-SPE RADIATION RECOVERY',
      title: 'Solar Storm Decay & Hematopoietic Shielding',
      description:
        'Coronal mass ejection proton flux decaying (6.2 mSv/day). Cumulative radiation dose remains safely below 600 mSv career limit.',
      actionGuidance: 'Remain on heightened dosimeter watch. Re-check complete blood count and lymphocyte status.',
    };
  }

  if (sol >= 65 && sol <= 74) {
    return {
      sol,
      tier: sol >= 72 ? 'RED' : 'AMBER',
      tag: 'ACTIVE ALERT: SLEEP DEBT & COGNITIVE DRIFT',
      title: 'Cumulative Neurobehavioral Exhaustion & Circadian Desynchrony',
      description:
        '9 consecutive sols of declining sleep duration (-2.3 hrs) concordant with rising resting heart rate (+9.8 bpm) and cognitive PVT response slowing (+86 ms).',
      actionGuidance:
        'High latency comm delay (+21m) active. Execute Autonomous Fatigue Stabilization Checklist: 480nm blue-depleted lighting, 30m CEVIS recovery, and mandatory sleep window.',
    };
  }

  if (sol >= 75) {
    return {
      sol,
      tier: 'GREEN',
      tag: 'PHASE 4: INTERVENTION RECOVERY',
      title: 'Stabilized Physiological & Neurocognitive Trajectory',
      description:
        'Prescribed chronobiological light shifting and sleep hygiene countermeasures have restored resting heart rate to 54.5 bpm and reduced PVT attentional lapses.',
      actionGuidance: 'Resume standard 2.5-hour daily countermeasure maintenance (ARED resistive + CEVIS aerobic).',
    };
  }

  return {
    sol,
    tier: 'GREEN',
    tag: 'PHASE 2: INTERPLANETARY CRUISE',
    title: 'Nominal Deep Space Transit Cruise',
    description:
      'All biometric vectors tracking within individual flight adaptation baseline envelopes (μ ± 1.5σ). Atmospheric ECLSS nominal.',
    actionGuidance: 'Maintain scheduled exercise compliance and asynchronous flight surgeon health check-ins.',
  };
}

export async function bootstrapTelemetry(): Promise<void> {
  try {
    await initializeDatabaseWithSeedData();
    // Hydrate memory cache if DB has existing readings
    const dbReadings = await db.readings.toArray();
    if (dbReadings && dbReadings.length >= 90) {
      inMemoryReadings = dbReadings.sort((a, b) => a.missionDay - b.missionDay);
    }
  } catch (err) {
    console.warn('[TelemetryService] Database initialization failed; running in pure in-memory mode:', err);
  }
}
