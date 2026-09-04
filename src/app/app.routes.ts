import { Routes } from '@angular/router';
import { authGuard, guestGuard } from './core/guards/auth.guard';

export const routes: Routes = [
  {
    path: 'login',
    title: 'Iniciar sesión · AgroPredict',
    canActivate: [guestGuard],
    loadComponent: () => import('./features/auth/login').then((m) => m.Login),
  },
  {
    path: '',
    canActivate: [authGuard],
    canActivateChild: [authGuard],
    loadComponent: () => import('./layout/app-layout').then((m) => m.AppLayout),
    children: [
      { path: '', pathMatch: 'full', redirectTo: 'dashboard' },
      {
        path: 'dashboard',
        title: 'Dashboard · AgroPredict',
        loadComponent: () => import('./features/dashboard/dashboard').then((m) => m.Dashboard),
      },
      {
        path: 'planificacion',
        title: 'Planificación · AgroPredict',
        loadComponent: () => import('./features/planning/planning').then((m) => m.Planning),
      },
      {
        path: 'predicciones',
        title: 'Predicciones · AgroPredict',
        loadComponent: () =>
          import('./features/predictions/predictions').then((m) => m.Predictions),
      },
      {
        path: 'parcelas',
        title: 'Parcelas · AgroPredict',
        loadComponent: () => import('./features/plots/plots').then((m) => m.Plots),
      },
      {
        path: 'cultivos',
        title: 'Cultivos · AgroPredict',
        loadComponent: () => import('./features/crops/crops').then((m) => m.Crops),
      },
      {
        path: 'clima',
        title: 'Clima · AgroPredict',
        loadComponent: () => import('./features/weather/weather').then((m) => m.Weather),
      },
      {
        path: 'sensores',
        title: 'Sensores IoT · AgroPredict',
        loadComponent: () => import('./features/sensors/sensors').then((m) => m.Sensors),
      },
      {
        path: 'historial',
        title: 'Historial · AgroPredict',
        loadComponent: () => import('./features/history/history').then((m) => m.History),
      },
      {
        path: 'reportes',
        title: 'Reportes · AgroPredict',
        loadComponent: () => import('./features/reports/reports').then((m) => m.Reports),
      },
      {
        path: 'configuracion',
        title: 'Configuración · AgroPredict',
        loadComponent: () => import('./features/settings/settings').then((m) => m.Settings),
      },
      {
        path: 'perfil',
        title: 'Mi perfil · AgroPredict',
        loadComponent: () => import('./features/profile/profile').then((m) => m.Profile),
      },
      {
        path: '**',
        title: 'Página no encontrada · AgroPredict',
        loadComponent: () => import('./features/not-found/not-found').then((m) => m.NotFound),
      },
    ],
  },
];
