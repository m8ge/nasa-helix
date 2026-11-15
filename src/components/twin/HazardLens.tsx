import React from 'react';
import { useTwinStore } from '../../stores/useTwinStore';
import hazardsData from '../../data/hazards.json';
import { SpaceflightHazardId, HazardDefinition } from '../../types/medical';
import { Radio, AlertOctagon, Orbit, Activity, ShieldAlert, Sparkles, X } from 'lucide-react';

const hazardIcons: Record<SpaceflightHazardId, React.ComponentType<{ className?: string }>> = {
  radiation: Radio,
  isolation: Sparkles,
  distance: Orbit,
  altered_gravity: Activity,
  hostile_environment: ShieldAlert,
};

export const HazardLens: React.FC = () => {
  const { activeHazard, setActiveHazard } = useTwinStore();
  const hazards = hazardsData.hazards as unknown as HazardDefinition[];

  const currentHazard = hazards.find((h) => h.id === activeHazard);

  return (
    <div className="relative w-full flex flex-col items-center">
      {/* Hazard Lens Ring / Arc Selector */}
      <div className="flex flex-wrap items-center justify-center gap-2 p-1.5 rounded-full bg-space-900/90 border border-slate-700/60 backdrop-blur-xl shadow-2xl z-20">
        <span className="text-[11px] font-orbitron tracking-widest text-slate-400 pl-3 pr-1 uppercase">
          HAZARD LENS:
        </span>

        {hazards.map((h) => {
          const Icon = hazardIcons[h.id] || AlertOctagon;
          const isSelected = activeHazard === h.id;

          return (
            <button
              key={h.id}
              onClick={() => setActiveHazard(isSelected ? null : h.id)}
              className={`flex items-center gap-2 px-3 py-1.5 rounded-full text-xs font-mono font-medium transition-all duration-300 ${
                isSelected
                  ? 'bg-gradient-to-r from-space-800 to-space-700 text-white shadow-lg ring-2'
                  : 'text-slate-300 hover:text-white hover:bg-space-800/80'
              }`}
              style={{
                borderColor: isSelected ? h.color : 'transparent',
                boxShadow: isSelected ? `0 0 16px ${h.color}55` : undefined,
                color: isSelected ? '#FFFFFF' : undefined,
              }}
              title={h.description}
            >
              <div
                className="w-2.5 h-2.5 rounded-full"
                style={{ backgroundColor: h.color }}
              />
              <Icon className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">[{h.acronym}] {h.name}</span>
              <span className="sm:hidden">[{h.acronym}]</span>
            </button>
          );
        })}

        {activeHazard && (
          <button
            onClick={() => setActiveHazard(null)}
            className="p-1.5 rounded-full text-slate-400 hover:text-white hover:bg-space-800 transition-colors ml-1"
            title="Reset Lens to Neutral"
          >
            <X className="w-3.5 h-3.5" />
          </button>
        )}
      </div>

      {/* Active Hazard Explainer HUD Drawer */}
      {currentHazard && (
        <div
          className="mt-3 w-full max-w-xl mx-auto glass-panel-glow p-4 rounded-xl border text-left shadow-2xl animate-in fade-in slide-in-from-top-2 duration-300 z-20"
          style={{ borderColor: `${currentHazard.color}66` }}
        >
          <div className="flex items-center justify-between border-b border-slate-700/60 pb-2 mb-2.5">
            <div className="flex items-center gap-2">
              <span
                className="w-3 h-3 rounded-full animate-ping"
                style={{ backgroundColor: currentHazard.color }}
              />
              <h3 className="font-orbitron font-bold text-sm tracking-wide text-white uppercase flex items-center gap-2">
                ACTIVE LENS: {currentHazard.name}
              </h3>
            </div>
            <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-space-800 text-slate-300 border border-slate-700">
              NASA HRP // {currentHazard.category}
            </span>
          </div>

          <p className="text-xs text-slate-200 leading-relaxed mb-3">
            {currentHazard.description}
          </p>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-[11px] font-mono pt-1 border-t border-slate-800/80">
            <div>
              <span className="text-slate-400 block mb-0.5">THREATENED SYSTEMS:</span>
              <div className="flex flex-wrap gap-1">
                {currentHazard.threatenedSystems.map((sys) => (
                  <span
                    key={sys}
                    className="px-1.5 py-0.5 rounded text-[10px] bg-space-950/70 border"
                    style={{ borderColor: `${currentHazard.color}44`, color: currentHazard.color }}
                  >
                    {sys.replace('_', ' ')}
                  </span>
                ))}
              </div>
            </div>

            <div>
              <span className="text-slate-400 block mb-0.5">PRIMARY ONBOARD MITIGATION:</span>
              <p className="text-[10px] text-slate-300 truncate" title={currentHazard.mitigationTactics[0]}>
                • {currentHazard.mitigationTactics[0]}
              </p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
