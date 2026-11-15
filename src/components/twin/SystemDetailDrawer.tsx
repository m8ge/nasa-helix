import React from 'react';
import { useTwinStore } from '../../stores/useTwinStore';
import organSystemsData from '../../data/organSystems.json';
import referenceRangesData from '../../data/referenceRanges.json';
import countermeasuresData from '../../data/countermeasures.json';
import { OrganSystem, MetricDefinition } from '../../types/medical';
import { BiometricReading } from '../../types/telemetry';
import { 
  Heart, 
  Brain, 
  Activity, 
  Shield, 
  AlertCircle, 
  X, 
  CheckCircle2, 
  AlertTriangle, 
  BookOpen, 
  ChevronRight,
  Eye,
  Wind,
  Flame,
  Bone,
  Dna
} from 'lucide-react';

interface Props {
  latestReading: BiometricReading | null;
  onOpenHowToMeasure?: (metricId: string) => void;
}

const organIcons: Record<string, React.ComponentType<{ className?: string }>> = {
  central_nervous: Brain,
  ocular_retina: Eye,
  cardiovascular: Heart,
  respiratory: Wind,
  metabolic_gastro: Flame,
  musculoskeletal: Bone,
  immune_hematopoietic: Dna,
};

export const SystemDetailDrawer: React.FC<Props> = ({ latestReading, onOpenHowToMeasure }) => {
  const { selectedOrganId, setSelectedOrganId, activeHazard } = useTwinStore();
  const organSystems = organSystemsData.organSystems as unknown as OrganSystem[];
  const allMetrics = referenceRangesData.metrics as unknown as MetricDefinition[];

  if (!selectedOrganId) return null;

  const currentOrgan = organSystems.find((o) => o.id === selectedOrganId);
  if (!currentOrgan) return null;

  const Icon = organIcons[currentOrgan.id] || Activity;
  const linkedMetricDefs = allMetrics.filter((m) => currentOrgan.linkedBiomarkers.includes(m.id));
  const relevantQuests = countermeasuresData.quests.filter(
    (q) => q.targetSystem === currentOrgan.id || q.targetSystem === currentOrgan.meshTarget
  );

  return (
    <aside className="fixed inset-y-0 right-0 w-full sm:w-[460px] bg-space-950/95 border-l border-space-700/80 backdrop-blur-2xl z-40 p-6 flex flex-col shadow-2xl overflow-y-auto animate-in slide-in-from-right duration-300">
      {/* Header */}
      <div className="flex items-start justify-between border-b border-space-800 pb-4 mb-4">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-bio-cyan/10 border border-bio-cyan/40 flex items-center justify-center text-bio-cyan shadow-glow-cyan">
            <Icon className="w-6 h-6" />
          </div>
          <div>
            <span className="text-[10px] font-mono tracking-widest text-bio-cyan uppercase">
              ANATOMICAL SUBSYSTEM
            </span>
            <h2 className="text-lg font-orbitron font-bold text-white leading-tight">
              {currentOrgan.name}
            </h2>
          </div>
        </div>

        <button
          onClick={() => setSelectedOrganId(null)}
          className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-space-800 transition-colors"
          title="Close System Drawer"
        >
          <X className="w-5 h-5" />
        </button>
      </div>

      <div className="space-y-5 text-sm">
        {/* Physiological Function */}
        <section className="bg-space-900/60 p-3.5 rounded-xl border border-slate-800">
          <h3 className="text-xs font-mono font-semibold text-slate-300 uppercase tracking-wider mb-1.5 flex items-center gap-1.5">
            <BookOpen className="w-3.5 h-3.5 text-bio-cyan" /> Clinical Function
          </h3>
          <p className="text-xs text-slate-300 leading-relaxed">
            {currentOrgan.clinicalFunction}
          </p>
        </section>

        {/* Spaceflight Hazard Impact */}
        <section className="bg-space-900/60 p-3.5 rounded-xl border border-slate-800">
          <h3 className="text-xs font-mono font-semibold text-bio-amber uppercase tracking-wider mb-1.5 flex items-center gap-1.5">
            <AlertCircle className="w-3.5 h-3.5 text-bio-amber" /> Spaceflight Hazard Vulnerability
          </h3>
          <p className="text-xs text-slate-300 leading-relaxed mb-2.5">
            {currentOrgan.spaceflightImpact}
          </p>
          <div className="flex flex-wrap gap-1.5">
            {currentOrgan.primaryHazards.map((hId) => (
              <span
                key={hId}
                className={`text-[10px] font-mono px-2 py-0.5 rounded border uppercase ${
                  activeHazard === hId
                    ? 'bg-bio-amber/20 border-bio-amber text-bio-amber font-bold'
                    : 'bg-space-800 border-slate-700 text-slate-400'
                }`}
              >
                Hazard: {hId.replace('_', ' ')}
              </span>
            ))}
          </div>
        </section>

        {/* Linked Biomarkers & Current Status */}
        <section className="space-y-2.5">
          <div className="flex items-center justify-between">
            <h3 className="text-xs font-mono font-semibold text-slate-200 uppercase tracking-wider">
              Linked Telemetry ({linkedMetricDefs.length})
            </h3>
            <span className="text-[10px] font-mono text-slate-400">Sol 074 Current</span>
          </div>

          <div className="space-y-2">
            {linkedMetricDefs.map((metric) => {
              const rawValue = latestReading ? (latestReading as any)[metric.id] : null;
              const hasValue = rawValue !== undefined && rawValue !== null;

              return (
                <div
                  key={metric.id}
                  className="p-3 rounded-lg bg-space-900/80 border border-slate-800 hover:border-slate-700 transition-colors flex items-center justify-between"
                >
                  <div>
                    <span className="text-xs font-medium text-white block">{metric.name}</span>
                    <span className="text-[10px] font-mono text-slate-400">
                      Pop Safe: {metric.populationEnvelope.minSafety} - {metric.populationEnvelope.maxSafety} {metric.unit}
                    </span>
                  </div>

                  <div className="text-right flex items-center gap-3">
                    <div>
                      <span className="text-sm font-mono font-bold text-white">
                        {hasValue ? rawValue : '--'}
                      </span>
                      <span className="text-[10px] font-mono text-slate-400 ml-1">{metric.unit}</span>
                    </div>

                    {onOpenHowToMeasure && (
                      <button
                        onClick={() => onOpenHowToMeasure(metric.id)}
                        className="text-[10px] font-mono text-bio-cyan hover:underline px-1.5 py-0.5 rounded bg-bio-cyan/10 border border-bio-cyan/20"
                        title="View onboard measurement protocol"
                      >
                        Guide
                      </button>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </section>

        {/* Countermeasures & Mitigation Protocols */}
        {relevantQuests.length > 0 && (
          <section className="space-y-2">
            <h3 className="text-xs font-mono font-semibold text-bio-green uppercase tracking-wider flex items-center gap-1.5">
              <Shield className="w-3.5 h-3.5 text-bio-green" /> Prescribed Countermeasure Missions
            </h3>
            {relevantQuests.map((quest) => (
              <div
                key={quest.id}
                className="p-3 rounded-lg bg-space-900/80 border border-slate-800 text-xs space-y-1.5"
              >
                <div className="flex items-center justify-between font-semibold text-white">
                  <span>{quest.title}</span>
                  <span className="text-[10px] font-mono text-bio-green px-1.5 py-0.5 rounded bg-bio-green/10 border border-bio-green/20">
                    +{quest.shieldPoints} Shield Pts
                  </span>
                </div>
                <p className="text-[11px] text-slate-300 leading-snug">
                  {quest.description}
                </p>
                <span className="text-[10px] font-mono text-slate-400 block pt-1">
                  Source: {quest.source}
                </span>
              </div>
            ))}
          </section>
        )}

        {/* Scientific Source Footnote */}
        <div className="pt-3 border-t border-slate-800 text-[10px] text-slate-400 font-mono space-y-1">
          <p>
            <strong className="text-slate-300">CLINICAL CITATION:</strong> {currentOrgan.source}
          </p>
          <p>
            <strong className="text-slate-300">CONFIDENCE:</strong> {currentOrgan.confidence.replace('_', ' ').toUpperCase()}
          </p>
        </div>
      </div>
    </aside>
  );
};
