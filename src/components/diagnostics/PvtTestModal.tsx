import React, { useState, useEffect, useRef, useCallback } from 'react';
import { db } from '../../database/dexieDb';
import { X, Play, RotateCcw, CheckCircle2, AlertTriangle, ShieldCheck, Zap } from 'lucide-react';

interface Props {
  isOpen: boolean;
  onClose: () => void;
  missionDay: number;
  onTestComplete?: (medianMs: number, lapses: number) => void;
}

type TestState = 'idle' | 'waiting' | 'stimulus' | 'result_trial' | 'complete';

export const PvtTestModal: React.FC<Props> = ({ isOpen, onClose, missionDay, onTestComplete }) => {
  const [testState, setTestState] = useState<TestState>('idle');
  const [testDuration, setTestDuration] = useState<number>(60);
  const [secondsRemaining, setSecondsRemaining] = useState<number>(60);
  const [currentMs, setCurrentMs] = useState<number>(0);
  const [reactionTimes, setReactionTimes] = useState<number[]>([]);
  const [lapses, setLapses] = useState<number>(0);
  const [falseStarts, setFalseStarts] = useState<number>(0);
  const [feedbackMsg, setFeedbackMsg] = useState<string>('');

  const timerRef = useRef<number | null>(null);
  const stimulusTimeoutRef = useRef<number | null>(null);
  const stimulusStartTimeRef = useRef<number>(0);
  const animationFrameRef = useRef<number | null>(null);

  // Clean up all timers on unmount or close
  const cleanupTimers = useCallback(() => {
    if (timerRef.current) clearInterval(timerRef.current);
    if (stimulusTimeoutRef.current) clearTimeout(stimulusTimeoutRef.current);
    if (animationFrameRef.current) cancelAnimationFrame(animationFrameRef.current);
  }, []);

  useEffect(() => {
    return cleanupTimers;
  }, [cleanupTimers]);

  // Start next stimulus with randomized interval (2 to 7 seconds)
  const scheduleNextStimulus = useCallback(() => {
    setTestState('waiting');
    setCurrentMs(0);
    const delay = Math.floor(Math.random() * 5000) + 2000; // 2000ms - 7000ms

    stimulusTimeoutRef.current = window.setTimeout(() => {
      setTestState('stimulus');
      stimulusStartTimeRef.current = performance.now();

      const updateCounter = () => {
        const elapsed = Math.round(performance.now() - stimulusStartTimeRef.current);
        setCurrentMs(elapsed);
        animationFrameRef.current = requestAnimationFrame(updateCounter);
      };
      animationFrameRef.current = requestAnimationFrame(updateCounter);
    }, delay);
  }, []);

  // Handle user response trigger
  const handleTrigger = useCallback(() => {
    if (testState === 'waiting') {
      // False start (pressed before stimulus appeared)
      if (stimulusTimeoutRef.current) clearTimeout(stimulusTimeoutRef.current);
      setFalseStarts((prev) => prev + 1);
      setFeedbackMsg('FALSE START! Wait for the visual counter.');
      setTimeout(() => {
        scheduleNextStimulus();
      }, 1000);
    } else if (testState === 'stimulus') {
      if (animationFrameRef.current) cancelAnimationFrame(animationFrameRef.current);
      const rt = Math.round(performance.now() - stimulusStartTimeRef.current);
      setCurrentMs(rt);
      setReactionTimes((prev) => [...prev, rt]);

      if (rt > 500) {
        setLapses((prev) => prev + 1);
        setFeedbackMsg(`LAPSE DETECTED: ${rt} ms (>500ms)`);
      } else {
        setFeedbackMsg(`VALID RESPONSE: ${rt} ms`);
      }

      setTestState('result_trial');
      setTimeout(() => {
        if (secondsRemaining > 0) {
          scheduleNextStimulus();
        }
      }, 750);
    }
  }, [testState, secondsRemaining, scheduleNextStimulus]);

  // Handle keyboard spacebar
  useEffect(() => {
    if (!isOpen) return;

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.code === 'Space') {
        e.preventDefault();
        if (testState === 'waiting' || testState === 'stimulus') {
          handleTrigger();
        } else if (testState === 'idle') {
          startTest();
        }
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, testState, handleTrigger]);

  // Start test with chosen duration
  const startTest = (duration = 60) => {
    setTestDuration(duration);
    setReactionTimes([]);
    setLapses(0);
    setFalseStarts(0);
    setSecondsRemaining(duration);
    setFeedbackMsg('');
    setTestState('waiting');

    timerRef.current = window.setInterval(() => {
      setSecondsRemaining((prev) => {
        if (prev <= 1) {
          endTest();
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    scheduleNextStimulus();
  };

  // Complete 60s test and save to IndexedDB
  const endTest = async () => {
    cleanupTimers();
    setTestState('complete');

    // Calculate final metrics
    const sorted = [...reactionTimes].sort((a, b) => a - b);
    const median = sorted.length > 0 ? sorted[Math.floor(sorted.length / 2)] : 250;

    // Update today's telemetry in Dexie
    const existing = await db.readings.where('missionDay').equals(missionDay).first();
    if (existing) {
      await db.readings.update(existing.id, {
        pvtReactionTimeMs: median,
        pvtLapses: lapses,
        sourceType: 'pvt_test',
      });
    }

    if (onTestComplete) {
      onTestComplete(median, lapses);
    }
  };

  if (!isOpen) return null;

  // Compute summary stats if complete
  const sorted = [...reactionTimes].sort((a, b) => a - b);
  const medianRt = sorted.length > 0 ? sorted[Math.floor(sorted.length / 2)] : 0;
  const meanRt = sorted.length > 0 ? Math.round(sorted.reduce((a, b) => a + b, 0) / sorted.length) : 0;
  const fastest10 = sorted.length > 0 ? sorted[0] : 0;
  const slowest10 = sorted.length > 0 ? sorted[sorted.length - 1] : 0;

  return (
    <div 
      className="fixed inset-0 bg-space-950/85 backdrop-blur-md z-50 flex items-center justify-center p-4"
      onClick={() => {
        cleanupTimers();
        onClose();
      }}
    >
      <div 
        className="relative w-full max-w-2xl bg-space-900 border border-bio-cyan/40 rounded-2xl shadow-glow-cyan overflow-hidden flex flex-col"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Top Header */}
        <div className="px-6 py-4 border-b border-space-800 flex items-center justify-between bg-space-950/60">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-bio-cyan/10 border border-bio-cyan/40 flex items-center justify-center text-bio-cyan">
              <Zap className="w-5 h-5" />
            </div>
            <div>
              <span className="text-[10px] font-mono tracking-widest text-bio-cyan uppercase">
                NASA OPERATIONAL NEUROBEHAVIORAL ASSESSMENT
              </span>
              <h2 className="text-lg font-orbitron font-bold text-white flex items-center gap-2">
                PVT (Psychomotor Vigilance Task)
              </h2>
            </div>
          </div>

          <button
            onClick={() => {
              cleanupTimers();
              onClose();
            }}
            className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-space-800 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* PVT Interactive Area */}
        <div className="p-6 flex flex-col items-center justify-center min-h-[380px] text-center space-y-6">
          {testState === 'idle' && (
            <div className="space-y-4 max-w-md">
              <p className="text-xs text-slate-300 leading-relaxed">
                PVT objectively quantifies sustained visual attention and cognitive fatigue. When the test begins, focus on the display box. As soon as numbers start counting, tap the trigger or press <strong className="text-bio-cyan">SPACEBAR</strong> immediately.
              </p>
              <div className="bg-space-950 p-3 rounded-xl border border-slate-800 text-[11px] font-mono text-slate-400 space-y-1">
                <div>• Mode: 15s Rapid Evaluation or 60s Full Standard</div>
                <div>• Stimulus Interval: Randomized (2 to 7s)</div>
                <div>• Attentional Lapse Threshold: &gt; 500 ms</div>
              </div>
              <div className="flex items-center gap-3 pt-2">
                <button
                  onClick={() => startTest(15)}
                  className="flex-1 py-3.5 rounded-xl bg-space-800 border border-slate-700 text-white font-mono text-xs hover:bg-space-700 transition-all flex items-center justify-center gap-1.5 shadow"
                >
                  <Zap className="w-4 h-4 text-bio-cyan" /> QUICK EVAL (15s)
                </button>
                <button
                  onClick={() => startTest(60)}
                  className="flex-1 py-3.5 rounded-xl bg-bio-cyan text-space-950 font-orbitron font-bold text-xs tracking-wider hover:bg-bio-cyan/80 shadow-glow-cyan transition-all flex items-center justify-center gap-1.5"
                >
                  <Play className="w-4 h-4 fill-current" /> FULL NASA (60s)
                </button>
              </div>
            </div>
          )}

          {(testState === 'waiting' || testState === 'stimulus' || testState === 'result_trial') && (
            <div className="w-full flex flex-col items-center space-y-5">
              {/* Status Header */}
              <div className="flex items-center justify-between w-full max-w-md px-2 text-xs font-mono">
                <span className="text-slate-400">
                  TIME LEFT: <strong className="text-white text-sm">{secondsRemaining}s</strong>
                </span>
                <span className="text-slate-400">
                  TRIALS: <strong className="text-white text-sm">{reactionTimes.length}</strong>
                </span>
                <span className="text-bio-red">
                  LAPSES: <strong className="text-sm">{lapses}</strong>
                </span>
              </div>

              {/* Central Stimulus Display */}
              <div
                onClick={handleTrigger}
                className={`w-full max-w-md h-48 rounded-2xl flex flex-col items-center justify-center cursor-pointer select-none transition-all duration-150 border-2 ${
                  testState === 'stimulus'
                    ? 'bg-bio-amber/20 border-bio-amber shadow-glow-amber'
                    : testState === 'waiting'
                    ? 'bg-space-950 border-slate-800 hover:border-slate-700'
                    : 'bg-space-900 border-bio-green'
                }`}
              >
                {testState === 'stimulus' && (
                  <div className="font-mono font-bold text-5xl text-bio-amber tracking-wider animate-pulse">
                    {currentMs} <span className="text-lg">ms</span>
                  </div>
                )}

                {testState === 'waiting' && (
                  <div className="text-slate-500 font-mono text-sm flex flex-col items-center gap-1">
                    <span className="w-3 h-3 rounded-full bg-slate-700 animate-ping" />
                    <span>WAIT FOR STIMULUS...</span>
                  </div>
                )}

                {testState === 'result_trial' && (
                  <div className="text-center font-mono">
                    <div className="text-3xl font-bold text-bio-green">{currentMs} ms</div>
                    <span className="text-xs text-slate-400">{feedbackMsg}</span>
                  </div>
                )}
              </div>

              {/* Big Touch Trigger Button for Tablet / Gloves */}
              <button
                onClick={handleTrigger}
                className="w-full max-w-md py-4 rounded-xl bg-space-800 border border-slate-700 text-white font-mono font-bold tracking-wider hover:bg-space-700 active:bg-bio-cyan active:text-space-950 transition-colors shadow-lg"
              >
                TAP TRIGGER / PRESS SPACEBAR
              </button>
            </div>
          )}

          {testState === 'complete' && (
            <div className="w-full max-w-lg space-y-5 animate-in fade-in duration-300">
              <div className="flex items-center justify-center gap-2 text-bio-green font-orbitron font-bold text-lg">
                <CheckCircle2 className="w-5 h-5" /> {testDuration}-SEC PVT TEST COMPLETE
              </div>

              {/* Scorecard */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-left">
                <div className="bg-space-950 p-3 rounded-xl border border-slate-800">
                  <span className="text-[10px] font-mono text-slate-400">MEDIAN RT</span>
                  <div className="text-xl font-bold font-mono text-white mt-0.5">{medianRt} ms</div>
                </div>

                <div className="bg-space-950 p-3 rounded-xl border border-slate-800">
                  <span className="text-[10px] font-mono text-slate-400">ATTENTIONAL LAPSES</span>
                  <div className={`text-xl font-bold font-mono mt-0.5 ${lapses > 1 ? 'text-bio-red' : 'text-bio-green'}`}>
                    {lapses} (&gt;500ms)
                  </div>
                </div>

                <div className="bg-space-950 p-3 rounded-xl border border-slate-800">
                  <span className="text-[10px] font-mono text-slate-400">FASTEST 10%</span>
                  <div className="text-xl font-bold font-mono text-bio-cyan mt-0.5">{fastest10} ms</div>
                </div>

                <div className="bg-space-950 p-3 rounded-xl border border-slate-800">
                  <span className="text-[10px] font-mono text-slate-400">FALSE STARTS</span>
                  <div className="text-xl font-bold font-mono text-slate-300 mt-0.5">{falseStarts}</div>
                </div>
              </div>

              {/* Baseline Comparison Insight */}
              <div className="p-3.5 rounded-xl bg-space-950/80 border border-slate-800 text-xs text-left space-y-1">
                <div className="font-mono font-semibold text-bio-amber flex items-center gap-1.5">
                  <AlertTriangle className="w-3.5 h-3.5" /> Baseline Comparison Insight:
                </div>
                <p className="text-slate-300 leading-relaxed">
                  Your flight adaptation baseline is <strong>234 ms</strong>. Today's median is <strong>{medianRt} ms</strong> ({medianRt > 234 ? `+${medianRt - 234} ms slowing` : `${234 - medianRt} ms faster`}).
                  {lapses >= 2 && ' Elevated lapse frequency indicates acute sleep debt and situational attention instability.'}
                </p>
              </div>

              <div className="flex items-center gap-3">
                <button
                  onClick={() => startTest(testDuration)}
                  className="flex-1 py-3 rounded-xl bg-space-800 border border-slate-700 text-white font-mono text-xs hover:bg-space-700 transition-colors flex items-center justify-center gap-1.5"
                >
                  <RotateCcw className="w-3.5 h-3.5" /> Repeat ({testDuration}s)
                </button>
                <button
                  onClick={onClose}
                  className="flex-1 py-3 rounded-xl bg-bio-cyan text-space-950 font-mono font-bold text-xs hover:bg-bio-cyan/80 transition-colors"
                >
                  Commit Telemetry & Close
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
