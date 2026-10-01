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
        path: 'campanas',
        title: 'Campaña · AgroPredict',
        loadComponent: () =>
          import('./campaign/pages/campaign.component').then((m) => m.CampaignComponent),
        canActivate: [permissionGuard],
        canMatch: [permissionMatchGuard],
        data: { menuCode: 'GENERAL_PANEL.CAMPAIGNS', permission: 'READ' },
      },
      {
        path: 'predicciones',
        title: 'Predicciones · AgroPredict',
        loadComponent: () =>
          import('./predictions/pages/prediction.component').then((m) => m.PredictionsComponent),
        canActivate: [permissionGuard],
        canMatch: [permissionMatchGuard],
        data: { menuCode: 'GENERAL_PANEL.PREDICTIONS', permission: 'READ' },
      },
      {
        path: 'predicciones/historial',
        title: 'Historial de predicciones · AgroPredict',
        loadComponent: () =>
          import('./predictions/pages/prediction-history/prediction-history.component').then(
            (m) => m.PredictionsHistoryComponent,
          ),
        canActivate: [permissionGuard],
        canMatch: [permissionMatchGuard],
        data: { menuCode: 'GENERAL_PANEL.PREDICTIONS', permission: 'READ' },
      },
      {
        path: 'datos-historicos',
        title: 'Registrar dato histórico · AgroPredict',
        loadComponent: () =>
          import('./training-records/pages/training-records.component').then(
            (m) => m.TrainingRecordsComponent,
          ),
        canActivate: [permissionGuard],
        canMatch: [permissionMatchGuard],
        data: { menuCode: 'GENERAL_PANEL.TRAINING_RECORDS', permission: 'READ' },
      },
      {
        path: 'datos-historicos/historial',
        title: 'Historial de datos · AgroPredict',
        loadComponent: () =>
          import('./training-records/pages/records-history/records-history.component').then(
            (m) => m.RecordsHistoryComponent,
          ),
        canActivate: [permissionGuard],
        canMatch: [permissionMatchGuard],
        data: { menuCode: 'GENERAL_PANEL.TRAINING_RECORDS', permission: 'READ' },
      },
    ],
  },
];
