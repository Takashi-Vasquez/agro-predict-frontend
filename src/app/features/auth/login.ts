import { ChangeDetectionStrategy, Component, DestroyRef, inject, signal } from '@angular/core';
import { HttpErrorResponse } from '@angular/common/http';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { MatCheckboxModule } from '@angular/material/checkbox';
import { MatDialog } from '@angular/material/dialog';
import { finalize, TimeoutError } from 'rxjs';
import { AuthService } from '../../core/services/auth.service';
import { AuthResponseError } from '../../core/models/auth.models';
import { ThemeService } from '../../core/services/theme.service';
import { Icon } from '../../shared/ui/icon';
import { Button, Input } from '../../shared/ui/primitives';
import { ConfirmDialog } from '../../shared/ui/confirm-dialog';

@Component({
  selector: 'agro-login',
  imports: [ReactiveFormsModule, MatCheckboxModule, Icon, Button, Input],
  templateUrl: './login.html',
  styleUrl: './login.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class Login {
  private readonly auth = inject(AuthService);
  private readonly router = inject(Router);
  private readonly route = inject(ActivatedRoute);
  private readonly dialog = inject(MatDialog);
  private readonly destroyRef = inject(DestroyRef);
  readonly theme = inject(ThemeService);
  readonly showPassword = signal(false);
  readonly pending = signal(false);
  readonly error = signal<string | null>(
    this.route.snapshot.queryParamMap.get('reason') === 'expired'
      ? 'Tu sesión venció. Inicia sesión nuevamente.'
      : null,
  );
  readonly form = inject(FormBuilder).nonNullable.group({
    email: ['', [Validators.required, Validators.email, Validators.maxLength(254)]],
    // Login must not impose a new registration/password-complexity policy.
    password: ['', [Validators.required, Validators.pattern(/\S/)]],
    remember: [false],
  });

  constructor() {
    this.form.valueChanges.pipe(takeUntilDestroyed()).subscribe(() => this.error.set(null));
  }

  normalizeEmail(): void {
    this.form.controls.email.setValue(this.form.controls.email.value.trim());
  }

  submit(): void {
    if (this.pending()) return;
    this.normalizeEmail();
    this.error.set(null);
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      return;
    }
    const { email, password, remember } = this.form.getRawValue();
    this.pending.set(true);
    this.form.disable({ emitEvent: false });
    this.auth
      .login({ email, password }, remember)
      .pipe(
        takeUntilDestroyed(this.destroyRef),
        finalize(() => {
          this.pending.set(false);
          if (this.form.disabled) this.form.enable({ emitEvent: false });
        }),
      )
      .subscribe({
        next: () => {
          this.form.controls.password.reset('', { emitEvent: false });
          this.showPassword.set(false);
          void this.router.navigateByUrl(this.returnUrl());
        },
        error: (error: unknown) => {
          this.form.enable({ emitEvent: false });
          this.error.set(this.errorMessage(error));
          if (error instanceof HttpErrorResponse && error.status === 422)
            this.applyServerValidation(error.error);
        },
      });
  }

  startDemo(): void {
    if (this.pending()) return;
    this.auth.startDemo();
    void this.router.navigateByUrl(this.returnUrl());
  }

  private returnUrl(): string {
    const target = this.route.snapshot.queryParamMap.get('returnUrl');
    return target &&
      /^\/(?!\/)/.test(target) &&
      !/[\\\r\n]/.test(target) &&
      !target.startsWith('/login')
      ? target
      : '/dashboard';
  }

  private errorMessage(error: unknown): string {
    if (error instanceof TimeoutError)
      return 'El servidor tardó demasiado en responder. Inténtalo nuevamente.';
    if (error instanceof AuthResponseError)
      return error.reason === 'expired-token'
        ? 'El servidor devolvió una sesión vencida. Revisa la fecha del servidor o contacta al administrador.'
        : 'El servidor devolvió una sesión no válida. Inténtalo nuevamente o contacta al administrador.';
    if (!(error instanceof HttpErrorResponse))
      return 'No pudimos iniciar sesión. Inténtalo nuevamente.';
    switch (error.status) {
      case 0:
        return 'No se pudo conectar con el servidor. Revisa tu conexión y que la API esté disponible.';
      case 400:
      case 401:
        return 'El correo o la contraseña son incorrectos.';
      case 403:
        return 'No tienes acceso a la aplicación. Contacta al administrador.';
      case 422:
        return 'Revisa los datos ingresados. El servidor no pudo validarlos.';
      case 429:
        return 'Demasiados intentos de acceso. Espera unos minutos antes de intentarlo nuevamente.';
      default:
        return 'El servicio de acceso no está disponible en este momento. Inténtalo más tarde.';
    }
  }

  private applyServerValidation(body: unknown): void {
    if (
      typeof body !== 'object' ||
      body === null ||
      !('detail' in body) ||
      !Array.isArray(body.detail)
    )
      return;
    for (const detail of body.detail as unknown[]) {
      if (
        typeof detail !== 'object' ||
        detail === null ||
        !('loc' in detail) ||
        !Array.isArray(detail.loc)
      )
        continue;
      const field: unknown = detail.loc.at(-1);
      if (field === 'email' || field === 'password') {
        this.form.controls[field].setErrors({ server: true });
        this.form.controls[field].markAsTouched();
      }
    }
  }

  forgot(): void {
    this.dialog.open(ConfirmDialog, {
      width: '440px',
      data: {
        title: 'Recuperar contraseña',
        message:
          'La recuperación de contraseña todavía no está disponible. Contacta al administrador para recuperar tu acceso. No se enviará ningún correo desde este formulario.',
        confirm: 'Entendido',
      },
    });
  }
}
