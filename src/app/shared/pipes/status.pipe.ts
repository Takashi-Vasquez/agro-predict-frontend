import { Pipe, PipeTransform } from '@angular/core';
import { STATUS_CAMPAIGN_OPTIONS, STATUS_OPTIONS } from '../../core/constants';

// Registro de todos los sets de opciones disponibles, por nombre
const STATUS_OPTIONS_REGISTRY = {
  status: STATUS_OPTIONS,
  campaignStatus: STATUS_CAMPAIGN_OPTIONS,
} as const;

const MAPS_CACHE = new Map<
  StatusOptionsKey,
  Record<string, { value: string; label: string; type: string }>
>();

export type StatusOptionsKey = keyof typeof STATUS_OPTIONS_REGISTRY;

// Arma un Record<value, opción> a partir de cualquier array de opciones
function buildStatusMap(options: readonly { value: string; label: string; type: string }[]) {
  return Object.fromEntries(options.map((opt) => [opt.value, opt]));
}

function getStatusMap(key: StatusOptionsKey) {
  if (!MAPS_CACHE.has(key)) {
    MAPS_CACHE.set(key, buildStatusMap(STATUS_OPTIONS_REGISTRY[key]));
  }
  return MAPS_CACHE.get(key)!;
}

@Pipe({ name: 'statusType', standalone: true, pure: true })
export class StatusTypePipe implements PipeTransform {
  transform(status: string | number, mapKey: StatusOptionsKey = 'status'): string {
    return getStatusMap(mapKey)[status as string]?.type ?? 'default';
  }
}

@Pipe({ name: 'statusLabel', standalone: true, pure: true })
export class StatusLabelPipe implements PipeTransform {
  transform(status: string | number, mapKey: StatusOptionsKey = 'status'): string | number {
    return getStatusMap(mapKey)[status as string]?.label ?? status;
  }
}
