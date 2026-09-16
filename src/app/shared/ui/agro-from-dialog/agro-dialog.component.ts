import { NgTemplateOutlet } from '@angular/common';
import {
  ChangeDetectionStrategy,
  Component,
  computed,
  input,
  output,
  TemplateRef,
} from '@angular/core';
import { ReactiveFormsModule } from '@angular/forms';
import { MatDialogModule } from '@angular/material/dialog';
import { BtnLoaderDirective } from '../../directives/agro-button-loader.directive';
import { Button } from '../../directives/agro-button.directive';

type AgroDialogSize = 'sm' | 'md' | 'lg' | 'xl' | 'noneResize' | 'none';

const DIALOG_SIZE_CLASSES: Record<AgroDialogSize, string> = {
  sm: 'dialog-sm',
  md: 'dialog-md',
  lg: 'dialog-lg',
  xl: 'dialog-xl',
  noneResize: 'dialog-xl-no-resize',
  none: '',
};

@Component({
  selector: 'agro-dialog',
  standalone: true,
  imports: [NgTemplateOutlet, MatDialogModule, ReactiveFormsModule, Button, BtnLoaderDirective],
  templateUrl: './agro-dialog.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class AgroFormDialog {
  //Header
  readonly title = input.required<string>();
  readonly description = input('');
  readonly size = input<AgroDialogSize>('md');
  readonly height = input<string>('auto');

  readonly saving = input(false);
  readonly savingLabel = input<string>('Procesando...');
  readonly btnCancelLabel = input<string>('Cancelar');
  readonly btnSaveLabel = input<string>('Guardar');
  readonly cancel = output<void>();

  readonly actions = input<TemplateRef<void>>();

  protected readonly modalSize = computed(() => DIALOG_SIZE_CLASSES[this.size()]);
}
