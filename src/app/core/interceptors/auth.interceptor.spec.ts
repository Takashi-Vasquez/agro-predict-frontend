import { TestBed } from '@angular/core/testing';
import { DOCUMENT } from '@angular/common';
import { HttpClient, provideHttpClient, withInterceptors } from '@angular/common/http';
import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';
import { Router, provideRouter } from '@angular/router';
import { authInterceptor } from './auth.interceptor';
import { AuthService } from '../services/auth.service';
import {
  authenticate,
  clearAuthStorage,
  fakeToken,
  TEST_CREDENTIALS,
} from '../../testing/auth-test-helpers';

describe('authInterceptor', () => {
  beforeEach(() => {
    clearAuthStorage();
    TestBed.configureTestingModule({
      providers: [
        provideRouter([]),
        provideHttpClient(withInterceptors([authInterceptor])),
        provideHttpClientTesting(),
      ],
    });
  });
  afterEach(() => {
    TestBed.inject(HttpTestingController).verify();
    clearAuthStorage();
  });
  it('adjunta Authorization Bearer solo a rutas de la API configurada', () => {
    const token = authenticate();
    for (const url of [
      '/api/v1/workspace',
      new URL('/api/v1/plots', TestBed.inject(DOCUMENT).baseURI).href,
    ]) {
      TestBed.inject(HttpClient).get(url).subscribe();
      const request = TestBed.inject(HttpTestingController).expectOne(url);
      expect(request.request.headers.get('Authorization')).toBe('Bearer ' + token);
      request.flush({});
    }
  });
  it.each([
    'https://example.com/api/v1/workspace',
    '/assets/example.json',
    '/api/v1-evil/workspace',
    '//example.com/api/v1/workspace',
  ])('no filtra el token a %s', (url) => {
    authenticate();
    TestBed.inject(HttpClient).get(url).subscribe();
    const request = TestBed.inject(HttpTestingController).expectOne(url);
    expect(request.request.headers.has('Authorization')).toBe(false);
    request.flush({});
  });
  it('no envía un token existente al endpoint público de login', () => {
    authenticate();
    TestBed.inject(AuthService).login(TEST_CREDENTIALS).subscribe();
    const request = TestBed.inject(HttpTestingController).expectOne('/api/v1/auth/login');
    expect(request.request.headers.has('Authorization')).toBe(false);
    request.flush({ access_token: fakeToken(), token_type: 'bearer' });
  });
  it('no inventa ni adjunta un Bearer durante una sesión demo', () => {
    TestBed.inject(AuthService).startDemo();
    TestBed.inject(HttpClient).get('/api/v1/workspace').subscribe();
    const request = TestBed.inject(HttpTestingController).expectOne('/api/v1/workspace');
    expect(request.request.headers.has('Authorization')).toBe(false);
    request.flush({});
  });
  it('un 401 de una petición autenticada limpia sesión y redirige', () => {
    authenticate();
    const navigate = vi.spyOn(TestBed.inject(Router), 'navigate').mockResolvedValue(true);
    TestBed.inject(HttpClient)
      .get('/api/v1/workspace')
      .subscribe({ error: () => undefined });
    TestBed.inject(HttpTestingController)
      .expectOne('/api/v1/workspace')
      .flush({}, { status: 401, statusText: 'Unauthorized' });
    expect(TestBed.inject(AuthService).isAuthenticated()).toBe(false);
    expect(navigate).toHaveBeenCalled();
  });
  it('un 403 no destruye una sesión válida', () => {
    authenticate();
    TestBed.inject(HttpClient)
      .get('/api/v1/workspace')
      .subscribe({ error: () => undefined });
    TestBed.inject(HttpTestingController)
      .expectOne('/api/v1/workspace')
      .flush({}, { status: 403, statusText: 'Forbidden' });
    expect(TestBed.inject(AuthService).isAuthenticated()).toBe(true);
  });
  it('una respuesta 401 tardía no invalida un token más reciente', () => {
    authenticate();
    TestBed.inject(HttpClient)
      .get('/api/v1/workspace')
      .subscribe({ error: () => undefined });
    const old = TestBed.inject(HttpTestingController).expectOne('/api/v1/workspace');
    const newToken = authenticate(false, fakeToken(Date.now() + 7_200_000, 'new-session'));
    old.flush({}, { status: 401, statusText: 'Unauthorized' });
    expect(TestBed.inject(AuthService).getAccessToken()).toBe(newToken);
  });
});
