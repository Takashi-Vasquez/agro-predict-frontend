import { Routes } from '@angular/router';
import { permissionGuard, permissionMatchGuard } from '../../core/guards/permission.guard';

export const SecurityRoutes: Routes = [
  {
    path: '',
    children: [
      {
        path: 'configuracion',
        title: 'Configuración · AgroPredict',
        loadComponent: () => import('./settings/settings').then((m) => m.SettingsComponent),
        canActivate: [permissionGuard],
        canMatch: [permissionMatchGuard],
        data: { menuCode: 'SECURITY.SETTINGS', permission: 'READ' },
      },
      {
        path: 'perfil',
        title: 'Mi perfil · AgroPredict',
        loadComponent: () => import('./profile/profile').then((m) => m.ProfileComponent),
        canActivate: [permissionGuard],
        canMatch: [permissionMatchGuard],
        data: { menuCode: 'SECURITY.PROFILE', permission: 'READ' },
      },
    ],
  },
];
