import { ChangeDetectionStrategy, Component, input, model } from '@angular/core';
import { FormValueControl } from '@angular/forms/signals';
import { Input as AgroInputDirective } from '../../../directives/agro-input.directive';

let nextId = 0;

@Component({
  selector: 'agro-input-date',
  templateUrl: './input-date.component.html',
  styleUrls: ['./input-date.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [AgroInputDirective],
})
export class InputDateComponent implements FormValueControl<string | null> {
  readonly label = input<string>('');
  readonly placeholder = input<string>('');
  readonly min = input<string | null>(null); // formato 'YYYY-MM-DD'
  readonly max = input<string | null>(null); // formato 'YYYY-MM-DD'
  readonly required = input<boolean>(false);
  readonly error = input<string>('');
  readonly id = input<string>(`agro-input-date-${nextId++}`);
  readonly disabled = input<boolean>(false);

  readonly value = model<string | null>(null);

  onInput(event: Event): void {
    const raw = (event.target as HTMLInputElement).value;
    this.value.set(raw === '' ? null : raw);
  }

  onBlur(): void {}
}
