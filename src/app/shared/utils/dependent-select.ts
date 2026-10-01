// shared/utils/dependent-select.ts
import { computed, Signal } from '@angular/core';
import { toSignal } from '@angular/core/rxjs-interop';
import { FormControl } from '@angular/forms';

export const NO_SELECTION = -1;

export interface DependentSelectState<P> {
  readonly sourceValue: Signal<P | undefined>;
  readonly isDisabled: Signal<boolean>;
  readonly filterParams: Signal<Record<string, P> | undefined>;
}

export function createDependentSelectState<P = number>(
  sourceControl: FormControl<P>,
  paramKey: string,
): DependentSelectState<P> {
  const sourceValue = toSignal(sourceControl.valueChanges, {
    initialValue: sourceControl.value,
  });

  const isDisabled = computed(() => {
    const value = sourceValue();
    return value == null || value === (NO_SELECTION as unknown as P);
  });

  const filterParams = computed(() =>
    !isDisabled() ? ({ [paramKey]: sourceValue() } as Record<string, P>) : undefined,
  );

  return { sourceValue, isDisabled, filterParams };
}
