import { DOCUMENT } from '@angular/common';
import { HttpEvent, HttpInterceptorFn, HttpResponse } from '@angular/common/http';
import { inject } from '@angular/core';
import { tap } from 'rxjs/operators';
import { ApiResponse } from '../models/api-response.model';
import { NotificationService } from '../services/notification.service';
import { isApiRequest, isLoginRequest } from './api-request';

const SUPPRESS_HEADER = 'X-Suppress-Success';

export const successInterceptor: HttpInterceptorFn = (request, next) => {
  const notificationService = inject(NotificationService);
  const document = inject(DOCUMENT);

  if (
    !isApiRequest(request.url, document.baseURI) ||
    isLoginRequest(request.url, document.baseURI) ||
    request.method === 'GET' ||
    request.headers.has(SUPPRESS_HEADER)
  ) {
    return next(request);
  }

  const cleanReq = request.clone({ headers: request.headers.delete(SUPPRESS_HEADER) });

  return next(cleanReq).pipe(
    tap((event: HttpEvent<unknown>) => {
      if (event instanceof HttpResponse) {
        if (event.status === 204) {
          notificationService.success('Eliminado correctamente');
          return;
        }

        const body = event.body as ApiResponse<unknown> | null;
        if (!body) return;

        if (body.statusCode >= 200 && body.statusCode < 300) {
          if (body.message) notificationService.success(body.message);
        } else if (body.statusCode >= 400) {
          notificationService.error(body.message || 'Ocurrió un error');
        }
      }
    }),
  );
};
