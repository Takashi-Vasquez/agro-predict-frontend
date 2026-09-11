import { A11yModule } from '@angular/cdk/a11y';
import { BreakpointObserver } from '@angular/cdk/layout';
import { ChangeDetectionStrategy, Component, computed, inject, signal } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { FormsModule } from '@angular/forms';
import { MatMenuModule } from '@angular/material/menu';
import { MatTooltipModule } from '@angular/material/tooltip';
import { NavigationEnd, Router, RouterOutlet } from '@angular/router';
import { environment } from '../../../environments/environment';
import {
  AgroRepository,
  ApiAgroRepository,
  MockAgroRepository,
} from '../../core/services/agro.repository';
import { AuthService } from '../../core/services/auth.service';
import { MenuService } from '../../core/services/menu.service';
import { WorkspaceStore } from '../../core/services/workspace.store';
import { Button, Empty, Loader } from '../../shared/ui/primitives';
import { FooterComponent } from '../components/footer/footer.component';
import { HeaderSidebarComponent } from './header-sidebar/header-sidebar.component';
import { SidebarComponent } from './sidebar/sidebar.component';

@Component({
  selector: 'agro-layout',
  imports: [
    RouterOutlet,
    Button,
    Empty,
    Loader,
    FormsModule,
    MatMenuModule,
    MatTooltipModule,
    A11yModule,
    HeaderSidebarComponent,
    SidebarComponent,
    FooterComponent
  ],
  providers: [
    WorkspaceStore,
    {
      provide: AgroRepository,
      useExisting: environment.useMockApi ? MockAgroRepository : ApiAgroRepository,
    },
  ],
  templateUrl: './app-layout.html',
  styleUrl: './app-layout.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class AppLayoutComponent {
  readonly authService = inject(AuthService);
  readonly store = inject(WorkspaceStore);
  readonly menuService = inject(MenuService);
  private readonly router = inject(Router);

  readonly collapsed = signal(false);
  readonly drawer = signal(false);
  readonly mobile = signal(false);
  readonly title = signal('Dashboard');
  readonly unread = signal(true);

  readonly menu = computed(() => this.menuService.menuTree() ?? []);

  constructor() {

    const updateTitle = () => {
      const currentUrl = this.router.url.split('?')[0];
      const matchingItem = this.menuService.findMenuItem(currentUrl, this.menu());
      this.title.set(matchingItem?.name ?? 'AgroPredict');
    }

    updateTitle();

    this.router.events.pipe(takeUntilDestroyed()).subscribe((event) => {
      if (event instanceof NavigationEnd) {
        updateTitle();
        this.drawer.set(false);
      }
    });

    inject(BreakpointObserver)
      .observe('(max-width: 900px)')
      .pipe(takeUntilDestroyed())
      .subscribe((result) => {
        this.mobile.set(result.matches);
        if (!result.matches) this.drawer.set(false);
      });
  }

}
