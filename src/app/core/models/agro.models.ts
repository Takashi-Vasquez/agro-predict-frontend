export type CropStatus = 'En crecimiento' | 'Listo para cosecha' | 'En preparación';
export interface Plot {
  id: string;
  name: string;
  location: string;
  area: number;
  crop: string;
  status: CropStatus;
  progress: number;
  humidity: number;
}
export interface Crop {
  id: string;
  name: string;
  variety: string;
  category: string;
  cycle: number;
  temperature: string;
  water: string;
  color: string;
}
export interface Prediction {
  id: string;
  crop: string;
  plot: string;
  date: string;
  yield: number;
  confidence: number;
  status: 'Completada' | 'En proceso';
  area: number;
  expectedYield: number;
  gap: number;
  meetsExpectation: boolean;
  mode: 'Individual' | 'Masiva';
  recommendations: string[];
  inputs: AgronomicInputs;
}
export interface AgronomicInputs {
  soilType: string;
  temperature: number;
  soilHumidity: number;
  soilPh: number;
  nitrogen: number;
  rainfall: number;
}
export interface HistoricalRecord extends AgronomicInputs {
  id: string;
  crop: string;
  campaign: string;
  location: string;
  actualYield: number;
}
export interface PredictiveModel {
  name: string;
  version: string;
  status: 'Entrenado' | 'Reentrenamiento pendiente';
  trainedAt: string;
  records: number;
  campaigns: number;
  crops: number;
  r2: number;
  mae: number;
}
export interface Plan {
  id: string;
  crop: string;
  plot: string;
  startDate: string;
  endDate: string;
  status: 'Planificado' | 'En curso' | 'Finalizado';
}
export interface Sensor {
  id: string;
  name: string;
  plot: string;
  type: string;
  value: number;
  unit: string;
  battery: number;
  online: boolean;
  history: number[];
}
export interface WeatherDay {
  day: string;
  date: string;
  high: number;
  low: number;
  icon: string;
  rain: number;
}
export interface Activity {
  id: string;
  title: string;
  detail: string;
  type: string;
  date: string;
}
export interface WorkspaceData {
  plots: Plot[];
  crops: Crop[];
  predictions: Prediction[];
  plans: Plan[];
  sensors: Sensor[];
  activities: Activity[];
  historicalRecords: HistoricalRecord[];
  model: PredictiveModel;
}
