import { HttpResponse } from '@angular/common/http';

export function triggerFileDownload(response: HttpResponse<Blob>, fallbackName = 'archivo'): void {
  const blob = response.body;
  if (!blob) return;

  const disposition = response.headers.get('content-disposition') ?? '';
  const match = disposition.match(/filename="?([^"]+)"?/);
  const filename = match?.[1] ?? fallbackName;

  const url = window.URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = filename;
  link.click();
  window.URL.revokeObjectURL(url);
}
