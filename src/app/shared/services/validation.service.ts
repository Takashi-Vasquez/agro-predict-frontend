import { Injectable } from '@angular/core';
import { AbstractControl } from '@angular/forms';

@Injectable({ providedIn: 'root' })
export class ValidationService {
  private readonly defaults: Record<string, string> = {
    required: 'Este campo es obligatorio.',
    minlength: 'Mínimo {requiredLength} caracteres.',
    maxlength: 'Máximo {requiredLength} caracteres.',
    email: 'Ingresa un correo electrónico válido.',
    pattern: 'Formato no válido.',
    min: 'El valor mínimo es {min}.',
    max: 'El valor máximo es {max}.',
  };

  getError(control: AbstractControl | null, custom?: Record<string, string>): string | null {
    if (!control?.errors || !control.touched) return null;
    const key = Object.keys(control.errors)[0];
    const msg = custom?.[key] ?? this.defaults[key];
    if (!msg) return null;
    return msg.replace(/\{(\w+)\}/g, (_, k: string) => control.errors[key][k] ?? '');
  }
}
