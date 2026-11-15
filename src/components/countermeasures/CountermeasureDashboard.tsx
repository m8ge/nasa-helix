import React, { useState } from 'react';
import countermeasuresData from '../../data/countermeasures.json';
import { useTwinStore } from '../../stores/useTwinStore';
import { Shield, CheckCircle2, Circle, Dumbbell, Activity, Sun, Droplets, Radio, BookOpen, Sparkles } from 'lucide-react';

interface QuestItem {
  id: string;
  title: string;
  targetSystem: string;
  category: string;
  durationMinutes: number;
  description: string;
  shieldContribution: string;
  shieldPoints: number;
  source: string;
}

const questIcons: Record<string, React.ComponentType<{ className?: string }>> = {
  exercise: Dumbbell,
  sleep_hygiene: Sun,
  hydration: Droplets,
  radiation_safety: Radio,
  behavioral_health: BookOpen,
};

export const CountermeasureDashboard: React.FC = () => {
  const { shieldGlows, setShieldGlow } = useTwinStore();
  const [completedQuestIds, setCompletedQuestIds] = useState<Record<string, boolean>>({
    quest_cevis_cardio: true,
  });

  const quests = countermeasuresData.quests as unknown as QuestItem[];

  const toggleQuest = (q: QuestItem) => {
    const isCompleted = !!completedQuestIds[q.id];
    setCompletedQuestIds((prev) => ({
      ...prev,
      [q.id]: !isCompleted,
    }));

    // Increment shield levels
    const shieldKey = q.shieldContribution as keyof typeof shieldGlows;
    if (shieldKey && shieldGlows[shieldKey] !== undefined) {
      const currentLevel = shieldGlows[shieldKey];
      const delta = isCompleted ? -q.shieldPoints : q.shieldPoints;
      const newLevel = Math.max(10, Math.min(100, currentLevel + delta));
      setShieldGlow(shieldKey, newLevel);
    }
  };

  const shieldColors: Record<string, { label: string; color: string; border: string }> = {
    cardiovascular: { label: 'Cardiovascular Shield', color: 'from-red-500 to-rose-600', border: 'border-rose-500/30' },
    musculoskeletal: { label: 'Musculoskeletal Shield', color: 'from-amber-500 to-yellow-600', border: 'border-amber-500/30' },
    neuro_behavioral: { label: 'Neuro-Behavioral Shield', color: 'from-purple-500 to-indigo-600', border: 'border-purple-500/30' },
    immune: { label: 'Immune / Radiation Shield', color: 'from-cyan-500 to-blue-600', border: 'border-cyan-500/30' },
  };

  return (
    <div className="w-full glass-panel p-5 rounded-2xl border border-space-700/60 shadow-xl space-y-5">
      {/* Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2 border-b border-space-800 pb-3">
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-xl bg-bio-green/10 border border-bio-green/40 flex items-center justify-center text-bio-green shadow-glow-green">
            <Shield className="w-4 h-4" />
          </div>
          <div>
            <h3 className="font-orbitron font-bold text-sm text-white tracking-wider uppercase">
              Autonomous Flight Countermeasures & Bio-Shield Systems
            </h3>
            <p className="text-[11px] text-slate-400">
              NASA-STD-3001 Prescribed Daily Protocols to Inhibit Microgravity Deconditioning
            </p>
          </div>
        </div>

        <span className="text-[10px] font-mono px-2.5 py-1 rounded-full bg-space-900 border border-slate-700 text-slate-300">
          DAILY QUOTA: {Object.values(completedQuestIds).filter(Boolean).length} / {quests.length} LOGGED
        </span>
      </div>

      {/* 4 Bio-Shield Health Gauges */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
        {Object.entries(shieldGlows).map(([key, level]) => {
          const cfg = shieldColors[key] || {
            label: key,
            color: 'from-cyan-500 to-blue-600',
            border: 'border-cyan-500/30',
          };
          return (
            <div
              key={key}
              className={`bg-space-950/70 p-3 rounded-xl border ${cfg.border} space-y-1.5`}
            >
              <div className="flex items-center justify-between text-xs font-mono">
                <span className="text-slate-300 text-[11px] truncate">{cfg.label}</span>
                <strong className="text-white font-bold">{level}%</strong>
              </div>
              {/* Progress track */}
              <div className="w-full h-2 bg-space-900 rounded-full overflow-hidden border border-slate-800">
                <div
                  className={`h-full bg-gradient-to-r ${cfg.color} transition-all duration-500`}
                  style={{ width: `${level}%` }}
                />
              </div>
            </div>
          );
        })}
      </div>

      {/* Prescribed Countermeasure Checklist */}
      <div className="space-y-2.5">
        <h4 className="text-xs font-mono font-semibold text-slate-300 uppercase tracking-wider flex items-center gap-2">
          <span>Active Onboard Flight Prescriptions</span>
          <span className="text-[10px] text-slate-500 font-normal">(Click to complete & recharge shield)</span>
        </h4>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-2.5">
          {quests.map((q) => {
            const isCompleted = !!completedQuestIds[q.id];
            const Icon = questIcons[q.category] || Activity;

            return (
              <div
                key={q.id}
                onClick={() => toggleQuest(q)}
                className={`p-3.5 rounded-xl border transition-all cursor-pointer select-none flex items-start gap-3 ${
                  isCompleted
                    ? 'bg-bio-green/10 border-bio-green/40 shadow-glow-green/30'
                    : 'bg-space-900/70 border-slate-800 hover:border-slate-700 hover:bg-space-900'
                }`}
              >
                <div className="mt-0.5">
                  {isCompleted ? (
                    <CheckCircle2 className="w-5 h-5 text-bio-green fill-bio-green/20" />
                  ) : (
                    <Circle className="w-5 h-5 text-slate-500" />
                  )}
                </div>

                <div className="flex-1 space-y-1">
                  <div className="flex items-center justify-between">
                    <h5 className={`text-xs font-bold font-sans ${isCompleted ? 'text-bio-green line-through' : 'text-white'}`}>
                      {q.title}
                    </h5>
                    <span className="text-[10px] font-mono px-1.5 py-0.5 rounded bg-space-950 text-slate-300 border border-slate-800">
                      {q.durationMinutes}m
                    </span>
                  </div>

                  <p className="text-[11px] text-slate-300 leading-snug">
                    {q.description}
                  </p>

                  <div className="flex items-center justify-between text-[10px] font-mono pt-1 text-slate-400">
                    <span className="text-bio-cyan uppercase">+{q.shieldPoints} pts ({q.shieldContribution})</span>
                    <span className="truncate max-w-[180px]">{q.source.split('(')[0]}</span>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};
