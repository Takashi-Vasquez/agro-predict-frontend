import { ChangeDetectionStrategy, Component, computed, inject, signal } from '@angular/core';
import { MatSnackBar } from '@angular/material/snack-bar';
import { WorkspaceStore } from '../../../core/services/workspace.store';
import { DataTable, TableColumn, TableRow } from '../../../shared/ui/data-table';
import { Icon } from '../../../shared/ui/icon';
import { Button, Card, PageHeader } from '../../../shared/ui/primitives';
import { downloadCsv } from '../../../shared/utils/csv';
type ReportType = 'plots' | 'predictions' | 'plans';
@Component({
  selector: 'agro-reports',
  imports: [Icon, Button, Card, PageHeader, DataTable],
  template: `
    <agro-page-header
      title="Tus datos, una visión más clara"
      description="Reúne la información de tu campo y llévala a tu próxima reunión."
      eyebrow="CENTRO DE REPORTES"
    >
      <button agroButton="primary" (click)="download()" [disabled]="!rows().length">
        <agro-icon name="download" />
        Descargar CSV
      </button>
    </agro-page-header>
    <div class="section-grid report-options">
      @for (report of reportTypes; track report.id) {
        <button
          class="report-option"
          [class.selected]="selected() === report.id"
          [attr.aria-pressed]="selected() === report.id"
          (click)="selected.set(report.id)"
        >
          <span class="report-icon"><agro-icon [name]="report.icon" /></span>
          <span class="report-copy">
            <strong>{{ report.title }}</strong>
            <span>{{ report.description }}</span>
          </span>
          <span class="radio-indicator">
            @if (selected() === report.id) {
              <agro-icon name="check" />
            }
          </span>
        </button>
      }
    </div>
    <agro-card>
      <div class="card-header">
        <div>
          <h2>{{ currentTitle() }}</h2>
          <p>Vista previa del archivo · {{ rows().length }} registros</p>
        </div>
        <span class="status neutral">CSV · UTF-8</span>
      </div>
      <agro-data-table
        [columns]="columns()"
        [rows]="rows()"
        [paginate]="true"
        caption="Vista previa del reporte seleccionado"
      />
    </agro-card>
    <div class="report-info">
      <agro-icon name="file" />
      <div>
        <h3>Listo para trabajar con tus datos</h3>
        <p>
          El archivo CSV incluye los registros de ejemplo y los cambios de esta sesión. Puedes
          abrirlo en una hoja de cálculo. Las cifras no provienen de un modelo real.
        </p>
      </div>
    </div>
  `,
  styles: [
    `
      .report-options {
        margin-bottom: 26px;
      }
      .report-option {
        display: flex;
        align-items: flex-start;
        gap: 14px;
        padding: 23px;
        text-align: left;
        border: 1px solid var(--border);
        border-radius: var(--radius);
        background: var(--surface);
        color: var(--text);
        transition:
          border-color 0.2s,
          background 0.2s;
      }
      .report-option.selected {
        background: var(--green-soft);
        border-color: var(--primary);
      }
      .report-icon {
        display: grid;
        place-items: center;
        width: 39px;
        height: 39px;
        border-radius: 10px;
        background: var(--surface-alt);
        color: var(--primary);
        flex-shrink: 0;
      }
      .report-copy {
        display: flex;
        flex-direction: column;
        gap: 8px;
        flex: 1;
      }
      .report-copy strong {
        font-size: 0.875rem;
        font-weight: 550;
      }
      .report-copy > span {
        font-size: 0.75rem;
        color: var(--muted);
        line-height: 1.7;
      }
      .radio-indicator {
        width: 18px;
        height: 18px;
        border: 1px solid var(--border);
        border-radius: 50%;
        flex-shrink: 0;
        display: grid;
        place-items: center;
        margin-top: 2px;
      }
      .selected .radio-indicator {
        background: var(--primary);
        border-color: var(--primary);
        color: var(--surface);
      }
      .radio-indicator agro-icon {
        width: 12px;
        height: 12px;
      }
      .report-info {
        display: flex;
        gap: 15px;
        padding: 24px 2px;
        color: var(--muted);
      }
      .report-info > agro-icon {
        margin-top: 2px;
      }
      .report-info h3 {
        color: var(--text);
        font-size: 0.875rem;
      }
      .report-info p {
        font-size: 0.8125rem;
        margin-top: 8px;
        max-width: 740px;
      }
      @media (max-width: 1300px) {
        .report-options {
          grid-template-columns: 1fr;
        }
        .report-option {
          align-items: center;
        }
        .report-copy > span {
          font-size: 0.8125rem;
        }
      }
    `,
  ],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class Reports {
  readonly store = inject(WorkspaceStore);
  private readonly snackbar = inject(MatSnackBar);
  readonly selected = signal<ReportType>('plots');
  readonly reportTypes: { id: ReportType; title: string; description: string; icon: string }[] = [
    {
      id: 'plots',
      title: 'Resumen de parcelas',
      description: 'Superficie, cultivos y estados.',
      icon: 'layers',
    },
    {
      id: 'predictions',
      title: 'Predicciones',
      description: 'Rendimiento proyectado, meta y brecha.',
      icon: 'sparkles',
    },
    {
      id: 'plans',
      title: 'Planes de cultivo',
      description: 'Campañas y fechas previstas.',
      icon: 'calendar',
    },
  ];
  readonly currentTitle = computed(
    () => this.reportTypes.find((item) => item.id === this.selected())?.title ?? 'Reporte',
  );
  readonly columns = computed<TableColumn[]>(() =>
    this.selected() === 'plots'
      ? [
          { key: 'name', label: 'PARCELA', kind: 'emphasis' },
          { key: 'crop', label: 'CULTIVO' },
          { key: 'area', label: 'SUPERFICIE (HA)' },
          { key: 'status', label: 'ESTADO', kind: 'status' },
        ]
      : this.selected() === 'predictions'
        ? [
            { key: 'crop', label: 'CULTIVO', kind: 'emphasis' },
            { key: 'plot', label: 'PARCELA' },
            { key: 'yield', label: 'PREDICCIÓN (T/HA)' },
            { key: 'target', label: 'META (T/HA)' },
            { key: 'gap', label: 'BRECHA (T/HA)' },
            { key: 'result', label: 'RESULTADO' },
          ]
        : [
            { key: 'crop', label: 'CULTIVO', kind: 'emphasis' },
            { key: 'plot', label: 'PARCELA' },
            { key: 'startDate', label: 'SIEMBRA' },
            { key: 'endDate', label: 'COSECHA PREVISTA' },
            { key: 'status', label: 'ESTADO', kind: 'status' },
          ],
  );
  readonly rows = computed<TableRow[]>(() =>
    this.selected() === 'plots'
      ? this.store.plots().map((item) => ({
          id: item.id,
          name: item.name,
          crop: item.crop,
          area: item.area,
          status: item.status,
        }))
      : this.selected() === 'predictions'
        ? this.store.predictions().map((item) => ({
            id: item.id,
            crop: item.crop,
            plot: item.plot,
            yield: item.yield,
            target: item.expectedYield,
            gap: item.gap,
            result: item.meetsExpectation ? 'Cumple meta' : 'Requiere ajuste',
          }))
        : this.store.plans().map((item) => ({
            id: item.id,
            crop: item.crop,
            plot: item.plot,
            startDate: item.startDate,
            endDate: item.endDate,
            status: item.status,
          })),
  );
  download(): void {
    downloadCsv(
      `agropredict-${this.selected()}-demo.csv`,
      this.columns().map((column) => column.label),
      this.rows().map((row) => this.columns().map((column) => row[column.key])),
    );
    this.snackbar.open('Se ha preparado la descarga del reporte CSV.', 'Cerrar', {
      duration: 3500,
    });
  }
}
