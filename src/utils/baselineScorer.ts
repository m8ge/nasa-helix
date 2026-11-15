import { MetricEvaluation } from '../types/telemetry';
import { MetricDefinition, BaselineStats } from '../types/medical';
import astronautData from '../data/astronautProfile.json';
import referenceRangesData from '../data/referenceRanges.json';

const metricsList = referenceRangesData.metrics as unknown as MetricDefinition[];
const baselines = astronautData.astronaut.baselines as Record<string, BaselineStats>;

export function evaluateMetric(metricId: string, value: number): MetricEvaluation {
  const metricDef = metricsList.find((m) => m.id === metricId);
  const baseline = baselines[metricId];

  if (!metricDef || !baseline) {
    return {
      metricId,
      value,
      personalZScore: 0,
      personalDelta: 0,
      populationStatus: 'optimal',
      personalStatus: 'optimal',
      overallTier: 'GREEN',
    };
  }

  // Use flight adaptation mean/stdDev as personal baseline
  const mean = baseline.flightAdaptationMean;
  const stdDev = baseline.flightAdaptationStdDev || 1.0;

  const personalDelta = value - mean;
  const personalZScore = Math.round((personalDelta / stdDev) * 100) / 100;
  const absZ = Math.abs(personalZScore);

  // Population safety status
  let populationStatus: 'optimal' | 'acceptable' | 'breach' = 'optimal';
  if (value < metricDef.populationEnvelope.minSafety || value > metricDef.populationEnvelope.maxSafety) {
    populationStatus = 'breach';
  } else if (value < metricDef.populationEnvelope.optimalMin || value > metricDef.populationEnvelope.optimalMax) {
    populationStatus = 'acceptable';
  }

  // Personal baseline status
  let personalStatus: 'optimal' | 'drift_mild' | 'drift_severe' = 'optimal';
  if (absZ >= 2.5) {
    personalStatus = 'drift_severe';
  } else if (absZ >= 1.5) {
    personalStatus = 'drift_mild';
  }

  // Overall Tier Resolution
  let overallTier: 'GREEN' | 'AMBER' | 'RED' = 'GREEN';
  if (populationStatus === 'breach' || personalStatus === 'drift_severe') {
    overallTier = 'RED';
  } else if (personalStatus === 'drift_mild' || populationStatus === 'acceptable') {
    overallTier = 'AMBER';
  }

  return {
    metricId,
    value,
    personalZScore,
    personalDelta: Math.round(personalDelta * 10) / 10,
    populationStatus,
    personalStatus,
    overallTier,
  };
}
