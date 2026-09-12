import { HttpClient, HttpErrorResponse } from '@angular/common/http';
import { Injectable, inject } from '@angular/core';
import { Observable, TimeoutError, throwError } from 'rxjs';
import { catchError, map } from 'rxjs/operators';
import { environment } from '../../../environments/environment';
import { ApiResponse } from '../models/api-response.model';
import { AppError } from '../models/api-error.model';

@Injectable({ providedIn: 'root' })
export class ApiService {
  private readonly http = inject(HttpClient);
  private readonly base = environment.apiUrl;

  get<T>(path: string, opts?: { silent?: boolean }): Observable<T> {
    return this.request<T>('get', path, undefined, opts);
  }

  post<T>(path: string, body: unknown, opts?: { silent?: boolean }): Observable<T> {
    return this.request<T>('post', path, body, opts);
  }

  put<T>(path: string, body: unknown, opts?: { silent?: boolean }): Observable<T> {
    return this.request<T>('put', path, body, opts);
  }

  delete<T>(path: string, opts?: { silent?: boolean }): Observable<T> {
    return this.request<T>('delete', path, undefined, opts);
  }

  private request<T>(
    method: 'get' | 'post' | 'put' | 'delete',
    path: string,
    body?: unknown,
    opts?: { silent?: boolean },
  ): Observable<T> {
    const url = `${this.base}/${path}`;
    const headers = opts?.silent ? { 'X-Suppress-Success': 'true' } : undefined;

    let request$: Observable<ApiResponse<T> | void>;
    switch (method) {
      case 'get':
        request$ = this.http.get<ApiResponse<T>>(url, { headers });
        break;
      case 'post':
        request$ = this.http.post<ApiResponse<T>>(url, body, { headers });
        break;
      case 'put':
        request$ = this.http.put<ApiResponse<T>>(url, body, { headers });
        break;
      case 'delete':
        request$ = this.http.delete<void>(url, { headers });
        break;
    }

    return request$.pipe(
      map((res) => {
        if (!res) return undefined as T;
        if (res.statusCode < 200 || res.statusCode >= 300) {
          throw new HttpErrorResponse({
            status: res.statusCode,
            error: res,
            statusText: res.message,
          });
        }
        return res.data;
      }),
      catchError((err) => throwError(() => this.toAppError(err))),
    );
  }

  private toAppError(err: unknown): AppError {
    if (err instanceof TimeoutError) {
      return { kind: 'timeout', message: 'La solicitud tardó demasiado' };
    }
    if (!(err instanceof HttpErrorResponse)) {
      return { kind: 'unknown', message: 'Ocurrió un error inesperado', raw: err };
    }
    if (err.status === 0) {
      return { kind: 'network', message: 'No se pudo conectar con el servidor' };
    }
    const body = err.error as Partial<ApiResponse<unknown>> | null;
    const msg = body?.message;
    switch (err.status) {
      case 401:
        return { kind: 'unauthorized', message: msg ?? 'Sesión inválida o expirada' };
      case 403:
        return { kind: 'forbidden', message: msg ?? 'No tienes permiso para esta acción' };
      case 404:
        return { kind: 'not-found', message: msg ?? 'Recurso no encontrado' };
      case 409:
        return { kind: 'conflict', message: msg ?? 'Conflicto con recurso existente' };
      case 400:
      case 422:
        return {
          kind: 'validation',
          message: msg ?? 'Datos inválidos',
          fields: (body?.data as Record<string, string[]>) ?? undefined,
        };
      default:
        return err.status >= 500
          ? { kind: 'server', message: msg ?? 'Error interno del servidor', status: err.status }
          : { kind: 'unknown', message: msg ?? 'Error desconocido', raw: err };
    }
  }
}
