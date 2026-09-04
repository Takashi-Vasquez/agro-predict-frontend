import { ChangeDetectionStrategy, Component, computed, inject, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { WorkspaceStore } from '../../core/services/workspace.store';
import { Icon } from '../../shared/ui/icon';
import { Button, Card, Input, PageHeader } from '../../shared/ui/primitives';
import { DataTable, TableColumn, TableRow } from '../../shared/ui/data-table';
import { downloadCsv } from '../../shared/utils/csv';
@Component({
  selector: 'agro-history',
  imports: [FormsModule, Icon, Button, Card, Input, PageHeader, DataTable],
  template: `
    <agro-page-header
      title="Cada decisión deja una historia"
      description="Consulta predicciones, datos de entrenamiento y movimientos de tu espacio agrícola."
      eyebrow="HISTORIAL"
    >
      <button agroButton (click)="download()" [disabled]="!rows().length">
        <agro-icon name="download" />
        Exportar vista
      </button>
    </agro-page-header>
    <agro-card>
      <div class="history-tabs" role="group" aria-label="Tipo de historial">
        <button
          [class.selected]="tab() === 'predictions'"
          [attr.aria-pressed]="tab() === 'predictions'"
          (click)="switchTab('predictions')"
        >
          <agro-icon name="sparkles" />
          Predicciones
          <span>{{ store.predictions().length }}</span>
        </button>
        <button
          [class.selected]="tab() === 'training'"
          [attr.aria-pressed]="tab() === 'training'"
          (click)="switchTab('training')"
        >
          <agro-icon name="chart" />
          Entrenamiento
          <span>{{ store.historicalRecords().length }}</span>
        </button>
        <button
          [class.selected]="tab() === 'activity'"
          [attr.aria-pressed]="tab() === 'activity'"
          (click)="switchTab('activity')"
        >
          <agro-icon name="history" />
          Actividad
          <span>{{ store.activities().length }}</span>
        </button>
      </div>
      <div class="toolbar">
        <div class="search-field">
          <agro-icon name="search" />
          <input
            agroInput
            type="search"
            placeholder="Buscar en el historial…"
            aria-label="Buscar en el historial"
            [ngModel]="query()"
            (ngModelChange)="query.set($event)"
          />
        </div>
        <span class="muted">{{ rows().length }} registros</span>
      </div>
      <agro-data-table
        [columns]="columns()"
        [rows]="rows()"
        [paginate]="true"
        caption="Historial de demostración"
      />
    </agro-card>
    <div class="demo-note history-note">
      <agro-icon name="info" />
      Los registros nuevos pertenecen a esta sesión. Resultados, métricas y recomendaciones son
      ilustrativos y no sustituyen la validación agronómica.
    </div>
  `,
  styles: [
    `
      .history-tabs {
        display: flex;
        gap: 28px;
        padding: 0 24px;
        border-bottom: 1px solid var(--border);
        overflow-x: auto;
      }
      .history-tabs button {
        display: flex;
        align-items: center;
        gap: 8px;
        background: none;
        border: 0;
        border-bottom: 2px solid transparent;
        color: var(--muted);
        padding: 21px 0 17px;
        font-size: 0.875rem;
        white-space: nowrap;
      }
      .history-tabs button.selected {
        border-bottom-color: var(--primary);
        color: var(--primary);
      }
      .history-tabs agro-icon {
        width: 17px;
        height: 17px;
      }
      .history-tabs span {
        padding: 2px 6px;
        font-size: 0.75rem;
        background: var(--surface-alt);
        border: 1px solid var(--border);
        border-radius: 5px;
      }
      .toolbar > .muted {
        font-size: 0.75rem;
      }
      .history-note {
        margin-top: 24px;
      }
    `,
  ],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class History {
  readonly store = inject(WorkspaceStore);
  readonly tab = signal<'predictions' | 'training' | 'activity'>('predictions');
  readonly query = signal('');
  readonly columns = computed<TableColumn[]>(() =>
    this.tab() === 'predictions'
      ? [
          { key: 'date', label: 'FECHA' },
          { key: 'crop', label: 'CULTIVO', kind: 'emphasis' },
          { key: 'plot', label: 'PARCELA' },
          { key: 'yield', label: 'PREDICCIÓN' },
          { key: 'target', label: 'META' },
          { key: 'gap', label: 'BRECHA' },
          { key: 'status', label: 'RESULTADO', kind: 'status' },
        ]
      : this.tab() === 'training'
        ? [
            { key: 'campaign', label: 'CAMPAÑA' },
            { key: 'crop', label: 'CULTIVO', kind: 'emphasis' },
            { key: 'location', label: 'UBICACIÓN' },
            { key: 'conditions', label: 'CONDICIONES' },
            { key: 'yield', label: 'COSECHA REAL' },
          ]
        : [
            { key: 'date', label: 'FECHA' },
            { key: 'title', label: 'ACTIVIDAD', kind: 'emphasis' },
            { key: 'detail', label: 'DETALLE' },
          ],
  );
  readonly rows = computed<TableRow[]>(() => {
    const source: TableRow[] =
      this.tab() === 'predictions'
        ? this.store.predictions().map((item) => ({
            id: item.id,
            date: this.formatDate(item.date),
            crop: item.crop,
            plot: item.plot,
            yield: `${item.yield} t/ha`,
            target: `${item.expectedYield} t/ha`,
            gap: `${item.gap > 0 ? '+' : ''}${item.gap} t/ha`,
            status: item.meetsExpectation ? 'Cumple meta' : 'Requiere ajuste',
          }))
        : this.tab() === 'training'
          ? this.store.historicalRecords().map((item) => ({
              id: item.id,
              campaign: item.campaign,
              crop: item.crop,
              location: item.location,
              conditions: `${item.soilHumidity}% hum. · pH ${item.soilPh} · ${item.temperature} °C`,
              yield: `${item.actualYield} t/ha`,
            }))
          : this.store.activities().map((item) => ({
              id: item.id,
              date: this.formatDate(item.date),
              title: item.title,
              detail: item.detail,
            }));
    return source.filter((row) =>
      Object.values(row)
        .join(' ')
        .toLocaleLowerCase('es')
        .includes(this.query().trim().toLocaleLowerCase('es')),
    );
  });
  switchTab(tab: 'predictions' | 'training' | 'activity'): void {
    this.tab.set(tab);
    this.query.set('');
  }
  download(): void {
    downloadCsv(
      `agropredict-${this.tab()}-demo.csv`,
      this.columns().map((column) => column.label),
      this.rows().map((row) => this.columns().map((column) => row[column.key])),
    );
  }
  private formatDate(date: string): string {
    return new Intl.DateTimeFormat('es-PE', {
      day: '2-digit',
      month: 'short',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    }).format(new Date(date));
  }
}
