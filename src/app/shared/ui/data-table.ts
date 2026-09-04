import { ChangeDetectionStrategy, Component, computed, input, signal } from '@angular/core';
import { Empty, Button } from './primitives';
export interface TableColumn {
  key: string;
  label: string;
  kind?: 'status' | 'emphasis';
}
export interface TableRow {
  id: string;
  [key: string]: string | number;
}
@Component({
  selector: 'agro-data-table',
  imports: [Empty, Button],
  template: `
    @if (rows().length) {
      <div class="table-scroll" tabindex="0" [attr.aria-label]="caption()">
        <table>
          <caption class="sr-only">{{ caption() }}</caption>
          <thead>
            <tr>
              @for (column of columns(); track column.key) {
                <th scope="col">{{ column.label }}</th>
              }
            </tr>
          </thead>
          <tbody>
            @for (row of visibleRows(); track row.id) {
              <tr>
                @for (column of columns(); track column.key) {
                  <td [class.emphasis]="column.kind === 'emphasis'">
                    @if (column.kind === 'status') {
                      <span
                        class="status"
                        [class.amber]="
                          row[column.key] === 'En preparación' ||
                          row[column.key] === 'Planificado' ||
                          row[column.key] === 'En proceso'
                        "
                        [class.blue]="row[column.key] === 'En crecimiento'"
                      >
                        {{ row[column.key] }}
                      </span>
                    } @else {
                      {{ row[column.key] }}
                    }
                  </td>
                }
              </tr>
            }
          </tbody>
        </table>
      </div>
      @if (paginate()) {
        <div class="table-pagination">
          <span>{{ rows().length }} registros</span>
          <div>
            <button
              agroButton="ghost"
              aria-label="Página anterior"
              [disabled]="currentPage() === 0"
              (click)="page.set(currentPage() - 1)"
            >
              Anterior
            </button>
            <span>{{ currentPage() + 1 }} / {{ pageCount() }}</span>
            <button
              agroButton="ghost"
              aria-label="Página siguiente"
              [disabled]="currentPage() >= pageCount() - 1"
              (click)="page.set(currentPage() + 1)"
            >
              Siguiente
            </button>
          </div>
        </div>
      }
    } @else {
      <agro-empty />
    }
  `,
  styles: [
    `
      :host {
        display: block;
        min-width: 0;
      }
      .table-scroll {
        overflow-x: auto;
      }
      table {
        width: 100%;
        border-collapse: collapse;
        text-align: left;
        white-space: nowrap;
      }
      th {
        font-size: 0.75rem;
        font-weight: 500;
        color: var(--muted);
        background: var(--surface-alt);
        padding: 13px 23px;
        border-top: 1px solid var(--border);
        border-bottom: 1px solid var(--border);
      }
      td {
        font-size: 0.875rem;
        padding: 18px 23px;
        border-bottom: 1px solid var(--border);
        color: var(--muted);
      }
      td.emphasis {
        color: var(--text);
        font-weight: 550;
      }
      tbody tr:last-child td {
        border-bottom: none;
      }
      tbody tr:hover {
        background: var(--surface-alt);
      }
      .table-pagination {
        display: flex;
        align-items: center;
        justify-content: space-between;
        gap: 10px;
        padding: 12px 20px;
        border-top: 1px solid var(--border);
        font-size: 0.75rem;
        color: var(--muted);
      }
      .table-pagination > div {
        display: flex;
        align-items: center;
        gap: 8px;
      }
      .table-pagination .button {
        font-size: 0.75rem;
        padding: 6px 8px;
        min-height: 34px;
      }
      .sr-only {
        position: absolute;
        width: 1px;
        height: 1px;
        padding: 0;
        margin: -1px;
        overflow: hidden;
        clip: rect(0, 0, 0, 0);
        white-space: nowrap;
        border: 0;
      }
    `,
  ],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class DataTable {
  readonly columns = input.required<TableColumn[]>();
  readonly rows = input.required<TableRow[]>();
  readonly caption = input('Datos agrícolas');
  readonly paginate = input(false);
  readonly page = signal(0);
  readonly pageCount = computed(() => Math.max(1, Math.ceil(this.rows().length / 6)));
  readonly currentPage = computed(() => Math.min(this.page(), this.pageCount() - 1));
  readonly visibleRows = computed(() =>
    this.paginate()
      ? this.rows().slice(this.currentPage() * 6, this.currentPage() * 6 + 6)
      : this.rows(),
  );
}
