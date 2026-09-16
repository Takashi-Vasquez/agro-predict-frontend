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
import { NgIcon, provideIcons } from '@ng-icons/core';
import { heroMagnifyingGlassMicro, heroPlusMicro } from '@ng-icons/heroicons/micro';
import { heroPencil, heroTrash } from '@ng-icons/heroicons/outline';
import { heroArrowPathSolid } from '@ng-icons/heroicons/solid';
import { Button } from '../../../../shared/directives/agro-button.directive';
import { Card } from '../../../../shared/directives/agro-card.directive';
import { AgroColorDirective } from '../../../../shared/directives/agro-color.directive';
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
import { RolesService } from '../roles.service';
import { RoleDialog } from './role-dialog/role-dialog.component';
@Component({
  selector: 'agro-roles',
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
  templateUrl: './roles.component.html',
  styleUrls: ['./roles.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush, // OnPush ya es el default en Angular 22.
})
export class RolesComponent implements OnInit {
  private readonly rolesService = inject(RolesService);
  private readonly dialog = inject(MatDialog);
  readonly searchTerm = signal('');

  roles = this.rolesService.listResource();
  @ViewChild('actionsTpl', { static: true }) actionsTpl!: TemplateRef<{ $implicit: TableRow }>;

  ngOnInit() {}

  readonly columns = computed<TableColumn[]>(() => [
    { key: 'name', label: 'NOMBRE' },
    { key: 'description', label: 'DESCRIPCIÓN' },
    { key: 'status', label: 'ESTADO', kind: 'status', width: '15%' },
    { key: 'actions', label: 'ACCIONES', kind: 'actions', width: '20%' },
  ]);

  // Rows:
  readonly rows = computed<TableRow[]>(() => {
    const all = (this.roles.value() ?? []).map((role) => ({
      id: String(role.id),
      name: role.name,
      description: role.description,
      status: role.status,
    }));
    return filterBy(all, this.searchTerm(), ['name', 'description']);
  });

  createOrUpdate(row?: TableRow) {
    const role = row ? this.roles.value()?.find((r) => r.id === Number(row.id)) : undefined;

    if (row && !role) return;

    this.dialog
      .open(RoleDialog, {
        data: role,
      })
      .afterClosed()
      .subscribe((saved: boolean) => {
        if (saved) this.roles.reload();
      });
  }

  remove(row: TableRow) {
    const role = this.roles.value()?.find((r) => r.id === Number(row.id));
    this.dialog
      .open(ConfirmDialog, {
        width: '440px',
        data: {
          title: '¿Eliminar este rol?',
          message: `Se eliminará ${role.name}. Esta acción no se puede deshacer.`,
          confirm: 'Eliminar',
          cancel: 'Cancelar',
        },
      })
      .afterClosed()
      .subscribe((confirmed: boolean) => {
        if (confirmed) {
          this.rolesService.delete(role.id).subscribe(() => {
            this.roles.reload();
          });
        }
      });
  }
}
