import React from 'react';
import { useConfigStore } from '../../stores/useConfigStore';
import { EnvironmentModeId } from '../../types/environment';
import environmentsData from '../../data/environments.json';
import { Radio, Orbit, Clock, ShieldAlert, Cpu, Compass } from 'lucide-react';

interface Preset {
  id: EnvironmentModeId;
  name: string;
  distanceKm: number;
  label: string;
}

const presets: Preset[] = [
  { id: 'iss', name: 'LEO (ISS)', distanceKm: 408, label: 'Real-Time (<1s)' },
  { id: 'lunar_base', name: 'Lunar Base', distanceKm: 384400, label: '2.6s Delay' },
  { id: 'deep_space_transit', name: 'Mars Transit', distanceKm: 225000000, label: '+21m 14s' },
  { id: 'mars_habitat', name: 'Mars Conjunction', distanceKm: 390000000, label: '+43m 22s' },
];

export const EarthDistanceSimulator: React.FC = () => {
  const { earthDistanceKm, commDelaySeconds, setEarthDistance, environmentMode, setEnvironmentMode } =
    useConfigStore();

  const isHighDelay = commDelaySeconds >= 120; // 2 minutes

  const formatDelay = (seconds: number) => {
    if (seconds < 2) return 'Real-Time (< 1s)';
    if (seconds < 60) return `${seconds.toFixed(1)}s (Round-Trip)`;
    const mins = Math.floor(seconds / 60);
    const secs = Math.round(seconds % 60);
    return `+${mins}m ${secs}s (One-Way)`;
  };

  const handlePreset = (p: Preset) => {
    setEnvironmentMode(p.id); // sets commDelaySeconds from JSON data
    setEarthDistance(p.distanceKm); // syncs the slider position
  };

  return (
    <div className="w-full glass-panel p-5 rounded-2xl border border-space-700/60 shadow-xl space-y-4">
      {/* Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2 border-b border-space-800 pb-3">
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-xl bg-bio-cyan/10 border border-bio-cyan/40 flex items-center justify-center text-bio-cyan shadow-glow-cyan">
            <Orbit className="w-4 h-4" />
          </div>
          <div>
            <h3 className="font-orbitron font-bold text-sm text-white tracking-wider uppercase">
              Deep-Space Comm Delay & Autonomy Engine
            </h3>
            <p className="text-[11px] text-slate-400">
              NASA HRP Exploration Medical Capability (ExMC) Speed-of-Light Latency Simulator
            </p>
          </div>
        </div>

        <div className="flex items-center gap-1.5 bg-space-950 px-3 py-1 rounded-xl border border-slate-800 text-xs font-mono">
          <Clock className="w-3.5 h-3.5 text-bio-cyan" />
          <span className="text-slate-400">LATENCY:</span>
          <strong className="text-bio-cyan">{formatDelay(commDelaySeconds)}</strong>
        </div>
      </div>

      {/* Preset Station Buttons */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
        {presets.map((p) => {
          const isSelected = environmentMode === p.id;
          return (
            <button
              key={p.id}
              onClick={() => handlePreset(p)}
              className={`p-2.5 rounded-xl border text-left transition-all ${
                isSelected
                  ? 'bg-bio-cyan/20 border-bio-cyan text-white shadow-glow-cyan ring-1 ring-bio-cyan'
                  : 'bg-space-950/70 border-slate-800 text-slate-400 hover:text-white hover:border-slate-700'
              }`}
            >
              <div className="text-xs font-mono font-bold text-white">{p.name}</div>
              <div className="text-[10px] font-mono text-bio-cyan mt-0.5">{p.label}</div>
            </button>
          );
        })}
      </div>

      {/* Distance Slider */}
      <div className="space-y-1.5 bg-space-950/60 p-3 rounded-xl border border-slate-800/80">
        <div className="flex items-center justify-between text-xs font-mono">
          <span className="text-slate-400">SPACECRAFT DISTANCE FROM EARTH:</span>
          <strong className="text-white font-mono">
            {(earthDistanceKm / 1000000).toFixed(1)} Million km
          </strong>
        </div>
        <input
          type="range"
          min="400"
          max="400000000"
          step="1000000"
          value={earthDistanceKm}
          onChange={(e) => setEarthDistance(parseFloat(e.target.value))}
          className="w-full h-2 bg-space-900 rounded-lg appearance-none cursor-pointer accent-bio-cyan border border-slate-700 focus:outline-none"
        />
        <div className="flex justify-between text-[10px] font-mono text-slate-500">
          <span>0M km (Earth)</span>
          <span>150M km</span>
          <span>225M km (Mars Average)</span>
          <span>400M km (Max Conjunction)</span>
        </div>
      </div>

      {/* Dynamic Clinical Autonomy Guidance Protocol Banner */}
      <div
        className={`p-3.5 rounded-xl border flex items-start gap-3 transition-colors ${
          isHighDelay
            ? 'bg-bio-amber/10 border-bio-amber/30 text-amber-100'
            : 'bg-bio-green/10 border-bio-green/30 text-emerald-100'
        }`}
      >
        <div className="mt-0.5">
          {isHighDelay ? (
            <Cpu className="w-5 h-5 text-bio-amber" />
          ) : (
            <Radio className="w-5 h-5 text-bio-green" />
          )}
        </div>
        <div className="space-y-0.5">
          <div className="flex items-center gap-2 font-mono text-xs font-bold uppercase tracking-wider">
            <span>
              {isHighDelay
                ? 'AUTONOMOUS CLINICAL PROTOCOL ACTIVE (Deep Space)'
                : 'REAL-TIME GROUND CLINICAL TELE-CONSULT ACTIVE (LEO)'}
            </span>
          </div>
          <p className="text-xs text-slate-300 leading-snug">
            {isHighDelay
              ? `One-way comm delay to Houston Mission Control is ${formatDelay(
                  commDelaySeconds
                )}. Real-time tele-medicine is physically impossible. HELIX executes autonomous decision-support checklists locally without waiting for ground authorization.`
              : 'Direct bidirectional S-band radio connection with NASA Flight Surgeon available in real-time. Ground medical director directs all clinical interventions.'}
          </p>
        </div>
      </div>
    </div>
  );
};
