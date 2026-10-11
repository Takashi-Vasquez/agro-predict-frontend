import { OVERLAY_DEFAULT_CONFIG } from '@angular/cdk/overlay';
import { registerLocaleData } from '@angular/common';
import { provideHttpClient, withInterceptors } from '@angular/common/http';
import localeEs from '@angular/common/locales/es';
import {
  ApplicationConfig,
  LOCALE_ID,
  inject,
  provideAppInitializer,
  provideBrowserGlobalErrorListeners,
} from '@angular/core';
import { provideRouter, withInMemoryScrolling } from '@angular/router';
import { provideNgIconsConfig } from '@ng-icons/core';
import { provideToaster } from 'ngx-herald';
import { catchError, of } from 'rxjs';
import { routes } from './app.routes';
import { AuthService } from './core/services/auth.service';
import { authInterceptor } from './core/interceptors/auth.interceptor';
import { errorInterceptor } from './core/interceptors/error.interceptor';
import { headersInterceptor } from './core/interceptors/headers.interceptor';
import { successInterceptor } from './core/interceptors/success.interceptor';

registerLocaleData(localeEs, 'es-PE');
export const appConfig: ApplicationConfig = {
  providers: [
    provideBrowserGlobalErrorListeners(),
    { provide: LOCALE_ID, useValue: 'es-PE' },
    { provide: OVERLAY_DEFAULT_CONFIG, useValue: { usePopover: false } },
    provideRouter(routes, withInMemoryScrolling({ scrollPositionRestoration: 'top' })),
    provideHttpClient(
      withInterceptors([authInterceptor, headersInterceptor, successInterceptor, errorInterceptor]),
    ),
    provideAppInitializer(() => {
      const auth = inject(AuthService);
      if (!auth.isAuthenticated()) return of(null);
      return auth.getUser().pipe(
        catchError(
          () => of(null), // Red caída: seguimos con datos de storage; 401 lo resuelve el interceptor.
        ),
      );
    }),
    provideToaster({
      position: 'top-right',
      duration: 5000,
      progressBar: true,
      dismissible: true,
      maxToasts: 5,
    }),
    provideNgIconsConfig({
      size: '1.2em',
    }),
  ],
};
