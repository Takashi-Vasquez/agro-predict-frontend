import { ChangeDetectionStrategy, Component, computed, inject } from '@angular/core';
import { Card } from '../../../../shared/directives/agro-card.directive';
import { Empty } from '../../../../shared/ui/agro-empty/agro-empty.component';
import { Loader } from '../../../../shared/ui/agro-loader/agro-loader.component';
import { PageHeader } from '../../../../shared/ui/agro-page-header/agro-page-header.component';
import { LineChart } from '../../../../shared/ui/chart';
import { Icon } from '../../../../shared/ui/icon';
import { ForecastDay } from '../weather.model';
import { WeatherService } from '../weather.service';

const MESES_CORTOS = [
  'ene',
  'feb',
  'mar',
  'abr',
  'may',
  'jun',
  'jul',
  'ago',
  'sep',
  'oct',
  'nov',
  'dic',
];

@Component({
  selector: 'agro-weather',
  imports: [Icon, Card, PageHeader, LineChart, Loader, Empty],
  templateUrl: './weather.component.html',
  styleUrls: ['./weather.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class WeatherComponent {
  private readonly weatherService = inject(WeatherService);

  readonly current = this.weatherService.currentResource();
  readonly forecast = this.weatherService.forecastResource();
  readonly curve = this.weatherService.dailyCurveResource();
  readonly alerts = this.weatherService.alertsResource();

  readonly pronosticoSubtitulo = computed(() => {
    const dias = this.forecast.value()?.dias ?? [];
    if (!dias.length) return 'Pronóstico por día';
    return `Pronóstico · del ${dias[0].date} al ${dias[dias.length - 1].date}`;
  });

  readonly alertasLabel = computed(() => {
    const total = this.alerts.value()?.alertas.length ?? 0;
    return total === 1 ? '1 alerta' : `${total} alertas`;
  });

  readonly chartLabel = computed(() => {
    const values = this.curve.value()?.values ?? [];
    if (!values.length) return 'Sin datos de temperatura para hoy.';
    return `Temperatura de hoy: mínima ${Math.min(...values)} °C, máxima ${Math.max(...values)} °C.`;
  });

  formatFecha(fecha?: string | null): string {
    if (!fecha) return '';
    const date = new Date(fecha);
    if (Number.isNaN(date.getTime())) return '';
    const dia = String(date.getDate()).padStart(2, '0');
    return `${dia} ${MESES_CORTOS[date.getMonth()].toUpperCase()} ${date.getFullYear()}`;
  }

  formatDiaFecha(date: string): string {
    const [dia, mes] = date.trim().split(/\s+/);
    return `${String(dia).padStart(2, '0')} ${mes}`;
  }

  labelDia(day: ForecastDay): string {
    if (this.esHoy(day.date)) return 'Hoy';
    const clean = day.day.trim();
    return clean.charAt(0) + clean.slice(1).toLowerCase();
  }

  private esHoy(date: string): boolean {
    const hoy = new Date();
    const esperado = `${hoy.getDate()} ${MESES_CORTOS[hoy.getMonth()]}`;
    return date.trim().toLowerCase() === esperado;
  }
}
