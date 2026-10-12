import { Injectable, inject } from '@angular/core';
import { Observable } from 'rxjs';
import { ApiService } from '../../../core/services/api.service';
import { toResource } from '../../../shared/utils/to-resource';
import { CurrentWeather, DailyCurve, Forecast, WeatherAlerts } from './weather.model';

@Injectable({ providedIn: 'root' })
export class WeatherService {
  private readonly api = inject(ApiService);
  private readonly moduleBaseUrl: string = 'weather';

  getCurrent(): Observable<CurrentWeather> {
    return this.api.get<CurrentWeather>(`${this.moduleBaseUrl}/current`);
  }

  getForecast(days = 7): Observable<Forecast> {
    return this.api.get<Forecast>(`${this.moduleBaseUrl}/forecast?days=${days}`);
  }

  getDailyCurve(): Observable<DailyCurve> {
    return this.api.get<DailyCurve>(`${this.moduleBaseUrl}/daily-curve`);
  }

  getAlerts(): Observable<WeatherAlerts> {
    return this.api.get<WeatherAlerts>(`${this.moduleBaseUrl}/alerts`);
  }

  currentResource() {
    return toResource(() => this.getCurrent());
  }

  forecastResource() {
    return toResource(() => this.getForecast());
  }

  dailyCurveResource() {
    return toResource(() => this.getDailyCurve());
  }

  alertsResource() {
    return toResource(() => this.getAlerts());
  }
}
