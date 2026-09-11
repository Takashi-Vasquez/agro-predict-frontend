import { A11yModule } from '@angular/cdk/a11y';
import { Component, computed, inject, OnInit } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { MatDialog } from '@angular/material/dialog';
import { MatMenuModule } from '@angular/material/menu';
import { MatTooltipModule } from '@angular/material/tooltip';
import { Router, RouterLink } from '@angular/router';
import { AuthService } from '../../../core/services/auth.service';
import { ThemeService } from '../../../core/services/theme.service';
import { ConfirmDialog } from '../../../shared/ui/confirm-dialog';
import { Icon } from '../../../shared/ui/icon';
import { AppLayoutComponent } from '../app-layout';
// import { ALL_NAV } from './navigation';

@Component({
  selector: 'app-header-sidebar',
  templateUrl: './header-sidebar.component.html',
  styleUrls: ['./header-sidebar.component.scss'],
  imports: [
    RouterLink,
    Icon,
    MatTooltipModule,
    FormsModule,
    MatMenuModule,
    A11yModule
  ]
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

  constructor(
  ) {

  }

  ngOnInit() {

  }

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
