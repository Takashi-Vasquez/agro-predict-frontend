import { ChangeDetectionStrategy, Component, inject } from '@angular/core';
import { MAT_DIALOG_DATA, MatDialogModule } from '@angular/material/dialog';
import { Button } from '../../directives/agro-button.directive';
export interface ConfirmData {
  title: string;
  message: string;
  confirm: string;
  cancel?: string;
}

@Component({
  selector: 'agro-confirm-dialog',
  imports: [MatDialogModule, Button],
  templateUrl: './confirm-dialog.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ConfirmDialog {
  readonly data = inject<ConfirmData>(MAT_DIALOG_DATA);
}
