import { Location } from '@angular/common';
import {
  ChangeDetectionStrategy,
  Component,
  TemplateRef,
  computed,
  inject,
  signal,
  viewChild,
} from '@angular/core';
import { ReactiveFormsModule } from '@angular/forms';
import { MatDialog } from '@angular/material/dialog';
import { NgIcon, provideIcons } from '@ng-icons/core';
import { heroArrowLeftEndOnRectangleMicro } from '@ng-icons/heroicons/micro';
import { heroPencil, heroTrash } from '@ng-icons/heroicons/outline';
import { heroArrowPathSolid } from '@ng-icons/heroicons/solid';
import { matDownloading } from '@ng-icons/material-icons/baseline';
import { Button } from '../../../../../shared/directives/agro-button.directive';
import { Card } from '../../../../../shared/directives/agro-card.directive';
import { AgroColorDirective } from '../../../../../shared/directives/agro-color.directive';
import { HasPermissionDirective } from '../../../../../shared/directives/has-permission.directive';
import { Empty } from '../../../../../shared/ui/agro-empty/agro-empty.component';
import { Loader } from '../../../../../shared/ui/agro-loader/agro-loader.component';
import { PageHeader } from '../../../../../shared/ui/agro-page-header/agro-page-header.component';
import { ConfirmDialog } from '../../../../../shared/ui/confirm-dialog/confirm-dialog.component';
import {
  DataTable,
  TableCellContext,
  TableColumn,
  TableRow,
} from '../../../../../shared/ui/data-table/data-table.component';
import { SearchField } from '../../../../../shared/ui/search-field/search-field.component';
import { exportTable } from '../../../../../shared/utils/export-table';
import { filterBy } from '../../../../../shared/utils/filter.util';
import { Utils } from '../../../../../shared/utils/utils';
import { TrainingRecordService } from '../../training-records.service';

type PredictionView = 'individual' | 'batch' | 'training';

@Component({
  selector: 'agro-predictions-history',
  standalone: true,
  imports: [
    ReactiveFormsModule,
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
      heroArrowLeftEndOnRectangleMicro,
      heroArrowPathSolid,
      heroPencil,
      heroTrash,
      matDownloading,
    }),
  ],
  templateUrl: './records-history.component.html',
  styleUrl: './records-history.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class RecordsHistoryComponent {
  private readonly trainingRecordService = inject(TrainingRecordService);
  private readonly location = inject(Location);
  private readonly dialog = inject(MatDialog);
  readonly searchTerm = signal('');

  records = this.trainingRecordService.listResource();

  actionsTpl = viewChild<TemplateRef<{ $implicit: TableRow }>>('actionsTpl');

  private readonly isTrainedTpl = viewChild<TemplateRef<TableCellContext>>('isTrainedTpl');

  ngOnInit() {}

  goBack(): void {
    this.location.back();
  }

  readonly columns = computed<TableColumn[]>(() => [
    { key: 'nitrogen', label: 'NITRÓGENO (kg/ha)' },
    { key: 'phosphorus', label: 'FÓSFORO (kg/ha)' },
    { key: 'potassium', label: 'POTASIO (kg/ha)' },
    { key: 'temperature', label: 'TEMPERATURA (°C)' },
    { key: 'humidity', label: 'HUMEDAD DEL SUELO (%)' },
    { key: 'phSoil', label: 'pH DEL SUELO' },
    { key: 'rainfall', label: 'PRECIPITACIÓN (mm)' },
    { key: 'source', label: 'ORIGEN' },
    { key: 'createdAt', label: 'FECHA DE CARGA' },
    { key: 'isTrained', label: 'ENTRENADO', template: this.isTrainedTpl() },
    { key: 'status', label: 'ESTADO', kind: 'status', width: '15%' },
    { key: 'actions', label: 'ACCIONES', kind: 'actions', width: '20%' },
  ]);

  // Rows:
  readonly rows = computed<TableRow[]>(() => {
    const all = (this.records.value() ?? []).map((record) => ({
      id: String(record.id),
      nitrogen: record.nitrogen,
      phosphorus: record.phosphorus,
      potassium: record.potassium,
      temperature: record.temperature,
      humidity: record.humidity,
      phSoil: record.phSoil,
      rainfall: record.rainfall,
      status: record.status,
      source: record.source,
      isTrained: String(record.isTrained ? 'SÍ' : 'NO'),
      createdAt: Utils.formatFecha(record.createdAt, 'dd/MM/yyyy'),
    }));
    return filterBy(all, this.searchTerm(), ['status']);
  });

  exportTable = () => exportTable('xlsx', this.columns(), this.rows(), 'datos-historicos-cultivos');

  isTrained = (row: TableRow) => row['isTrained'] === 'SÍ';

  remove(row: TableRow) {
    const record = this.records.value()?.find((r) => r.id === Number(row.id));
    this.dialog
      .open(ConfirmDialog, {
        width: '440px',
        data: {
          title: '¿Eliminar este registro?',
          message: `Se eliminará el registro. Esta acción no se puede deshacer.`,
          confirm: 'Eliminar',
          cancel: 'Cancelar',
        },
      })
      .afterClosed()
      .subscribe((confirmed: boolean) => {
        if (confirmed) {
          this.trainingRecordService.delete(record.id).subscribe(() => {
            this.records.reload();
          });
        }
      });
  }
}
