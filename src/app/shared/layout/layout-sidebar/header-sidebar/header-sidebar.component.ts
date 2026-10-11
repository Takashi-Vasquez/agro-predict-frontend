import { A11yModule } from '@angular/cdk/a11y';
import { Component, computed, inject, OnInit, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { MatDialog } from '@angular/material/dialog';
import { MatMenuModule } from '@angular/material/menu';
import { MatTooltipModule } from '@angular/material/tooltip';
import { Router, RouterLink } from '@angular/router';
import { NgIcon, provideIcons, provideNgIconsConfig } from '@ng-icons/core';
import { heroCheckBadgeMicro } from '@ng-icons/heroicons/micro';
import { heroBell, heroMoon, heroSun, heroUser } from '@ng-icons/heroicons/outline';
import { matKeyboardArrowRight, matLogOut } from '@ng-icons/material-icons/baseline';
import { matViewSidebarOutline } from '@ng-icons/material-icons/outline';
import { matMessageRound } from '@ng-icons/material-icons/round';
import { AuthService } from '../../../../core/services/auth.service';
import { ThemeService } from '../../../../core/services/theme.service';
import { AppLayoutComponent } from '../../../../shared/layout/layout-sidebar/app-layout';
import { ConfirmDialog } from '../../../../shared/ui/confirm-dialog/confirm-dialog.component';
// import { ALL_NAV } from './navigation';

@Component({
  selector: 'app-header-sidebar',
  templateUrl: './header-sidebar.component.html',
  styleUrls: ['./header-sidebar.component.scss'],
  imports: [RouterLink, NgIcon, MatTooltipModule, FormsModule, MatMenuModule, A11yModule],
  providers: [
    provideIcons({
      matViewSidebarOutline,
      matKeyboardArrowRight,
      heroSun,
      heroMoon,
      heroBell,
      matMessageRound,
      heroCheckBadgeMicro,
      heroUser,
      matLogOut,
    }),
    provideNgIconsConfig({
      size: '1.3em',
    }),
  ],
})
export class HeaderSidebarComponent implements OnInit {
  readonly authService = inject(AuthService);
  readonly appLayoutComponent = inject(AppLayoutComponent);
  readonly theme = inject(ThemeService);
  private readonly router = inject(Router);
  private readonly dialog = inject(MatDialog);

  readonly collapsed = this.appLayoutComponent.collapsed;
  readonly drawer = this.appLayoutComponent.drawer;
  readonly mobile = this.appLayoutComponent.mobile;
  readonly title = this.appLayoutComponent.title;
  readonly unread = this.appLayoutComponent.unread;

  readonly initials = computed(
    () =>
      this.authService
        .user()
        ?.firstName?.trim()
        .split(/\s+/)
        .slice(0, 2)
        .map((first_name) => first_name[0])
        .join('')
        .toUpperCase() ?? 'AM',
  );

  private readonly brokenLogos = signal<ReadonlySet<string>>(new Set());

  companyLogo(logoPath: string): string {
    return `/icons/companies/${logoPath}`;
  }

  logoBroken(logoPath: string): boolean {
    return this.brokenLogos().has(logoPath);
  }

  onLogoError(logoPath: string): void {
    this.brokenLogos.update((current) => new Set(current).add(logoPath));
  }

  constructor() {}

  ngOnInit() {}

  toggleMenu(): void {
    if (this.mobile()) this.drawer.update((value) => !value);
    else this.collapsed.update((value) => !value);
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
          this.authService.logout();
          void this.router.navigateByUrl('/auth/signin');
        }
      });
  }
}
