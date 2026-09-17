import { Routes } from '@angular/router';
import { authGuard, guestGuard } from './core/guards/auth.guard';
import { AuthLayoutComponent } from './shared/layout/auth-layout/auth-layout.component';
import { BlankLayoutComponent } from './shared/layout/blank-layout/blank-layout.component';
import { AppLayoutComponent } from './shared/layout/layout-sidebar/app-layout';

export const routes: Routes = [
  {
    path: '',
    component: AuthLayoutComponent,
    canActivate: [guestGuard],
    children: [
      {
        path: 'auth',
        loadChildren: () =>
          import('./core/auth/authentication.routes').then((m) => m.AuthenticationRoutes),
      },
    ],
  },
  {
    path: '',
    component: AppLayoutComponent,
    canActivate: [authGuard],
    canActivateChild: [authGuard],
    children: [
      {
        path: 'perfil',
        title: 'Mi perfil · AgroPredict',
        loadComponent: () =>
          import('./features/security/profile/profile').then((m) => m.ProfileComponent),
      },
      {
        path: 'panel-general',
        loadChildren: () =>
          import('./features/general-panel/general-panel.routes').then((m) => m.GeneralPanelRoutes),
      },
      {
        path: 'operaciones',
        loadChildren: () =>
          import('./features/operations/operations.routes').then((m) => m.OperationsRoutes),
      },
      {
        path: 'monitoreo',
        loadChildren: () =>
          import('./features/monitoring/monitoring.routes').then((m) => m.MonitoringRoutes),
      },
      {
        path: 'seguridad',
        loadChildren: () =>
          import('./features/security/security.routes').then((m) => m.SecurityRoutes),
      },
    ],
  },
  {
    path: '',
    component: BlankLayoutComponent,
    children: [
      {
        path: 'others',
        loadChildren: () => import('./core/others/others.routes').then((m) => m.OtherRoutes),
      },
    ],
  },
  {
    path: '**',
    redirectTo: 'others/404',
  },
];
