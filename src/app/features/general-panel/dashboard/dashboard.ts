import { DecimalPipe } from '@angular/common';
import { ChangeDetectionStrategy, Component, computed, inject, signal } from '@angular/core';
import { RouterLink } from '@angular/router';
import { AuthService } from '../../../core/services/auth.service';
import { WorkspaceStore } from '../../../core/services/workspace.store';
import { Button } from '../../../shared/directives/agro-button.directive';
import { Card } from '../../../shared/directives/agro-card.directive';
import { Empty } from '../../../shared/ui/agro-empty/agro-empty.component';
import { Loader } from '../../../shared/ui/agro-loader/agro-loader.component';
import { PageHeader } from '../../../shared/ui/agro-page-header/agro-page-header.component';
import { LineChart } from '../../../shared/ui/chart';
import { DataTable, TableColumn, TableRow } from '../../../shared/ui/data-table/data-table.component';
import { Icon } from '../../../shared/ui/icon';

@Component({
  selector: 'agro-dashboard',
  imports: [
    RouterLink,
    DecimalPipe,
    Icon,
    Button,
    Card,
    PageHeader,
    LineChart,
    DataTable,
    Loader,
    Empty
  ],
  templateUrl: './dashboard.html',
  styleUrl: './dashboard.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class DashboardComponent {
  readonly store = inject(WorkspaceStore);
  readonly auth = inject(AuthService);
  readonly period = signal<'6 resultados' | '8 resultados'>('6 resultados');
  readonly visiblePredictions = computed(() =>
    this.store
      .predictions()
      .slice(0, this.period() === '6 resultados' ? 6 : 8)
      .reverse(),
  );

  greetingTitle = computed(() => {
    const user = this.auth.user();
    if (!user) return 'Hola, Alex 👋';

    const name = user.isAdmin ? 'Administrador' : (user.firstName?.split(' ')?.[0] || 'Alex');

    return `Hola, ${name} 👋`;
  });

  readonly values = computed(() =>
    this.visiblePredictions().map((item) =>
      Number(((item.yield / item.expectedYield) * 100).toFixed(1)),
    ),
  );
  readonly targetValues = computed(() => this.values().map(() => 100));
  readonly chartLabels = computed(() => this.visiblePredictions().map((item) => item.crop));
  readonly latestAchievement = computed(() => this.values().at(-1) ?? 0);
  readonly needsAdjustment = computed(
    () => this.store.predictions().filter((item) => !item.meetsExpectation).length,
  );
  readonly metRate = computed(() => {
    const predictions = this.store.predictions();
    return predictions.length
      ? (predictions.filter((item) => item.meetsExpectation).length / predictions.length) * 100
      : 0;
  });
  readonly latestAttention = computed(() =>
    this.store.predictions().find((item) => !item.meetsExpectation),
  );
  readonly columns: TableColumn[] = [
    { key: 'crop', label: 'CULTIVO', kind: 'emphasis' },
    { key: 'name', label: 'PARCELA' },
    { key: 'predicted', label: 'PREDICCIÓN' },
    { key: 'target', label: 'META' },
    { key: 'gap', label: 'BRECHA' },
    { key: 'status', label: 'RESULTADO', kind: 'status' },
  ];
  readonly rows = computed<TableRow[]>(() =>
    this.store
      .predictions()
      .slice(0, 4)
      .map((prediction) => ({
        id: prediction.id,
        name: prediction.plot,
        crop: prediction.crop,
        predicted: `${prediction.yield} t/ha`,
        target: `${prediction.expectedYield} t/ha`,
        gap: `${prediction.gap > 0 ? '+' : ''}${prediction.gap} t/ha`,
        status: prediction.meetsExpectation ? 'Cumple meta' : 'Requiere ajuste',
      })),
  );
  readonly distribution = computed(() =>
    this.store.crops().map((crop) => ({
      name: crop.name,
      color: crop.color,
      area: this.store
        .plots()
        .filter((plot) => plot.crop === crop.name)
        .reduce((sum, plot) => sum + plot.area, 0),
    })),
  );
  readonly donutSegments = computed(() => {
    let offset = 0;
    return this.distribution().map((crop) => {
      const fraction = crop.area / (this.store.totalArea() || 1);
      const segment = {
        name: crop.name,
        length: Math.max(0, fraction * 100 - 1.5),
        offset: -offset,
        color: crop.color,
      };
      offset += fraction * 100;
      return segment;
    });
  });
  readonly distributionLabel = computed(
    () =>
      'Superficie por cultivo: ' +
      this.distribution()
        .map((crop) => `${crop.name}, ${crop.area} hectáreas`)
        .join('; '),
  );
  readonly yieldBars = computed(() => {
    const entries = this.store.crops().map((crop) => ({
      name: crop.name,
      color: crop.color,
      value: this.store.predictions().find((item) => item.crop === crop.name)?.yield ?? 0,
    }));
    const maximum = Math.max(...entries.map((item) => item.value), 1);
    return entries.map((item) => ({ ...item, percent: (item.value / maximum) * 100 }));
  });
}
