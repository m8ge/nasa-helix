import React, { useEffect, useState, useRef } from 'react';
import { useConfigStore } from '../../stores/useConfigStore';
import { Play, Pause, RotateCcw, AlertTriangle, Radio, ShieldCheck, Flame, ChevronRight } from 'lucide-react';

interface Milestone {
  sol: number;
  label: string;
  sub: string;
  tier: 'GREEN' | 'AMBER' | 'RED';
}

const milestones: Milestone[] = [
  { sol: 1, label: 'Sol 01', sub: 'Launch & Fluid Shift', tier: 'AMBER' },
  { sol: 42, label: 'Sol 42', sub: 'Solar Particle Event (SPE)', tier: 'RED' },
  { sol: 74, label: 'Sol 74', sub: 'Sleep Debt & Fatigue (Active)', tier: 'RED' },
  { sol: 88, label: 'Sol 88', sub: 'Countermeasure Recovery', tier: 'GREEN' },
];

export const MissionSolScrubber: React.FC = () => {
  const { currentSol, setSol } = useConfigStore();
  const [isPlaying, setIsPlaying] = useState(false);
  const playIntervalRef = useRef<number | null>(null);

  useEffect(() => {
    if (isPlaying) {
      playIntervalRef.current = window.setInterval(() => {
        setSol(currentSol >= 90 ? 1 : currentSol + 1);
      }, 750);
    } else {
      if (playIntervalRef.current) clearInterval(playIntervalRef.current);
    }
    return () => {
      if (playIntervalRef.current) clearInterval(playIntervalRef.current);
    };
  }, [isPlaying, currentSol, setSol]);

  const tierColors = {
    GREEN: 'border-bio-green/40 bg-bio-green/10 text-bio-green hover:bg-bio-green/20',
    AMBER: 'border-bio-amber/40 bg-bio-amber/10 text-bio-amber hover:bg-bio-amber/20',
    RED: 'border-bio-red/50 bg-bio-red/10 text-bio-red hover:bg-bio-red/20 shadow-glow-red',
  };

  return (
    <div className="w-full glass-panel p-4 rounded-2xl border border-space-700/60 shadow-xl space-y-3">
      {/* Top Header: Sol info + Playback Controls */}
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-2 bg-space-950/80 px-3 py-1.5 rounded-xl border border-bio-cyan/30 text-xs font-mono">
            <span className="w-2.5 h-2.5 rounded-full bg-bio-cyan animate-ping" />
            <span className="text-slate-400">MISSION DAY:</span>
            <strong className="text-white text-sm font-bold tracking-wider">
              SOL {String(currentSol).padStart(3, '0')}
            </strong>
            <span className="text-slate-500">/ 090</span>
          </div>

          <div className="text-[11px] font-mono text-slate-400 hidden sm:block">
            {currentSol <= 5 && 'Phase 1: Cephalad Fluid Redistribution'}
            {currentSol > 5 && currentSol < 42 && 'Phase 2: Nominal Interplanetary Cruise'}
            {currentSol >= 42 && currentSol <= 44 && '⚠️ Solar Particle Event Coronal Storm'}
            {currentSol > 44 && currentSol < 65 && 'Phase 3: Deep Space Trajectory Cruise'}
            {currentSol >= 65 && currentSol <= 74 && '🚨 Active Multi-System Drift & Sleep Debt'}
            {currentSol > 74 && 'Phase 4: Post-Intervention Recovery'}
          </div>
        </div>

        {/* Play / Pause / Reset button */}
        <div className="flex items-center gap-2">
          <button
            onClick={() => setIsPlaying(!isPlaying)}
            className={`px-3 py-1.5 rounded-lg border text-xs font-mono flex items-center gap-1.5 transition-colors ${
              isPlaying
                ? 'bg-bio-amber/20 border-bio-amber text-bio-amber'
                : 'bg-space-800/80 border-slate-700 text-slate-300 hover:text-white'
            }`}
            title="Auto-advance mission timeline"
          >
            {isPlaying ? <Pause className="w-3.5 h-3.5 fill-current" /> : <Play className="w-3.5 h-3.5 fill-current" />}
            <span>{isPlaying ? 'Pause Sim' : 'Play Sim'}</span>
          </button>

          <button
            onClick={() => {
              setIsPlaying(false);
              setSol(74);
            }}
            className="p-1.5 rounded-lg bg-space-800/80 border border-slate-700 text-slate-400 hover:text-white text-xs font-mono transition-colors"
            title="Reset to Active Incident (Sol 74)"
          >
            <RotateCcw className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>

      {/* Scrubber Range Slider */}
      <div className="relative pt-1 pb-1">
        <input
          type="range"
          min="1"
          max="90"
          value={currentSol}
          onChange={(e) => {
            setIsPlaying(false);
            setSol(parseInt(e.target.value, 10));
          }}
          className="w-full h-2 bg-space-900 rounded-lg appearance-none cursor-pointer accent-bio-cyan border border-slate-700 focus:outline-none focus:ring-2 focus:ring-bio-cyan/40"
        />
        <div className="flex justify-between text-[10px] font-mono text-slate-500 pt-1">
          <span>Sol 01 (Earth Launch)</span>
          <span>Sol 42 (Solar Storm)</span>
          <span>Sol 74 (Sleep Crisis)</span>
          <span>Sol 90 (Mars Orbit Insertion)</span>
        </div>
      </div>

      {/* Incident Quick-Jump Milestones */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 pt-1 border-t border-space-800/80">
        {milestones.map((m) => {
          const isSelected = currentSol === m.sol;
          return (
            <button
              key={m.sol}
              onClick={() => {
                setIsPlaying(false);
                setSol(m.sol);
              }}
              className={`p-2 rounded-xl border text-left transition-all ${
                isSelected
                  ? 'bg-bio-cyan/15 border-bio-cyan text-white shadow-glow-cyan ring-1 ring-bio-cyan'
                  : tierColors[m.tier]
              }`}
            >
              <div className="flex items-center justify-between text-[11px] font-mono font-bold">
                <span>{m.label}</span>
                <span className="text-[9px] uppercase tracking-wider">{m.tier}</span>
              </div>
              <div className="text-[10px] text-slate-300 font-sans truncate mt-0.5">
                {m.sub}
              </div>
            </button>
          );
        })}
      </div>
    </div>
  );
};
