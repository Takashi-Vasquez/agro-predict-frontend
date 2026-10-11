import {
  ChangeDetectionStrategy,
  Component,
  computed,
  inject,
  input,
  model,
  TemplateRef,
  viewChild,
} from '@angular/core';
import { toObservable, toSignal } from '@angular/core/rxjs-interop';
import { ReactiveFormsModule, UntypedFormGroup } from '@angular/forms';
import { Observable, startWith, switchMap } from 'rxjs';
import { CoreService } from '../../../../../../core/services/core.service';
import { Card } from '../../../../../../shared/directives/agro-card.directive';
import { OnlyNumbersDirective } from '../../../../../../shared/directives/only-numbers.directive';
import { ValidationErrorPipe } from '../../../../../../shared/pipes/validation-error.pipe';
import { Empty } from '../../../../../../shared/ui/agro-empty/agro-empty.component';
import { Loader } from '../../../../../../shared/ui/agro-loader/agro-loader.component';
import {
  DataTable,
  TableCellContext,
  TableColumn,
  TableRow,
} from '../../../../../../shared/ui/data-table/data-table.component';
import { InputCheckboxComponent } from '../../../../../../shared/ui/forms/input-checkbox/input-checkbox.component';
import { InputNumberComponent } from '../../../../../../shared/ui/forms/input-number/input-number.component';
import { InputTextComponent } from '../../../../../../shared/ui/forms/input-text/input-text.component';
import { UserCompanyDto } from '../../../user.model';

@Component({
  selector: 'app-data-general',
  standalone: true,
  imports: [
    ReactiveFormsModule,
    Loader,
    Card,
    InputTextComponent,
    InputNumberComponent,
    InputCheckboxComponent,
    DataTable,
    Empty,
    ValidationErrorPipe,
    OnlyNumbersDirective,
  ],
  templateUrl: './data-general.component.html',
  styleUrl: './data-general.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class DataGeneralFormComponent {
  readonly form = input.required<UntypedFormGroup>();

  private readonly coreService = inject(CoreService);
  private readonly selectTpl = viewChild.required<TemplateRef<TableCellContext>>('selectTpl');
  private readonly defaultTpl = viewChild.required<TemplateRef<TableCellContext>>('defaultTpl');

  readonly companies = this.coreService.companiesResource({ showAll: true });

  private readonly selected = toSignal(
    toObservable(this.form).pipe(
      switchMap((form): Observable<UserCompanyDto[]> => {
        const control = form.controls['companies'];
        return control.valueChanges.pipe(startWith(control.value));
      }),
    ),
    { initialValue: [] as UserCompanyDto[] },
  );

  readonly selectedIds = model<ReadonlySet<string>>(new Set());
  readonly defaultId = model<string | null>(null);

  readonly columns = computed<TableColumn[]>(() => [
    { key: 'select', label: '', width: '48px', template: this.selectTpl() },
    { key: 'name', label: 'NOMBRE' },
    { key: 'code', label: 'CODIGO' },
    { key: 'ruc', label: 'RUC' },
    { key: 'description', label: 'DESCRIPCIÓN' },
    { key: 'isDefault', label: 'POR DEFECTO', template: this.defaultTpl() },
  ]);

  // Rows:
  readonly rows = computed<TableRow[]>(() => {
    const all = (this.companies.value() ?? []).map((companies) => ({
      id: String(companies.id),
      name: companies.name,
      code: companies.code,
      ruc: companies.ruc,
      description: companies.description,
      isDefault: String(companies.isDefault),
    }));

    return all;
  });

  isSelected(id: string): boolean {
    return this.selected().some((c) => c.id === +id);
  }

  isDefault(id: string): boolean {
    return this.selected().some((c) => c.id === +id && c.isDefault);
  }

  toggleSelected(id: string) {
    const list = this.selected();

    if (!this.isSelected(id)) {
      // la primera que se marca queda como default
      this.setFormCompanies([...list, { id: +id, isDefault: list.length === 0 }]);
      return;
    }

    const rest = list.filter((c) => c.id !== +id);
    // si se quitó la default, la primera que quede pasa a serlo
    if (rest.length && !rest.some((c) => c.isDefault)) {
      rest[0] = { ...rest[0], isDefault: true };
    }
    this.setFormCompanies(rest);
  }

  setDefault(id: string): void {
    // marcarla como default también la selecciona
    const list = this.isSelected(id)
      ? this.selected()
      : [...this.selected(), { id: +id, isDefault: false }];
    this.setFormCompanies(list.map((c) => ({ ...c, isDefault: c.id === +id })));
  }

  private setFormCompanies(list: UserCompanyDto[]): void {
    this.form().controls['companies'].setValue(list);
  }
}
