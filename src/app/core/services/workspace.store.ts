import { DestroyRef, Injectable, computed, inject, signal } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { AgroRepository } from './agro.repository';
import {
  Activity,
  HistoricalRecord,
  Plan,
  Plot,
  Prediction,
  WorkspaceData,
} from '../models/agro.models';
import { environment } from '../../../environments/environment';

const EMPTY: WorkspaceData = {
  plots: [],
  crops: [],
  predictions: [],
  plans: [],
  sensors: [],
  activities: [],
  historicalRecords: [],
  model: {
    name: 'AgroModel Rendimiento',
    version: 'Sin entrenar',
    status: 'Reentrenamiento pendiente',
    trainedAt: '',
    records: 0,
    campaigns: 0,
    crops: 0,
    r2: 0,
    mae: 0,
  },
};
@Injectable()
export class WorkspaceStore {
  private readonly repository = inject(AgroRepository);
  private readonly destroyRef = inject(DestroyRef);
  private readonly state = signal<WorkspaceData>(EMPTY);
  readonly loading = signal(true);
  readonly error = signal(false);
  readonly plots = computed(() => this.state().plots);
  readonly crops = computed(() => this.state().crops);
  readonly predictions = computed(() => this.state().predictions);
  readonly plans = computed(() => this.state().plans);
  readonly sensors = computed(() => this.state().sensors);
  readonly activities = computed(() => this.state().activities);
  readonly historicalRecords = computed(() => this.state().historicalRecords);
  readonly model = computed(() => this.state().model);
  readonly totalArea = computed(() => this.plots().reduce((total, plot) => total + plot.area, 0));
  readonly averageConfidence = computed(() => {
    const predictions = this.predictions();
    return predictions.length
      ? predictions.reduce((sum, item) => sum + item.confidence, 0) / predictions.length
      : 0;
  });
  readonly demo = environment.useMockApi;
  constructor() {
    this.load();
  }
  load(): void {
    this.loading.set(true);
    this.error.set(false);
    this.repository
      .loadWorkspace()
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe({
        next: (data) => {
          this.state.set(data);
          this.loading.set(false);
        },
        error: () => {
          this.error.set(true);
          this.loading.set(false);
        },
      });
  }
  addPlot(plot: Omit<Plot, 'id' | 'progress' | 'humidity' | 'status'>): void {
    this.requireDemo();
    const item: Plot = {
      ...plot,
      id: `PAR-${crypto.randomUUID().slice(0, 8)}`,
      progress: 0,
      humidity: 0,
      status: 'En preparación',
    };
    this.state.update((state) => ({ ...state, plots: [...state.plots, item] }));
    this.log('Nueva parcela registrada', `${plot.name} · ${plot.area} ha`, 'layers');
  }
  addPlan(plan: Omit<Plan, 'id' | 'status'>): void {
    this.requireDemo();
    this.state.update((state) => ({
      ...state,
      plans: [
        ...state.plans,
        { ...plan, id: `PLA-${crypto.randomUUID().slice(0, 8)}`, status: 'Planificado' },
      ],
    }));
    this.log('Plan de cultivo creado', `${plan.crop} · ${plan.plot}`, 'calendar');
  }
  removePlan(id: string): void {
    this.requireDemo();
    this.state.update((state) => ({
      ...state,
      plans: state.plans.filter((plan) => plan.id !== id),
    }));
    this.log('Plan de cultivo eliminado', 'Cambio realizado en la sesión demo', 'calendar');
  }
  addPrediction(prediction: Omit<Prediction, 'id' | 'date' | 'status'>): Prediction {
    this.requireDemo();
    const item: Prediction = {
      ...prediction,
      id: `PRE-${crypto.randomUUID().slice(0, 8)}`,
      date: new Date().toISOString(),
      status: 'Completada',
    };
    this.state.update((state) => ({ ...state, predictions: [item, ...state.predictions] }));
    this.log(
      item.meetsExpectation ? 'Predicción sobre la meta' : 'Predicción bajo la meta',
      `${item.crop} · ${item.plot}`,
      'sparkles',
    );
    return item;
  }
  addHistoricalRecord(record: Omit<HistoricalRecord, 'id'>): HistoricalRecord {
    this.requireDemo();
    const item: HistoricalRecord = {
      ...record,
      id: `HIS-${crypto.randomUUID().slice(0, 8)}`,
    };
    this.state.update((state) => ({
      ...state,
      historicalRecords: [item, ...state.historicalRecords],
      model: {
        ...state.model,
        status: 'Reentrenamiento pendiente',
        records: state.model.records + 1,
      },
    }));
    this.log('Registro histórico incorporado', `${record.crop} · ${record.campaign}`, 'history');
    return item;
  }
  trainDemoModel(): void {
    this.requireDemo();
    const current = this.model();
    const versionNumber = Number(current.version.match(/v1\.(\d+)/)?.[1] ?? 3) + 1;
    this.state.update((state) => ({
      ...state,
      model: {
        ...state.model,
        version: `v1.${versionNumber}-demo`,
        status: 'Entrenado',
        trainedAt: new Date().toISOString(),
        r2: Math.min(0.94, Number((state.model.r2 + 0.002).toFixed(3))),
      },
    }));
    this.log('Modelo demo reentrenado', `${this.model().records} registros históricos`, 'chart');
  }
  private requireDemo(): void {
    if (!this.demo)
      throw new Error('Las escrituras REST deben implementarse antes de desactivar el modo demo.');
  }
  private log(title: string, detail: string, type: string): void {
    const activity: Activity = {
      id: crypto.randomUUID(),
      title,
      detail,
      type,
      date: new Date().toISOString(),
    };
    this.state.update((state) => ({ ...state, activities: [activity, ...state.activities] }));
  }
}
