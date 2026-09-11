import { ChangeDetectionStrategy, Component, computed, inject, signal } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { MatSnackBar } from '@angular/material/snack-bar';
import { AuthService } from '../../../core/services/auth.service';
import { Icon } from '../../../shared/ui/icon';
import { Button, Card, Input, PageHeader } from '../../../shared/ui/primitives';
@Component({
  selector: 'agro-profile',
  imports: [ReactiveFormsModule, Icon, Button, Card, Input, PageHeader],
  template: `
    <agro-page-header
      title="Tu perfil"
      description="Un poco más sobre la persona detrás de cada buena decisión."
      eyebrow="MI CUENTA"
    />
    <div class="profile-grid">
      <agro-card class="profile-card">
        <div class="profile-cover"></div>
        <div class="profile-card-body">
          <span class="avatar profile-avatar">
            @if (avatar()) {
              <img [src]="avatar()" alt="Vista previa de tu foto de perfil" />
            } @else {
              {{ initials() }}
            }
          </span>
          <h2>{{ auth.user()?.firstName }}</h2>
          <p>{{ auth.user()?.email }}</p>
          <span class="status">
            <agro-icon name="shield" />
            {{ auth.user()?.roles }}
          </span>
          <div class="profile-meta">
            <span>Espacio agrícola</span>
            <strong>Cuenta conectada</strong>
            <span>Acceso</span>
            <strong>Sesión autenticada mediante API</strong>
          </div>
        </div>
      </agro-card>
      <agro-card>
        <div class="card-header">
          <div>
            <h2>Información personal</h2>
            <p>El nombre y la foto se personalizan solo en este navegador.</p>
          </div>
          <agro-icon name="user" />
        </div>
        <form class="panel-body" [formGroup]="form" (ngSubmit)="save()">
          <div class="photo-actions">
            <button agroButton type="button" (click)="photoInput.click()">Cambiar foto</button>
            <input
              #photoInput
              type="file"
              accept="image/jpeg,image/png,image/webp"
              class="file-input"
              aria-label="Seleccionar foto de perfil"
              (change)="upload($event)"
            />
            @if (avatar()) {
              <button agroButton="ghost" type="button" (click)="avatar.set(null)">
                Quitar foto
              </button>
            }
            <p>
              JPG, PNG o WebP. Máximo 2 MB.
              <br />
              Vista previa local: no se subirá a un servidor.
            </p>
          </div>
          <div class="form-field">
            <label for="profile-name">Nombre completo</label>
            <input
              agroInput
              id="profile-name"
              formControlName="name"
              autocomplete="name"
              maxlength="60"
            />
            @if (form.controls.name.touched && form.controls.name.invalid) {
              <span class="field-error">Ingresa un nombre de entre 3 y 60 caracteres.</span>
            }
          </div>
          <div class="form-field">
            <label for="profile-email">Correo electrónico</label>
            <input
              agroInput
              id="profile-email"
              type="email"
              formControlName="email"
              autocomplete="email"
              readonly
            />
            @if (form.controls.email.touched && form.controls.email.invalid) {
              <span class="field-error">Ingresa un correo electrónico válido.</span>
            }
          </div>
          <div class="form-field">
            <label for="profile-role">Rol</label>
            <input
              agroInput
              id="profile-role"
              [value]="auth.user()?.roles || 'No informado'"
              readonly
            />
          </div>
          <div class="demo-note">
            <agro-icon name="info" />
            El login no devuelve nombre ni rol. El correo identifica tu acceso y no se puede editar
            aquí. Los cambios de nombre y foto no se guardan en el servidor.
          </div>
          <div class="profile-save">
            <button agroButton type="button" (click)="reset()">Descartar</button>
            <button agroButton="primary" type="submit">Guardar perfil</button>
          </div>
        </form>
      </agro-card>
    </div>
  `,
  styles: [
    `
      .profile-grid {
        display: grid;
        grid-template-columns: 340px minmax(0, 1fr);
        gap: 27px;
        align-items: start;
        max-width: 1100px;
      }
      .profile-card {
        overflow: hidden;
      }
      .profile-cover {
        height: 100px;
        background: linear-gradient(120deg, #1e4c35, #668a56);
      }
      .profile-card-body {
        padding: 0 27px 27px;
      }
      .profile-avatar {
        width: 78px;
        height: 78px;
        font-size: 1.5rem;
        border: 5px solid var(--surface);
        margin-top: -39px;
        position: relative;
      }
      .profile-card h2 {
        font-size: 1.25rem;
        margin-top: 16px;
      }
      .profile-card p {
        font-size: 0.8125rem;
        margin: 7px 0 16px;
        overflow-wrap: anywhere;
      }
      .profile-card .status {
        font-size: 0.75rem;
      }
      .profile-card .status::before {
        display: none;
      }
      .profile-card .status agro-icon {
        width: 13px;
        height: 13px;
      }
      .profile-meta {
        display: flex;
        flex-direction: column;
        border-top: 1px solid var(--border);
        margin-top: 27px;
        padding-top: 23px;
        gap: 8px;
      }
      .profile-meta span {
        font-size: 0.75rem;
        color: var(--muted);
      }
      .profile-meta strong {
        font-size: 0.8125rem;
        font-weight: 500;
        margin-bottom: 15px;
      }
      .photo-actions {
        display: flex;
        align-items: center;
        gap: 10px;
        flex-wrap: wrap;
        margin-bottom: 26px;
        padding-bottom: 23px;
        border-bottom: 1px solid var(--border);
      }
      .photo-actions p {
        font-size: 0.75rem;
        width: 100%;
      }
      .file-input {
        display: none;
      }
      .profile-save {
        display: flex;
        gap: 10px;
        justify-content: flex-end;
        margin-top: 24px;
      }
      @media (max-width: 1100px) {
        .profile-grid {
          grid-template-columns: 1fr;
        }
        .profile-card-body {
          padding-bottom: 12px;
        }
        .profile-meta {
          display: none;
        }
        .profile-card {
          max-width: none;
        }
      }
    `,
  ],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ProfileComponent {
  readonly auth = inject(AuthService);
  private readonly snackbar = inject(MatSnackBar);
  readonly avatar = signal(this.auth.user()?.photoUrl ?? null);
  readonly initials = computed(() =>
    this.auth
      .user()
      ?.firstName?.trim()
      .split(/\s+/)
      .slice(0, 2)
      .map((first_name) => first_name[0])
      .join('')
      .toUpperCase(),
  );
  readonly form = inject(FormBuilder).nonNullable.group({
    name: [
      this.auth.user()?.firstName ?? '',
      [
        Validators.required,
        Validators.minLength(3),
        Validators.maxLength(60),
        Validators.pattern(/\S/),
      ],
    ],
    email: [this.auth.user()?.email ?? '', [Validators.required, Validators.email]],
  });
  save(): void {
    this.form.controls.name.setValue(this.form.controls.name.value.trim());
    this.form.controls.email.setValue(this.form.controls.email.value.trim());
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      return;
    }
    const value = this.form.getRawValue();
    this.auth.updateProfile({
      firstName: value.name.trim(),
      photoUrl: this.avatar(),
    });
    this.snackbar.open('Preferencias locales de perfil actualizadas.', 'Cerrar', {
      duration: 3500,
    });
  }
  reset(): void {
    this.form.reset({ name: this.auth.user()?.firstName ?? '', email: this.auth.user()?.email ?? '' });
    this.avatar.set(this.auth.user()?.photoUrl ?? null);
  }
  upload(event: Event): void {
    const input = event.target as HTMLInputElement;
    const file = input.files?.[0];
    input.value = '';
    if (!file) return;
    if (
      !['image/jpeg', 'image/png', 'image/webp'].includes(file.type) ||
      file.size > 2 * 1024 * 1024
    ) {
      this.snackbar.open('Selecciona un JPG, PNG o WebP de hasta 2 MB.', 'Cerrar', {
        duration: 4000,
      });
      return;
    }
    const reader = new FileReader();
    reader.onload = () => {
      if (typeof reader.result === 'string') this.avatar.set(reader.result);
    };
    reader.onerror = () =>
      this.snackbar.open('No se pudo leer la imagen.', 'Cerrar', { duration: 4000 });
    reader.readAsDataURL(file);
  }
}
