import Dexie, { Table } from 'dexie';
import { BiometricReading } from '../types/telemetry';
import { QuestLogEntry } from '../types/quests';
import { DriftAlert } from '../types/drift';

export interface AppSetting {
  key: string;
  value: any;
}

export class HelixDatabase extends Dexie {
  readings!: Table<BiometricReading, string>;
  questLogs!: Table<QuestLogEntry, string>;
  driftAlerts!: Table<DriftAlert, string>;
  settings!: Table<AppSetting, string>;

  constructor() {
    super('HelixDatabase');
    this.version(1).stores({
      readings: 'id, missionDay, timestamp',
      questLogs: 'id, questId, missionDay, completedAt',
      driftAlerts: 'id, metricId, tier, missionDay, timestamp',
      settings: 'key',
    });
  }
}

export const db = new HelixDatabase();
