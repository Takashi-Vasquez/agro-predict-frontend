import { DOCUMENT } from '@angular/common';
import { HttpErrorResponse, HttpInterceptorFn } from '@angular/common/http';
import { inject } from '@angular/core';
import { catchError, throwError } from 'rxjs';
import { AuthService } from '../services/auth.service';
import { isApiRequest, isLoginRequest } from './api-request';

export const authInterceptor: HttpInterceptorFn = (request, next) => {
  const document = inject(DOCUMENT);
  // Never send tokens to assets, other origins or the public login endpoint.
  if (!isApiRequest(request.url, document.baseURI) || isLoginRequest(request.url, document.baseURI))
    return next(request);
  const auth = inject(AuthService);
  const token = auth.getAccessToken();
  const authenticatedRequest = token
    ? request.clone({ setHeaders: { Authorization: `Bearer ${token}` } })
    : request;
  return next(authenticatedRequest).pipe(
    catchError((error: unknown) => {
      // A late 401 from an older session must not clear a newer successful login.
      if (
        error instanceof HttpErrorResponse &&
        error.status === 401 &&
        token &&
        token === auth.getAccessToken()
      )
        auth.expireSession();
      return throwError(() => error);
    }),
  );
};
