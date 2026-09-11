import { A11yModule } from '@angular/cdk/a11y';
import { UpperCasePipe } from '@angular/common';
import { Component, computed, inject, OnInit } from '@angular/core';
import { MatMenuModule } from '@angular/material/menu';
import { MatTooltipModule } from '@angular/material/tooltip';
import { RouterLinkActive, RouterModule } from '@angular/router';
import { AuthService } from '../../../core/services/auth.service';
import { MenuService } from '../../../core/services/menu.service';
import { Icon } from '../../../shared/ui/icon';
import { AppLayoutComponent } from '../app-layout';


@Component({
  selector: 'app-sidebar',
  templateUrl: './sidebar.component.html',
  styleUrls: ['./sidebar.component.scss'],
  imports: [
    RouterModule,
    RouterLinkActive,
    MatMenuModule,
    MatTooltipModule,
    Icon,
    A11yModule,
    UpperCasePipe
  ]
})
export class SidebarComponent implements OnInit {

  readonly authService = inject(AuthService);
  readonly menuService = inject(MenuService);
  readonly appLayoutComponent = inject(AppLayoutComponent);

  readonly collapsed = this.appLayoutComponent.collapsed;
  readonly drawer = this.appLayoutComponent.drawer;
  readonly mobile = this.appLayoutComponent.mobile;

  // menu: MenuItem[] = [];
  readonly menu = computed(() => this.menuService.menuTree() ?? []);

  constructor(
  ) {

  }

  ngOnInit() {
  }

}
