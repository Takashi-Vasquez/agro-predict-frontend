import {
  ChangeDetectionStrategy,
  Component,
  computed,
  inject,
  OnInit,
  signal,
  TemplateRef,
  ViewChild,
} from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import { Router } from '@angular/router';
import { NgIcon, provideIcons } from '@ng-icons/core';
import { heroMagnifyingGlassMicro, heroPlusMicro } from '@ng-icons/heroicons/micro';
import { heroPencil, heroTrash } from '@ng-icons/heroicons/outline';
import { heroArrowPathSolid } from '@ng-icons/heroicons/solid';
import { Button } from '../../../../shared/directives/agro-button.directive';
import { Card } from '../../../../shared/directives/agro-card.directive';
import { AgroColorDirective } from '../../../../shared/directives/agro-color.directive';
import { HasPermissionDirective } from '../../../../shared/directives/has-permission.directive';
import { Empty } from '../../../../shared/ui/agro-empty/agro-empty.component';
import { Loader } from '../../../../shared/ui/agro-loader/agro-loader.component';
import { PageHeader } from '../../../../shared/ui/agro-page-header/agro-page-header.component';
import { ConfirmDialog } from '../../../../shared/ui/confirm-dialog/confirm-dialog.component';
import {
  DataTable,
  TableColumn,
  TableRow,
} from '../../../../shared/ui/data-table/data-table.component';
import { SearchField } from '../../../../shared/ui/search-field/search-field.component';
import { filterBy } from '../../../../shared/utils/filter.util';
import { AccessProfileService } from '../access-profile.service';
@Component({
  selector: 'agro-access-profile',
  imports: [
    SearchField,
    NgIcon,
    Button,
    Card,
    Empty,
    Loader,
    PageHeader,
    DataTable,
    AgroColorDirective,
    HasPermissionDirective,
  ],
  providers: [
    provideIcons({
      heroPlusMicro,
      heroMagnifyingGlassMicro,
      heroPencil,
      heroTrash,
      heroArrowPathSolid,
    }),
  ],
  templateUrl: './access-profile.component.html',
  styleUrls: ['./access-profile.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush, // OnPush ya es el default en Angular 22.
})
export class AccessProfileComponent implements OnInit {
  private readonly router = inject(Router);
  private readonly accessProfileService = inject(AccessProfileService);
  private readonly dialog = inject(MatDialog);
  readonly searchTerm = signal('');

  accessProfile = this.accessProfileService.listResource();
  @ViewChild('actionsTpl', { static: true }) actionsTpl!: TemplateRef<{ $implicit: TableRow }>;

  ngOnInit() {}

  readonly columns = computed<TableColumn[]>(() => [
    { key: 'name', label: 'NOMBRE' },
    { key: 'status', label: 'ESTADO', kind: 'status', width: '30%' },
    { key: 'actions', label: 'ACCIONES', kind: 'actions', width: '20%' },
  ]);

  // Rows:
  readonly rows = computed<TableRow[]>(() => {
    const all = (this.accessProfile.value() ?? []).map((obj) => ({
      id: String(obj.id),
      name: obj.name,
      status: obj.status,
    }));
    return filterBy(all, this.searchTerm(), ['name']);
  });

  createOrUpdate(row?: TableRow) {
    if (!row) {
      this.router.navigate(['/seguridad', 'perfil-acceso', 'nuevo']);
      return;
    }
    const user = row ? this.accessProfile.value()?.find((r) => r.id === Number(row.id)) : undefined;
    if (user.id > 0) {
      this.router.navigate(['/seguridad', 'perfil-acceso', user.id, 'edit']);
    }
  }

  remove(row: TableRow) {
    const obj = this.accessProfile.value()?.find((r) => r.id === Number(row.id));
    this.dialog
      .open(ConfirmDialog, {
        width: '440px',
        data: {
          title: '¿Eliminar este perfil?',
          message: `Se eliminará ${obj.name}. Esta acción no se puede deshacer.`,
          confirm: 'Eliminar',
          cancel: 'Cancelar',
          action: () => this.accessProfileService.delete(obj.id),
        },
      })
      .afterClosed()
      .subscribe((done) => {
        if (done) this.accessProfile.reload();
      });
  }
}
