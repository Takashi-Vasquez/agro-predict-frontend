import { ChangeDetectionStrategy, Component, forwardRef, input, signal } from '@angular/core';
import { ControlValueAccessor, NG_VALUE_ACCESSOR } from '@angular/forms';
import { Input as AgroInputDirective } from '../../../directives/agro-input.directive';

@Component({
  selector: 'agro-input-textarea',
  templateUrl: './input-textarea.component.html',
  styleUrls: ['./input-textarea.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [AgroInputDirective],
  providers: [
    {
      provide: NG_VALUE_ACCESSOR,
      useExisting: forwardRef(() => TextareaComponent),
      multi: true,
    },
  ],
})
export class TextareaComponent implements ControlValueAccessor {
  readonly label = input<string>('');
  readonly placeholder = input<string>('');
  readonly rows = input<number>(3);
  readonly maxlength = input<number | null>(null);
  readonly required = input<boolean>(false);
  readonly error = input<string>('');
  readonly id = input<string>(`agro-textarea-${Math.random().toString(36).slice(2, 8)}`);

  readonly value = signal('');
  readonly disabled = signal(false);
  private onChange: (value: string) => void = () => {};
  onTouched: () => void = () => {};

  onInput(event: Event): void {
    const newValue = (event.target as HTMLInputElement).value;
    this.value.set(newValue);
    this.onChange(newValue);
  }

  writeValue(val: string): void {
    this.value.set(val ?? '');
  }

  registerOnChange(fn: (value: string) => void): void {
    this.onChange = fn;
  }

  registerOnTouched(fn: () => void): void {
    this.onTouched = fn;
  }

  onBlur(): void {
    this.onTouched();
  }

  setDisabledState(isDisabled: boolean): void {
    this.disabled.set(isDisabled);
  }
}
