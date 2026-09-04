import { TestBed } from '@angular/core/testing';
import { provideHttpClient } from '@angular/common/http';
import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';
import { ActivatedRoute, Router, convertToParamMap, provideRouter } from '@angular/router';
import { Login } from './login';
import { AuthService } from '../../core/services/auth.service';
import { clearAuthStorage, fakeToken, TEST_CREDENTIALS } from '../../testing/auth-test-helpers';

describe('Formulario de acceso conectado', () => {
  beforeEach(() => {
    clearAuthStorage();
    TestBed.configureTestingModule({
      providers: [provideRouter([]), provideHttpClient(), provideHttpClientTesting()],
    });
  });
  afterEach(() => {
    TestBed.inject(HttpTestingController).verify({ ignoreCancelled: true });
    clearAuthStorage();
    TestBed.resetTestingModule();
    vi.useRealTimers();
  });
  it.each([
    { email: '', password: '' },
    { email: 'not-email', password: 'password' },
    { email: 'user@example.com', password: '   ' },
    { email: 'a'.repeat(250) + '@example.com', password: 'password' },
  ])('no solicita login con campos inválidos', (values) => {
    const fixture = TestBed.createComponent(Login);
    fixture.detectChanges();
    fixture.componentInstance.form.patchValue(values);
    fixture.componentInstance.submit();
    fixture.detectChanges();
    expect(fixture.componentInstance.form.invalid).toBe(true);
    expect(fixture.componentInstance.pending()).toBe(false);
    TestBed.inject(HttpTestingController).expectNone('/api/v1/auth/login');
    expect(
      (fixture.nativeElement as HTMLElement).querySelector('[aria-invalid="true"]'),
    ).not.toBeNull();
  });
  it('no impone complejidad ni mínimo de registro a una contraseña de acceso', () => {
    const fixture = TestBed.createComponent(Login);
    fixture.componentInstance.form.patchValue({ email: 'user@example.com', password: 'x' });
    expect(fixture.componentInstance.form.valid).toBe(true);
  });
  it('normaliza correo, preserva contraseña, bloquea doble envío y recupera formulario tras error', () => {
    const fixture = TestBed.createComponent(Login);
    fixture.detectChanges();
    const page = fixture.componentInstance;
    page.form.patchValue({ email: ' user@example.com ', password: ' exact password ' });
    page.submit();
    page.submit();
    fixture.detectChanges();
    const request = TestBed.inject(HttpTestingController).expectOne('/api/v1/auth/login');
    expect(request.request.body).toEqual({
      email: 'user@example.com',
      password: ' exact password ',
    });
    expect(page.form.disabled).toBe(true);
    expect(
      (fixture.nativeElement as HTMLElement).querySelector('form')?.getAttribute('aria-busy'),
    ).toBe('true');
    request.flush({}, { status: 401, statusText: 'Unauthorized' });
    expect(page.error()).toContain('incorrectos');
    expect(page.pending()).toBe(false);
    expect(page.form.enabled).toBe(true);
    page.form.controls.password.setValue('another-password');
    expect(page.error()).toBeNull();
  });
  it.each([
    [400, 'incorrectos'],
    [401, 'incorrectos'],
    [403, 'No tienes acceso'],
    [422, 'Revisa los datos'],
    [429, 'Demasiados intentos'],
    [500, 'no está disponible'],
  ])('muestra error HTTP %s sin exponer detalles internos', (status, message) => {
    const fixture = TestBed.createComponent(Login);
    fixture.detectChanges();
    fixture.componentInstance.form.patchValue(TEST_CREDENTIALS);
    fixture.componentInstance.submit();
    TestBed.inject(HttpTestingController)
      .expectOne('/api/v1/auth/login')
      .flush({ detail: 'PRIVATE TRACE' }, { status: status as number, statusText: 'Error' });
    fixture.detectChanges();
    expect(
      (fixture.nativeElement as HTMLElement).querySelector('[role="alert"]')?.textContent,
    ).toContain(message as string);
    expect(fixture.componentInstance.error()).not.toContain('PRIVATE TRACE');
    expect(TestBed.inject(AuthService).isAuthenticated()).toBe(false);
  });
  it('asocia los errores 422 a campos conocidos y permite corregirlos', () => {
    const fixture = TestBed.createComponent(Login);
    fixture.detectChanges();
    const page = fixture.componentInstance;
    page.form.patchValue(TEST_CREDENTIALS);
    page.submit();
    TestBed.inject(HttpTestingController)
      .expectOne('/api/v1/auth/login')
      .flush(
        { detail: [{ loc: ['body', 'email'], msg: 'internal validation' }] },
        { status: 422, statusText: 'Unprocessable Entity' },
      );
    expect(page.form.controls.email.hasError('server')).toBe(true);
    expect(page.form.controls.email.touched).toBe(true);
    page.form.controls.email.setValue('new@example.com');
    expect(page.form.controls.email.valid).toBe(true);
  });
  it('maneja desconexión sin navegar ni dejar el botón bloqueado', () => {
    const fixture = TestBed.createComponent(Login);
    const navigate = vi.spyOn(TestBed.inject(Router), 'navigateByUrl').mockResolvedValue(true);
    fixture.componentInstance.form.patchValue(TEST_CREDENTIALS);
    fixture.componentInstance.submit();
    TestBed.inject(HttpTestingController)
      .expectOne('/api/v1/auth/login')
      .error(new ProgressEvent('error'));
    expect(fixture.componentInstance.error()).toContain('No se pudo conectar');
    expect(fixture.componentInstance.pending()).toBe(false);
    expect(navigate).not.toHaveBeenCalled();
  });
  it('libera el formulario después de 15 segundos sin respuesta', () => {
    vi.useFakeTimers();
    const fixture = TestBed.createComponent(Login);
    fixture.componentInstance.form.patchValue(TEST_CREDENTIALS);
    fixture.componentInstance.submit();
    const request = TestBed.inject(HttpTestingController).expectOne('/api/v1/auth/login');
    vi.advanceTimersByTime(15_001);
    expect(fixture.componentInstance.error()).toContain('tardó demasiado');
    expect(fixture.componentInstance.pending()).toBe(false);
    expect(request.cancelled).toBe(true);
  });
  it('cancela el login si se abandona la pantalla', () => {
    const fixture = TestBed.createComponent(Login);
    fixture.componentInstance.form.patchValue(TEST_CREDENTIALS);
    fixture.componentInstance.submit();
    const request = TestBed.inject(HttpTestingController).expectOne('/api/v1/auth/login');
    fixture.destroy();
    expect(request.cancelled).toBe(true);
    expect(TestBed.inject(AuthService).isAuthenticated()).toBe(false);
  });
  it.each(['https://example.com', '//example.com', '/\\example.com', '/login'])(
    'rechaza returnUrl inseguro %s',
    (returnUrl) => {
      TestBed.overrideProvider(ActivatedRoute, {
        useValue: { snapshot: { queryParamMap: convertToParamMap({ returnUrl }) } },
      });
      const fixture = TestBed.createComponent(Login);
      const navigate = vi.spyOn(TestBed.inject(Router), 'navigateByUrl').mockResolvedValue(true);
      fixture.componentInstance.form.patchValue(TEST_CREDENTIALS);
      fixture.componentInstance.submit();
      TestBed.inject(HttpTestingController)
        .expectOne('/api/v1/auth/login')
        .flush({ access_token: fakeToken(), token_type: 'bearer' });
      expect(navigate).toHaveBeenCalledWith('/dashboard');
      expect(fixture.componentInstance.form.controls.password.value).toBe('');
    },
  );
});
