import React from 'react';
import referenceRangesData from '../../data/referenceRanges.json';
import { MetricDefinition } from '../../types/medical';
import { 
  X, 
  Activity, 
  ShieldAlert, 
  BookOpen, 
  Flame, 
  Stethoscope
} from 'lucide-react';

interface Props {
  metricId: string | null;
  onClose: () => void;
}

export const HowToMeasureModal: React.FC<Props> = ({ metricId, onClose }) => {
  if (!metricId) return null;

  const metrics = referenceRangesData.metrics as unknown as MetricDefinition[];
  const metric = metrics.find((m) => m.id === metricId);

  if (!metric) return null;

  return (
    <div 
      className="fixed inset-0 bg-space-950/80 backdrop-blur-md z-50 flex items-center justify-center p-4"
      onClick={onClose}
    >
      <div 
        className="relative w-full max-w-2xl bg-space-900 border border-bio-cyan/40 rounded-2xl shadow-glow-cyan overflow-hidden animate-in fade-in zoom-in-95 duration-200"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="px-6 py-4 border-b border-space-800 flex items-center justify-between bg-space-950/60">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-bio-cyan/10 border border-bio-cyan/40 flex items-center justify-center text-bio-cyan">
              <Stethoscope className="w-5 h-5" />
            </div>
            <div>
              <span className="text-[10px] font-mono tracking-widest text-bio-cyan uppercase">
                ONBOARD CLINICAL MEASUREMENT PROTOCOL
              </span>
              <h2 className="text-lg font-orbitron font-bold text-white flex items-center gap-2">
                {metric.name} <span className="text-xs font-mono text-slate-400">({metric.unit})</span>
              </h2>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-space-800 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content Body */}
        <div className="p-6 space-y-4 max-h-[75vh] overflow-y-auto text-sm">
          {/* Section 1: What it is */}
          <div className="space-y-1 bg-space-950/50 p-3.5 rounded-xl border border-slate-800">
            <h3 className="text-xs font-mono font-semibold text-bio-cyan uppercase tracking-wider flex items-center gap-1.5">
              <BookOpen className="w-3.5 h-3.5" /> What It Is
            </h3>
            <p className="text-xs text-slate-300 leading-relaxed">
              {metric.whatItIs}
            </p>
          </div>

          {/* Section 2: Why it matters in space & Linked Hazard */}
          <div className="space-y-1 bg-space-950/50 p-3.5 rounded-xl border border-slate-800">
            <div className="flex items-center justify-between">
              <h3 className="text-xs font-mono font-semibold text-bio-amber uppercase tracking-wider flex items-center gap-1.5">
                <Flame className="w-3.5 h-3.5" /> Spaceflight Relevance
              </h3>
              <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-bio-amber/20 text-bio-amber border border-bio-amber/30 uppercase">
                Hazard: {metric.linkedHazard.replace('_', ' ')}
              </span>
            </div>
            <p className="text-xs text-slate-300 leading-relaxed">
              {metric.whyItMatters}
            </p>
            <div className="mt-2 pt-2 border-t border-slate-800/80 text-[11px] font-mono text-slate-400">
              <strong className="text-slate-300">Spaceflight Physiological Shift:</strong> {metric.spaceflightShift.explanation}
            </div>
          </div>

          {/* Section 3: How to measure with onboard equipment */}
          <div className="space-y-2 bg-space-950/70 p-4 rounded-xl border border-bio-cyan/20">
            <h3 className="text-xs font-mono font-semibold text-white uppercase tracking-wider flex items-center gap-1.5">
              <Activity className="w-4 h-4 text-bio-cyan" /> Onboard Equipment & Measurement Steps
            </h3>
            <div className="text-xs text-bio-cyan font-mono font-medium">
              Hardware: {metric.onboardMeasurement.device}
            </div>
            <p className="text-xs text-slate-300 leading-relaxed pl-2 border-l-2 border-bio-cyan/40">
              {metric.onboardMeasurement.howToMeasure}
            </p>
          </div>

          {/* Section 4: When to escalate */}
          <div className="space-y-1 bg-bio-red/10 p-3.5 rounded-xl border border-bio-red/30 text-bio-red">
            <h3 className="text-xs font-mono font-semibold uppercase tracking-wider flex items-center gap-1.5 text-bio-red">
              <ShieldAlert className="w-3.5 h-3.5" /> When to Escalate to Flight Surgeon
            </h3>
            <p className="text-xs text-slate-200 leading-relaxed">
              {metric.escalationCriteria}
            </p>
          </div>

          {/* Section 5: Normal & Safety Boundaries */}
          <div className="grid grid-cols-2 gap-3 pt-2 text-xs font-mono">
            <div className="bg-space-950 p-3 rounded-lg border border-slate-800">
              <span className="text-slate-400 block text-[10px]">POPULATION SAFETY ENVELOPE</span>
              <span className="text-white font-bold text-sm">
                {metric.populationEnvelope.minSafety} – {metric.populationEnvelope.maxSafety} {metric.unit}
              </span>
              <span className="text-[10px] text-slate-500 block">NASA-STD-3001 Limit</span>
            </div>

            <div className="bg-space-950 p-3 rounded-lg border border-slate-800">
              <span className="text-slate-400 block text-[10px]">OPTIMAL CRITICAL TARGET</span>
              <span className="text-bio-green font-bold text-sm">
                {metric.populationEnvelope.optimalMin} – {metric.populationEnvelope.optimalMax} {metric.unit}
              </span>
              <span className="text-[10px] text-slate-500 block">Nominal In-Flight Target</span>
            </div>
          </div>

          {/* Source Citation */}
          <div className="pt-3 border-t border-space-800 text-[10px] font-mono text-slate-400 flex flex-col gap-0.5">
            <div>
              <strong className="text-slate-300">CLINICAL CITATION:</strong> {metric.source}
            </div>
            <div>
              <strong className="text-slate-300">EVIDENCE CONFIDENCE:</strong>{' '}
              <span className="text-bio-cyan uppercase">{metric.confidence.replace('_', ' ')}</span>
            </div>
          </div>
        </div>

        {/* Modal Footer */}
        <div className="px-6 py-3 bg-space-950/80 border-t border-space-800 flex justify-end">
          <button
            onClick={onClose}
            className="px-4 py-2 rounded-lg bg-bio-cyan text-space-950 font-bold font-mono text-xs hover:bg-bio-cyan/80 transition-colors"
          >
            Acknowledge & Close
          </button>
        </div>
      </div>
    </div>
  );
};
