import { NgTemplateOutlet } from '@angular/common';
import {
  ChangeDetectionStrategy,
  Component,
  computed,
  input,
  signal,
  TemplateRef,
} from '@angular/core';
import { Button } from '../../directives/agro-button.directive';
import { StatusLabelPipe, StatusTypePipe } from '../../pipes/status.pipe';
import { Empty } from '../agro-empty/agro-empty.component';
export interface TableColumn {
  key: string;
  label: string;
  kind?: 'status' | 'emphasis' | 'actions';
  width?: string;
}
export interface TableRow {
  id: string;
  [key: string]: string | number;
}
@Component({
  selector: 'agro-data-table',
  imports: [Empty, Button, NgTemplateOutlet, StatusTypePipe, StatusLabelPipe],
  templateUrl: './data-table.component.html',
  styleUrls: ['./data-table.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class DataTable {
  readonly columns = input.required<TableColumn[]>();
  readonly rows = input.required<TableRow[]>();
  readonly caption = input('Datos agrícolas');
  readonly paginate = input(false);
  readonly page = signal(0);
  readonly actionsTemplate = input<TemplateRef<{ $implicit: TableRow }>>();

  readonly pageCount = computed(() => Math.max(1, Math.ceil(this.rows().length / 6)));
  readonly currentPage = computed(() => Math.min(this.page(), this.pageCount() - 1));
  readonly visibleRows = computed(() =>
    this.paginate()
      ? this.rows().slice(this.currentPage() * 6, this.currentPage() * 6 + 6)
      : this.rows(),
  );
}
