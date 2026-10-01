import { ChangeDetectionStrategy, Component, input, model } from '@angular/core';
import { FormValueControl } from '@angular/forms/signals';
import { Input as AgroInputDirective } from '../../../directives/agro-input.directive';
import { OnlyNumbersDirective } from '../../../directives/only-numbers.directive';

let nextId = 0;

@Component({
  selector: 'agro-input-number',
  templateUrl: './input-number.component.html',
  styleUrls: ['./input-number.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [AgroInputDirective, OnlyNumbersDirective],
})
export class InputNumberComponent implements FormValueControl<number | null> {
  readonly decimal = input<boolean>(true);
  readonly label = input<string>('');
  readonly placeholder = input<string>('');
  readonly min = input<number | null>(null);
  readonly max = input<number | null>(null);
  readonly required = input<boolean>(false);
  readonly error = input<string>('');
  readonly id = input<string>(`agro-input-number-${nextId++}`);

  // readonly value = signal(0);
  readonly disabled = input<boolean>(false);

  readonly value = model<number | null>(null);

  onInput(event: Event): void {
    const raw = (event.target as HTMLInputElement).value;
    const parsed = raw === '' ? null : this.decimal() ? parseFloat(raw) : parseInt(raw, 10);
    this.value.set(parsed);
  }

  onBlur(): void {
    // el estado "touched" lo gestiona el field binding de Signal Forms al usar [field]
  }
}
