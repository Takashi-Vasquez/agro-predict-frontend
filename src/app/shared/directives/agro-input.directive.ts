import { Directive } from '@angular/core';

@Directive({
  selector: 'input[agroInput], select[agroInput], textarea[agroInput]',
  host: { class: 'form-control' },
})
export class Input { }
