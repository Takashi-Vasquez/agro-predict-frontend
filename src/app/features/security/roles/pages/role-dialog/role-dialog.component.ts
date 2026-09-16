import { ChangeDetectionStrategy, Component, computed, inject, signal } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { MAT_DIALOG_DATA, MatDialogModule, MatDialogRef } from '@angular/material/dialog';
import { MatSlideToggleModule } from '@angular/material/slide-toggle';
import { STATUS, StatusType } from '../../../../../core/constants';
import { ValidationErrorPipe } from '../../../../../shared/pipes/validation-error.pipe';
import { AgroFormDialog } from '../../../../../shared/ui/agro-from-dialog/agro-dialog.component';
import { InputTextComponent } from '../../../../../shared/ui/forms/input-text/input-text.component';
import { TextareaComponent } from '../../../../../shared/ui/forms/input-textarea/input-textarea.component';
import { SildeToggle } from '../../../../../shared/ui/forms/slide-toggle/slide-toggle.component';
import { Role } from '../../roles.model';
import { RolesService } from '../../roles.service';

@Component({
  selector: 'agro-role-dialog',
  imports: [
    ReactiveFormsModule,
    MatSlideToggleModule,
    AgroFormDialog,
    MatDialogModule,
    SildeToggle,
    InputTextComponent,
    TextareaComponent,
    ValidationErrorPipe,
  ],
  templateUrl: './role-dialog.component.html',
  styleUrls: ['./role-dialog.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class RoleDialog {
  protected readonly ref = inject(MatDialogRef<RoleDialog>);
  readonly STATUS = STATUS;
  private readonly rolesService = inject(RolesService);
  protected saving = signal(false);
  readonly role = inject<Role | undefined>(MAT_DIALOG_DATA);
  protected readonly isEditMode = computed(() => !!this.role?.id);

  readonly form = inject(FormBuilder).nonNullable.group({
    name: [
      this.role?.name ?? '',
      [Validators.required, Validators.minLength(3), Validators.maxLength(60)],
    ],
    description: [this.role?.description ?? '', [Validators.maxLength(200)]],
    status: [(this.role?.status ?? STATUS.ACTIVE) as StatusType, [Validators.required]],
  });

  save(): void {
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      return;
    }

    const value = this.form.getRawValue();
    this.saving.set(true);

    const request$ = this.role?.id
      ? this.rolesService.update(this.role.id, value)
      : this.rolesService.create(value);

    request$.subscribe({
      next: () => {
        this.ref.close(true);
        this.saving.set(false);
      },
      error: () => this.saving.set(false),
    });
  }
}
