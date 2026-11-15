import { describe, it, expect } from 'vitest';
import { generate90DayMissionDataset } from '../database/seedData';
import referenceRangesData from '../data/referenceRanges.json';
import hazardsData from '../data/hazards.json';
import organSystemsData from '../data/organSystems.json';
import countermeasuresData from '../data/countermeasures.json';
import environmentsData from '../data/environments.json';
import astronautData from '../data/astronautProfile.json';

describe('Phase 1 Verification: Medical Data & Seed Integrity', () => {
  it('should have sources and confidence ratings on all reference ranges', () => {
    expect(referenceRangesData.metrics.length).toBeGreaterThan(10);
    for (const metric of referenceRangesData.metrics) {
      expect(metric.id).toBeDefined();
      expect(metric.name).toBeDefined();
      expect(metric.source).toBeDefined();
      expect(metric.source.length).toBeGreaterThan(5);
      expect(metric.confidence).toBeDefined();
      expect(metric.populationEnvelope.minSafety).toBeLessThan(metric.populationEnvelope.maxSafety);
      expect(metric.whatItIs).toBeDefined();
      expect(metric.whyItMatters).toBeDefined();
      expect(metric.onboardMeasurement.device).toBeDefined();
      expect(metric.onboardMeasurement.howToMeasure).toBeDefined();
      expect(metric.escalationCriteria).toBeDefined();
    }
  });

  it('should have the 5 NASA Spaceflight Hazards (RIDGE) with explicit sources', () => {
    const hazardIds = hazardsData.hazards.map((h) => h.id);
    expect(hazardIds).toContain('radiation');
    expect(hazardIds).toContain('isolation');
    expect(hazardIds).toContain('distance');
    expect(hazardIds).toContain('altered_gravity');
    expect(hazardIds).toContain('hostile_environment');

    for (const hazard of hazardsData.hazards) {
      expect(hazard.source).toBeDefined();
      expect(hazard.confidence).toBeDefined();
      expect(hazard.mitigationTactics.length).toBeGreaterThan(0);
    }
  });

  it('should have all 4 mission environments defined', () => {
    const envIds = environmentsData.environments.map((e) => e.id);
    expect(envIds).toContain('iss');
    expect(envIds).toContain('deep_space_transit');
    expect(envIds).toContain('lunar_base');
    expect(envIds).toContain('mars_habitat');
  });

  it('should generate 90 continuous days of telemetry with planted anomalies', () => {
    const dataset = generate90DayMissionDataset();
    expect(dataset.length).toBe(90);

    // Verify Day 42 Solar Particle Event
    const day42 = dataset.find((r) => r.missionDay === 42);
    expect(day42).toBeDefined();
    expect(day42!.radiationDailyRate).toBeGreaterThan(15.0);

    // Verify Day 74 Sleep Debt & PVT Drift
    const day64 = dataset.find((r) => r.missionDay === 64)!;
    const day74 = dataset.find((r) => r.missionDay === 74)!;

    // Resting HR should have drifted upward
    expect(day74.restingHR).toBeGreaterThan(day64.restingHR);
    // Sleep hours should have declined
    expect(day74.sleepHours).toBeLessThan(day64.sleepHours);
    // Cognitive PVT should have slowed down (higher ms)
    expect(day74.pvtReactionTimeMs).toBeGreaterThan(day64.pvtReactionTimeMs);
    // Fatigue should be elevated
    expect(day74.fatigueScore).toBeGreaterThan(3.5);
  });
});
