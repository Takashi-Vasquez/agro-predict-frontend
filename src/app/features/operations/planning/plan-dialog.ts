import { ChangeDetectionStrategy, Component, inject } from '@angular/core';
import {
  AbstractControl,
  FormBuilder,
  ReactiveFormsModule,
  ValidationErrors,
  Validators,
} from '@angular/forms';
import { MAT_DIALOG_DATA, MatDialogModule, MatDialogRef } from '@angular/material/dialog';
import { WorkspaceStore } from '../../../core/services/workspace.store';
import { Button } from '../../../shared/directives/agro-button.directive';
import { Input } from '../../../shared/directives/agro-input.directive';

export function dateRangeValidator(control: AbstractControl): ValidationErrors | null {
  const start = control.get('startDate')?.value as string;
  const end = control.get('endDate')?.value as string;
  return start && end && end <= start ? { dateRange: true } : null;
}
@Component({
  selector: 'agro-plan-dialog',
  imports: [ReactiveFormsModule, MatDialogModule, Button, Input],
  template: `
    <div class="dialog-content">
      <h2 mat-dialog-title>Planificar un cultivo</h2>
      <p>Define la parcela y el periodo de tu próxima campaña.</p>
      <form [formGroup]="form" (ngSubmit)="save()">
        <div class="form-field">
          <label for="plan-plot">Parcela</label>
          <select agroInput id="plan-plot" formControlName="plot">
            @for (plot of store.plots(); track plot.id) {
              <option [value]="plot.name">{{ plot.name }} · {{ plot.area }} ha</option>
            }
          </select>
        </div>
        <div class="form-field">
          <label for="plan-crop">Cultivo</label>
          <select agroInput id="plan-crop" formControlName="crop">
            @for (crop of store.crops(); track crop.id) {
              <option [value]="crop.name">{{ crop.name }} · {{ crop.variety }}</option>
            }
          </select>
        </div>
        <div class="form-grid">
          <div class="form-field">
            <label for="plan-start">Fecha de siembra</label>
            <input agroInput id="plan-start" type="date" formControlName="startDate" />
          </div>
          <div class="form-field">
            <label for="plan-end">Cosecha prevista</label>
            <input
              agroInput
              id="plan-end"
              type="date"
              formControlName="endDate"
              [min]="form.controls.startDate.value"
            />
          </div>
        </div>
        @if (form.touched && form.invalid) {
          <p class="field-error" role="alert">
            Completa todos los campos. La cosecha debe ser posterior a la siembra.
          </p>
        }
        <div class="demo-note">
          Plan ilustrativo: valida fechas y condiciones con tu equipo agronómico.
        </div>
        <div class="dialog-actions">
          <button agroButton type="button" mat-dialog-close>Cancelar</button>
          <button agroButton="primary" type="submit">Crear plan</button>
        </div>
      </form>
    </div>
  `,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class PlanDialog {
  readonly store = inject<WorkspaceStore>(MAT_DIALOG_DATA);
  private readonly ref = inject(MatDialogRef<PlanDialog>);
  readonly form = inject(FormBuilder).nonNullable.group(
    {
      plot: [this.store.plots()[0]?.name ?? '', Validators.required],
      crop: [this.store.crops()[0]?.name ?? '', Validators.required],
      startDate: ['', Validators.required],
      endDate: ['', Validators.required],
    },
    { validators: dateRangeValidator },
  );
  save(): void {
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      return;
    }
    this.store.addPlan(this.form.getRawValue());
    this.ref.close(true);
  }
}
