import { ChangeDetectionStrategy, Component, input } from '@angular/core';
import { Icon } from './icon';
@Component({
  selector: 'agro-kpi-card',
  imports: [Icon],
  template:
    '<div class="metric-top"><span>{{ label() }}</span><agro-icon [name]="icon()" /></div><strong>{{ value() }}<small>{{ unit() }}</small></strong><p>{{ detail() }}</p>',
  styles: [
    ':host{display:block;padding:23px;background:var(--surface);border:1px solid var(--border);border-radius:var(--radius)}.metric-top{display:flex;justify-content:space-between;align-items:center;gap:12px;font-size:.875rem;color:var(--muted)}agro-icon{color:var(--primary)}strong{display:flex;align-items:baseline;gap:6px;font-size:2rem;font-weight:600;letter-spacing:-1px;margin:16px 0 8px}small{font-size:1rem;font-weight:400;letter-spacing:0;color:var(--muted)}p{font-size:.75rem}',
  ],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class KpiCard {
  readonly label = input.required<string>();
  readonly value = input.required<string | number>();
  readonly unit = input('');
  readonly detail = input('');
  readonly icon = input('sprout');
}
