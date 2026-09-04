import { ChangeDetectionStrategy, Component, inject } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { MAT_DIALOG_DATA, MatDialogModule, MatDialogRef } from '@angular/material/dialog';
import { Button, Input } from '../../shared/ui/primitives';
import { WorkspaceStore } from '../../core/services/workspace.store';
@Component({
  selector: 'agro-plot-dialog',
  imports: [ReactiveFormsModule, MatDialogModule, Button, Input],
  template: `
    <div class="dialog-content">
      <h2 mat-dialog-title>Nueva parcela</h2>
      <p>Organiza un nuevo espacio de cultivo. Los datos se guardan solo en esta sesión.</p>
      <form [formGroup]="form" (ngSubmit)="save()">
        <div class="form-field">
          <label for="plot-name">Nombre de la parcela</label>
          <input
            agroInput
            id="plot-name"
            formControlName="name"
            placeholder="Ej. La Arboleda"
            maxlength="60"
          />
          @if (form.controls.name.touched && form.controls.name.invalid) {
            <span class="field-error">Escribe un nombre de al menos 3 caracteres.</span>
          }
        </div>
        <div class="form-field">
          <label for="plot-location">Ubicación</label>
          <input
            agroInput
            id="plot-location"
            formControlName="location"
            placeholder="Sector y localidad"
            maxlength="120"
          />
          @if (form.controls.location.touched && form.controls.location.invalid) {
            <span class="field-error">Indica la ubicación.</span>
          }
        </div>
        <div class="form-grid">
          <div class="form-field">
            <label for="plot-area">Superficie (ha)</label>
            <input
              agroInput
              id="plot-area"
              type="number"
              formControlName="area"
              min="0.1"
              max="10000"
              step="0.1"
            />
            @if (form.controls.area.touched && form.controls.area.invalid) {
              <span class="field-error">Entre 0.1 y 10 000 hectáreas.</span>
            }
          </div>
          <div class="form-field">
            <label for="plot-crop">Cultivo</label>
            <select agroInput id="plot-crop" formControlName="crop">
              @for (crop of store.crops(); track crop.id) {
                <option [value]="crop.name">{{ crop.name }}</option>
              }
            </select>
          </div>
        </div>
        <div class="dialog-actions">
          <button agroButton type="button" mat-dialog-close>Cancelar</button>
          <button agroButton="primary" type="submit">Registrar parcela</button>
        </div>
      </form>
    </div>
  `,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class PlotDialog {
  readonly store = inject<WorkspaceStore>(MAT_DIALOG_DATA);
  private readonly ref = inject(MatDialogRef<PlotDialog>);
  readonly form = inject(FormBuilder).nonNullable.group({
    name: [
      '',
      [
        Validators.required,
        Validators.minLength(3),
        Validators.maxLength(60),
        Validators.pattern(/\S/),
      ],
    ],
    location: ['', [Validators.required, Validators.maxLength(120), Validators.pattern(/\S/)]],
    area: [1, [Validators.required, Validators.min(0.1), Validators.max(10000)]],
    crop: [this.store.crops()[0]?.name ?? '', Validators.required],
  });
  save(): void {
    this.form.controls.name.setValue(this.form.controls.name.value.trim());
    this.form.controls.location.setValue(this.form.controls.location.value.trim());
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      return;
    }
    const value = this.form.getRawValue();
    this.store.addPlot({ ...value, name: value.name.trim(), location: value.location.trim() });
    this.ref.close(true);
  }
}
