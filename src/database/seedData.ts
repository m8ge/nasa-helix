import { BiometricReading } from '../types/telemetry';
import { QuestLogEntry } from '../types/quests';
import { db } from './dexieDb';

export function generate90DayMissionDataset(): BiometricReading[] {
  const readings: BiometricReading[] = [];
  const baseDate = new Date('2026-09-02T08:00:00Z'); // Mission Launch Day 1

  let cumRadiation = 0;

  for (let day = 1; day <= 90; day++) {
    const currentDate = new Date(baseDate.getTime() + (day - 1) * 86400000);
    const isoString = currentDate.toISOString();

    // Baseline physiological parameters in microgravity
    let restingHR = 54.0 + (Math.sin(day * 0.4) * 1.5) + (Math.random() * 1.2 - 0.6);
    let systolicBP = 110.0 + (Math.sin(day * 0.2) * 2.0) + (Math.random() * 2 - 1);
    let diastolicBP = 68.0 + (Math.cos(day * 0.2) * 1.5) + (Math.random() * 1.5 - 0.75);
    let bodyTemp = 37.05 + (Math.random() * 0.25 - 0.12);
    let bloodGlucose = 96.0 + (Math.sin(day * 0.3) * 4.0) + (Math.random() * 3 - 1.5);
    let sleepHours = 6.6 + (Math.sin(day * 0.5) * 0.3) + (Math.random() * 0.4 - 0.2);
    let sleepEfficiency = 84.0 + (Math.random() * 4 - 2);
    let spO2 = 98.0 + (Math.random() * 0.8 - 0.4);
    let bodyMass = 66.5 - (day * 0.015) + (Math.random() * 0.2 - 0.1);
    let pvtReactionTimeMs = 232.0 + (Math.sin(day * 0.3) * 6.0) + (Math.random() * 8 - 4);
    let pvtLapses = Math.random() > 0.8 ? 1 : 0;
    let moodValence = 4.2 + (Math.random() * 0.4 - 0.2);
    let stressLevel = 2.0 + (Math.random() * 0.4 - 0.2);
    let fatigueScore = 2.0 + (Math.random() * 0.4 - 0.2);
    let exerciseCompliance = 94.0 + (Math.random() * 6 - 3);

    // Baseline daily radiation rate (GCR interplanetary rate ~1.4 mSv/day)
    let dailyRadRate = 1.35 + (Math.random() * 0.25 - 0.12);

    // Initial adaptation phase (Days 1 to 5: cephalad fluid shift)
    if (day <= 5) {
      bodyMass = 68.4 - (day * 0.4); // rapid fluid loss
      restingHR += (5 - day) * 1.2;
      sleepHours -= 0.8;
      stressLevel += 0.8;
    }

    // ANOMALY 1: Day 42 Solar Particle Event (SPE) Coronal Mass Ejection
    if (day === 42) {
      dailyRadRate = 18.6; // acute radiation flare
      stressLevel = 4.2;
      fatigueScore = 3.8;
      restingHR += 6.5;
      systolicBP += 8.0;
      moodValence = 2.6;
    } else if (day === 43) {
      dailyRadRate = 6.2; // residual flare
      stressLevel = 3.4;
      fatigueScore = 3.2;
      restingHR += 3.0;
    } else if (day === 44) {
      dailyRadRate = 2.1;
      stressLevel = 2.6;
    }

    // ANOMALY 2: Days 65 to 74 — Sleep Debt Spiral & Cognitive Latency Drift
    // Simulates cumulative isolation fatigue, ECLSS acoustic spike, and circadian desynchrony
    if (day >= 65 && day <= 74) {
      const severity = (day - 64); // 1 to 10
      sleepHours = Math.max(4.2, 6.5 - (severity * 0.23)); // Drops from 6.3h to 4.2h
      sleepEfficiency = Math.max(68, 83 - (severity * 1.5)); // Drops to 68%
      restingHR = 54.0 + (severity * 0.95) + (Math.random() * 0.8 - 0.4); // Climbs to 63.5+ bpm
      systolicBP = 110.0 + (severity * 0.7);
      pvtReactionTimeMs = 230.0 + (severity * 8.8) + (Math.random() * 6); // Slows from 230 to ~318 ms
      pvtLapses = severity >= 6 ? Math.min(4, Math.floor((severity - 5) * 1.2)) : (Math.random() > 0.6 ? 1 : 0);
      fatigueScore = Math.min(4.8, 2.1 + (severity * 0.26)); // Climbs to 4.7
      stressLevel = Math.min(4.4, 2.0 + (severity * 0.22)); // Climbs to 4.2
      moodValence = Math.max(2.4, 4.2 - (severity * 0.17)); // Drops to 2.5
      exerciseCompliance = Math.max(76, 95 - (severity * 1.8)); // Drops to 77%
    }

    // Days 75 to 90: Projected post-intervention recovery trajectory
    if (day > 74) {
      const recoveryDays = (day - 74);
      sleepHours = Math.min(7.2, 4.4 + (recoveryDays * 0.25));
      sleepEfficiency = Math.min(88, 70 + (recoveryDays * 1.3));
      restingHR = Math.max(54.5, 63.5 - (recoveryDays * 0.7));
      pvtReactionTimeMs = Math.max(235, 318 - (recoveryDays * 6.5));
      pvtLapses = Math.max(0, 3 - Math.floor(recoveryDays * 0.4));
      fatigueScore = Math.max(2.0, 4.5 - (recoveryDays * 0.2));
      stressLevel = Math.max(2.1, 4.0 - (recoveryDays * 0.18));
      moodValence = Math.min(4.3, 2.6 + (recoveryDays * 0.15));
      exerciseCompliance = Math.min(96, 78 + (recoveryDays * 1.5));
    }

    cumRadiation += dailyRadRate;

    readings.push({
      id: `READING-DAY-${String(day).padStart(3, '0')}`,
      timestamp: isoString,
      missionDay: day,
      systolicBP: Math.round(systolicBP * 10) / 10,
      diastolicBP: Math.round(diastolicBP * 10) / 10,
      restingHR: Math.round(restingHR * 10) / 10,
      bodyTemp: Math.round(bodyTemp * 100) / 100,
      bloodGlucose: Math.round(bloodGlucose * 10) / 10,
      sleepHours: Math.round(sleepHours * 10) / 10,
      sleepEfficiency: Math.round(sleepEfficiency * 10) / 10,
      spO2: Math.round(spO2 * 10) / 10,
      bodyMass: Math.round(bodyMass * 10) / 10,
      radiationDoseCum: Math.round(cumRadiation * 10) / 10,
      radiationDailyRate: Math.round(dailyRadRate * 100) / 100,
      pvtReactionTimeMs: Math.round(pvtReactionTimeMs),
      pvtLapses,
      moodValence: Math.round(moodValence * 10) / 10,
      stressLevel: Math.round(stressLevel * 10) / 10,
      fatigueScore: Math.round(fatigueScore * 10) / 10,
      exerciseCompliance: Math.round(exerciseCompliance),
      sourceType: day === 74 ? 'manual_entry' : 'sensor_auto',
      notes: day === 42 
        ? 'Solar Particle Event detected by CPDS. Sheltered in Water Wall Core Module 3.'
        : day === 74 
        ? 'Day 74 check-in. Severe fatigue logged; high latency comm delay to Earth.'
        : undefined,
    });
  }

  return readings;
}

export function generateSeedQuestLogs(): QuestLogEntry[] {
  const questLogs: QuestLogEntry[] = [];
  const questIds = [
    'quest_ared_resistance',
    'quest_cevis_cardio',
    'quest_circadian_lighting',
    'quest_fluid_electrolyte',
    'quest_journal_social',
  ];

  // Up to Day 74, simulate high adherence early on, with slight drop around Day 70-74
  for (let day = 1; day <= 74; day++) {
    const isLateSpiral = day >= 71 && day <= 74;
    for (const qId of questIds) {
      // 90% chance of completion normally, 60% chance during late spiral
      const completionChance = isLateSpiral ? 0.65 : 0.92;
      if (Math.random() < completionChance) {
        questLogs.push({
          id: `QUESTLOG-${day}-${qId}`,
          questId: qId,
          missionDay: day,
          completedAt: new Date(new Date('2026-09-02T12:00:00Z').getTime() + (day - 1) * 86400000).toISOString(),
          durationCompletedMinutes: qId.includes('ared') ? 60 : qId.includes('cevis') ? 45 : 20,
          perceivedExertionRPE: isLateSpiral ? 16 : 13,
        });
      }
    }
  }

  return questLogs;
}

export async function initializeDatabaseWithSeedData(): Promise<void> {
  const existingCount = await db.readings.count();
  if (existingCount === 0) {
    const dataset = generate90DayMissionDataset();
    await db.readings.bulkAdd(dataset);

    const questLogs = generateSeedQuestLogs();
    await db.questLogs.bulkAdd(questLogs);

    await db.settings.put({ key: 'currentMissionDay', value: 74 });
    await db.settings.put({ key: 'environmentMode', value: 'deep_space_transit' });
    await db.settings.put({ key: 'dimCabinNightMode', value: false });
    await db.settings.put({ key: 'highContrastMode', value: false });
    console.log(`[HELIX DB] Successfully seeded 90 days of telemetry and ${questLogs.length} quest logs.`);
  }
}
