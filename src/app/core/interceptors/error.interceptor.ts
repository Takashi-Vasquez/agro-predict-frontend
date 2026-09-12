import { DOCUMENT } from '@angular/common';
import { HttpErrorResponse, HttpInterceptorFn } from '@angular/common/http';
import { inject } from '@angular/core';
import { catchError, throwError } from 'rxjs';
import { NotificationService } from '../services/notification.service';
import { isApiRequest, isLoginRequest } from './api-request';

export const errorInterceptor: HttpInterceptorFn = (request, next) => {
  const notificationService = inject(NotificationService);
  const document = inject(DOCUMENT);

  return next(request).pipe(
    catchError((error: unknown) => {
      if (
        isApiRequest(request.url, document.baseURI) &&
        !isLoginRequest(request.url, document.baseURI) &&
        !(error instanceof HttpErrorResponse && error.status === 401)
      ) {
        let message = 'No se pudo completar la solicitud. Inténtalo de nuevo.';

        if (error instanceof HttpErrorResponse && error.status === 0) {
          message = 'No se pudo conectar con el servidor. Revisa tu conexión.';
        } else if (
          error instanceof HttpErrorResponse &&
          error.error &&
          typeof error.error === 'object' &&
          'message' in error.error
        ) {
          message = (error.error as { message: string }).message;
        }

        notificationService.error(message);
      }

      return throwError(() => error);
    }),
  );
};
