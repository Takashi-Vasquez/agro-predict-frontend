import { Directive, HostListener, input } from '@angular/core';

type documentType = 'DNI' | 'C.E' | 'RUC' | 'PASAPORTE' | 'OTROS';

@Directive({ selector: '[only-numbers]' })
export class OnlyNumbersDirective {
  readonly decimal = input<boolean>(false);
  readonly isDocument = input<boolean>(false);
  readonly documentType = input<documentType>('OTROS');

  constructor() {}

  @HostListener('keypress', ['$event']) onKeyPress(e: KeyboardEvent) {
    if (this.isDocument) {
      const documentType = this.documentType() ? this.documentType().toUpperCase().trim() : 'OTROS';
      if (documentType == 'DNI' || documentType == 'RUC') {
        return this.onlyNumbers(e.key);
      } else {
        return /^[a-zA-Z0-9]*$/.test(e.key);
      }
    }
    if (!this.decimal) return this.onlyNumbers(e.key);
    if (isNaN(parseInt(e.key))) return e.key == '.';
    else return parseInt(e.key) >= 0 && parseInt(e.key) <= 9;
  }

  private onlyNumbers(key: string): boolean {
    return /^\d+$/.test(key);
  }
}
