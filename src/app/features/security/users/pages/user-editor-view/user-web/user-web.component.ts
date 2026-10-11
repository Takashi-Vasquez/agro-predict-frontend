import {
  ChangeDetectionStrategy,
  Component,
  computed,
  inject,
  input,
  OnInit,
  signal,
} from '@angular/core';
import { ReactiveFormsModule, UntypedFormGroup } from '@angular/forms';
import { MatCheckboxModule } from '@angular/material/checkbox';
import { NgIcon, provideIcons } from '@ng-icons/core';
import { heroPlusCircleMini } from '@ng-icons/heroicons/mini';
import { heroTrash } from '@ng-icons/heroicons/outline';
import { STATUS } from '../../../../../../core/constants';
import { CoreService } from '../../../../../../core/services/core.service';
import { Button } from '../../../../../../shared/directives/agro-button.directive';
import { Card } from '../../../../../../shared/directives/agro-card.directive';
import { ValidationErrorPipe } from '../../../../../../shared/pipes/validation-error.pipe';
import { Empty } from '../../../../../../shared/ui/agro-empty/agro-empty.component';
import {
  DataTable,
  TableColumn,
  TableRow,
} from '../../../../../../shared/ui/data-table/data-table.component';
import { SelectComponent } from '../../../../../../shared/ui/forms/agro-select/agro-select.component';
import { InputCheckboxComponent } from '../../../../../../shared/ui/forms/input-checkbox/input-checkbox.component';
import { InputTextComponent } from '../../../../../../shared/ui/forms/input-text/input-text.component';
import { SildeToggle } from '../../../../../../shared/ui/forms/slide-toggle/slide-toggle.component';

@Component({
  selector: 'app-user-web',
  standalone: true,
  imports: [
    ReactiveFormsModule,
    MatCheckboxModule,
    NgIcon,
    Card,
    SelectComponent,
    InputTextComponent,
    InputCheckboxComponent,
    ValidationErrorPipe,
    DataTable,
    SildeToggle,
    Empty,
    Button,
  ],
  providers: [
    provideIcons({
      heroPlusCircleMini,
      heroTrash,
    }),
  ],
  templateUrl: './user-web.component.html',
  styleUrl: './user-web.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class UserWebFormComponent implements OnInit {
  readonly form = input.required<UntypedFormGroup>();

  private readonly coreService = inject(CoreService);

  readonly STATUS = STATUS;

  readonly rolesOptions = this.coreService.rolesResource();

  private readonly roleIds = signal<number[]>([]);
  readonly availableRoles = computed(() =>
    (this.rolesOptions.value() ?? []).filter((opt) => !this.roleIds().includes(Number(opt.value))),
  );

  readonly columns = computed<TableColumn[]>(() => [
    { key: 'name', label: 'NOMBRE' },
    { key: 'actions', label: 'ACCIONES', kind: 'actions', width: '20%' },
  ]);

  readonly rows = computed<TableRow[]>(() => {
    const options = this.rolesOptions.value() ?? [];

    return this.roleIds()
      .map((id): TableRow | null => {
        const option = options.find((opt) => String(opt.value) === String(id));
        return option ? { id: String(id), name: option.label } : null;
      })
      .filter((row): row is TableRow => row !== null);
  });

  ngOnInit(): void {
    const roleIds = this.form().controls['roleIds'];
    this.roleIds.set(roleIds.value ?? []);
    roleIds.valueChanges.subscribe((value) => this.roleIds.set(value ?? []));
  }

  addRol(): void {
    const select = this.form().controls['selectRoles'];
    const id = Number(select.value);
    if (!id || this.roleIds().includes(id)) {
      return;
    }
    this.form().controls['roleIds'].setValue([...this.roleIds(), id]);
    select.setValue(0);
  }

  removeRol(row: TableRow): void {
    const id = Number(row.id);
    this.form().controls['roleIds'].setValue(this.roleIds().filter((roleId) => roleId !== id));
  }
}
