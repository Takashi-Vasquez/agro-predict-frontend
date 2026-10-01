import { booleanAttribute, Directive, input } from '@angular/core';

export type AgroButtonVariant = 'primary' | 'secondary' | 'ghost' | 'amber' | 'blue' | 'danger';
export type AgroButtonShape = 'rounded' | 'outline' | '';

@Directive({
  selector: 'button[agroButton], a[agroButton]',
  host: {
    class: 'button',
    '[class.button-primary]': 'agroButton() === "primary"',
    '[class.button-amber]': 'agroButton() === "amber"',
    '[class.button-blue]': 'agroButton() === "blue"',
    '[class.button-danger]': 'agroButton() === "danger"',
    '[class.button-ghost]': 'agroButton() === "ghost"',
    '[class.button-rounded]': 'rounded()',
    '[class.button-outline]': 'outline()',
  },
})
export class Button {
  readonly agroButton = input<'' | AgroButtonVariant>('secondary');
  readonly rounded = input(false, { transform: booleanAttribute });
  readonly outline = input(false, { transform: booleanAttribute });
}
