import { ChangeDetectionStrategy, Component, input, model } from '@angular/core';
import { FormValueControl } from '@angular/forms/signals';

export type InputCheckboxColor = 'primary' | 'amber' | 'blue' | 'danger' | 'orange';

let nextId = 0;

@Component({
  selector: 'agro-input-checkbox',
  templateUrl: './input-checkbox.component.html',
  styleUrls: ['./input-checkbox.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
  host: {
    '[style.--check-color]': 'colorMap[color()]',
    '[style.--check-soft]': 'softMap[color()]',
  },
})
export class InputCheckboxComponent implements FormValueControl<boolean> {
  readonly customClass = input<string>('');
  readonly label = input<string>('');
  readonly description = input<string>('');
  readonly color = input<InputCheckboxColor>('primary');
  readonly required = input<boolean>(false);
  readonly error = input<string>('');
  readonly id = input<string>(`agro-input-checkbox-${nextId++}`);

  readonly disabled = input<boolean>(false);

  readonly indeterminate = input<boolean>(false);

  readonly value = model<boolean>(false);

  readonly colorMap: Record<InputCheckboxColor, string> = {
    primary: 'var(--primary)',
    amber: 'var(--amber)',
    blue: 'var(--blue)',
    danger: 'var(--danger)',
    orange: 'var(--orange)',
  };

  readonly softMap: Record<InputCheckboxColor, string> = {
    primary: 'var(--green-soft)',
    amber: 'var(--amber-soft)',
    blue: 'var(--blue-soft)',
    danger: 'var(--danger-soft)',
    orange: 'var(--orange-soft)',
  };

  onChange(event: Event): void {
    this.value.set((event.target as HTMLInputElement).checked);
  }

  onBlur(): void {
    // el estado "touched" lo gestiona el field binding de Signal Forms al usar [field]
  }
}
