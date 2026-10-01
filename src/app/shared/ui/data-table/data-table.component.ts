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
import { StatusLabelPipe, StatusOptionsKey, StatusTypePipe } from '../../pipes/status.pipe';
import { Empty } from '../agro-empty/agro-empty.component';
export interface TableColumn {
  key: string;
  label: string;
  kind?: 'status' | 'emphasis' | 'actions';
  width?: string;
  template?: TemplateRef<{ $implicit: TableRow[keyof TableRow]; row: TableRow }>;
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
  readonly StatusOptionsKey = input<StatusOptionsKey>('status');
  readonly rows = input.required<TableRow[]>();
  readonly caption = input('Datos agrícolas');
  readonly countRowView = input(8);

  readonly paginate = input(false);
  readonly page = signal(0);
  readonly actionsTemplate = input<TemplateRef<{ $implicit: TableRow }>>();

  readonly pageCount = computed(() =>
    Math.max(1, Math.ceil(this.rows().length / this.countRowView())),
  );
  readonly currentPage = computed(() => Math.min(this.page(), this.pageCount() - 1));
  readonly visibleRows = computed(() =>
    this.paginate()
      ? this.rows().slice(
          this.currentPage() * this.countRowView(),
          this.currentPage() * this.countRowView() + this.countRowView(),
        )
      : this.rows(),
  );
}
