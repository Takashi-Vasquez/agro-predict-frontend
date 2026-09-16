import { inject, Pipe, PipeTransform } from '@angular/core';
import { AbstractControl } from '@angular/forms';
import { ValidationService } from '../services/validation.service';

@Pipe({ name: 'validationError', standalone: true, pure: false })
export class ValidationErrorPipe implements PipeTransform {
  private readonly service = inject(ValidationService);

  transform(control: AbstractControl | null, custom?: Record<string, string>): string | null {
    return this.service.getError(control, custom);
  }
}
