import { HttpErrorResponse, HttpInterceptorFn } from '@angular/common/http';
import { DOCUMENT } from '@angular/common';
import { inject } from '@angular/core';
import { MatSnackBar } from '@angular/material/snack-bar';
import { catchError, throwError } from 'rxjs';
import { isApiRequest, isLoginRequest } from './api-request';

export const apiErrorInterceptor: HttpInterceptorFn = (request, next) => {
  const snackBar = inject(MatSnackBar);
  const document = inject(DOCUMENT);
  return next(request).pipe(
    catchError((error: unknown) => {
      if (
        isApiRequest(request.url, document.baseURI) &&
        !isLoginRequest(request.url, document.baseURI) &&
        !(error instanceof HttpErrorResponse && error.status === 401)
      ) {
        const message =
          error instanceof HttpErrorResponse && error.status === 0
            ? 'No se pudo conectar con el servidor. Revisa tu conexión.'
            : 'No se pudo completar la solicitud. Inténtalo de nuevo.';
        snackBar.open(message, 'Cerrar', { duration: 6000 });
      }
      return throwError(() => error);
    }),
  );
};
