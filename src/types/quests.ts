export type ShieldType = 'cardiovascular' | 'musculoskeletal' | 'neuro_behavioral' | 'immune';

export interface CountermeasureQuest {
  id: string;
  title: string;
  targetSystem: string;
  category: 'exercise' | 'sleep_hygiene' | 'hydration' | 'radiation_safety' | 'mental_health';
  prescribedFrequency: 'daily' | 'weekly';
  durationMinutes: number;
  description: string;
  shieldContribution: ShieldType;
  shieldPoints: number;
  source: string;
  confidence: string;
}

export interface QuestLogEntry {
  id: string;
  questId: string;
  missionDay: number;
  completedAt: string;
  durationCompletedMinutes: number;
  perceivedExertionRPE?: number; // Borg 6-20
  notes?: string;
}

export interface ShieldStatus {
  cardiovascular: number;     // 0 - 100%
  musculoskeletal: number;    // 0 - 100%
  neuro_behavioral: number;   // 0 - 100%
  immune: number;             // 0 - 100%
  currentStreakDays: number;
  totalQuestsCompleted: number;
}
