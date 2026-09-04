/** Escape every cell and neutralize spreadsheet formula injection in user-entered text. */
export function toCsv(headers: string[], rows: (string | number)[][]): string {
  const cell = (value: string | number): string => {
    const text = String(value);
    const safe = typeof value === 'string' && /^[\s]*[=+@\-]/.test(text) ? `'${text}` : text;
    return `"${safe.replaceAll('"', '""')}"`;
  };
  return '\uFEFF' + [headers, ...rows].map((row) => row.map(cell).join(',')).join('\r\n');
}
export function downloadCsv(
  filename: string,
  headers: string[],
  rows: (string | number)[][],
): void {
  const url = URL.createObjectURL(
    new Blob([toCsv(headers, rows)], { type: 'text/csv;charset=utf-8' }),
  );
  const link = document.createElement('a');
  link.href = url;
  link.download = filename;
  link.click();
  setTimeout(() => URL.revokeObjectURL(url), 1000);
}
