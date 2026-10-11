import { ChangeDetectionStrategy, Component, inject, signal } from '@angular/core';
import { MAT_DIALOG_DATA, MatDialogModule, MatDialogRef } from '@angular/material/dialog';
import { Observable } from 'rxjs';
import { Button } from '../../directives/agro-button.directive';
export interface ConfirmData {
  title: string;
  message: string;
  confirm: string;
  cancel?: string;
  action?: () => Observable<unknown>;
}

@Component({
  selector: 'agro-confirm-dialog',
  imports: [MatDialogModule, Button],
  templateUrl: './confirm-dialog.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ConfirmDialog {
  readonly ref = inject<MatDialogRef<ConfirmDialog>>(MatDialogRef);
  readonly data = inject<ConfirmData>(MAT_DIALOG_DATA);
  readonly loading = signal(false);
  confirm(): void {
    if (!this.data.action) {
      this.ref.close(true);
      return;
    }

    this.loading.set(true);
    this.ref.disableClose = true;

    this.data.action().subscribe({
      next: () => this.ref.close(true),
      error: () => {
        this.loading.set(false);
        this.ref.disableClose = false;
      },
    });
  }
}
