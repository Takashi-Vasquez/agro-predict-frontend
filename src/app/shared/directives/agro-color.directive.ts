import { Directive, effect, ElementRef, inject, input } from '@angular/core';

@Directive({
  selector: 'ng-icon[agroColor]',
})
export class AgroColorDirective {
  readonly agroColor = input.required<string>();

  private readonly colorMap: Record<string, string> = {
    danger: 'var(--danger)',
    blue: 'var(--blue)',
    primary: 'var(--primary)',
    amber: 'var(--amber)',
    text: 'var(--text)',
    muted: 'var(--muted)',
  };

  constructor() {
    const el = inject(ElementRef).nativeElement;
    effect(() => {
      el.style.color = this.colorMap[this.agroColor()] ?? this.agroColor();
    });
  }
}
