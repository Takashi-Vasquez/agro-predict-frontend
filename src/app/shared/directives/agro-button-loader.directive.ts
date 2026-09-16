import { Directive, input } from '@angular/core';

@Directive({
  selector: 'button[btnLoader]',
  host: {
    class: 'has-loader',
    '[class.is-loading]': 'btnLoader()',
    '[attr.disabled]': 'btnLoader() ? true : null',
    '[attr.aria-busy]': 'btnLoader()',
    '[attr.data-loading-text]': 'loadingText()',
  },
})
export class BtnLoaderDirective {
  readonly btnLoader = input<boolean>(false);
  readonly loadingText = input<string>('Procesando...');
}
