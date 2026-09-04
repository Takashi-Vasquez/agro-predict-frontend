import { TestBed } from '@angular/core/testing';
import { provideRouter, Router } from '@angular/router';
import { provideHttpClient } from '@angular/common/http';
import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';
import { RouterTestingHarness } from '@angular/router/testing';
import { of } from 'rxjs';
import { BreakpointObserver } from '@angular/cdk/layout';
import { routes } from './app.routes';
import { ALL_NAV } from './layout/navigation';
import { AgroRepository, MockAgroRepository } from './core/services/agro.repository';
import { MOCK_WORKSPACE } from './core/data/mock-data';
import { Login } from './features/auth/login';
import { AuthService } from './core/services/auth.service';
import {
  authenticate,
  clearAuthStorage,
  fakeToken,
  TEST_CREDENTIALS,
} from './testing/auth-test-helpers';

describe('Rutas y pantallas standalone con login conectado', () => {
  beforeEach(() => {
    clearAuthStorage();
    TestBed.configureTestingModule({
      providers: [
        provideRouter(routes),
        provideHttpClient(),
        provideHttpClientTesting(),
        {
          provide: MockAgroRepository,
          useValue: { loadWorkspace: () => of(structuredClone(MOCK_WORKSPACE)) },
        },
        {
          provide: BreakpointObserver,
          useValue: { observe: () => of({ matches: false, breakpoints: {} }) },
        },
      ],
    });
    TestBed.overrideProvider(AgroRepository, {
      useValue: { loadWorkspace: () => of(structuredClone(MOCK_WORKSPACE)) },
    });
  });
  afterEach(() => {
    TestBed.inject(HttpTestingController).verify();
    clearAuthStorage();
  });
  it('protege rutas privadas y conserva la ruta de regreso', async () => {
    const harness = await RouterTestingHarness.create();
    await harness.navigateByUrl('/parcelas', Login);
    expect(TestBed.inject(Router).url).toBe('/login?returnUrl=%2Fparcelas');
  });
  it('valida el login, alterna contraseña y navega solo después de una respuesta válida', async () => {
    const harness = await RouterTestingHarness.create();
    const page = await harness.navigateByUrl('/login?returnUrl=%2Fparcelas', Login);
    page.submit();
    harness.detectChanges();
    expect(page.form.invalid).toBe(true);
    expect(harness.routeNativeElement?.textContent).toContain('correo electrónico es obligatorio');
    page.showPassword.set(true);
    harness.detectChanges();
    expect(harness.routeNativeElement?.querySelector('#password')?.getAttribute('type')).toBe(
      'text',
    );
    expect(harness.routeNativeElement?.textContent).toContain('Explorar con datos demo');
    page.form.patchValue(TEST_CREDENTIALS);
    page.submit();
    expect(TestBed.inject(Router).url).toContain('/login');
    TestBed.inject(HttpTestingController)
      .expectOne('/api/v1/auth/login')
      .flush({ access_token: fakeToken(), token_type: 'bearer' });
    await harness.fixture.whenStable();
    expect(TestBed.inject(Router).url).toBe('/parcelas');
    expect(page.form.controls.password.value).toBe('');
  });
  it('abre el dashboard con una sesión demo local y sin llamar al login', async () => {
    const harness = await RouterTestingHarness.create();
    const page = await harness.navigateByUrl('/login', Login);
    page.startDemo();
    await harness.fixture.whenStable();
    expect(TestBed.inject(Router).url).toBe('/dashboard');
    expect(TestBed.inject(AuthService).isDemo()).toBe(true);
    TestBed.inject(HttpTestingController).expectNone('/api/v1/auth/login');
  });
  it('renderiza todas las opciones del menú con sesión autenticada y datos mock', async () => {
    authenticate();
    const harness = await RouterTestingHarness.create();
    for (const item of ALL_NAV) {
      await harness.navigateByUrl(item.path);
      await harness.fixture.whenStable();
      harness.detectChanges();
      expect(TestBed.inject(Router).url).toBe(item.path);
      await vi.waitFor(() => {
        harness.detectChanges();
        expect(harness.routeNativeElement?.querySelector('main h1'), item.path).toBeTruthy();
      });
    }
  });
  it('redirige usuarios autenticados de login al dashboard y muestra 404', async () => {
    authenticate();
    const harness = await RouterTestingHarness.create();
    await harness.navigateByUrl('/login');
    expect(TestBed.inject(Router).url).toBe('/dashboard');
    await harness.navigateByUrl('/ruta-inexistente');
    await harness.fixture.whenStable();
    await vi.waitFor(() => {
      harness.detectChanges();
      expect(harness.routeNativeElement?.textContent).toContain('Esta ruta no lleva a una parcela');
    });
  });
});
