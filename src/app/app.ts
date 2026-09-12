import { ChangeDetectionStrategy, Component, inject } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { ToasterComponent } from 'ngx-herald';
import { ThemeService } from './core/services/theme.service';

@Component({
  selector: 'agro-root',
  imports: [RouterOutlet, ToasterComponent],
  template: '<ngx-herald /><router-outlet />',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class App {
  private readonly theme = inject(ThemeService);
}
