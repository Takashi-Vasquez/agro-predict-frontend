import { Routes } from '@angular/router';
import { permissionGuard, permissionMatchGuard } from '../../core/guards/permission.guard';

export const OperationsRoutes: Routes = [
  {
    path: '',
    children: [
      {
        path: 'cultivos',
        title: 'Cultivos · AgroPredict',
        loadComponent: () => import('./crops/pages/crops.component').then((m) => m.CropsComponent),
        canActivate: [permissionGuard],
        canMatch: [permissionMatchGuard],
        data: { menuCode: 'OPERATION.CROPS', permission: 'READ' },
      },
      {
        path: 'planificacion',
        title: 'Planificación · AgroPredict',
        loadComponent: () => import('./planning/planning').then((m) => m.PlanningComponent),
        canActivate: [permissionGuard],
        canMatch: [permissionMatchGuard],
        data: { menuCode: 'OPERATION.PLANNING', permission: 'READ' },
      },
      {
        path: 'parcelas',
        title: 'Parcelas · AgroPredict',
        loadComponent: () => import('./plots/plots').then((m) => m.PlotsComponent),
        canActivate: [permissionGuard],
        canMatch: [permissionMatchGuard],
        data: { menuCode: 'OPERATION.PLOTS', permission: 'READ' },
      },
    ],
  },
];
