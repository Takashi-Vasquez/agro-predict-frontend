import { ChangeDetectionStrategy, Component, computed, inject, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { MatDialog } from '@angular/material/dialog';
import { Sensor } from '../../../core/models/agro.models';
import { WorkspaceStore } from '../../../core/services/workspace.store';
import { Button } from '../../../shared/directives/agro-button.directive';
import { Card } from '../../../shared/directives/agro-card.directive';
import { Input } from '../../../shared/directives/agro-input.directive';
import { Empty } from '../../../shared/ui/agro-empty/agro-empty.component';
import { PageHeader } from '../../../shared/ui/agro-page-header/agro-page-header.component';
import { ConfirmDialog } from '../../../shared/ui/confirm-dialog/confirm-dialog.component';
import { Icon } from '../../../shared/ui/icon';
import { KpiCard } from '../../../shared/ui/kpi-card';
@Component({
  selector: 'agro-sensors',
  imports: [FormsModule, Icon, Button, Card, Empty, Input, PageHeader, KpiCard],
  template: `
    <agro-page-header
      title="Conecta con lo que pasa en el campo"
      description="Consulta las lecturas y el estado de tus dispositivos."
      eyebrow="SENSORES IOT"
    >
      <span class="status neutral">Sin conexión a dispositivos reales</span>
    </agro-page-header>
    <div class="sensor-summary">
      <agro-kpi-card
        label="Sensores registrados"
        [value]="store.sensors().length"
        icon="sensor"
        detail="Dispositivos de ejemplo"
      />
      <agro-kpi-card label="En línea" [value]="online()" icon="wifi" detail="Estado simulado" />
      <agro-kpi-card
        label="Requieren atención"
        [value]="store.sensors().length - online()"
        icon="alert"
        detail="Revisa batería y conectividad"
      />
    </div>
    <div class="sensor-filter">
      <select
        agroInput
        aria-label="Filtrar sensores por conexión"
        [ngModel]="filter()"
        (ngModelChange)="filter.set($event)"
      >
        <option value="all">Todos los dispositivos</option>
        <option value="online">En línea</option>
        <option value="offline">Sin conexión</option>
      </select>
    </div>
    <div class="section-grid">
      @for (sensor of filtered(); track sensor.id) {
        <agro-card class="sensor-card">
          <div class="sensor-top">
            <span><agro-icon [name]="sensor.type" /></span>
            <span class="status" [class.amber]="!sensor.online">
              {{ sensor.online ? 'En línea' : 'Sin conexión' }}
            </span>
          </div>
          <h2>{{ sensor.name }}</h2>
          <p>{{ sensor.plot }} · {{ sensor.id }}</p>
          <div class="sensor-value">
            {{ sensor.value }}
            <span>{{ sensor.unit }}</span>
          </div>
          <div
            class="sensor-history"
            role="img"
            [attr.aria-label]="
              'Últimas siete lecturas: ' + sensor.history.join(', ') + ' ' + sensor.unit
            "
          >
            @for (value of sensor.history; track $index) {
              <i
                [style.height.%]="(value / max(sensor)) * 100"
                [class.offline]="!sensor.online"
              ></i>
            }
          </div>
          <div class="sensor-meta">
            <span>Últimas 7 lecturas · demo</span>
            <span [class.low]="sensor.battery < 20">Batería {{ sensor.battery }}%</span>
          </div>
          <button agroButton="ghost" class="sensor-detail" (click)="details(sensor)">
            Ver dispositivo
            <agro-icon name="arrow" />
          </button>
        </agro-card>
      }
    </div>
    @if (!filtered().length) {
      <agro-empty icon="sensor" title="No hay dispositivos en este estado" />
    }
    <div class="demo-note sensor-note">
      <agro-icon name="info" />
      Las lecturas son estáticas. La conexión a sensores, actualización en tiempo real y alertas
      automáticas se incorporarán con el backend.
    </div>
  `,
  styles: [
    `
      .sensor-summary {
        display: grid;
        grid-template-columns: repeat(3, minmax(0, 1fr));
        gap: 20px;
        margin-bottom: 24px;
      }
      .sensor-filter {
        margin-bottom: 22px;
      }
      .sensor-filter select {
        max-width: 260px;
      }
      .sensor-card {
        padding: 24px;
      }
      .sensor-top {
        display: flex;
        align-items: center;
        justify-content: space-between;
        gap: 10px;
        margin-bottom: 20px;
      }
      .sensor-top > span:first-child {
        display: grid;
        place-items: center;
        width: 43px;
        height: 43px;
        background: var(--green-soft);
        color: var(--primary);
        border-radius: 11px;
      }
      .sensor-card h2 {
        font-size: 1rem;
      }
      .sensor-card > p {
        font-size: 0.75rem;
        margin-top: 7px;
      }
      .sensor-value {
        font-size: 2.5rem;
        font-weight: 550;
        letter-spacing: -1px;
        margin: 24px 0 20px;
      }
      .sensor-value > span {
        font-size: 1.1rem;
        letter-spacing: 0;
        font-weight: 400;
        color: var(--muted);
        margin-left: 5px;
      }
      .sensor-history {
        display: flex;
        align-items: flex-end;
        gap: 9px;
        height: 55px;
      }
      .sensor-history > i {
        flex: 1;
        display: block;
        background: color-mix(in srgb, var(--primary) 60%, var(--green-soft));
        border-radius: 4px 4px 0 0;
      }
      .sensor-history > i:nth-last-child(1) {
        background: var(--primary);
      }
      .sensor-history > i.offline {
        opacity: 0.4;
      }
      .sensor-meta {
        display: flex;
        align-items: center;
        justify-content: space-between;
        gap: 8px;
        font-size: 0.75rem;
        margin-top: 14px;
        color: var(--muted);
      }
      .sensor-meta .low {
        color: var(--amber);
      }
      .sensor-detail {
        padding-left: 0;
        padding-right: 0;
        margin-top: 20px;
        display: flex;
        justify-content: space-between;
        width: 100%;
        border-top: 1px solid var(--border);
        border-radius: 0;
        padding-top: 18px;
        font-size: 0.8125rem;
      }
      .sensor-note {
        margin-top: 26px;
      }
      @media (max-width: 700px) {
        .sensor-summary {
          grid-template-columns: 1fr;
        }
      }
    `,
  ],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class Sensors {
  readonly store = inject(WorkspaceStore);
  private readonly dialog = inject(MatDialog);
  readonly filter = signal('all');
  readonly online = computed(() => this.store.sensors().filter((sensor) => sensor.online).length);
  readonly filtered = computed(() =>
    this.store
      .sensors()
      .filter(
        (sensor) => this.filter() === 'all' || sensor.online === (this.filter() === 'online'),
      ),
  );
  max(sensor: Sensor): number {
    return Math.max(...sensor.history) * 1.15;
  }
  details(sensor: Sensor): void {
    this.dialog.open(ConfirmDialog, {
      width: '460px',
      data: {
        title: `${sensor.name} · ${sensor.id}`,
        message: `Parcela: ${sensor.plot}. Lectura de ejemplo: ${sensor.value} ${sensor.unit}. Batería: ${sensor.battery}%. ${sensor.online ? 'Conectividad simulada activa.' : 'Ejemplo de dispositivo sin conexión y batería baja.'} No hay un dispositivo físico conectado.`,
        confirm: 'Entendido',
      },
    });
  }
}
