import {
  ChangeDetectionStrategy,
  Component,
  DestroyRef,
  computed,
  inject,
  signal,
} from '@angular/core';
import { DecimalPipe } from '@angular/common';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { ActivatedRoute, RouterLink } from '@angular/router';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { timer } from 'rxjs';
import { AgronomicInputs, Plot, Prediction } from '../../core/models/agro.models';
import { WorkspaceStore } from '../../core/services/workspace.store';
import { Icon } from '../../shared/ui/icon';
import { Button, Card, Input, PageHeader } from '../../shared/ui/primitives';
import { DataTable, TableColumn, TableRow } from '../../shared/ui/data-table';
import { simulateYield } from './simulation';

type PredictionView = 'individual' | 'batch' | 'training';

@Component({
  selector: 'agro-predictions',
  imports: [
    DecimalPipe,
    ReactiveFormsModule,
    RouterLink,
    Icon,
    Button,
    Card,
    Input,
    PageHeader,
    DataTable,
  ],
  templateUrl: './predictions.html',
  styleUrl: './predictions.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class Predictions {
  readonly store = inject(WorkspaceStore);
  private readonly destroyRef = inject(DestroyRef);
  private readonly formBuilder = inject(FormBuilder);
  private readonly requested = inject(ActivatedRoute).snapshot.queryParamMap.get('parcela');

  readonly view = signal<PredictionView>('individual');
  readonly pending = signal(false);
  readonly batchPending = signal(false);
  readonly trainingPending = signal(false);
  readonly result = signal<Prediction | null>(null);
  readonly batchResults = signal<Prediction[]>([]);
  readonly batchError = signal<string | null>(null);
  readonly trainingMessage = signal<string | null>(null);
  readonly batchMetCount = computed(
    () => this.batchResults().filter((item) => item.meetsExpectation).length,
  );
  readonly batchAdjustmentCount = computed(() => this.batchResults().length - this.batchMetCount());

  readonly form = this.formBuilder.nonNullable.group({
    plotId: [this.requested ?? this.store.plots()[0]?.id ?? '', Validators.required],
    soilType: ['Arenoso', Validators.required],
    temperature: [20, [Validators.required, Validators.min(0), Validators.max(45)]],
    soilHumidity: [58, [Validators.required, Validators.min(0), Validators.max(100)]],
    soilPh: [5.2, [Validators.required, Validators.min(3), Validators.max(10)]],
    nitrogen: [130, [Validators.required, Validators.min(0), Validators.max(500)]],
    rainfall: [9, [Validators.required, Validators.min(0), Validators.max(500)]],
    expectedYield: [13, [Validators.required, Validators.min(0.1), Validators.max(250)]],
  });

  readonly batchForm = this.formBuilder.nonNullable.group({
    rows: [
      'PAR-001,20,61,5.2,140,9,13\nPAR-002,22,58,6.8,170,7,11.5\nPAR-003,21,60,6.3,150,8,16',
      [Validators.required, Validators.maxLength(5000)],
    ],
  });

  readonly historicalForm = this.formBuilder.nonNullable.group({
    crop: ['Arándano', Validators.required],
    campaign: ['2025-2026', [Validators.required, Validators.maxLength(20)]],
    location: ['Chao, Virú', [Validators.required, Validators.maxLength(80)]],
    soilType: ['Arenoso', Validators.required],
    temperature: [20, [Validators.required, Validators.min(0), Validators.max(45)]],
    soilHumidity: [67, [Validators.required, Validators.min(0), Validators.max(100)]],
    soilPh: [5.2, [Validators.required, Validators.min(3), Validators.max(10)]],
    nitrogen: [158, [Validators.required, Validators.min(0), Validators.max(500)]],
    rainfall: [10, [Validators.required, Validators.min(0), Validators.max(500)]],
    actualYield: [12.8, [Validators.required, Validators.min(0.1), Validators.max(250)]],
  });

  readonly predictionColumns: TableColumn[] = [
    { key: 'crop', label: 'CULTIVO', kind: 'emphasis' },
    { key: 'plot', label: 'PARCELA' },
    { key: 'yield', label: 'PREDICCIÓN' },
    { key: 'target', label: 'META' },
    { key: 'gap', label: 'BRECHA' },
    { key: 'status', label: 'RESULTADO', kind: 'status' },
  ];

  readonly historicalColumns: TableColumn[] = [
    { key: 'crop', label: 'CULTIVO', kind: 'emphasis' },
    { key: 'campaign', label: 'CAMPAÑA' },
    { key: 'location', label: 'UBICACIÓN' },
    { key: 'conditions', label: 'CONDICIONES' },
    { key: 'yield', label: 'COSECHA REAL' },
  ];

  readonly rows = computed<TableRow[]>(() =>
    this.store
      .predictions()
      .slice(0, 6)
      .map((item) => ({
        id: item.id,
        crop: item.crop,
        plot: item.plot,
        yield: `${item.yield} t/ha`,
        target: `${item.expectedYield} t/ha`,
        gap: `${item.gap > 0 ? '+' : ''}${item.gap} t/ha`,
        status: item.meetsExpectation ? 'Cumple meta' : 'Requiere ajuste',
      })),
  );

  readonly historicalRows = computed<TableRow[]>(() =>
    this.store
      .historicalRecords()
      .slice(0, 8)
      .map((item) => ({
        id: item.id,
        crop: item.crop,
        campaign: item.campaign,
        location: item.location,
        conditions: `${item.soilHumidity}% hum. · pH ${item.soilPh} · ${item.temperature} °C`,
        yield: `${item.actualYield} t/ha`,
      })),
  );

  selectView(view: PredictionView): void {
    this.view.set(view);
    this.batchError.set(null);
    this.trainingMessage.set(null);
  }

  loadPlotDefaults(): void {
    const plot = this.store.plots().find((item) => item.id === this.form.controls.plotId.value);
    if (!plot) return;
    const defaults = this.defaultsForCrop(plot.crop);
    this.form.patchValue({ ...defaults, soilHumidity: plot.humidity });
  }

  submit(): void {
    if (this.pending()) return;
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      return;
    }
    const raw = this.form.getRawValue();
    const plot = this.store.plots().find((item) => item.id === raw.plotId);
    if (!plot) {
      this.form.controls.plotId.setErrors({ missing: true });
      return;
    }
    this.pending.set(true);
    this.result.set(null);
    this.form.disable();
    timer(750)
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe(() => {
        const inputs = this.toInputs(raw);
        const simulation = simulateYield(plot.crop, inputs, raw.expectedYield);
        this.result.set(
          this.store.addPrediction({
            ...simulation,
            crop: plot.crop,
            plot: plot.name,
            area: plot.area,
            mode: 'Individual',
          }),
        );
        this.pending.set(false);
        this.form.enable();
      });
  }

  submitBatch(): void {
    if (this.batchPending()) return;
    this.batchError.set(null);
    if (this.batchForm.invalid) {
      this.batchForm.markAllAsTouched();
      return;
    }
    try {
      const parsed = this.parseBatch(this.batchForm.controls.rows.value);
      this.batchPending.set(true);
      this.batchResults.set([]);
      timer(850)
        .pipe(takeUntilDestroyed(this.destroyRef))
        .subscribe(() => {
          const predictions = parsed.map(({ plot, inputs, expectedYield }) =>
            this.store.addPrediction({
              ...simulateYield(plot.crop, inputs, expectedYield),
              crop: plot.crop,
              plot: plot.name,
              area: plot.area,
              mode: 'Masiva',
            }),
          );
          this.batchResults.set(predictions);
          this.batchPending.set(false);
        });
    } catch (error) {
      this.batchError.set(error instanceof Error ? error.message : 'No pudimos leer el lote.');
    }
  }

  addHistoricalRecord(): void {
    this.trainingMessage.set(null);
    if (this.historicalForm.invalid) {
      this.historicalForm.markAllAsTouched();
      return;
    }
    this.store.addHistoricalRecord(this.historicalForm.getRawValue());
    this.trainingMessage.set('Registro agregado. El modelo quedó pendiente de reentrenamiento.');
  }

  trainModel(): void {
    if (this.trainingPending() || this.store.model().status === 'Entrenado') return;
    this.trainingPending.set(true);
    this.trainingMessage.set('Validando datos y reentrenando el modelo de demostración…');
    timer(950)
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe(() => {
        this.store.trainDemoModel();
        this.trainingPending.set(false);
        this.trainingMessage.set(
          'Entrenamiento demo completado. La nueva versión está disponible.',
        );
      });
  }

  private toInputs(value: {
    soilType: string;
    temperature: number;
    soilHumidity: number;
    soilPh: number;
    nitrogen: number;
    rainfall: number;
  }): AgronomicInputs {
    return {
      soilType: value.soilType,
      temperature: value.temperature,
      soilHumidity: value.soilHumidity,
      soilPh: value.soilPh,
      nitrogen: value.nitrogen,
      rainfall: value.rainfall,
    };
  }

  private parseBatch(value: string): Array<{
    plot: Plot;
    inputs: AgronomicInputs;
    expectedYield: number;
  }> {
    const lines = value
      .split(/\r?\n/)
      .map((line) => line.trim())
      .filter(Boolean);
    if (!lines.length) throw new Error('Agrega al menos una fila para procesar.');
    if (lines.length > 20) throw new Error('La demostración admite hasta 20 filas por lote.');
    return lines.map((line, index) => {
      const values = line.split(',').map((item) => item.trim());
      if (values.length !== 7)
        throw new Error(`Fila ${index + 1}: se esperaban 7 columnas separadas por comas.`);
      const plot = this.store.plots().find((item) => item.id === values[0]);
      if (!plot) throw new Error(`Fila ${index + 1}: la parcela ${values[0]} no existe.`);
      const numbers = values.slice(1).map(Number);
      if (numbers.some((item) => !Number.isFinite(item)))
        throw new Error(`Fila ${index + 1}: todos los parámetros deben ser numéricos.`);
      const [temperature, soilHumidity, soilPh, nitrogen, rainfall, expectedYield] = numbers;
      if (
        temperature < 0 ||
        temperature > 45 ||
        soilHumidity < 0 ||
        soilHumidity > 100 ||
        soilPh < 3 ||
        soilPh > 10 ||
        nitrogen < 0 ||
        nitrogen > 500 ||
        rainfall < 0 ||
        rainfall > 500 ||
        expectedYield <= 0 ||
        expectedYield > 250
      )
        throw new Error(`Fila ${index + 1}: uno o más valores están fuera del rango permitido.`);
      return {
        plot,
        inputs: {
          soilType: this.defaultsForCrop(plot.crop).soilType,
          temperature,
          soilHumidity,
          soilPh,
          nitrogen,
          rainfall,
        },
        expectedYield,
      };
    });
  }

  private defaultsForCrop(crop: string): {
    soilType: string;
    temperature: number;
    soilPh: number;
    nitrogen: number;
    rainfall: number;
    expectedYield: number;
  } {
    const defaults: Record<
      string,
      {
        soilType: string;
        temperature: number;
        soilPh: number;
        nitrogen: number;
        rainfall: number;
        expectedYield: number;
      }
    > = {
      Arándano: {
        soilType: 'Arenoso',
        temperature: 20,
        soilPh: 5.2,
        nitrogen: 160,
        rainfall: 10,
        expectedYield: 13,
      },
      Espárrago: {
        soilType: 'Franco arenoso',
        temperature: 22,
        soilPh: 6.8,
        nitrogen: 170,
        rainfall: 7,
        expectedYield: 11.5,
      },
      Palta: {
        soilType: 'Franco arenoso',
        temperature: 21,
        soilPh: 6.4,
        nitrogen: 175,
        rainfall: 9,
        expectedYield: 16,
      },
      'Caña de azúcar': {
        soilType: 'Franco',
        temperature: 25,
        soilPh: 6.6,
        nitrogen: 210,
        rainfall: 18,
        expectedYield: 115,
      },
      Arroz: {
        soilType: 'Arcilloso',
        temperature: 25,
        soilPh: 6.4,
        nitrogen: 185,
        rainfall: 24,
        expectedYield: 10,
      },
      Uva: {
        soilType: 'Franco arenoso',
        temperature: 23,
        soilPh: 6.7,
        nitrogen: 145,
        rainfall: 7,
        expectedYield: 23,
      },
    };
    return defaults[crop] ?? defaults['Arándano'];
  }
}
