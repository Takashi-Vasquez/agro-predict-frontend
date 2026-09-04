import { ChangeDetectionStrategy, Component, Directive, input } from '@angular/core';
import { Icon } from './icon';

@Directive({
  selector: 'button[agroButton], a[agroButton]',
  host: {
    class: 'button',
    '[class.button-primary]': 'agroButton() === "primary"',
    '[class.button-ghost]': 'agroButton() === "ghost"',
  },
})
export class Button {
  readonly agroButton = input<'' | 'primary' | 'secondary' | 'ghost'>('secondary');
}

@Directive({
  selector: 'input[agroInput], select[agroInput], textarea[agroInput]',
  host: { class: 'form-control' },
})
export class Input {}

@Component({
  selector: 'agro-card',
  template: '<ng-content />',
  host: { class: 'card' },
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class Card {}

@Component({
  selector: 'agro-page-header',
  template:
    '<div><div class="eyebrow">{{ eyebrow() }}</div><h1>{{ title() }}</h1><p>{{ description() }}</p></div><div class="page-actions"><ng-content /></div>',
  host: { class: 'page-header' },
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class PageHeader {
  readonly title = input.required<string>();
  readonly description = input('');
  readonly eyebrow = input('TU ESPACIO DE TRABAJO');
}

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

@Component({
  selector: 'agro-loader',
  template: '<span class="spinner"></span><span>{{ label() }}</span>',
  host: { class: 'loader', role: 'status' },
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class Loader {
  readonly label = input('Cargando tu espacio de trabajo…');
}
