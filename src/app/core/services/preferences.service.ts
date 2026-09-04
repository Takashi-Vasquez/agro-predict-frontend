import { Injectable, signal } from '@angular/core';
import { readStorage, writeStorage } from './browser-storage';
export interface Preferences {
  workspaceName: string;
  climateAlerts: boolean;
  predictionAlerts: boolean;
  weeklySummary: boolean;
}
const DEFAULTS: Preferences = {
  workspaceName: 'Mi espacio agrícola',
  climateAlerts: true,
  predictionAlerts: true,
  weeklySummary: false,
};
@Injectable({ providedIn: 'root' })
export class PreferencesService {
  readonly value = signal<Preferences>(this.restore());
  save(value: Preferences): void {
    this.value.set(value);
    writeStorage('agro.preferences', JSON.stringify(value));
  }
  private restore(): Preferences {
    try {
      const value: unknown = JSON.parse(readStorage('agro.preferences') ?? 'null');
      if (
        typeof value === 'object' &&
        value !== null &&
        'workspaceName' in value &&
        typeof value.workspaceName === 'string' &&
        'climateAlerts' in value &&
        typeof value.climateAlerts === 'boolean' &&
        'predictionAlerts' in value &&
        typeof value.predictionAlerts === 'boolean' &&
        'weeklySummary' in value &&
        typeof value.weeklySummary === 'boolean'
      ) {
        return {
          workspaceName: value.workspaceName,
          climateAlerts: value.climateAlerts,
          predictionAlerts: value.predictionAlerts,
          weeklySummary: value.weeklySummary,
        };
      }
    } catch {
      /* Restore defaults after corrupt or unavailable browser storage. */
    }
    return DEFAULTS;
  }
}
