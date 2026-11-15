import React, { useState, useMemo } from 'react';
import {
  ResponsiveContainer,
  AreaChart,
  Area,
  XAxis,
  YAxis,
  Tooltip,
  ReferenceLine,
  CartesianGrid,
} from 'recharts';
import { getAllTelemetryReadings } from '../../database/telemetryService';
import { useConfigStore } from '../../stores/useConfigStore';
import astronautData from '../../data/astronautProfile.json';
import referenceRangesData from '../../data/referenceRanges.json';
import { Activity, Moon, Zap, Radio, Heart, TrendingUp } from 'lucide-react';

type MetricKey =
  | 'restingHR'
  | 'sleepHours'
  | 'pvtReactionTimeMs'
  | 'radiationDoseCum'
  | 'systolicBP'
  | 'bodyMass';

interface MetricOption {
  key: MetricKey;
  label: string;
  unit: string;
  color: string;
  icon: React.ComponentType<{ className?: string; style?: React.CSSProperties }>;
  baselineMean: number;
  baselineStd: number;
  safetyMin: number;
  safetyMax: number;
}

const metricOptions: MetricOption[] = [
  {
    key: 'restingHR',
    label: 'Resting HR',
    unit: 'bpm',
    color: '#00F0FF',
    icon: Heart,
    baselineMean: 54.0,
    baselineStd: 2.8,
    safetyMin: 45,
    safetyMax: 100,
  },
  {
    key: 'sleepHours',
    label: 'Sleep Duration',
    unit: 'hrs',
    color: '#A855F7',
    icon: Moon,
    baselineMean: 6.5,
    baselineStd: 0.6,
    safetyMin: 5.0,
    safetyMax: 9.0,
  },
  {
    key: 'pvtReactionTimeMs',
    label: 'PVT Reaction',
    unit: 'ms',
    color: '#F59E0B',
    icon: Zap,
    baselineMean: 232.0,
    baselineStd: 14.0,
    safetyMin: 180,
    safetyMax: 350,
  },
  {
    key: 'radiationDoseCum',
    label: 'Cumulative Rad',
    unit: 'mSv',
    color: '#EF4444',
    icon: Radio,
    baselineMean: 0,
    baselineStd: 0,
    safetyMin: 0,
    safetyMax: 600,
  },
];

export const TelemetryTrendChart: React.FC = () => {
  const { currentSol, setSol } = useConfigStore();
  const [selectedMetricKey, setSelectedMetricKey] = useState<MetricKey>('restingHR');

  const readings = getAllTelemetryReadings();
  const selectedMetric = metricOptions.find((m) => m.key === selectedMetricKey) || metricOptions[0];

  const chartData = useMemo(() => {
    return readings.map((r) => {
      const val = (r as any)[selectedMetric.key] ?? 0;
      return {
        sol: r.missionDay,
        value: val,
        baselineMean: selectedMetric.baselineMean,
        baselineHigh: selectedMetric.baselineMean + selectedMetric.baselineStd * 1.5,
        baselineLow: Math.max(0, selectedMetric.baselineMean - selectedMetric.baselineStd * 1.5),
      };
    });
  }, [readings, selectedMetric]);

  const currentValue = chartData.find((d) => d.sol === currentSol)?.value ?? 0;
  const delta = Math.round((currentValue - selectedMetric.baselineMean) * 10) / 10;

  return (
    <div className="w-full glass-panel p-5 rounded-2xl border border-space-700/60 shadow-xl space-y-4">
      {/* Header with Title & Metric Selector Pills */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 border-b border-space-800 pb-3">
        <div>
          <div className="flex items-center gap-2">
            <TrendingUp className="w-4 h-4 text-bio-cyan" />
            <h3 className="font-orbitron font-bold text-sm text-white tracking-wider uppercase">
              Mission Telemetry & Dual-Envelope Drift Analysis
            </h3>
          </div>
          <p className="text-[11px] text-slate-400 mt-0.5">
            Compare 90-sol mission readings vs Personal Baseline ($\mu \pm 1.5\sigma$) & NASA-STD-3001 Safety Limits
          </p>
        </div>

        {/* Metric Selector Buttons */}
        <div className="flex flex-wrap items-center gap-1.5">
          {metricOptions.map((opt) => {
            const Icon = opt.icon;
            const isSelected = opt.key === selectedMetricKey;
            return (
              <button
                key={opt.key}
                onClick={() => setSelectedMetricKey(opt.key)}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-mono transition-all ${
                  isSelected
                    ? 'bg-bio-cyan/20 border border-bio-cyan text-white shadow-glow-cyan'
                    : 'bg-space-900/80 border border-slate-800 text-slate-400 hover:text-slate-200 hover:border-slate-700'
                }`}
              >
                <Icon className="w-3.5 h-3.5" style={{ color: isSelected ? opt.color : undefined }} />
                <span>{opt.label}</span>
              </button>
            );
          })}
        </div>
      </div>

      {/* Live Reading Summary Banner for Current Sol */}
      <div className="flex flex-wrap items-center justify-between gap-3 bg-space-950/60 p-3 rounded-xl border border-slate-800/80 text-xs font-mono">
        <div className="flex items-center gap-4">
          <div>
            <span className="text-slate-400 text-[10px] block">CURRENT (SOL {currentSol})</span>
            <strong className="text-white text-base font-bold" style={{ color: selectedMetric.color }}>
              {currentValue} <span className="text-xs font-normal text-slate-400">{selectedMetric.unit}</span>
            </strong>
          </div>

          <div className="border-l border-slate-800 pl-4">
            <span className="text-slate-400 text-[10px] block">PERSONAL BASELINE</span>
            <span className="text-slate-200">
              {selectedMetric.baselineMean} {selectedMetric.unit} (±{selectedMetric.baselineStd})
            </span>
          </div>

          <div className="border-l border-slate-800 pl-4">
            <span className="text-slate-400 text-[10px] block">DRIFT DELTA</span>
            <span
              className={`font-bold ${
                Math.abs(delta) > selectedMetric.baselineStd * 1.5 ? 'text-bio-amber' : 'text-bio-green'
              }`}
            >
              {delta > 0 ? `+${delta}` : delta} {selectedMetric.unit}
            </span>
          </div>
        </div>

        <div className="text-[10px] text-slate-400">
          Click any point on graph to scrub to that Sol
        </div>
      </div>

      {/* Interactive Recharts Graph */}
      <div className="w-full h-64 sm:h-72">
        <ResponsiveContainer width="100%" height="100%">
          <AreaChart
            data={chartData}
            onClick={(state) => {
              if (state && state.activeLabel !== undefined) {
                setSol(Number(state.activeLabel));
              }
            }}
            margin={{ top: 10, right: 10, left: -10, bottom: 0 }}
          >
            <defs>
              <linearGradient id="metricGradient" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor={selectedMetric.color} stopOpacity={0.45} />
                <stop offset="95%" stopColor={selectedMetric.color} stopOpacity={0.02} />
              </linearGradient>
            </defs>
            <CartesianGrid strokeDasharray="3 3" stroke="#1E293B" opacity={0.6} />
            <XAxis
              dataKey="sol"
              stroke="#64748B"
              fontSize={11}
              fontFamily="JetBrains Mono"
              tickLine={false}
              tickFormatter={(v) => `S${v}`}
            />
            <YAxis
              stroke="#64748B"
              fontSize={11}
              fontFamily="JetBrains Mono"
              tickLine={false}
              domain={['auto', 'auto']}
            />
            <Tooltip
              content={({ active, payload }) => {
                if (active && payload && payload.length) {
                  const data = payload[0].payload;
                  return (
                    <div className="glass-panel p-2.5 rounded-lg border border-slate-700 text-xs font-mono shadow-2xl">
                      <div className="text-bio-cyan font-bold">SOL {data.sol}</div>
                      <div className="text-white mt-1">
                        {selectedMetric.label}:{' '}
                        <strong style={{ color: selectedMetric.color }}>
                          {data.value} {selectedMetric.unit}
                        </strong>
                      </div>
                      <div className="text-slate-400 text-[10px]">
                        Base: {data.baselineMean} {selectedMetric.unit}
                      </div>
                    </div>
                  );
                }
                return null;
              }}
            />
            {/* Shaded Personal Baseline Range */}
            {selectedMetric.baselineStd > 0 && (
              <>
                <ReferenceLine
                  y={selectedMetric.baselineMean + selectedMetric.baselineStd * 1.5}
                  stroke="#38BDF8"
                  strokeDasharray="4 4"
                  strokeOpacity={0.5}
                />
                <ReferenceLine
                  y={Math.max(0, selectedMetric.baselineMean - selectedMetric.baselineStd * 1.5)}
                  stroke="#38BDF8"
                  strokeDasharray="4 4"
                  strokeOpacity={0.5}
                />
              </>
            )}
            {/* Active Sol Marker Line */}
            <ReferenceLine
              x={currentSol}
              stroke="#F59E0B"
              strokeWidth={2}
              strokeDasharray="3 3"
              label={{
                value: `Sol ${currentSol}`,
                position: 'top',
                fill: '#F59E0B',
                fontSize: 10,
                fontFamily: 'JetBrains Mono',
              }}
            />
            <Area
              type="monotone"
              dataKey="value"
              stroke={selectedMetric.color}
              strokeWidth={2.5}
              fillOpacity={1}
              fill="url(#metricGradient)"
            />
          </AreaChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
};
