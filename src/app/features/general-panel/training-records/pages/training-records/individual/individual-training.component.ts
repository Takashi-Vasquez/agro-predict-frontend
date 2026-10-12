import { DecimalPipe } from '@angular/common';
import {
  ChangeDetectionStrategy,
  Component,
  ResourceRef,
  computed,
  inject,
  input,
  output,
  signal,
} from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { NgIcon, provideIcons, provideNgIconsConfig } from '@ng-icons/core';
import { heroPlus, heroSparkles } from '@ng-icons/heroicons/outline';
import { heroSparklesSolid } from '@ng-icons/heroicons/solid';
import { CoreService } from '../../../../../../core/services/core.service';
import { Button } from '../../../../../../shared/directives/agro-button.directive';
import { Card } from '../../../../../../shared/directives/agro-card.directive';
import { HasPermissionDirective } from '../../../../../../shared/directives/has-permission.directive';
import { ValidationErrorPipe } from '../../../../../../shared/pipes/validation-error.pipe';
import { Loader } from '../../../../../../shared/ui/agro-loader/agro-loader.component';
import {
  SelectComponent,
  SelectOption,
} from '../../../../../../shared/ui/forms/agro-select/agro-select.component';
import { InputNumberComponent } from '../../../../../../shared/ui/forms/input-number/input-number.component';
import { createDependentSelectState } from '../../../../../../shared/utils/dependent-select';
import { TrainingRecordsStats } from '../../../models/training-records-stats.model';
import { TrainingRecordService } from '../../../training-records.service';

@Component({
  selector: 'app-individual-training',
  standalone: true,
  imports: [
    ReactiveFormsModule,
    Loader,
    NgIcon,
    Button,
    Card,
    InputNumberComponent,
    SelectComponent,
    ValidationErrorPipe,
    DecimalPipe,
    HasPermissionDirective,
  ],
  providers: [
    provideIcons({
      heroSparklesSolid,
      heroPlus,
      heroSparkles,
    }),
    provideNgIconsConfig({
      size: '1.3em',
    }),
  ],
  templateUrl: './individual-training.component.html',
  styleUrl: './individual-training.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class IndividualTrainingComponent {
  recordAdded = output<void>();

  private readonly coreService = inject(CoreService);
  private readonly trainingRecordService = inject(TrainingRecordService);

  readonly recordsStats = input<ResourceRef<TrainingRecordsStats>>(null);
  protected saving = signal(false);
  protected trainingPending = signal(false);
  protected trainingMessage = signal<string | null>(null);

  readonly form = inject(FormBuilder).nonNullable.group({
    cropId: [-1, Validators.required],
    campaign: ['-', [Validators.required]],
    soilType: ['Arenoso', Validators.required],
    nitrogen: [158, [Validators.min(0), Validators.max(500), Validators.required]],
    phosphorus: [130, [Validators.min(0), Validators.max(500), Validators.required]],
    potassium: [130, [Validators.min(0), Validators.max(500), Validators.required]],
    temperature: [20, [Validators.min(0), Validators.max(45), Validators.required]],
    humidity: [58, [Validators.min(0), Validators.max(100), Validators.required]],
    phSoil: [5.2, [Validators.min(3), Validators.max(10), Validators.required]],
    rainfall: [10, [Validators.min(0), Validators.max(500), Validators.required]],
    irrigationType: ['-', [Validators.required]],
    targetYield: [12.8, [Validators.min(0.1), Validators.max(250), Validators.required]],
  });

  readonly irrigationTypeOptions = this.coreService.catalogsResource('irrigation_type');
  readonly soilTypeOptions = this.coreService.catalogsResource('soil_type');
  readonly cropsOptions = this.coreService.cropsResource();
  private readonly cropDependent = createDependentSelectState(this.form.controls.cropId, 'cropId');

  protected readonly selectedCrop = this.cropDependent.sourceValue;
  readonly isCampaignDisabled = this.cropDependent.isDisabled;
  readonly campaingOptions = this.coreService.campaignsResource(this.cropDependent.filterParams);
  readonly campaignSelectOptions = computed<SelectOption[]>(() =>
    (this.campaingOptions.value() ?? []).map((opt) => ({
      ...opt,
      value: opt.code ?? opt.value,
    })),
  );
  readonly fieldsResource = this.trainingRecordService.fieldsResource();

  submit(): void {
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      return;
    }

    const value = this.form.getRawValue();
    this.saving.set(true);

    this.trainingRecordService.create(value).subscribe({
      next: () => {
        this.saving.set(false);
        this.recordAdded.emit();
      },
      error: () => this.saving.set(false),
    });
  }

  trainModel(): void {
    console.log('entrenando');
    if (this.trainingPending() || this.recordsStats().value().isAllTrained) return;
    this.trainingPending.set(true);
    // this.trainingMessage.set('Validando datos y reentrenando el modelo de demostración…');

    this.trainingPending.set(false);
    // this.trainingMessage.set('Entrenamiento demo completado. La nueva versión está disponible.',);
  }
}
