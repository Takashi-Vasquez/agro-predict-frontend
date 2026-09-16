import { ChangeDetectionStrategy, Component } from '@angular/core';

@Component({
  selector: 'agro-card',
  template: '<ng-content />',
  host: { class: 'card' },
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class Card { }
