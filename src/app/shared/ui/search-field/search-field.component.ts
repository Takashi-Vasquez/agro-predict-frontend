import {
  ChangeDetectionStrategy,
  Component,
  debounced,
  effect,
  input,
  output,
  signal,
} from '@angular/core';
import { NgIcon, provideIcons } from '@ng-icons/core';
import { heroMagnifyingGlassMicro, heroXMarkMicro } from '@ng-icons/heroicons/micro';
import { Input } from '../../directives/agro-input.directive';

@Component({
  selector: 'agro-search-field',
  imports: [NgIcon, Input],
  providers: [provideIcons({ heroMagnifyingGlassMicro, heroXMarkMicro })],
  templateUrl: './search-field.component.html',
  styleUrls: ['./search-field.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class SearchField {
  readonly placeholder = input('Buscar…');
  readonly ariaLabel = input('Buscar');
  readonly debounceMs = input(300);

  readonly term = signal('');
  private readonly debouncedTerm = debounced(this.term, this.debounceMs());

  readonly searchChange = output<string>();

  constructor() {
    effect(() => this.searchChange.emit(this.debouncedTerm.value() ?? ''));
  }

  onInput(event: Event): void {
    this.term.set((event.target as HTMLInputElement).value);
  }

  clear(): void {
    this.term.set('');
  }
}
