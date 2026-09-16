import { ChangeDetectionStrategy, Component, input } from '@angular/core';
import { Icon } from '../icon';

@Component({
  selector: 'agro-empty',
  imports: [Icon],
  template:
    '<div class="empty-icon"><agro-icon [name]="icon()" /></div><h3>{{ title() }}</h3><p>{{ description() }}</p><ng-content />',
  host: { class: 'empty-state' },
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class Empty {
  readonly icon = input('search');
  readonly title = input('Sin resultados');
  readonly description = input('Prueba con otro término de búsqueda.');
}
