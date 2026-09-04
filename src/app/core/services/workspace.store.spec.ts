import { TestBed } from '@angular/core/testing';
import { of, throwError } from 'rxjs';
import { AgroRepository } from './agro.repository';
import { WorkspaceStore } from './workspace.store';
import { MOCK_WORKSPACE } from '../data/mock-data';

describe('WorkspaceStore', () => {
  const repository = { loadWorkspace: vi.fn() };
  beforeEach(() => {
    repository.loadWorkspace.mockReturnValue(of(structuredClone(MOCK_WORKSPACE)));
    TestBed.configureTestingModule({
      providers: [WorkspaceStore, { provide: AgroRepository, useValue: repository }],
    });
  });
  it('carga fixtures regionales y calcula superficie y confianza', () => {
    const store = TestBed.inject(WorkspaceStore);
    expect(store.loading()).toBe(false);
    expect(store.plots()).toHaveLength(6);
    expect(store.totalArea()).toBe(95);
    expect(store.averageConfidence()).toBeCloseTo(91.775);
    expect(store.model().records).toBe(12480);
  });
  it('registra una parcela y actualiza los consumidores sin mutar los fixtures', () => {
    const store = TestBed.inject(WorkspaceStore);
    store.addPlot({ name: 'Nueva parcela', location: 'Virú', area: 5, crop: 'Arándano' });
    expect(store.totalArea()).toBe(100);
    expect(store.plots().at(-1)?.status).toBe('En preparación');
    expect(store.activities()[0].title).toBe('Nueva parcela registrada');
    expect(MOCK_WORKSPACE.plots).toHaveLength(6);
  });
  it('crea y elimina un plan por su identificador', () => {
    const store = TestBed.inject(WorkspaceStore);
    store.addPlan({
      crop: 'Palta',
      plot: 'Lote El Porvenir',
      startDate: '2026-09-01',
      endDate: '2026-12-01',
    });
    const plan = store.plans().at(-1)!;
    expect(store.plans()).toHaveLength(5);
    store.removePlan(plan.id);
    expect(store.plans()).toHaveLength(4);
  });
  it('añade una predicción con meta y brecha al inicio del historial', () => {
    const store = TestBed.inject(WorkspaceStore);
    const prediction = store.addPrediction({
      crop: 'Arándano',
      plot: 'Fundo Chavimochic',
      area: 18.5,
      yield: 12.1,
      expectedYield: 13,
      gap: -0.9,
      meetsExpectation: false,
      confidence: 92,
      mode: 'Individual',
      recommendations: ['Ajustar humedad.'],
      inputs: {
        soilType: 'Arenoso',
        temperature: 20,
        soilHumidity: 58,
        soilPh: 5.2,
        nitrogen: 130,
        rainfall: 9,
      },
    });
    expect(store.predictions()[0].id).toBe(prediction.id);
    expect(store.predictions()).toHaveLength(9);
    expect(store.activities()[0].title).toBe('Predicción bajo la meta');
  });
  it('incorpora históricos y deja reentrenar una nueva versión demo', () => {
    const store = TestBed.inject(WorkspaceStore);
    store.addHistoricalRecord({
      crop: 'Palta',
      campaign: '2026',
      location: 'Virú',
      soilType: 'Franco',
      temperature: 21,
      soilHumidity: 65,
      soilPh: 6.4,
      nitrogen: 175,
      rainfall: 9,
      actualYield: 16,
    });
    expect(store.historicalRecords()).toHaveLength(11);
    expect(store.model().status).toBe('Reentrenamiento pendiente');
    expect(store.model().records).toBe(12481);
    store.trainDemoModel();
    expect(store.model().status).toBe('Entrenado');
    expect(store.model().version).toBe('v1.5-demo');
  });
  it('expone errores y permite reintentar', () => {
    repository.loadWorkspace.mockReturnValueOnce(throwError(() => new Error('offline')));
    const store = TestBed.inject(WorkspaceStore);
    expect(store.error()).toBe(true);
    expect(store.loading()).toBe(false);
    store.load();
    expect(store.error()).toBe(false);
    expect(store.plots()).toHaveLength(6);
  });
});
