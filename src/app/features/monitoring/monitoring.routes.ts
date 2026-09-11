import { Routes } from '@angular/router';
import { permissionGuard, permissionMatchGuard } from '../../core/guards/permission.guard';

export const MonitoringRoutes: Routes = [
  {
    path: '',
    children: [
      {
        path: 'clima',
        title: 'Clima · AgroPredict',
        loadComponent: () => import('../monitoring/weather/weather').then((m) => m.Weather),
        canActivate: [permissionGuard],
        canMatch: [permissionMatchGuard],
        data: { menuCode: 'MONITORING.WEATHER', permission: 'READ' },
      },
      {
        path: 'sensores',
        title: 'Sensores IoT · AgroPredict',
        loadComponent: () => import('../monitoring/sensors/sensors').then((m) => m.Sensors),
        canActivate: [permissionGuard],
        canMatch: [permissionMatchGuard],
        data: { menuCode: 'MONITORING.SENSORS', permission: 'READ' },
      },
      {
        path: 'historial',
        title: 'Historial · AgroPredict',
        loadComponent: () => import('../monitoring/history/history').then((m) => m.History),
        canActivate: [permissionGuard],
        canMatch: [permissionMatchGuard],
        data: { menuCode: 'MONITORING.HISTORY', permission: 'READ' },
      },
      {
        path: 'reportes',
        title: 'Reportes · AgroPredict',
        loadComponent: () => import('../monitoring/reports/reports').then((m) => m.Reports),
        canActivate: [permissionGuard],
        canMatch: [permissionMatchGuard],
        data: { menuCode: 'MONITORING.REPORTS', permission: 'READ' },
      },
    ],
  },
];
