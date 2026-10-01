import { ChangeDetectionStrategy, Component, input, model } from '@angular/core';
import { FormValueControl } from '@angular/forms/signals';
import { Input as AgroInputDirective } from '../../../directives/agro-input.directive';

@Component({
  selector: 'agro-input-textarea',
  templateUrl: './input-textarea.component.html',
  styleUrls: ['./input-textarea.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [AgroInputDirective],
})
export class TextareaComponent implements FormValueControl<string> {
  readonly label = input<string>('');
  readonly placeholder = input<string>('');
  readonly rows = input<number>(3);
  readonly maxlength = input<number | null>(null);
  readonly required = input<boolean>(false);
  readonly error = input<string>('');
  readonly id = input<string>(`agro-textarea-${Math.random().toString(36).slice(2, 8)}`);
  readonly disabled = input<boolean>(false);

  readonly value = model<string>('');

  onInput(event: Event): void {
    this.value.set((event.target as HTMLTextAreaElement).value);
  }

  onBlur(): void {}
}
