import { ChangeDetectionStrategy, Component, inject } from '@angular/core';
import { MAT_DIALOG_DATA, MatDialogModule } from '@angular/material/dialog';
import { Button } from './primitives';
export interface ConfirmData {
  title: string;
  message: string;
  confirm: string;
  cancel?: string;
}
@Component({
  selector: 'agro-confirm-dialog',
  imports: [MatDialogModule, Button],
  template: `
    <div class="dialog-content">
      <h2 mat-dialog-title>{{ data.title }}</h2>
      <p>{{ data.message }}</p>
      <div class="dialog-actions">
        @if (data.cancel) {
          <button agroButton [mat-dialog-close]="false">{{ data.cancel }}</button>
        }
        <button agroButton="primary" [mat-dialog-close]="true">{{ data.confirm }}</button>
      </div>
    </div>
  `,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ConfirmDialog {
  readonly data = inject<ConfirmData>(MAT_DIALOG_DATA);
}
