import { TestBed } from '@angular/core/testing';
import { HttpClient, provideHttpClient, withInterceptors } from '@angular/common/http';
import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';
import { MatSnackBar } from '@angular/material/snack-bar';
import { apiErrorInterceptor } from './api-error.interceptor';

describe('apiErrorInterceptor', () => {
  const snackbar = { open: vi.fn() };
  beforeEach(() => {
    snackbar.open.mockClear();
    TestBed.configureTestingModule({
      providers: [
        provideHttpClient(withInterceptors([apiErrorInterceptor])),
        provideHttpClientTesting(),
        { provide: MatSnackBar, useValue: snackbar },
      ],
    });
  });
  afterEach(() => TestBed.inject(HttpTestingController).verify());
  it('propaga los errores de la API y muestra feedback', () => {
    const error = vi.fn();
    TestBed.inject(HttpClient).get('/api/v1/workspace').subscribe({ error });
    TestBed.inject(HttpTestingController)
      .expectOne('/api/v1/workspace')
      .flush({}, { status: 500, statusText: 'Internal Error' });
    expect(error).toHaveBeenCalled();
    expect(snackbar.open).toHaveBeenCalled();
  });
  it('no agrega avisos de API a peticiones ajenas', () => {
    TestBed.inject(HttpClient)
      .get('/assets/missing.json')
      .subscribe({ error: () => undefined });
    TestBed.inject(HttpTestingController)
      .expectOne('/assets/missing.json')
      .flush({}, { status: 404, statusText: 'Not Found' });
    expect(snackbar.open).not.toHaveBeenCalled();
  });
});
