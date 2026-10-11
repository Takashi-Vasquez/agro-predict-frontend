import { Routes } from '@angular/router';
import { permissionGuard, permissionMatchGuard } from '../../core/guards/permission.guard';

export const SecurityRoutes: Routes = [
  {
    path: '',
    children: [
      {
        path: 'perfil-acceso',
        title: 'Perfiles de Acceso · AgroPredict',
        loadComponent: () =>
          import('./access-profile/pages/access-profile.component').then(
            (m) => m.AccessProfileComponent,
          ),
        canActivate: [permissionGuard],
        canMatch: [permissionMatchGuard],
        data: { menuCode: 'SECURITY.ACCESS_PROFILE', permission: 'READ' },
      },
      {
        path: 'perfil-acceso/nuevo',
        title: 'Perfiles de Acceso · AgroPredict',
        loadComponent: () =>
          import('./access-profile/pages/access-editor-view/access-editor-view.component').then(
            (m) => m.AccesProfileEditorViewComponent,
          ),
        canActivate: [permissionGuard],
        canMatch: [permissionMatchGuard],
        data: { menuCode: 'SECURITY.ACCESS_PROFILE', permission: 'READ' },
      },
      {
        path: 'perfil-acceso/:id/edit',
        title: 'Perfiles de Acceso · AgroPredict',
        loadComponent: () =>
          import('./access-profile/pages/access-editor-view/access-editor-view.component').then(
            (m) => m.AccesProfileEditorViewComponent,
          ),
        canActivate: [permissionGuard],
        canMatch: [permissionMatchGuard],
        data: { menuCode: 'SECURITY.ACCESS_PROFILE', permission: 'READ' },
      },
      {
        path: 'usuarios',
        title: 'Usuarios · AgroPredict',
        loadComponent: () => import('./users/pages/users.component').then((m) => m.UsersComponent),
        canActivate: [permissionGuard],
        canMatch: [permissionMatchGuard],
        data: { menuCode: 'SECURITY.USER', permission: 'READ' },
      },
      {
        path: 'usuarios/nuevo',
        title: 'Usuarios · AgroPredict',
        loadComponent: () =>
          import('./users/pages/user-editor-view/user-editor-view.component').then(
            (m) => m.UserEditorViewComponent,
          ),
        canActivate: [permissionGuard],
        canMatch: [permissionMatchGuard],
        data: { menuCode: 'SECURITY.USER', permission: 'READ' },
      },
      {
        path: 'usuarios/:id/edit',
        title: 'Usuarios · AgroPredict',
        loadComponent: () =>
          import('./users/pages/user-editor-view/user-editor-view.component').then(
            (m) => m.UserEditorViewComponent,
          ),
        canActivate: [permissionGuard],
        canMatch: [permissionMatchGuard],
        data: { menuCode: 'SECURITY.USER', permission: 'READ' },
      },
    ],
  },
];
