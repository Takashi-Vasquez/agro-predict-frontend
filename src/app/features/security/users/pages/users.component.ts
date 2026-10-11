import {
  ChangeDetectionStrategy,
  Component,
  computed,
  inject,
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
import { UserService } from '../user.service';
@Component({
  selector: 'agro-user',
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
  templateUrl: './users.component.html',
  styleUrls: ['./users.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class UsersComponent {
  private readonly userService = inject(UserService);
  private readonly router = inject(Router);

  private readonly dialog = inject(MatDialog);
  readonly searchTerm = signal('');

  users = this.userService.listResource();
  @ViewChild('actionsTpl', { static: true }) actionsTpl!: TemplateRef<{ $implicit: TableRow }>;
  readonly columns = computed<TableColumn[]>(() => [
    { key: 'documentNumber', label: 'N° DOCUMENTO' },
    { key: 'firstName', label: 'NOMBRES' },
    { key: 'lastName', label: 'APELLIDOS' },
    { key: 'email', label: 'CORREO' },
    { key: 'status', label: 'ESTADO', kind: 'status', width: '15%' },
    { key: 'actions', label: 'ACCIONES', kind: 'actions', width: '20%' },
  ]);

  // Rows:
  readonly rows = computed<TableRow[]>(() => {
    const all = (this.users.value() ?? []).map((role) => ({
      id: String(role.id),
      documentNumber: role.documentNumber,
      firstName: role.firstName,
      lastName: role.lastName,
      email: role.email,
      status: role.status,
    }));
    return filterBy(all, this.searchTerm(), ['documentNumber', 'firstName', 'lastName', 'email']);
  });

  createOrUpdate(row?: TableRow) {
    if (!row) {
      this.router.navigate(['/seguridad', 'usuarios', 'nuevo']);
      return;
    }
    const user = this.users.value()?.find((r) => r.id === Number(row.id));
    if (user.id > 0) {
      this.router.navigate(['/seguridad', 'usuarios', user.id, 'edit']);
    }
  }

  remove(row: TableRow) {
    const user = this.users.value()?.find((r) => r.id === Number(row.id));
    this.dialog
      .open(ConfirmDialog, {
        width: '440px',
        data: {
          title: '¿Eliminar este usuario?',
          message: `Se eliminará ${user.firstName} ${user.lastName}. Esta acción no se puede deshacer.`,
          confirm: 'Eliminar',
          cancel: 'Cancelar',
          action: () => this.userService.delete(user.id),
        },
      })
      .afterClosed()
      .subscribe((done) => {
        if (done) this.users.reload();
      });
  }
}
