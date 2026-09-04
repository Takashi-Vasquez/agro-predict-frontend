import { ChangeDetectionStrategy, Component, computed, inject, signal } from '@angular/core';
import { NavigationEnd, Router, RouterLink, RouterLinkActive, RouterOutlet } from '@angular/router';
import { DatePipe } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { MatMenuModule } from '@angular/material/menu';
import { MatTooltipModule } from '@angular/material/tooltip';
import { MatDialog } from '@angular/material/dialog';
import { A11yModule } from '@angular/cdk/a11y';
import { BreakpointObserver } from '@angular/cdk/layout';
import { AuthService } from '../core/services/auth.service';
import { ThemeService } from '../core/services/theme.service';
import { PreferencesService } from '../core/services/preferences.service';
import { WorkspaceStore } from '../core/services/workspace.store';
import {
  AgroRepository,
  ApiAgroRepository,
  MockAgroRepository,
} from '../core/services/agro.repository';
import { environment } from '../../environments/environment';
import { Icon } from '../shared/ui/icon';
import { Button, Empty, Loader } from '../shared/ui/primitives';
import { ConfirmDialog } from '../shared/ui/confirm-dialog';
import { MAIN_NAV, MONITOR_NAV, ACCOUNT_NAV, ALL_NAV } from './navigation';
import { SearchDialog } from './search-dialog';

@Component({
  selector: 'agro-layout',
  imports: [
    RouterOutlet,
    RouterLink,
    RouterLinkActive,
    Icon,
    Button,
    Empty,
    Loader,
    DatePipe,
    FormsModule,
    MatMenuModule,
    MatTooltipModule,
    A11yModule,
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
export class AppLayout {
  readonly auth = inject(AuthService);
  readonly theme = inject(ThemeService);
  readonly preferences = inject(PreferencesService);
  readonly store = inject(WorkspaceStore);
  private readonly router = inject(Router);
  private readonly dialog = inject(MatDialog);
  readonly mainNav = MAIN_NAV;
  readonly monitorNav = MONITOR_NAV;
  readonly accountNav = ACCOUNT_NAV;
  readonly collapsed = signal(false);
  readonly drawer = signal(false);
  readonly mobile = signal(false);
  readonly search = signal('');
  readonly title = signal('Dashboard');
  readonly unread = signal(true);
  readonly today = new Date();
  readonly searchResults = computed(() =>
    this.search().trim()
      ? ALL_NAV.filter((item) =>
          item.label.toLocaleLowerCase('es').includes(this.search().trim().toLocaleLowerCase('es')),
        )
      : [],
  );
  readonly initials = computed(
    () =>
      this.auth
        .user()
        ?.name.trim()
        .split(/\s+/)
        .slice(0, 2)
        .map((name) => name[0])
        .join('')
        .toUpperCase() ?? 'AM',
  );
  constructor() {
    const updateTitle = () =>
      this.title.set(
        ALL_NAV.find((item) => this.router.url.split('?')[0] === item.path)?.label ?? 'AgroPredict',
      );
    updateTitle();
    this.router.events.pipe(takeUntilDestroyed()).subscribe((event) => {
      if (event instanceof NavigationEnd) {
        updateTitle();
        this.drawer.set(false);
        this.search.set('');
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
  toggleMenu(): void {
    if (this.mobile()) this.drawer.update((value) => !value);
    else this.collapsed.update((value) => !value);
  }
  openSearch(): void {
    this.dialog.open(SearchDialog, { width: '500px', maxWidth: 'calc(100vw - 24px)' });
  }
  logout(): void {
    this.dialog
      .open(ConfirmDialog, {
        width: '420px',
        data: {
          title: '¿Cerrar sesión?',
          message:
            'Los cambios de parcelas, planes y simulaciones de esta sesión demo no se guardarán.',
          confirm: 'Cerrar sesión',
          cancel: 'Continuar aquí',
        },
      })
      .afterClosed()
      .subscribe((confirmed: boolean) => {
        if (confirmed) {
          this.auth.logout();
          void this.router.navigateByUrl('/login');
        }
      });
  }
}
