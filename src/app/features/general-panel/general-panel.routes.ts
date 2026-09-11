import { Routes } from '@angular/router';
import { permissionGuard, permissionMatchGuard } from '../../core/guards/permission.guard';

export const GeneralPanelRoutes: Routes = [
  {
    path: '',
    children: [
      { path: '', pathMatch: 'full', redirectTo: 'dashboard' },
      {
        path: 'dashboard',
        title: 'Dashboard · AgroPredict',
        loadComponent: () => import('./dashboard/dashboard').then((m) => m.DashboardComponent),
        canActivate: [permissionGuard],
        canMatch: [permissionMatchGuard],
        data: { menuCode: 'GENERAL_PANEL.DASHBOARD', permission: 'READ' },
      },
      {
        path: 'predicciones',
        title: 'Predicciones · AgroPredict',
        loadComponent: () => import('./predictions/predictions').then((m) => m.PredictionsComponent),
        canActivate: [permissionGuard],
        canMatch: [permissionMatchGuard],
        data: { menuCode: 'GENERAL_PANEL.PREDICTIONS', permission: 'READ' },
      },
    ],
  },
];
