import { ChangeDetectionStrategy, Component, computed, input, model } from '@angular/core';
import { FormValueControl } from '@angular/forms/signals';

@Component({
  selector: 'slide-toggle',
  templateUrl: './slide-toggle.component.html',
  styleUrls: ['./slide-toggle.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class SildeToggle implements FormValueControl<unknown> {
  readonly titleLabel = input<unknown>('');
  readonly activeValue = input<unknown>(true);
  readonly inactiveValue = input<unknown>(false);
  readonly label = input<(val: unknown) => string>((val) => (val ? 'Activo' : 'Inactivo'));
  readonly id = input<string>(`agro-toggle-${Math.random().toString(36).slice(2, 8)}`);

  readonly value = model<unknown>(false);
  readonly isChecked = computed(() => this.value() === this.activeValue());

  readonly displayLabel = computed(() => {
    const val = this.isChecked() ? this.activeValue() : this.inactiveValue();
    return this.label()(val);
  });

  toggle(): void {
    this.value.set(this.isChecked() ? this.inactiveValue() : this.activeValue());
  }

  onTouched(): void {}
}
