import {
  ChangeDetectionStrategy,
  Component,
  computed,
  forwardRef,
  input,
  model,
} from '@angular/core';
import { ControlValueAccessor, NG_VALUE_ACCESSOR } from '@angular/forms';

@Component({
  selector: 'slide-toggle',
  templateUrl: './slide-toggle.component.html',
  styleUrls: ['./slide-toggle.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
  providers: [
    {
      provide: NG_VALUE_ACCESSOR,
      useExisting: forwardRef(() => SildeToggle),
      multi: true,
    },
  ],
})
export class SildeToggle implements ControlValueAccessor {
  readonly titleLabel = input<unknown>('');
  readonly activeValue = input<unknown>(true);
  readonly inactiveValue = input<unknown>(false);
  readonly label = input<(val: unknown) => string>((val) => (val ? 'Activo' : 'Inactivo'));
  readonly id = input<string>(`agro-toggle-${Math.random().toString(36).slice(2, 8)}`);

  readonly checked = model<boolean>(false);

  readonly displayLabel = computed(() => {
    const value = this.checked() ? this.activeValue() : this.inactiveValue();
    return this.label()(value);
  });

  private onChange: (value: unknown) => void = () => {};
  onTouched: () => void = () => {};

  toggle(): void {
    this.checked.update((v) => !v);
    this.onChange(this.checked() ? this.activeValue() : this.inactiveValue());
    this.onTouched();
  }

  writeValue(val: unknown): void {
    this.checked.set(val === this.activeValue());
  }

  registerOnChange(fn: (value: unknown) => void): void {
    this.onChange = fn;
  }

  registerOnTouched(fn: () => void): void {
    this.onTouched = fn;
  }

  setDisabledState(): void {}
}
