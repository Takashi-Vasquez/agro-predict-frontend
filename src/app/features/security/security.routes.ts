import { Routes } from '@angular/router';
import { permissionGuard, permissionMatchGuard } from '../../core/guards/permission.guard';

export const SecurityRoutes: Routes = [
  {
    path: '',
    children: [
      {
        path: 'roles',
        title: 'Roles · AgroPredict',
        loadComponent: () => import('./roles/pages/roles.component').then((m) => m.RolesComponent),
        canActivate: [permissionGuard],
        canMatch: [permissionMatchGuard],
        data: { menuCode: 'SECURITY.ROLES', permission: 'READ' },
      },
    ],
  },
];
