import { Routes } from '@angular/router';

// import { ForgotComponent } from './forgot/forgot.component';
import { SigninComponent } from './signin/signin.component';
// import { SignupComponent } from './signup/signup.component';

export const AuthenticationRoutes: Routes = [
  {
    path: '',
    children: [
      // {
      //   path: 'signup',
      //   component: SignupComponent
      // },
      {
        title: 'Iniciar sesión · AgroPredict',
        path: 'signin',
        component: SigninComponent
      },
      // {
      //   path: 'forgot',
      //   component: ForgotComponent
      // }
    ],
  },
];
