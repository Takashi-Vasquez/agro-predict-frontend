import { Directive, input } from '@angular/core';

@Directive({
  selector: 'button[agroButton], a[agroButton]',
  host: {
    class: 'button',
    '[class.button-primary]': 'agroButton() === "primary"',
    '[class.button-ghost]': 'agroButton() === "ghost"',
  },
})
export class Button {
  readonly agroButton = input<'' | 'primary' | 'secondary' | 'ghost'>('secondary');
}
