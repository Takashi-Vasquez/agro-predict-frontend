import { ChangeDetectionStrategy, Component, computed, input } from '@angular/core';

@Component({
  selector: 'agro-line-chart',
  template: `
    <svg viewBox="0 0 600 205" role="img" [attr.aria-label]="label()">
      <defs>
        <linearGradient [id]="gradientId" x1="0" y1="0" x2="0" y2="1">
          <stop stop-color="currentColor" stop-opacity=".12" />
          <stop offset="1" stop-color="currentColor" stop-opacity="0" />
        </linearGradient>
      </defs>
      @for (tick of ticks; track tick) {
        <line
          x1="36"
          [attr.y1]="tick"
          x2="588"
          [attr.y2]="tick"
          stroke="var(--border)"
          stroke-dasharray="3 4"
        />
      }
      @for (value of axis(); track $index) {
        <text x="0" [attr.y]="17 + $index * 41" fill="var(--muted)" font-size="12">
          {{ value }}
        </text>
      }
      <path [attr.d]="area()" [attr.fill]="'url(#' + gradientId + ')'" />
      @if (comparison().length) {
        <polyline
          [attr.points]="comparisonPoints()"
          fill="none"
          stroke="#a4b792"
          stroke-width="2"
          stroke-dasharray="5 5"
        />
      }
      <polyline
        [attr.points]="points()"
        fill="none"
        stroke="currentColor"
        stroke-width="2.5"
        stroke-linejoin="round"
        stroke-linecap="round"
      />
      @for (month of labels(); track $index) {
        <text
          [attr.x]="36 + ($index * 552) / (labels().length - 1 || 1)"
          y="201"
          [attr.text-anchor]="
            $index === 0 ? 'start' : $index === labels().length - 1 ? 'end' : 'middle'
          "
          fill="var(--muted)"
          font-size="12"
        >
          {{ month }}
        </text>
      }
    </svg>
  `,
  styles: [
    ':host{display:block;color:var(--primary);width:100%}svg{width:100%;height:auto;overflow:visible}',
  ],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class LineChart {
  private static count = 0;
  readonly gradientId = `chart-fill-${LineChart.count++}`;
  readonly values = input<number[]>([3, 4, 3.8, 5.5, 5.2, 6.5, 6.1, 7.9, 7.2, 8.4, 8, 9.2]);
  readonly comparison = input<number[]>([]);
  readonly labels = input<string[]>(['Ene', 'Feb', 'Mar', 'Abr', 'May', 'Jun']);
  readonly label = input('Rendimiento agrícola simulado por mes, en toneladas por hectárea.');
  readonly max = input(10);
  readonly ticks = [13, 54, 95, 136, 177];
  readonly axis = computed(() =>
    [this.max(), this.max() * 0.75, this.max() * 0.5, this.max() * 0.25, 0].map((value) =>
      Number(value.toFixed(1)),
    ),
  );
  readonly points = computed(() => this.toPoints(this.values()));
  readonly comparisonPoints = computed(() => this.toPoints(this.comparison()));
  readonly area = computed(() => `M${this.points().replaceAll(' ', ' L')} L588,177 L36,177 Z`);
  private toPoints(values: number[]): string {
    return values
      .map(
        (value, index) =>
          `${36 + (index * 552) / (values.length - 1 || 1)},${177 - (value / this.max()) * 164}`,
      )
      .join(' ');
  }
}
