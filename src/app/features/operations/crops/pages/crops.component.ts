import { ChangeDetectionStrategy, Component, inject, OnInit, signal } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import { RouterLink } from '@angular/router';
import { WorkspaceStore } from '../../../../core/services/workspace.store';
import { ConfirmDialog } from '../../../../shared/ui/confirm-dialog';
import { Icon } from '../../../../shared/ui/icon';
import { Button, Card, Empty, Loader, PageHeader } from '../../../../shared/ui/primitives';
import { Crop } from '../crop.model';
import { CropsService } from '../crops.service';

@Component({
  selector: 'agro-crops',
  imports: [RouterLink, Icon, Button, Card, Empty, Loader, PageHeader],
  templateUrl: './crops.component.html',
  styleUrls: ['./crops.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush, // OnPush ya es el default en Angular 22.
})
export class CropsComponent implements OnInit {
  private readonly cropsService = inject(CropsService);
  private readonly store = inject(WorkspaceStore);
  private readonly dialog = inject(MatDialog);

  loading = signal(false);
  error = signal<string | null>(null);
  crops = this.cropsService.listResource();

  ngOnInit() {
  }

  plotCount(name: string): number {
    return this.store.plots().filter((plot) => plot.crop === name).length;
  }

  // !ELIMINAR, SOLO DE EJEMPLO
  remove(crop: Crop) {
    this.dialog
      .open(ConfirmDialog, {
        width: '440px',
        data: {
          title: '¿Eliminar este cultivo?',
          message: `Se eliminará ${crop.name} (${crop.variety}). Esta acción no se puede deshacer.`,
          confirm: 'Eliminar',
          cancel: 'Cancelar',
        },
      })
      .afterClosed()
      .subscribe((confirmed: boolean) => {
        if (confirmed) {
          this.cropsService.delete(5).subscribe(() => {
            this.crops.reload();
          });
        }
      });
  }
}
