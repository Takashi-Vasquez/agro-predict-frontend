import { TestBed } from '@angular/core/testing';
import { provideHttpClient } from '@angular/common/http';
import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';
import { Router, provideRouter } from '@angular/router';
import { AUTH_SESSION_KEY, AuthService } from './auth.service';
import { AuthResponseError } from '../models/auth.models';
import {
  authenticate,
  clearAuthStorage,
  fakeToken,
  TEST_CREDENTIALS,
} from '../../testing/auth-test-helpers';

describe('AuthService: API de autenticación', () => {
  beforeEach(() => {
    clearAuthStorage();
    TestBed.configureTestingModule({
      providers: [provideHttpClient(), provideHttpClientTesting(), provideRouter([])],
    });
  });
  afterEach(() => {
    TestBed.inject(HttpTestingController).verify();
    clearAuthStorage();
    TestBed.resetTestingModule();
    vi.useRealTimers();
  });
  it('inicia sin sesión y no acepta identidades demo antiguas', () => {
    localStorage.setItem(
      'agro.demo-session',
      JSON.stringify({ name: 'Admin demo', email: 'demo@example.com' }),
    );
    const auth = TestBed.inject(AuthService);
    expect(auth.user()).toBeNull();
    expect(auth.isAuthenticated()).toBe(false);
    expect(localStorage.getItem('agro.demo-session')).toBeNull();
  });
  it('crea una sesión demo temporal sin token ni solicitud al backend', () => {
    const auth = TestBed.inject(AuthService);
    auth.startDemo();
    expect(auth.isAuthenticated()).toBe(true);
    expect(auth.isDemo()).toBe(true);
    expect(auth.getAccessToken()).toBeNull();
    expect(auth.user()?.role).toBe('Explorador de negocio');
    expect(sessionStorage.getItem(AUTH_SESSION_KEY)).toContain('"mode":"demo"');
    expect(localStorage.getItem(AUTH_SESSION_KEY)).toBeNull();
    TestBed.inject(HttpTestingController).expectNone('/api/v1/auth/login');
  });
  it('envía solo email/password, conserva exactamente la contraseña y guarda el token temporal', () => {
    const auth = TestBed.inject(AuthService);
    auth.login({ email: ' user@example.com ', password: ' test password ' }, false).subscribe();
    const request = TestBed.inject(HttpTestingController).expectOne('/api/v1/auth/login');
    expect(request.request.method).toBe('POST');
    expect(request.request.body).toEqual({
      email: 'user@example.com',
      password: ' test password ',
    });
    const token = fakeToken();
    request.flush({ access_token: token, token_type: 'bearer' });
    expect(auth.getAccessToken()).toBe(token);
    expect(auth.user()?.role).toBe('No informado');
    expect(localStorage.getItem(AUTH_SESSION_KEY)).toBeNull();
    expect(sessionStorage.getItem(AUTH_SESSION_KEY)).not.toContain('password');
  });
  it('recuerda el token solo al marcar Recordarme y limpia ambos almacenes al salir', () => {
    const token = authenticate(true);
    expect(localStorage.getItem(AUTH_SESSION_KEY)).toContain(token);
    expect(sessionStorage.getItem(AUTH_SESSION_KEY)).toBeNull();
    TestBed.inject(AuthService).logout();
    expect(TestBed.inject(AuthService).user()).toBeNull();
    expect(localStorage.getItem(AUTH_SESSION_KEY)).toBeNull();
    expect(sessionStorage.getItem(AUTH_SESSION_KEY)).toBeNull();
  });
  it('restaura una sesión vigente y deriva exp del token, no de un valor almacenado', () => {
    const token = fakeToken();
    sessionStorage.setItem(
      AUTH_SESSION_KEY,
      JSON.stringify({
        accessToken: token,
        expiresAt: 1,
        user: { name: 'Nombre local', email: 'user@example.com', role: 'Administrador' },
      }),
    );
    const auth = TestBed.inject(AuthService);
    expect(auth.isAuthenticated()).toBe(true);
    expect(auth.getAccessToken()).toBe(token);
    expect(auth.user()?.role).toBe('No informado');
  });
  it.each([
    '{broken',
    JSON.stringify({ accessToken: 'invalid', user: {} }),
    JSON.stringify({
      accessToken: fakeToken(Date.now() - 60_000),
      user: { name: 'User', email: 'user@example.com' },
    }),
  ])('descarta datos corruptos o vencidos', (raw) => {
    localStorage.setItem(AUTH_SESSION_KEY, raw);
    expect(TestBed.inject(AuthService).isAuthenticated()).toBe(false);
    expect(localStorage.getItem(AUTH_SESSION_KEY)).toBeNull();
  });
  it.each([
    { access_token: '', token_type: 'bearer' },
    { access_token: fakeToken(), token_type: 'basic' },
    { token_type: 'bearer' },
    { access_token: 'not-a-jwt', token_type: 'bearer' },
    { access_token: fakeToken(Date.now() - 60_000), token_type: 'bearer' },
  ])('rechaza una respuesta inválida sin crear sesión', (response) => {
    const auth = TestBed.inject(AuthService);
    const error = vi.fn();
    auth.login(TEST_CREDENTIALS).subscribe({ error });
    TestBed.inject(HttpTestingController).expectOne('/api/v1/auth/login').flush(response);
    expect(error.mock.calls[0][0]).toBeInstanceOf(AuthResponseError);
    expect(auth.isAuthenticated()).toBe(false);
  });
  it('un 401 de login no almacena ningún token', () => {
    const auth = TestBed.inject(AuthService);
    auth.login(TEST_CREDENTIALS).subscribe({ error: () => undefined });
    TestBed.inject(HttpTestingController)
      .expectOne('/api/v1/auth/login')
      .flush({}, { status: 401, statusText: 'Unauthorized' });
    expect(auth.isAuthenticated()).toBe(false);
    expect(sessionStorage.getItem(AUTH_SESSION_KEY)).toBeNull();
  });
  it('expira la sesión y redirige automáticamente sin inventar refresh tokens', () => {
    vi.useFakeTimers();
    const navigate = vi.spyOn(TestBed.inject(Router), 'navigate').mockResolvedValue(true);
    authenticate(false, fakeToken(Date.now() + 10_000));
    vi.advanceTimersByTime(10_001);
    expect(TestBed.inject(AuthService).user()).toBeNull();
    expect(navigate).toHaveBeenCalledWith(['/login'], {
      queryParams: { reason: 'expired', returnUrl: '/' },
    });
  });
  it('el guard detecta una sesión vencida aunque el temporizador todavía no se haya ejecutado', () => {
    vi.useFakeTimers();
    authenticate(false, fakeToken(Date.now() + 60_000));
    vi.setSystemTime(Date.now() + 120_000);
    expect(TestBed.inject(AuthService).isAuthenticated()).toBe(false);
  });
  it('permite nombre/foto locales sin persistir fotos ni cambiar el email de acceso', () => {
    authenticate(true);
    const auth = TestBed.inject(AuthService);
    auth.updateProfile({ name: 'Ana Pérez', avatar: 'data:image/png;base64,test' });
    expect(auth.user()?.name).toBe('Ana Pérez');
    expect(auth.user()?.email).toBe(TEST_CREDENTIALS.email);
    expect(localStorage.getItem(AUTH_SESSION_KEY)).not.toContain('base64');
  });
});
