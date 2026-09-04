import { ChangeDetectionStrategy, Component, inject } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { MatSlideToggleModule } from '@angular/material/slide-toggle';
import { MatSnackBar } from '@angular/material/snack-bar';
import { ThemeService } from '../../core/services/theme.service';
import { PreferencesService } from '../../core/services/preferences.service';
import { Icon } from '../../shared/ui/icon';
import { Button, Card, Input, PageHeader } from '../../shared/ui/primitives';
@Component({
  selector: 'agro-settings',
  imports: [ReactiveFormsModule, MatSlideToggleModule, Icon, Button, Card, Input, PageHeader],
  template: `
    <agro-page-header
      title="Un espacio a tu manera"
      description="Personaliza tu experiencia y las preferencias de tu organización."
      eyebrow="CONFIGURACIÓN"
    />
    <form [formGroup]="form" (ngSubmit)="save()" class="settings-form">
      <section class="setting-section">
        <div class="setting-description">
          <h2>Espacio de trabajo</h2>
          <p>La información que identifica tu entorno agrícola.</p>
        </div>
        <agro-card class="setting-card">
          <div class="form-field">
            <label for="workspace-name">Nombre del espacio</label>
            <input agroInput id="workspace-name" formControlName="workspaceName" maxlength="50" />
            @if (form.controls.workspaceName.touched && form.controls.workspaceName.invalid) {
              <span class="field-error">Usa entre 3 y 50 caracteres.</span>
            }
          </div>
          <div class="form-grid">
            <div class="form-field">
              <label for="language">Idioma de la aplicación</label>
              <input agroInput id="language" value="Español" readonly />
            </div>
            <div class="form-field">
              <label for="units">Sistema de unidades</label>
              <input agroInput id="units" value="Métrico · ha, t, °C" readonly />
            </div>
          </div>
        </agro-card>
      </section>
      <section class="setting-section">
        <div class="setting-description">
          <h2>Apariencia</h2>
          <p>Una interfaz que se adapta a tu forma de trabajar.</p>
        </div>
        <agro-card class="setting-card">
          <div class="theme-options">
            <button
              type="button"
              class="theme-option"
              [class.selected]="!theme.dark()"
              [attr.aria-pressed]="!theme.dark()"
              (click)="theme.dark.set(false)"
            >
              <span class="theme-swatch light-swatch">
                <i></i>
                <i></i>
                <i></i>
              </span>
              <span>
                <agro-icon name="sun" />
                Claro
              </span>
            </button>
            <button
              type="button"
              class="theme-option"
              [class.selected]="theme.dark()"
              [attr.aria-pressed]="theme.dark()"
              (click)="theme.dark.set(true)"
            >
              <span class="theme-swatch dark-swatch">
                <i></i>
                <i></i>
                <i></i>
              </span>
              <span>
                <agro-icon name="moon" />
                Oscuro
              </span>
            </button>
          </div>
          <p class="setting-hint">El tema se aplica y guarda automáticamente en este navegador.</p>
        </agro-card>
      </section>
      <section class="setting-section">
        <div class="setting-description">
          <h2>Notificaciones</h2>
          <p>Prepara los avisos que te gustaría recibir.</p>
        </div>
        <agro-card class="setting-card">
          <div class="toggle-row">
            <div>
              <strong>Alertas climáticas</strong>
              <p>Cambios relevantes en las condiciones del campo.</p>
            </div>
            <mat-slide-toggle formControlName="climateAlerts" aria-label="Alertas climáticas" />
          </div>
          <div class="toggle-row">
            <div>
              <strong>Resultados de predicciones</strong>
              <p>Avisos al completar el análisis de un cultivo.</p>
            </div>
            <mat-slide-toggle
              formControlName="predictionAlerts"
              aria-label="Resultados de predicciones"
            />
          </div>
          <div class="toggle-row">
            <div>
              <strong>Resumen semanal</strong>
              <p>Una visión general de tu actividad agrícola.</p>
            </div>
            <mat-slide-toggle formControlName="weeklySummary" aria-label="Resumen semanal" />
          </div>
          <div class="demo-note">
            <agro-icon name="info" />
            Preferencias locales. No se enviarán correos ni notificaciones reales en esta etapa.
          </div>
        </agro-card>
      </section>
      <div class="settings-save">
        <button agroButton type="button" (click)="reset()">Descartar cambios</button>
        <button agroButton="primary" type="submit">
          <agro-icon name="check" />
          Guardar preferencias
        </button>
      </div>
    </form>
  `,
  styles: [
    `
      .settings-form {
        max-width: 1100px;
      }
      .setting-section {
        display: grid;
        grid-template-columns: 260px minmax(0, 1fr);
        gap: 40px;
        padding: 0 0 28px;
        margin-bottom: 28px;
        border-bottom: 1px solid var(--border);
      }
      .setting-description h2 {
        font-size: 1rem;
        margin: 6px 0 11px;
      }
      .setting-description p {
        font-size: 0.875rem;
      }
      .setting-card {
        padding: 25px;
      }
      .setting-card .form-grid .form-field {
        margin-bottom: 0;
      }
      .theme-options {
        display: flex;
        gap: 18px;
      }
      .theme-option {
        background: none;
        border: 1px solid var(--border);
        border-radius: 10px;
        padding: 8px;
        color: var(--text);
        width: 150px;
      }
      .theme-option.selected {
        border: 2px solid var(--primary);
        padding: 7px;
      }
      .theme-swatch {
        height: 77px;
        border-radius: 5px;
        display: grid;
        grid-template-columns: 22px 1fr;
        grid-template-rows: 17px 1fr;
        padding: 7px;
        gap: 5px;
      }
      .theme-swatch i {
        display: block;
        border-radius: 2px;
      }
      .theme-swatch i:first-child {
        grid-row: span 2;
      }
      .light-swatch {
        background: #f1f4ef;
        border: 1px solid #dde5da;
      }
      .light-swatch i {
        background: white;
      }
      .dark-swatch {
        background: #17271d;
        border: 1px solid #364c3e;
      }
      .dark-swatch i {
        background: #334739;
      }
      .theme-option > span:last-child {
        display: flex;
        gap: 7px;
        align-items: center;
        justify-content: center;
        font-size: 0.8125rem;
        margin: 10px 0 4px;
      }
      .theme-option agro-icon {
        width: 15px;
        height: 15px;
      }
      .setting-hint {
        font-size: 0.75rem;
        margin-top: 16px;
      }
      .toggle-row {
        display: flex;
        align-items: center;
        justify-content: space-between;
        gap: 20px;
        padding-bottom: 22px;
        margin-bottom: 22px;
        border-bottom: 1px solid var(--border);
      }
      .toggle-row strong {
        font-size: 0.875rem;
        font-weight: 550;
      }
      .toggle-row p {
        font-size: 0.8125rem;
        margin-top: 5px;
      }
      .settings-save {
        display: flex;
        justify-content: flex-end;
        gap: 10px;
      }
      @media (max-width: 950px) {
        .setting-section {
          grid-template-columns: 1fr;
          gap: 20px;
        }
      }
      @media (max-width: 500px) {
        .settings-save {
          flex-wrap: wrap;
        }
        .setting-card {
          padding: 19px;
        }
        .theme-option {
          width: calc(50% - 9px);
        }
      }
    `,
  ],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class Settings {
  readonly theme = inject(ThemeService);
  private readonly preferences = inject(PreferencesService);
  private readonly snackbar = inject(MatSnackBar);
  readonly form = inject(FormBuilder).nonNullable.group({
    workspaceName: [
      this.preferences.value().workspaceName,
      [
        Validators.required,
        Validators.minLength(3),
        Validators.maxLength(50),
        Validators.pattern(/\S/),
      ],
    ],
    climateAlerts: [this.preferences.value().climateAlerts],
    predictionAlerts: [this.preferences.value().predictionAlerts],
    weeklySummary: [this.preferences.value().weeklySummary],
  });
  save(): void {
    this.form.controls.workspaceName.setValue(this.form.controls.workspaceName.value.trim());
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      return;
    }
    const value = this.form.getRawValue();
    this.preferences.save({ ...value, workspaceName: value.workspaceName.trim() });
    this.form.markAsPristine();
    this.snackbar.open('Preferencias guardadas en este navegador.', 'Cerrar', { duration: 3500 });
  }
  reset(): void {
    this.form.reset(this.preferences.value());
  }
}
