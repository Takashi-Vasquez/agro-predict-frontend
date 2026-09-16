import { ChangeDetectionStrategy, Component, input } from '@angular/core';

@Component({
  selector: 'agro-loader',
  template: '<span class="spinner"></span><span>{{ label() }}</span>',
  host: { class: 'loader', role: 'status' },
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class Loader {
  readonly label = input('Cargando...');
}
