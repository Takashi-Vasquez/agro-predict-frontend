import {
  ChangeDetectionStrategy,
  Component,
  computed,
  input,
  model,
  ResourceRef,
} from '@angular/core';
import { FormValueControl } from '@angular/forms/signals';
import { Input as AgroInputDirective } from '../../../directives/agro-input.directive';

export interface SelectOption {
  value: string | number;
  label: string;
  code?: string;
}
export type SelectOptionsSource = ResourceRef<SelectOption[]> | SelectOption[];

let nextId = 0;
export const NO_SELECTION = -1;

@Component({
  selector: 'agro-select',
  templateUrl: './agro-select.component.html',
  styleUrls: ['./agro-select.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [AgroInputDirective],
})
export class SelectComponent implements FormValueControl<string | number | null> {
  readonly label = input<string>('');
  readonly options = input.required<SelectOptionsSource>();
  readonly placeholder = input<string>('Seleccione una opción');
  readonly required = input<boolean>(false);
  readonly error = input<string>('');
  readonly id = input<string>(`agro-select-${nextId++}`);
  readonly isDisabled = input<boolean>(false, { alias: 'uiDisabled' });

  readonly value = model<string | number | null>(null);

  private toDisplayValue(value: string | number): string | number {
    if (typeof value === 'number') return value;
    return value !== '' && !isNaN(Number(value)) ? Number(value) : value;
  }

  readonly normalizedOptions = computed(() => {
    const source = this.options();

    const mapOptions = (opts: SelectOption[]): SelectOption[] =>
      opts.map((opt) => ({
        ...opt,
        value: this.toDisplayValue(opt.value),
      }));

    if (this.isResourceRef(source)) {
      return {
        value: mapOptions(source.value() ?? []),
        isLoading: source.isLoading(),
        error: !!source.error(),
      };
    }

    return {
      value: mapOptions(source),
      isLoading: false,
      error: false,
    };
  });

  onChange(event: Event): void {
    const raw = (event.target as HTMLSelectElement).value;

    if (raw === '') {
      this.value.set(null);
      return;
    }

    const match = this.normalizedOptions().value.find((opt) => String(opt.value) === raw);
    this.value.set(match ? match.value : raw);
  }

  onBlur(): void {}

  isResourceRef(source: SelectOptionsSource): source is ResourceRef<SelectOption[]> {
    return (
      source != null && typeof source === 'object' && 'isLoading' in source && 'value' in source
    );
  }
}
