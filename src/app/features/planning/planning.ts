import { ChangeDetectionStrategy, Component, computed, inject, signal } from '@angular/core';
import { DatePipe } from '@angular/common';
import { MatDialog } from '@angular/material/dialog';
import { MatSnackBar } from '@angular/material/snack-bar';
import { WorkspaceStore } from '../../core/services/workspace.store';
import { Plan } from '../../core/models/agro.models';
import { Icon } from '../../shared/ui/icon';
import { Button, Card, Empty, PageHeader } from '../../shared/ui/primitives';
import { ConfirmDialog } from '../../shared/ui/confirm-dialog';
import { PlanDialog } from './plan-dialog';
@Component({
  selector: 'agro-planning',
  imports: [DatePipe, Icon, Button, Card, Empty, PageHeader],
  template: `
    <agro-page-header
      title="Una buena cosecha empieza con un plan"
      description="Organiza tus campañas y mantén a la vista lo que viene."
      eyebrow="PLANIFICACIÓN DE CULTIVOS"
    >
      <button
        agroButton="primary"
        (click)="create()"
        [disabled]="!store.demo || !store.plots().length"
      >
        <agro-icon name="plus" />
        Nuevo plan de cultivo
      </button>
    </agro-page-header>
    <div class="planning-summary">
      <div>
        <span class="summary-icon"><agro-icon name="calendar" /></span>
        <div>
          <strong>Campaña agrícola 2026</strong>
          <p>{{ store.plans().length }} planes · {{ store.plots().length }} parcelas disponibles</p>
        </div>
      </div>
      <span class="status">Planificación demo</span>
    </div>
    <div class="plan-tabs" role="group" aria-label="Filtrar planes">
      @for (tab of tabs; track tab) {
        <button
          [class.selected]="filter() === tab"
          [attr.aria-pressed]="filter() === tab"
          (click)="filter.set(tab)"
        >
          {{ tab }}
          <span>{{ count(tab) }}</span>
        </button>
      }
    </div>
    <div class="section-grid">
      @for (plan of filtered(); track plan.id) {
        <agro-card class="plan-card">
          <div class="plan-top">
            <span class="crop-icon"><agro-icon name="sprout" /></span>
            <span class="status" [class.amber]="plan.status === 'Planificado'">
              {{ plan.status }}
            </span>
          </div>
          <h2>{{ plan.crop }}</h2>
          <p class="plan-plot">
            <agro-icon name="location" />
            {{ plan.plot }}
          </p>
          <div class="plan-dates">
            <div>
              <span>Siembra</span>
              <strong>{{ plan.startDate | date: 'dd MMM yyyy' }}</strong>
            </div>
            <agro-icon name="arrow" />
            <div>
              <span>Cosecha prevista</span>
              <strong>{{ plan.endDate | date: 'dd MMM yyyy' }}</strong>
            </div>
          </div>
          <div class="plan-cycle">
            <agro-icon name="calendar" />
            {{ days(plan) }} días de campaña
          </div>
          <button
            agroButton="ghost"
            class="remove-plan"
            (click)="remove(plan)"
            [disabled]="!store.demo"
          >
            Eliminar plan
          </button>
        </agro-card>
      }
    </div>
    @if (!filtered().length) {
      <agro-empty
        icon="calendar"
        title="Todavía no hay planes en este estado"
        description="Crea un plan para organizar tu próxima campaña."
      />
    }
    <div class="demo-note note">
      <agro-icon name="info" />
      Los planes nuevos se conservan mientras esta sesión esté abierta. No se ha conectado una API
      ni un calendario externo.
    </div>
  `,
  styles: [
    `
      .planning-summary {
        display: flex;
        align-items: center;
        justify-content: space-between;
        gap: 20px;
        background: var(--green-soft);
        border: 1px solid var(--border);
        border-radius: var(--radius);
        padding: 24px;
        margin-bottom: 28px;
      }
      .planning-summary > div {
        display: flex;
        align-items: center;
        gap: 16px;
      }
      .summary-icon {
        width: 46px;
        height: 46px;
        border-radius: 12px;
        background: var(--surface);
        display: grid;
        place-items: center;
        color: var(--primary);
      }
      .planning-summary strong {
        font-size: 1rem;
        font-weight: 550;
      }
      .planning-summary p {
        font-size: 0.8125rem;
        margin-top: 5px;
      }
      .plan-tabs {
        display: flex;
        gap: 25px;
        border-bottom: 1px solid var(--border);
        margin-bottom: 24px;
        overflow-x: auto;
      }
      .plan-tabs button {
        display: flex;
        align-items: center;
        gap: 8px;
        border: 0;
        border-bottom: 2px solid transparent;
        padding: 0 0 15px;
        background: none;
        color: var(--muted);
        font-size: 0.875rem;
        white-space: nowrap;
      }
      .plan-tabs button.selected {
        border-bottom-color: var(--primary);
        color: var(--primary);
        font-weight: 550;
      }
      .plan-tabs span {
        padding: 2px 6px;
        background: var(--surface);
        border: 1px solid var(--border);
        border-radius: 5px;
        font-size: 0.75rem;
      }
      .plan-card {
        padding: 24px;
      }
      .plan-top {
        display: flex;
        justify-content: space-between;
        align-items: center;
        margin-bottom: 20px;
      }
      .crop-icon {
        display: grid;
        place-items: center;
        background: var(--green-soft);
        border-radius: 11px;
        width: 43px;
        height: 43px;
        color: var(--primary);
      }
      h2 {
        font-size: 1.2rem;
      }
      .plan-plot {
        display: flex;
        gap: 5px;
        align-items: center;
        margin-top: 8px;
        font-size: 0.8125rem;
      }
      .plan-plot agro-icon {
        width: 14px;
        height: 14px;
      }
      .plan-dates {
        display: flex;
        justify-content: space-between;
        gap: 12px;
        align-items: center;
        padding: 22px 0;
        border-top: 1px solid var(--border);
        border-bottom: 1px solid var(--border);
        margin-top: 22px;
      }
      .plan-dates > div {
        display: flex;
        flex-direction: column;
        gap: 8px;
      }
      .plan-dates span {
        color: var(--muted);
        font-size: 0.75rem;
      }
      .plan-dates strong {
        font-size: 0.8125rem;
        font-weight: 550;
      }
      .plan-dates agro-icon {
        color: var(--muted);
        width: 15px;
        height: 15px;
      }
      .plan-cycle {
        display: flex;
        align-items: center;
        gap: 8px;
        margin-top: 18px;
        color: var(--muted);
        font-size: 0.75rem;
      }
      .plan-cycle agro-icon {
        width: 15px;
        height: 15px;
      }
      .remove-plan {
        font-size: 0.75rem;
        padding-left: 0;
        margin-top: 9px;
        color: var(--muted);
      }
      .note {
        margin-top: 26px;
      }
      @media (max-width: 700px) {
        .planning-summary {
          align-items: flex-start;
          flex-direction: column;
        }
        .planning-summary > .status {
          display: none;
        }
      }
    `,
  ],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class Planning {
  readonly store = inject(WorkspaceStore);
  private readonly dialog = inject(MatDialog);
  private readonly snackbar = inject(MatSnackBar);
  readonly tabs = ['Todos', 'En curso', 'Planificado', 'Finalizado'];
  readonly filter = signal('Todos');
  readonly filtered = computed(() =>
    this.store.plans().filter((plan) => this.filter() === 'Todos' || plan.status === this.filter()),
  );
  count(status: string): number {
    return this.store.plans().filter((plan) => status === 'Todos' || plan.status === status).length;
  }
  days(plan: Plan): number {
    return Math.round((Date.parse(plan.endDate) - Date.parse(plan.startDate)) / 86_400_000);
  }
  create(): void {
    this.dialog
      .open(PlanDialog, { width: '540px', maxWidth: 'calc(100vw - 32px)', data: this.store })
      .afterClosed()
      .subscribe((saved: boolean) => {
        if (saved) {
          this.filter.set('Todos');
          this.snackbar.open('Plan creado en esta sesión demo.', 'Cerrar', { duration: 4000 });
        }
      });
  }
  remove(plan: Plan): void {
    this.dialog
      .open(ConfirmDialog, {
        width: '440px',
        data: {
          title: '¿Eliminar este plan?',
          message: `Se eliminará el plan de ${plan.crop} en ${plan.plot} de la sesión demo. Esta acción no se puede deshacer.`,
          confirm: 'Eliminar plan',
          cancel: 'Cancelar',
        },
      })
      .afterClosed()
      .subscribe((confirmed: boolean) => {
        if (confirmed) this.store.removePlan(plan.id);
      });
  }
}
