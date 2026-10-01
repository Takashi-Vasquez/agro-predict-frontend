import { Signal } from '@angular/core';
import { rxResource } from '@angular/core/rxjs-interop';
import { EMPTY, Observable } from 'rxjs';

// Sin params reactivos
export function toResource<T>(streamFn: () => Observable<T>) {
  return rxResource<T, void>({ stream: streamFn });
}

// Con params reactivos
export function toResourceWithParams<T, P>(
  params: Signal<P | undefined>,
  streamFn: (params: P) => Observable<T>,
) {
  return rxResource<T, P | undefined>({
    params,
    stream: ({ params: p }) => (p !== undefined ? streamFn(p) : EMPTY),
  });
}
