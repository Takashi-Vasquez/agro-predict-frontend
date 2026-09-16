import { ChangeDetectionStrategy, Component, input } from '@angular/core';

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



