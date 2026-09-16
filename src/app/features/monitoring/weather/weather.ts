import { ChangeDetectionStrategy, Component } from '@angular/core';
import { WEATHER } from '../../../core/data/mock-data';
import { Card } from '../../../shared/directives/agro-card.directive';
import { PageHeader } from '../../../shared/ui/agro-page-header/agro-page-header.component';
import { LineChart } from '../../../shared/ui/chart';
import { Icon } from '../../../shared/ui/icon';
@Component({
  selector: 'agro-weather',
  imports: [Icon, Card, PageHeader, LineChart],
  template: `
    <agro-page-header
      title="El clima, de tu lado"
      description="Visualiza las condiciones del campo y anticipa cambios en tu planificación."
      eyebrow="MONITOREO CLIMÁTICO"
    >
      <span class="location-label">
        <agro-icon name="location" />
        Chao, La Libertad, Perú
      </span>
    </agro-page-header>
    <div class="weather-overview">
      <section class="current-weather">
        <div class="current-top">
          <span>
            <agro-icon name="location" />
            Valle de Chao
          </span>
          <span class="weather-demo">03 SEP 2026 · DEMO</span>
        </div>
        <div class="current-temperature">
          <div>
            24
            <span>°C</span>
            <p>Mayormente soleado</p>
          </div>
          <agro-icon name="sun" />
        </div>
        <div class="current-bottom">
          <span>
            Máxima
            <strong>24°</strong>
          </span>
          <span>
            Mínima
            <strong>16°</strong>
          </span>
          <span>
            Sensación
            <strong>25°</strong>
          </span>
        </div>
      </section>
      <div class="weather-metrics">
        @for (metric of metrics; track metric.label) {
          <agro-card>
            <span class="weather-metric-icon"><agro-icon [name]="metric.icon" /></span>
            <div>
              <p>{{ metric.label }}</p>
              <strong>
                {{ metric.value }}
                <small>{{ metric.unit }}</small>
              </strong>
              <span>{{ metric.detail }}</span>
            </div>
          </agro-card>
        }
      </div>
    </div>
    <agro-card class="forecast-card">
      <div class="card-header">
        <div>
          <h2>Los próximos 7 días</h2>
          <p>Pronóstico de ejemplo · 3 al 9 de septiembre de 2026</p>
        </div>
        <span class="status neutral">Datos simulados</span>
      </div>
      <div class="forecast-grid">
        @for (day of forecast; track day.day) {
          <div [class.today]="$first">
            <strong>{{ day.day }}</strong>
            <span>{{ day.date }}</span>
            <agro-icon [name]="day.icon" />
            <div class="forecast-temperatures">
              <strong>{{ day.high }}°</strong>
              <span>{{ day.low }}°</span>
            </div>
            <small>
              <agro-icon name="drop" />
              {{ day.rain }}%
            </small>
          </div>
        }
      </div>
    </agro-card>
    <div class="weather-bottom">
      <agro-card>
        <div class="card-header">
          <div>
            <h2>Temperatura durante el día</h2>
            <p>Curva ilustrativa en grados Celsius</p>
          </div>
          <agro-icon name="thermometer" />
        </div>
        <div class="temperature-chart">
          <agro-line-chart
            [values]="[16, 16, 17, 19, 22, 24, 25, 24, 22, 20, 18, 17]"
            [max]="32"
            [labels]="['00:00', '04:00', '08:00', '12:00', '16:00', '20:00']"
            label="Temperatura simulada: mínima 16 °C, máxima 25 °C."
          />
        </div>
      </agro-card>
      <agro-card>
        <div class="card-header">
          <h2>Alertas del campo</h2>
          <span class="status amber">2 alertas demo</span>
        </div>
        <div class="weather-alert">
          <span><agro-icon name="rain" /></span>
          <div>
            <strong>Posibilidad de lluvias</strong>
            <p>Escenario de ejemplo para el sábado 5 de septiembre: 80% de probabilidad.</p>
            <small>Moderada · escenario simulado</small>
          </div>
        </div>
        <div class="weather-alert">
          <span><agro-icon name="sun" /></span>
          <div>
            <strong>Mayor radiación al mediodía</strong>
            <p>Ejemplo de aviso de radiación elevada entre las 11:00 y las 14:00.</p>
            <small>Informativa · escenario simulado</small>
          </div>
        </div>
      </agro-card>
    </div>
  `,
  styles: [
    `
      .location-label {
        display: flex;
        align-items: center;
        gap: 8px;
        color: var(--muted);
        font-size: 0.875rem;
      }
      .weather-overview {
        display: grid;
        grid-template-columns: 1fr 1.3fr;
        gap: 24px;
        margin-bottom: 24px;
      }
      .current-weather {
        background: #244f3a;
        color: #eaf3e5;
        padding: 27px;
        border-radius: var(--radius);
      }
      .current-top {
        display: flex;
        align-items: center;
        justify-content: space-between;
        gap: 10px;
      }
      .current-top > span:first-child {
        display: flex;
        align-items: center;
        gap: 7px;
        font-size: 0.875rem;
      }
      .current-top agro-icon {
        width: 15px;
        height: 15px;
      }
      .weather-demo {
        font-size: 0.75rem;
        letter-spacing: 0.06em;
        color: #b4cba9;
      }
      .current-temperature {
        display: flex;
        align-items: center;
        justify-content: space-between;
        margin: 26px 0;
      }
      .current-temperature > div {
        font-size: 4.5rem;
        line-height: 1;
        letter-spacing: -3px;
        font-weight: 500;
      }
      .current-temperature > div > span {
        font-size: 1.7rem;
        color: #b4cba9;
        vertical-align: top;
        letter-spacing: 0;
        display: inline-block;
        margin-top: 10px;
      }
      .current-temperature p {
        color: #c0d0b9;
        letter-spacing: 0;
        font-size: 0.875rem;
        margin-top: 13px;
      }
      .current-temperature > agro-icon {
        width: 80px;
        height: 80px;
        color: #deca80;
        margin-right: 20px;
      }
      .current-bottom {
        border-top: 1px solid #49684d;
        padding-top: 20px;
        display: flex;
        justify-content: space-between;
        gap: 8px;
        font-size: 0.75rem;
        color: #bacab3;
      }
      .current-bottom strong {
        color: #edf5e8;
        margin-left: 5px;
        font-weight: 500;
      }
      .weather-metrics {
        display: grid;
        grid-template-columns: 1fr 1fr;
        gap: 18px;
      }
      .weather-metrics agro-card {
        display: flex;
        align-items: center;
        gap: 18px;
        padding: 24px;
      }
      .weather-metric-icon {
        color: var(--primary);
        background: var(--green-soft);
        display: grid;
        place-items: center;
        width: 42px;
        height: 42px;
        flex-shrink: 0;
        border-radius: 11px;
      }
      .weather-metrics p {
        font-size: 0.8125rem;
      }
      .weather-metrics strong {
        display: block;
        font-size: 1.6rem;
        font-weight: 550;
        margin: 6px 0;
      }
      .weather-metrics small {
        font-size: 0.875rem;
        font-weight: 400;
        color: var(--muted);
        margin-left: 4px;
      }
      .weather-metrics div > span {
        font-size: 0.75rem;
        color: var(--muted);
      }
      .forecast-grid {
        display: grid;
        grid-template-columns: repeat(7, 1fr);
        gap: 8px;
        padding: 0 24px 24px;
        overflow-x: auto;
      }
      .forecast-grid > div {
        display: flex;
        flex-direction: column;
        align-items: center;
        min-width: 85px;
        padding: 20px 10px;
        border-radius: 10px;
        border: 1px solid transparent;
      }
      .forecast-grid > div.today {
        background: var(--green-soft);
        border-color: var(--border);
      }
      .forecast-grid > div > strong {
        font-size: 0.875rem;
        font-weight: 550;
      }
      .forecast-grid > div > span {
        font-size: 0.75rem;
        color: var(--muted);
        margin-top: 5px;
      }
      .forecast-grid > div > agro-icon {
        width: 34px;
        height: 34px;
        color: #b5a165;
        margin: 23px 0;
      }
      .forecast-temperatures {
        display: flex;
        gap: 10px;
        font-size: 1rem;
      }
      .forecast-temperatures strong {
        font-weight: 550;
      }
      .forecast-temperatures span {
        color: var(--muted);
      }
      .forecast-grid small {
        display: flex;
        align-items: center;
        gap: 4px;
        font-size: 0.75rem;
        color: var(--blue);
        margin-top: 16px;
      }
      .forecast-grid small agro-icon {
        width: 12px;
        height: 12px;
      }
      .weather-bottom {
        display: grid;
        grid-template-columns: 1.3fr 1fr;
        gap: 24px;
        margin-top: 24px;
      }
      .temperature-chart {
        padding: 12px 24px 25px;
      }
      .weather-alert {
        display: flex;
        gap: 12px;
        padding: 5px 24px 24px;
      }
      .weather-alert > span {
        display: grid;
        place-items: center;
        width: 34px;
        height: 34px;
        flex-shrink: 0;
        background: var(--amber-soft);
        color: var(--amber);
        border-radius: 9px;
      }
      .weather-alert strong {
        font-size: 0.875rem;
        font-weight: 550;
      }
      .weather-alert p {
        font-size: 0.8125rem;
        margin-top: 7px;
      }
      .weather-alert small {
        display: block;
        margin-top: 8px;
        color: var(--amber);
        font-size: 0.75rem;
      }
      @media (max-width: 1200px) {
        .weather-overview,
        .weather-bottom {
          grid-template-columns: 1fr;
        }
      }
      @media (max-width: 600px) {
        .weather-metrics {
          grid-template-columns: 1fr 1fr;
          gap: 12px;
        }
        .weather-metrics agro-card {
          padding: 17px;
          gap: 10px;
          flex-direction: column;
          align-items: flex-start;
        }
        .current-top {
          flex-wrap: wrap;
        }
        .forecast-grid {
          padding: 0 15px 15px;
        }
        .forecast-card .status {
          display: none;
        }
        .weather-metrics p {
          font-size: 0.75rem;
        }
      }
    `,
  ],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class Weather {
  readonly forecast = WEATHER;
  readonly metrics = [
    {
      label: 'Humedad relativa',
      value: '64',
      unit: '%',
      detail: 'Lectura de ejemplo',
      icon: 'drop',
    },
    {
      label: 'Velocidad del viento',
      value: '12',
      unit: 'km/h',
      detail: 'Dirección suroeste',
      icon: 'wind',
    },
    {
      label: 'Probabilidad de lluvia',
      value: '10',
      unit: '%',
      detail: 'Escenario de hoy',
      icon: 'rain',
    },
    { label: 'Índice UV', value: '6', unit: '/ 11', detail: 'Valor ilustrativo alto', icon: 'sun' },
  ];
}
