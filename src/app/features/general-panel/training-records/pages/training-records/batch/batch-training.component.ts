import {
  ChangeDetectionStrategy,
  Component,
  EventEmitter,
  Output,
  computed,
  inject,
  signal,
} from '@angular/core';
import { NgIcon, provideIcons, provideNgIconsConfig } from '@ng-icons/core';
import { heroPlus, heroSquare3Stack3d } from '@ng-icons/heroicons/outline';
import { matCloudUpload, matDownload, matDownloading } from '@ng-icons/material-icons/baseline';
import { Button } from '../../../../../../shared/directives/agro-button.directive';
import { Card } from '../../../../../../shared/directives/agro-card.directive';
import { HasPermissionDirective } from '../../../../../../shared/directives/has-permission.directive';
import { Empty } from '../../../../../../shared/ui/agro-empty/agro-empty.component';
import { Loader } from '../../../../../../shared/ui/agro-loader/agro-loader.component';
import {
  DataTable,
  TableColumn,
  TableRow,
} from '../../../../../../shared/ui/data-table/data-table.component';
import { triggerFileDownload } from '../../../../../../shared/utils/download';
import { exportTable } from '../../../../../../shared/utils/export-table';
import { pickFile } from '../../../../../../shared/utils/file-picker';
import { UploadResult } from '../../../models/upload.model';
import { TrainingRecordService } from '../../../training-records.service';

@Component({
  selector: 'app-batch-training',
  standalone: true,
  imports: [NgIcon, Button, Card, Empty, Loader, DataTable, HasPermissionDirective],
  providers: [
    provideIcons({
      heroSquare3Stack3d,
      matDownload,
      matCloudUpload,
      heroPlus,
      matDownloading,
    }),
    provideNgIconsConfig({
      size: '1.3em',
    }),
  ],
  templateUrl: './batch-training.component.html',
  styleUrl: './batch-training.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class BatchTrainingComponent {
  @Output() recordsChanged = new EventEmitter<void>();

  private readonly trainingRecordService = inject(TrainingRecordService);

  protected downloading = signal(false);
  protected uploading = signal(false);
  protected batchError = signal<string | null>(null);

  readonly uploadResult = signal<UploadResult | null>(null);
  readonly fieldsResource = this.trainingRecordService.fieldsResource();

  readonly columns = computed<TableColumn[]>(() => {
    const fields = this.fieldsResource.value() ?? [];
    const dynamicColumns: TableColumn[] = [...fields]
      .sort((a, b) => a.orderIndex - b.orderIndex)
      .map((f) => ({ key: f.fieldKey, label: f.label.toUpperCase() }));

    return [
      ...dynamicColumns,
      { key: 'row', label: 'FILA', width: '8%' },
      { key: 'error', label: 'ERROR', kind: 'emphasis', width: '20%' },
    ];
  });

  readonly rows = computed<TableRow[]>(() =>
    (this.uploadResult()?.records ?? []).map((r) => ({
      id: String(r.row),
      ...r,
    })),
  );

  exportTable = () => exportTable('xlsx', this.columns(), this.rows(), 'datos-historicos-cultivos');

  downloadFormat() {
    this.downloading.set(true);
    this.trainingRecordService.downloadTemplate().subscribe({
      next: (response) => {
        triggerFileDownload(response);
      },
      error: () => this.downloading.set(false),
      complete: () => this.downloading.set(false),
    });
  }

  async uploadFile() {
    this.uploading.set(true);
    this.batchError.set(null);

    const file = await pickFile({ accept: ['.csv', '.xlsx'] });
    if (!file) {
      this.uploadResult.set(null);
      this.uploading.set(false);
      return;
    }

    this.trainingRecordService.upload(file).subscribe({
      next: (response: UploadResult) => {
        this.uploadResult.set(response);
      },
      error: (err) => {
        this.batchError.set(err?.message ?? 'Error al subir el archivo');
        this.uploading.set(false);
      },
      complete: () => {
        this.uploading.set(false);
        this.recordsChanged.emit();
      },
    });
  }
}
