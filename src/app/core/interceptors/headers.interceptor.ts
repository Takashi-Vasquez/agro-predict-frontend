import { DOCUMENT } from '@angular/common';
import { HttpInterceptorFn } from '@angular/common/http';
import { inject } from '@angular/core';
import { AuthService } from '../services/auth.service';
import { isApiRequest, isLoginRequest } from './api-request';

/**
 * Headers comunes enviados en cada petición autenticada a la API.
 * Para agregar un header nuevo basta con sumarlo aquí.
 */

function commonHeaders(): Record<string, string> {
  const headers: Record<string, string> = {};
  const companyId = inject(AuthService).companyId();
  if (companyId != null) headers['X-Company-Id'] = String(companyId);
  return headers;
}

export const headersInterceptor: HttpInterceptorFn = (request, next) => {
  const document = inject(DOCUMENT);
  // Never send session headers to assets, other origins or the public login endpoint.
  if (!isApiRequest(request.url, document.baseURI) || isLoginRequest(request.url, document.baseURI))
    return next(request);
  const headers = commonHeaders();
  if (Object.keys(headers).length === 0) return next(request);
  return next(request.clone({ setHeaders: headers }));
};
