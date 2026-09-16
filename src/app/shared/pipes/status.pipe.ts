// status.pipe.ts
import { Pipe, PipeTransform } from '@angular/core';
import { STATUS_OPTIONS, StatusType } from '../../core/constants';

export const STATUS_MAP: Record<StatusType, (typeof STATUS_OPTIONS)[number]> = Object.fromEntries(
  STATUS_OPTIONS.map((opt) => [opt.value, opt]),
) as any;

@Pipe({ name: 'statusType', standalone: true, pure: true })
export class StatusTypePipe implements PipeTransform {
  transform(status: string | number): string {
    return STATUS_MAP[status as StatusType]?.type ?? 'default';
  }
}

@Pipe({ name: 'statusLabel', standalone: true, pure: true })
export class StatusLabelPipe implements PipeTransform {
  transform(status: string | number): string | number {
    return STATUS_MAP[status as StatusType]?.label ?? status;
  }
}
