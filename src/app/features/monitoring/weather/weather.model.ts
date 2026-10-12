export interface WeatherMetric {
  label: string;
  value: number;
  unit: string;
  detail: string;
  icon: string;
}

export interface CurrentWeather {
  ubicacion: string;
  fecha: string | null;
  stale: boolean;
  temperatura_actual: number | null;
  descripcion: string;
  icono: string;
  maxima: number | null;
  minima: number | null;
  sensacion_termica: number | null;
  metrics: WeatherMetric[];
}

export interface ForecastDay {
  day: string;
  date: string;
  icon: string;
  high: number | null;
  low: number | null;
  rain: number | null;
}

export interface Forecast {
  dias: ForecastDay[];
}

export interface DailyCurve {
  values: number[];
  labels: string[];
  max: number;
}

export interface WeatherAlert {
  icon: string;
  titulo: string;
  detalle: string;
  nivel: string;
}

export interface WeatherAlerts {
  alertas: WeatherAlert[];
}
