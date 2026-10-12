import { TableColumn, TableRow } from '../ui/data-table/data-table.component';

export type ExportFormat = 'xlsx' | 'csv';

function toCell(value: unknown): unknown {
  if (typeof value !== 'string') return value;
  const text = value.trim();
  // sin ceros a la izquierda (códigos, documentos) y hasta 15 dígitos, el límite de precisión de Excel
  const isNumber = /^-?(0|[1-9]\d*)(\.\d+)?$/.test(text) && text.replace(/\D/g, '').length <= 15;
  return isNumber ? Number(text) : value;
}

export async function exportTable(
  format: ExportFormat,
  columns: TableColumn[],
  rows: TableRow[],
  fileName: string,
  sheetName = 'Datos',
): Promise<void> {
  const { Workbook } = await import('exceljs'); // se carga solo al exportar

  // se omiten acciones y columnas sin título (checks, etc.)
  const cols = columns.filter((c) => c.kind !== 'actions' && c.label);

  const workbook = new Workbook();
  const sheet = workbook.addWorksheet(sheetName.slice(0, 31));

  sheet.columns = cols.map((c) => ({
    header: c.label,
    key: c.key,
    width: Math.max(c.label.length + 2, 14),
  }));

  sheet.addRows(
    rows.map((row) => Object.fromEntries(cols.map((c) => [c.key, toCell(row[c.key])]))),
  );

  let blob: Blob;
  if (format === 'xlsx') {
    const border = { style: 'thin', color: { argb: 'FF808080' } } as const;

    sheet.eachRow((row, rowNumber) => {
      row.eachCell({ includeEmpty: true }, (cell) => {
        cell.border = { top: border, left: border, bottom: border, right: border };

        if (rowNumber === 1) {
          cell.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FF187631' } };
          cell.font = { bold: true, color: { argb: 'FFFFFFFF' } };
          cell.alignment = { vertical: 'middle', horizontal: 'center' };
        }
      });
    });

    sheet.views = [{ state: 'frozen', ySplit: 1 }]; // encabezado fijo
    const buffer = await workbook.xlsx.writeBuffer();
    blob = new Blob([buffer], {
      type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
    });
  }

  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = `${fileName}.${format}`;
  link.click();
  URL.revokeObjectURL(url);
}
