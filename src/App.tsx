  import React, { useEffect, useState, useCallback } from 'react';
import { bootstrapTelemetry, getTelemetryForSol, getIncidentForSol, updateTelemetryReading } from './database/telemetryService';
import { BiometricReading } from './types/telemetry';
import { HazardLens } from './components/twin/HazardLens';
import { DigitalTwinContainer } from './components/twin/DigitalTwinContainer';
import { SystemDetailDrawer } from './components/twin/SystemDetailDrawer';
import { MissionSolScrubber } from './components/timeline/MissionSolScrubber';
import { TelemetryTrendChart } from './components/charts/TelemetryTrendChart';
import { CountermeasureDashboard } from './components/countermeasures/CountermeasureDashboard';
import { EarthDistanceSimulator } from './components/comm/EarthDistanceSimulator';
import { PvtTestModal } from './components/diagnostics/PvtTestModal';
import { HowToMeasureModal } from './components/diagnostics/HowToMeasureModal';
import { useConfigStore } from './stores/useConfigStore';
import { useTwinStore } from './stores/useTwinStore';
import astronautData from './data/astronautProfile.json';
import {
  Radio,
  Moon,
  Sun,
  ShieldCheck,
  AlertTriangle,
  Clock,
  Zap,
  Info,
} from 'lucide-react';

export default function App() {
  const { currentSol, environmentMode, dimCabinNightMode, toggleNightMode, commDelaySeconds } =
    useConfigStore();
  const { pulseBpm, breathingRateRpm, setPulseBpm } = useTwinStore();

  const [reading, setReading] = useState<BiometricReading>(() => getTelemetryForSol(currentSol));
  const [isPvtOpen, setIsPvtOpen] = useState(false);
  const [measuringMetricId, setMeasuringMetricId] = useState<string | null>(null);

  const astronaut = astronautData.astronaut;
  const incident = getIncidentForSol(currentSol);

  // Sync reading when Sol changes
  useEffect(() => {
    const cur = getTelemetryForSol(currentSol);
    setReading(cur);
    if (cur.restingHR) {
      setPulseBpm(Math.round(cur.restingHR));
    }
  }, [currentSol, setPulseBpm]);

  // Bootstrap DB in background
  useEffect(() => {
    bootstrapTelemetry().then(() => {
      const cur = getTelemetryForSol(currentSol);
      setReading(cur);
    });
  }, [currentSol]);

  const handlePvtComplete = useCallback(
    async (medianMs: number, lapses: number) => {
      await updateTelemetryReading(currentSol, {
        pvtReactionTimeMs: medianMs,
        pvtLapses: lapses,
        sourceType: 'manual_entry',
      });
      setReading(getTelemetryForSol(currentSol));
    },
    [currentSol]
  );

  const formatDelay = (seconds: number) => {
    if (seconds < 2) return '< 1s';
    if (seconds < 60) return `${seconds.toFixed(0)}s`;
    const mins = Math.floor(seconds / 60);
    const secs = Math.round(seconds % 60);
    return `+${mins}m ${secs}s`;
  };

  const tierStyles = {
    GREEN: {
      border: 'border-bio-green/40',
      badge: 'bg-bio-green/20 text-bio-green border-bio-green/40',
      glow: 'shadow-glow-green/20',
      dot: 'bg-bio-green',
    },
    AMBER: {
      border: 'border-bio-amber/40',
      badge: 'bg-bio-amber/20 text-bio-amber border-bio-amber/40',
      glow: 'shadow-glow-amber/20',
      dot: 'bg-bio-amber',
    },
    RED: {
      border: 'border-bio-red/50',
      badge: 'bg-bio-red/20 text-bio-red border-bio-red/40',
      glow: 'shadow-glow-red/30',
      dot: 'bg-bio-red',
    },
  };

  const currentTierStyle = tierStyles[incident.tier] || tierStyles.GREEN;

  return (
    <div
      className={`min-h-screen flex flex-col transition-colors duration-500 ${
        dimCabinNightMode ? 'bg-[#0E0404] text-red-100' : 'bg-space-950 text-slate-100'
      }`}
    >
      {/* TOP MISSION HUD BAR */}
      <header
        className={`border-b px-4 lg:px-8 py-3 flex items-center justify-between backdrop-blur-xl sticky top-0 z-30 transition-colors ${
          dimCabinNightMode
            ? 'bg-[#180808]/90 border-red-900/40 text-red-200'
            : 'bg-space-900/90 border-space-700/60'
        }`}
      >
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-full border border-bio-cyan flex items-center justify-center text-bio-cyan shadow-glow-cyan">
            <Radio className="w-4 h-4 animate-pulse" />
          </div>
          <div>
            <h1 className="font-orbitron font-bold tracking-wider text-sm sm:text-base text-white flex items-center gap-2">
              HELIX <span className="text-bio-cyan text-xs font-normal font-mono">// NASA HRP DIGITAL TWIN</span>
            </h1>
            <p className="text-[11px] text-slate-400 font-mono">
              {astronaut.callsign} • {astronaut.fullName} ({astronaut.spacecraft})
            </p>
          </div>
        </div>

        {/* Central HUD Status */}
        <div className="hidden md:flex items-center gap-4 text-xs font-mono">
          <div className="flex items-center gap-2 bg-space-950/80 px-3 py-1.5 rounded-lg border border-slate-800">
            <span className={`w-2.5 h-2.5 rounded-full ${currentTierStyle.dot} animate-ping`} />
            <span className="text-slate-400">MISSION DAY:</span>
            <strong className="text-white">SOL {String(currentSol).padStart(3, '0')} / 090</strong>
          </div>

          <div className="flex items-center gap-2 bg-space-950/80 px-3 py-1.5 rounded-lg border border-slate-800 text-slate-300">
            <Clock className="w-3.5 h-3.5 text-bio-cyan" />
            <span>COMM DELAY:</span>
            <span className="text-bio-cyan font-bold">{formatDelay(commDelaySeconds)}</span>
          </div>

          <span className={`text-[10px] font-mono px-2 py-0.5 rounded border uppercase ${currentTierStyle.badge}`}>
            TIER: {incident.tier}
          </span>
        </div>

        {/* Right Action buttons */}
        <div className="flex items-center gap-2">
          {/* PVT Quick Test Trigger */}
          <button
            onClick={() => setIsPvtOpen(true)}
            className="px-3 py-1.5 rounded-lg bg-bio-cyan text-space-950 font-orbitron font-bold text-xs hover:bg-bio-cyan/80 shadow-glow-cyan transition-all flex items-center gap-1.5"
            title="Launch 60-Second NASA PVT Reaction Test"
          >
            <Zap className="w-3.5 h-3.5 fill-current" />
            <span className="hidden sm:inline">RUN PVT TEST</span>
            <span className="sm:hidden">PVT</span>
          </button>

          {/* Dim Cabin Night Mode Toggle */}
          <button
            onClick={toggleNightMode}
            className={`p-2 rounded-lg border text-xs font-mono flex items-center gap-1.5 transition-colors ${
              dimCabinNightMode
                ? 'bg-red-500/20 border-red-500 text-red-200'
                : 'bg-space-800/80 border-slate-700 text-slate-300 hover:text-white'
            }`}
            title="NASA-STD-3001 630nm Red-Shift Light Mode (Melatonin Preservation)"
          >
            {dimCabinNightMode ? <Sun className="w-4 h-4 text-bio-night" /> : <Moon className="w-4 h-4 text-bio-cyan" />}
            <span className="hidden lg:inline">{dimCabinNightMode ? 'Cabin Light' : 'Dim Cabin'}</span>
          </button>
        </div>
      </header>

      {/* MAIN VIEWPORT */}
      <main className="flex-1 p-4 lg:p-6 max-w-7xl mx-auto w-full space-y-6">
        {/* 1. MISSION SOL SCRUBBER & TIMELINE */}
        <section className="w-full">
          <MissionSolScrubber />
        </section>

        {/* 2. NASA 5 HAZARDS (RIDGE) LENS RING */}
        <section className="w-full">
          <HazardLens />
        </section>

        {/* 3. CORE DUAL-COLUMN VIEWPORT: DIGITAL TWIN & BIOMETRICS HUD */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
          {/* LEFT 7 COLS: Living Anatomical Twin */}
          <div className="lg:col-span-7 flex flex-col items-center space-y-3">
            <DigitalTwinContainer
              pulseBpm={reading?.restingHR ? Math.round(reading.restingHR) : pulseBpm}
              breathingRate={breathingRateRpm}
            />

            {/* Quick Helper Banner */}
            <div className="w-full glass-panel px-4 py-2.5 rounded-xl border border-slate-800 flex items-center justify-between text-xs font-mono text-slate-400">
              <span className="flex items-center gap-1.5 text-bio-cyan">
                <Info className="w-3.5 h-3.5" /> Interactive Blueprint
              </span>
              <span>Click any labeled organ node to open physiological deep-dive</span>
            </div>
          </div>

          {/* RIGHT 5 COLS: Active Mission Status & Key Biomarkers */}
          <div className="lg:col-span-5 space-y-4">
            {/* Dynamic Mission Day Incident Status Banner */}
            <div className={`glass-panel p-4 rounded-xl border ${currentTierStyle.border} ${currentTierStyle.glow} space-y-2.5 transition-all`}>
              <div className="flex items-center justify-between">
                <span className="text-[11px] font-mono flex items-center gap-1.5 text-slate-300 font-bold">
                  <AlertTriangle className="w-3.5 h-3.5 text-bio-amber" /> {incident.tag}
                </span>
                <span className={`text-[10px] font-mono px-2 py-0.5 rounded border uppercase ${currentTierStyle.badge}`}>
                  TIER: {incident.tier}
                </span>
              </div>

              <h3 className="font-orbitron font-bold text-base text-white leading-snug">
                {incident.title}
              </h3>

              <p className="text-xs text-slate-300 leading-relaxed">
                {incident.description}
              </p>

              <div className="pt-2 border-t border-slate-800/80 text-[11px] font-mono text-bio-cyan flex items-start gap-1.5">
                <ShieldCheck className="w-4 h-4 shrink-0 text-bio-green mt-0.5" />
                <span>
                  <strong className="text-white">CLINICAL DIRECTIVE:</strong> {incident.actionGuidance}
                </span>
              </div>
            </div>

            {/* 4 Primary Biometric Cards with (i) Clinical Protocol Buttons */}
            <div className="grid grid-cols-2 gap-3">
              {/* Card 1: Resting HR */}
              <div className="glass-panel p-3.5 rounded-xl border border-slate-800 relative group hover:border-bio-cyan/40 transition-colors">
                <div className="flex items-center justify-between">
                  <span className="text-[11px] font-mono text-slate-400">RESTING HR</span>
                  <button
                    onClick={() => setMeasuringMetricId('restingHR')}
                    className="p-1 text-slate-400 hover:text-bio-cyan transition-colors"
                    title="View NASA Onboard Measurement Protocol"
                  >
                    <Info className="w-3.5 h-3.5" />
                  </button>
                </div>
                <div className="text-2xl font-bold font-mono text-bio-cyan flex items-baseline gap-1 mt-1">
                  {reading?.restingHR} <span className="text-[11px] text-slate-400">bpm</span>
                </div>
                <div className="text-[10px] font-mono text-slate-400 mt-1 flex items-center justify-between">
                  <span>Base: 54.0 bpm</span>
                  <span className={reading?.restingHR > 60 ? 'text-bio-amber font-bold' : 'text-bio-green'}>
                    {reading?.restingHR > 54 ? `+${(reading.restingHR - 54).toFixed(1)}` : '0.0'}
                  </span>
                </div>
              </div>

              {/* Card 2: Sleep Duration */}
              <div className="glass-panel p-3.5 rounded-xl border border-slate-800 relative group hover:border-bio-cyan/40 transition-colors">
                <div className="flex items-center justify-between">
                  <span className="text-[11px] font-mono text-slate-400">SLEEP DURATION</span>
                  <button
                    onClick={() => setMeasuringMetricId('sleepHours')}
                    className="p-1 text-slate-400 hover:text-bio-cyan transition-colors"
                    title="View NASA Onboard Measurement Protocol"
                  >
                    <Info className="w-3.5 h-3.5" />
                  </button>
                </div>
                <div className="text-2xl font-bold font-mono text-purple-400 flex items-baseline gap-1 mt-1">
                  {reading?.sleepHours} <span className="text-[11px] text-slate-400">hrs</span>
                </div>
                <div className="text-[10px] font-mono text-slate-400 mt-1 flex items-center justify-between">
                  <span>Base: 6.5 hrs</span>
                  <span className={reading?.sleepHours < 5.5 ? 'text-bio-red font-bold' : 'text-bio-green'}>
                    {reading?.sleepHours < 6.5 ? `-${(6.5 - reading.sleepHours).toFixed(1)}h` : 'Optimal'}
                  </span>
                </div>
              </div>

              {/* Card 3: PVT Reaction Time */}
              <div className="glass-panel p-3.5 rounded-xl border border-slate-800 relative group hover:border-bio-cyan/40 transition-colors">
                <div className="flex items-center justify-between">
                  <span className="text-[11px] font-mono text-slate-400">PVT REACTION TIME</span>
                  <div className="flex items-center gap-1">
                    <button
                      onClick={() => setIsPvtOpen(true)}
                      className="text-[9px] font-mono text-bio-amber hover:underline px-1 py-0.5 rounded bg-bio-amber/10 border border-bio-amber/30"
                      title="Run Interactive PVT Test"
                    >
                      Test
                    </button>
                    <button
                      onClick={() => setMeasuringMetricId('pvtReactionTimeMs')}
                      className="p-1 text-slate-400 hover:text-bio-cyan transition-colors"
                      title="View NASA Onboard Measurement Protocol"
                    >
                      <Info className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
                <div className="text-2xl font-bold font-mono text-bio-amber flex items-baseline gap-1 mt-1">
                  {reading?.pvtReactionTimeMs} <span className="text-[11px] text-slate-400">ms</span>
                </div>
                <div className="text-[10px] font-mono text-slate-400 mt-1 flex items-center justify-between">
                  <span>Base: 232 ms</span>
                  <span className={reading?.pvtLapses > 0 ? 'text-bio-red font-bold' : 'text-slate-400'}>
                    Lapses: {reading?.pvtLapses}
                  </span>
                </div>
              </div>

              {/* Card 4: Cumulative Radiation */}
              <div className="glass-panel p-3.5 rounded-xl border border-slate-800 relative group hover:border-bio-cyan/40 transition-colors">
                <div className="flex items-center justify-between">
                  <span className="text-[11px] font-mono text-slate-400">CUMULATIVE DOSE</span>
                  <button
                    onClick={() => setMeasuringMetricId('radiationDoseCum')}
                    className="p-1 text-slate-400 hover:text-bio-cyan transition-colors"
                    title="View NASA Onboard Measurement Protocol"
                  >
                    <Info className="w-3.5 h-3.5" />
                  </button>
                </div>
                <div className="text-2xl font-bold font-mono text-bio-red flex items-baseline gap-1 mt-1">
                  {reading?.radiationDoseCum} <span className="text-[11px] text-slate-400">mSv</span>
                </div>
                <div className="text-[10px] font-mono text-slate-400 mt-1 flex items-center justify-between">
                  <span>Rate: {reading?.radiationDailyRate} mSv/d</span>
                  <span className="text-slate-400">Limit: 600 mSv</span>
                </div>
              </div>
            </div>

            {/* Secondary Vitals Strip: BP, Temp, Glucose, SpO2 */}
            <div className="grid grid-cols-4 gap-2 bg-space-950/70 p-3 rounded-xl border border-slate-800 text-center font-mono">
              <div
                className="cursor-pointer hover:bg-space-900/80 p-1 rounded transition-colors"
                onClick={() => setMeasuringMetricId('systolicBP')}
                title="Click for Onboard Measurement Protocol"
              >
                <span className="text-[10px] text-slate-400 block">BLOOD PRESS</span>
                <strong className="text-xs text-white">
                  {reading?.systolicBP}/{reading?.diastolicBP}
                </strong>
                <span className="text-[9px] text-slate-500 block">mmHg</span>
              </div>

              <div
                className="cursor-pointer hover:bg-space-900/80 p-1 rounded transition-colors"
                onClick={() => setMeasuringMetricId('bodyTemp')}
                title="Click for Onboard Measurement Protocol"
              >
                <span className="text-[10px] text-slate-400 block">BODY TEMP</span>
                <strong className="text-xs text-white">{reading?.bodyTemp}°C</strong>
                <span className="text-[9px] text-slate-500 block">Core</span>
              </div>

              <div
                className="cursor-pointer hover:bg-space-900/80 p-1 rounded transition-colors"
                onClick={() => setMeasuringMetricId('spO2')}
                title="Click for Onboard Measurement Protocol"
              >
                <span className="text-[10px] text-slate-400 block">PULSE SpO2</span>
                <strong className="text-xs text-bio-green">{reading?.spO2}%</strong>
                <span className="text-[9px] text-slate-500 block">O2 Sat</span>
              </div>

              <div
                className="cursor-pointer hover:bg-space-900/80 p-1 rounded transition-colors"
                onClick={() => setMeasuringMetricId('bloodGlucose')}
                title="Click for Onboard Measurement Protocol"
              >
                <span className="text-[10px] text-slate-400 block">GLUCOSE</span>
                <strong className="text-xs text-white">{reading?.bloodGlucose}</strong>
                <span className="text-[9px] text-slate-500 block">mg/dL</span>
              </div>
            </div>

            {/* Quick Interactive Call to Action Banner */}
            <div className="glass-panel p-3.5 rounded-xl border border-bio-cyan/20 flex items-center justify-between">
              <div className="space-y-0.5">
                <span className="text-xs font-bold font-mono text-bio-cyan flex items-center gap-1.5">
                  <Zap className="w-3.5 h-3.5" /> Astronaut Cognitive Vigilance Test
                </span>
                <p className="text-[11px] text-slate-300">
                  Execute the 60s PVT micro-test to detect attention lapses in real time.
                </p>
              </div>
              <button
                onClick={() => setIsPvtOpen(true)}
                className="px-3 py-1.5 rounded-lg bg-space-800 border border-bio-cyan/40 text-bio-cyan hover:bg-bio-cyan hover:text-space-950 font-mono text-xs font-bold transition-all shrink-0 ml-3"
              >
                Launch
              </button>
            </div>
          </div>
        </div>

        {/* 4. TELEMETRY TRENDS & DUAL-ENVELOPE DRIFT CHARTS (RECHARTS) */}
        <section className="w-full">
          <TelemetryTrendChart />
        </section>

        {/* 5. BIO-SHIELD & AUTONOMOUS COUNTERMEASURES DASHBOARD */}
        <section className="w-full">
          <CountermeasureDashboard />
        </section>

        {/* 6. SPEED-OF-LIGHT COMM DELAY & AUTONOMY ENGINE */}
        <section className="w-full">
          <EarthDistanceSimulator />
        </section>
      </main>

      {/* SLIDE-OUT ANATOMICAL SUBSYSTEM DRAWER */}
      <SystemDetailDrawer
        latestReading={reading}
        onOpenHowToMeasure={(metricId) => setMeasuringMetricId(metricId)}
      />

      {/* HOW TO MEASURE ONBOARD CLINICAL MODAL */}
      <HowToMeasureModal
        metricId={measuringMetricId}
        onClose={() => setMeasuringMetricId(null)}
      />

      {/* 60-SECOND PVT COGNITIVE REACTION TEST MODAL */}
      <PvtTestModal
        isOpen={isPvtOpen}
        onClose={() => setIsPvtOpen(false)}
        missionDay={currentSol}
        onTestComplete={handlePvtComplete}
      />

      {/* FOOTER DISCLAIMER */}
      <footer className="border-t border-space-800/80 bg-space-950/90 px-6 py-3 text-center text-xs text-slate-400 space-y-1">
        <div>
          <span className="text-bio-amber font-medium">NASA HRP PROTOCOL NOTICE:</span> HELIX is an operational decision-support prototype for deep-space interplanetary exploration. Escalation guidance defaults to contacting the Flight Surgeon.
        </div>
        <div className="text-[10px] font-mono text-slate-500">
          Standard: NASA-STD-3001 Vol 1 & 2 • Offline-First Dexie Storage • Fully Hostable on Netlify
        </div>
      </footer>
    </div>
  );
}
