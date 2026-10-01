/**
 * Abre el selector nativo de archivos del navegador y retorna el archivo
 * elegido, sin depender de ningún <input type="file"> en el template.
 *
 * @param accept  Extensiones/mime-types permitidos (ej. ['.csv', '.xlsx'] o
 *                ['image/png', 'image/jpeg']). Si no se pasa nada, se muestran
 *                todos los archivos sin restricción.
 * @param multiple Si permite seleccionar más de un archivo.
 *                 - true: retorna `Promise<File[]>`.
 *                 - false o no pasado: retorna `Promise<File | null>`.
 */
export function pickFile(options: { accept?: string[]; multiple: true }): Promise<File[]>;
export function pickFile(options?: { accept?: string[]; multiple?: false }): Promise<File | null>;
export function pickFile(options?: {
  accept?: string[];
  multiple?: boolean;
}): Promise<File | File[] | null> {
  return new Promise((resolve) => {
    const input = document.createElement('input');
    input.type = 'file';
    input.accept = options?.accept?.join(',') ?? '';
    input.multiple = options?.multiple ?? false;
    input.style.display = 'none';
    document.body.appendChild(input);

    const finish = (result: File | File[] | null) => {
      input.remove();
      resolve(result);
    };

    input.addEventListener(
      'change',
      () => {
        const files = input.files ? Array.from(input.files) : [];
        finish(input.multiple ? files : (files[0] ?? null));
      },
      { once: true },
    );

    input.addEventListener('cancel', () => finish(input.multiple ? [] : null), { once: true });

    input.click();
  });
}
