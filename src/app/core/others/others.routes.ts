import { Routes } from '@angular/router';
import { NotFoundComponent } from './not-found/not-found.component';
import { UnauthorizedComponent } from './unauthorized/unauthorized.component';


export const OtherRoutes: Routes = [
  {
    path: '',
    title: 'Página no encontrada · AgroPredict',
    children: [
      {
        path: '404',
        component: NotFoundComponent
      },
      {
        path: '403',
        component: UnauthorizedComponent
      }
    ],
  },
];
