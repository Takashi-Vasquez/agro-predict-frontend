import { ChangeDetectionStrategy, Component, computed, inject, signal } from '@angular/core';
import { DecimalPipe } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { MatDialog } from '@angular/material/dialog';
import { MatSnackBar } from '@angular/material/snack-bar';
import { RouterLink } from '@angular/router';
import { WorkspaceStore } from '../../core/services/workspace.store';
import { Icon } from '../../shared/ui/icon';
import { Button, Card, Empty, Input, PageHeader } from '../../shared/ui/primitives';
import { KpiCard } from '../../shared/ui/kpi-card';
import { PlotDialog } from './plot-dialog';
@Component({
  selector: 'agro-plots',
  imports: [
    DecimalPipe,
    FormsModule,
    RouterLink,
    Icon,
    Button,
    Card,
    Empty,
    Input,
    PageHeader,
    KpiCard,
  ],
  template: `
    <agro-page-header
      title="Tus parcelas, en perspectiva"
      description="Cada espacio tiene el potencial de una gran cosecha."
      eyebrow="GESTIÓN AGRÍCOLA"
    >
      <button agroButton="primary" (click)="create()" [disabled]="!store.demo">
        <agro-icon name="plus" />
        Nueva parcela
      </button>
    </agro-page-header>
    <div class="metrics">
      <agro-kpi-card
        label="Parcelas registradas"
        [value]="store.plots().length"
        icon="layers"
        detail="En tu espacio agrícola"
      />
      <agro-kpi-card
        label="Superficie gestionada"
        [value]="(store.totalArea() | number: '1.0-1') || '0'"
        unit="ha"
        detail="Distribuida entre todos tus cultivos"
      />
      <agro-kpi-card
        label="Listas para cosechar"
        [value]="ready()"
        icon="check"
        detail="Según el estado de demostración"
      />
    </div>
    <div class="filter-row">
      <div class="search-field">
        <agro-icon name="search" />
        <input
          agroInput
          type="search"
          placeholder="Buscar parcela o cultivo…"
          aria-label="Buscar parcelas"
          [ngModel]="query()"
          (ngModelChange)="query.set($event)"
        />
      </div>
      <select
        agroInput
        aria-label="Filtrar por estado"
        [ngModel]="status()"
        (ngModelChange)="status.set($event)"
      >
        <option value="">Todos los estados</option>
        <option>En crecimiento</option>
        <option>Listo para cosecha</option>
        <option>En preparación</option>
      </select>
      <span>{{ filtered().length }} parcelas</span>
    </div>
    <div class="section-grid">
      @for (plot of filtered(); track plot.id) {
        <agro-card class="plot-card">
          <div class="plot-top">
            <span class="plot-icon"><agro-icon name="layers" /></span>
            <span
              class="status"
              [class.blue]="plot.status === 'En crecimiento'"
              [class.amber]="plot.status === 'En preparación'"
            >
              {{ plot.status }}
            </span>
          </div>
          <h2>{{ plot.name }}</h2>
          <p class="plot-location">
            <agro-icon name="location" />
            {{ plot.location }}
          </p>
          <div class="plot-data">
            <div>
              <span>Cultivo</span>
              <strong>{{ plot.crop }}</strong>
            </div>
            <div>
              <span>Superficie</span>
              <strong>
                {{ plot.area | number: '1.0-1' }}
                <small>ha</small>
              </strong>
            </div>
            <div>
              <span>Humedad</span>
              <strong>{{ plot.humidity ? plot.humidity + '%' : 'Sin datos' }}</strong>
            </div>
          </div>
          <div class="progress-label">
            <span>Desarrollo del cultivo</span>
            <strong>{{ plot.progress }}%</strong>
          </div>
          <div
            class="progress-track"
            role="progressbar"
            [attr.aria-label]="'Desarrollo de ' + plot.name"
            aria-valuemin="0"
            aria-valuemax="100"
            [attr.aria-valuenow]="plot.progress"
          >
            <span [style.width.%]="plot.progress"></span>
          </div>
          <a class="plot-link" routerLink="/predicciones" [queryParams]="{ parcela: plot.id }">
            Explorar predicción
            <agro-icon name="arrow" />
          </a>
        </agro-card>
      }
    </div>
    @if (!filtered().length) {
      <agro-empty
        title="No encontramos parcelas"
        description="Ajusta los filtros o registra tu primera parcela."
      />
    }
  `,
  styles: [
    `
      .metrics {
        display: grid;
        grid-template-columns: repeat(3, minmax(0, 1fr));
        gap: 20px;
        margin-bottom: 28px;
      }
      .filter-row {
        display: flex;
        align-items: center;
        gap: 12px;
        margin-bottom: 22px;
      }
      .filter-row select {
        max-width: 220px;
      }
      .filter-row > span {
        margin-left: auto;
        color: var(--muted);
        font-size: 0.75rem;
        white-space: nowrap;
      }
      .plot-card {
        padding: 24px;
      }
      .plot-top {
        display: flex;
        align-items: center;
        justify-content: space-between;
        gap: 8px;
        margin-bottom: 20px;
      }
      .plot-icon {
        display: grid;
        place-items: center;
        width: 40px;
        height: 40px;
        border-radius: 11px;
        background: var(--green-soft);
        color: var(--primary);
      }
      h2 {
        font-size: 1.1rem;
      }
      .plot-location {
        display: flex;
        align-items: center;
        gap: 6px;
        font-size: 0.75rem;
        margin-top: 8px;
      }
      .plot-location agro-icon {
        width: 13px;
        height: 13px;
      }
      .plot-data {
        display: grid;
        grid-template-columns: repeat(3, 1fr);
        gap: 10px;
        border-top: 1px solid var(--border);
        border-bottom: 1px solid var(--border);
        padding: 21px 0;
        margin: 22px 0;
      }
      .plot-data > div {
        display: flex;
        flex-direction: column;
        gap: 8px;
      }
      .plot-data span {
        color: var(--muted);
        font-size: 0.75rem;
      }
      .plot-data strong {
        font-size: 0.875rem;
        font-weight: 550;
      }
      .plot-data small {
        color: var(--muted);
        font-weight: 400;
      }
      .progress-label {
        display: flex;
        justify-content: space-between;
        font-size: 0.75rem;
        color: var(--muted);
      }
      .progress-label strong {
        font-weight: 500;
        color: var(--primary);
      }
      .progress-track {
        background: var(--green-soft);
        border-radius: 10px;
        height: 5px;
        margin: 11px 0 24px;
        overflow: hidden;
      }
      .progress-track span {
        display: block;
        height: 100%;
        background: var(--primary);
        border-radius: 10px;
      }
      .plot-link {
        display: flex;
        justify-content: space-between;
        align-items: center;
        color: var(--primary);
        font-size: 0.8125rem;
      }
      .plot-link agro-icon {
        width: 16px;
        height: 16px;
      }
      @media (max-width: 700px) {
        .metrics {
          grid-template-columns: 1fr;
        }
        .filter-row {
          flex-wrap: wrap;
        }
        .filter-row .search-field {
          max-width: none;
        }
        .filter-row select {
          max-width: none;
        }
        .filter-row > span {
          margin-left: 0;
        }
      }
    `,
  ],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class Plots {
  readonly store = inject(WorkspaceStore);
  private readonly dialog = inject(MatDialog);
  private readonly snackbar = inject(MatSnackBar);
  readonly query = signal('');
  readonly status = signal('');
  readonly ready = computed(
    () => this.store.plots().filter((plot) => plot.status === 'Listo para cosecha').length,
  );
  readonly filtered = computed(() =>
    this.store
      .plots()
      .filter(
        (plot) =>
          (!this.status() || plot.status === this.status()) &&
          `${plot.name} ${plot.crop}`
            .toLocaleLowerCase('es')
            .includes(this.query().trim().toLocaleLowerCase('es')),
      ),
  );
  create(): void {
    this.dialog
      .open(PlotDialog, { width: '530px', maxWidth: 'calc(100vw - 32px)', data: this.store })
      .afterClosed()
      .subscribe((saved: boolean) => {
        if (saved)
          this.snackbar.open('Parcela registrada en esta sesión demo.', 'Cerrar', {
            duration: 4000,
          });
      });
  }
}
