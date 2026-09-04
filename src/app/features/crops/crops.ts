import { ChangeDetectionStrategy, Component, computed, inject, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { RouterLink } from '@angular/router';
import { WorkspaceStore } from '../../core/services/workspace.store';
import { Icon } from '../../shared/ui/icon';
import { Button, Card, Empty, Input, PageHeader } from '../../shared/ui/primitives';
@Component({
  selector: 'agro-crops',
  imports: [FormsModule, RouterLink, Icon, Button, Card, Empty, Input, PageHeader],
  template: `
    <agro-page-header
      title="Conoce lo que cultivas"
      description="Un catálogo de referencia para organizar tus campañas."
      eyebrow="CATÁLOGO DE CULTIVOS"
    >
      <a agroButton="primary" routerLink="/planificacion">
        <agro-icon name="calendar" />
        Planificar cultivo
      </a>
    </agro-page-header>
    <div class="crop-filters">
      <div class="search-field">
        <agro-icon name="search" />
        <input
          agroInput
          type="search"
          aria-label="Buscar cultivos"
          placeholder="Buscar cultivo o variedad…"
          [ngModel]="query()"
          (ngModelChange)="query.set($event)"
        />
      </div>
      <span>{{ filtered().length }} cultivos en tu catálogo</span>
    </div>
    <div class="section-grid">
      @for (crop of filtered(); track crop.id) {
        <agro-card class="crop-card">
          <div class="crop-banner" [style.--crop-color]="crop.color">
            <span class="crop-initial">{{ crop.name.slice(0, 2).toUpperCase() }}</span>
            <span class="crop-category">{{ crop.category }}</span>
            <agro-icon name="sprout" />
          </div>
          <div class="crop-body">
            <h2>{{ crop.name }}</h2>
            <p>{{ crop.variety }}</p>
            <dl>
              <div>
                <dt>
                  <agro-icon name="calendar" />
                  Ciclo de referencia
                </dt>
                <dd>{{ crop.cycle }} días</dd>
              </div>
              <div>
                <dt>
                  <agro-icon name="thermometer" />
                  Temperatura
                </dt>
                <dd>{{ crop.temperature }}</dd>
              </div>
              <div>
                <dt>
                  <agro-icon name="drop" />
                  Requerimiento hídrico
                </dt>
                <dd>{{ crop.water }}</dd>
              </div>
              <div>
                <dt>
                  <agro-icon name="layers" />
                  Parcelas asignadas
                </dt>
                <dd>{{ plotCount(crop.name) }}</dd>
              </div>
            </dl>
            <a routerLink="/planificacion" class="crop-action">
              Ver planificación
              <agro-icon name="arrow" />
            </a>
          </div>
        </agro-card>
      }
    </div>
    @if (!filtered().length) {
      <agro-empty
        title="No encontramos ese cultivo"
        description="Prueba con el nombre de un cultivo o una variedad."
      />
    }
    <div class="demo-note crop-note">
      <agro-icon name="info" />
      Parámetros ilustrativos del catálogo demo, no recomendaciones agronómicas. Deben validarse por
      zona, variedad y campaña antes de usarse.
    </div>
  `,
  styles: [
    `
      .crop-filters {
        display: flex;
        align-items: center;
        gap: 15px;
        justify-content: space-between;
        margin-bottom: 24px;
      }
      .crop-filters > span {
        font-size: 0.8125rem;
        color: var(--muted);
      }
      .crop-card {
        overflow: hidden;
      }
      .crop-banner {
        height: 128px;
        background: color-mix(in srgb, var(--crop-color) 17%, var(--surface));
        position: relative;
        padding: 23px;
        display: flex;
        align-items: flex-start;
        justify-content: space-between;
        overflow: hidden;
        border-bottom: 1px solid var(--border);
      }
      .crop-initial {
        font-size: 3.3rem;
        font-weight: 600;
        letter-spacing: -3px;
        color: var(--crop-color);
        align-self: center;
      }
      .crop-category {
        background: var(--surface);
        border: 1px solid var(--border);
        padding: 5px 9px;
        border-radius: 5px;
        font-size: 0.75rem;
        color: var(--muted);
      }
      .crop-banner > agro-icon {
        position: absolute;
        bottom: -18px;
        right: 35px;
        color: var(--crop-color);
        width: 100px;
        height: 100px;
        opacity: 0.16;
      }
      .crop-body {
        padding: 24px;
      }
      .crop-body h2 {
        font-size: 1.25rem;
      }
      .crop-body > p {
        font-size: 0.8125rem;
        margin-top: 6px;
      }
      dl {
        margin: 23px 0;
      }
      dl > div {
        display: flex;
        justify-content: space-between;
        gap: 10px;
        margin: 17px 0;
        font-size: 0.8125rem;
      }
      dt {
        display: flex;
        align-items: center;
        gap: 8px;
        color: var(--muted);
      }
      dt agro-icon {
        width: 16px;
        height: 16px;
      }
      dd {
        margin: 0;
        font-weight: 500;
        white-space: nowrap;
      }
      .crop-action {
        display: flex;
        align-items: center;
        justify-content: space-between;
        border-top: 1px solid var(--border);
        padding-top: 18px;
        font-size: 0.8125rem;
        color: var(--primary);
      }
      .crop-action agro-icon {
        width: 15px;
        height: 15px;
      }
      .crop-note {
        margin-top: 26px;
      }
      @media (max-width: 600px) {
        .crop-filters {
          flex-direction: column;
          align-items: flex-start;
        }
      }
    `,
  ],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class Crops {
  readonly store = inject(WorkspaceStore);
  readonly query = signal('');
  readonly filtered = computed(() =>
    this.store
      .crops()
      .filter((crop) =>
        `${crop.name} ${crop.variety}`.toLowerCase().includes(this.query().trim().toLowerCase()),
      ),
  );
  plotCount(name: string): number {
    return this.store.plots().filter((plot) => plot.crop === name).length;
  }
}
