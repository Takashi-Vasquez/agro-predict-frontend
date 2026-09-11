import { TestBed } from '@angular/core/testing';
import { ActivatedRoute, provideRouter } from '@angular/router';
import { of } from 'rxjs';
import { MOCK_WORKSPACE } from '../../../core/data/mock-data';
import { AgroRepository } from '../../../core/services/agro.repository';
import { WorkspaceStore } from '../../../core/services/workspace.store';
import { PredictionsComponent } from './predictions';

describe('Formulario de predicción', () => {
  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [
        provideRouter([]),
        WorkspaceStore,
        {
          provide: AgroRepository,
          useValue: { loadWorkspace: () => of(structuredClone(MOCK_WORKSPACE)) },
        },
        {
          provide: ActivatedRoute,
          useValue: { snapshot: { queryParamMap: { get: () => 'PAR-001' } } },
        },
      ],
    });
  });
  it('preselecciona la parcela de la URL y rechaza valores fuera de rango', () => {
    const fixture = TestBed.createComponent(PredictionsComponent);
    fixture.detectChanges();
    expect(fixture.componentInstance.form.controls.plotId.value).toBe('PAR-001');
    fixture.componentInstance.form.controls.soilHumidity.setValue(101);
    fixture.componentInstance.submit();
    expect(fixture.componentInstance.form.invalid).toBe(true);
    expect(fixture.componentInstance.pending()).toBe(false);
    expect(fixture.componentInstance.store.predictions()).toHaveLength(8);
  });
  it('completa una predicción y actualiza el historial compartido una sola vez', async () => {
    const fixture = TestBed.createComponent(PredictionsComponent);
    fixture.detectChanges();
    const page = fixture.componentInstance;
    page.submit();
    page.submit();
    expect(page.pending()).toBe(true);
    expect(page.form.disabled).toBe(true);
    await vi.waitFor(() => expect(page.result()).not.toBeNull(), { timeout: 2000 });
    expect(page.store.predictions()).toHaveLength(9);
    expect(page.result()?.yield).toBe(12.1);
    expect(page.result()?.meetsExpectation).toBe(false);
    expect(page.result()?.recommendations.length).toBeGreaterThan(0);
    expect(page.form.enabled).toBe(true);
    expect(page.pending()).toBe(false);
  });
  it('valida y procesa varias parcelas en el modo masivo', async () => {
    const fixture = TestBed.createComponent(PredictionsComponent);
    fixture.detectChanges();
    const page = fixture.componentInstance;
    page.batchForm.controls.rows.setValue('PAR-001,20,61,5.2,140,9,13\nPAR-003,21,60,6.3,150,8,16');
    page.submitBatch();
    await vi.waitFor(() => expect(page.batchResults()).toHaveLength(2), { timeout: 2000 });
    expect(page.store.predictions()).toHaveLength(10);
    expect(page.batchResults().every((item) => item.mode === 'Masiva')).toBe(true);
  });
  it('registra un dato real y habilita el reentrenamiento demo', () => {
    const fixture = TestBed.createComponent(PredictionsComponent);
    fixture.detectChanges();
    const page = fixture.componentInstance;
    page.addHistoricalRecord();
    expect(page.store.historicalRecords()).toHaveLength(11);
    expect(page.store.model().status).toBe('Reentrenamiento pendiente');
    expect(page.trainingMessage()).toContain('pendiente');
  });
});
