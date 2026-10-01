import { ChangeDetectionStrategy, Component, input, model } from '@angular/core';
import { FormValueControl } from '@angular/forms/signals';
import { Input as AgroInputDirective } from '../../../directives/agro-input.directive';

let nextId = 0;

@Component({
  selector: 'agro-input-text',
  templateUrl: './input-text.component.html',
  styleUrls: ['./input-text.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [AgroInputDirective],
})
export class InputTextComponent implements FormValueControl<string> {
  readonly label = input<string>('');
  readonly placeholder = input<string>('');
  readonly type = input<string>('text');
  readonly maxlength = input<number | null>(null);
  readonly required = input<boolean>(false);
  readonly error = input<string>('');
  readonly id = input<string>(`agro-input-${nextId++}`);

  readonly disabled = input<boolean>(false);

  readonly value = model<string>('');

  onInput(event: Event): void {
    this.value.set((event.target as HTMLInputElement).value);
  }

  onBlur(): void {}
}
