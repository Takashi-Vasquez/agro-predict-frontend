import { DestroyRef, Injectable, computed, inject, signal } from '@angular/core';
import { Router } from '@angular/router';
import { Observable, map, switchMap, tap, timeout } from 'rxjs';
import {
  AuthResponseError,
  AuthSession,
  AuthUser,
  LoginRequest,
  LoginResponse,
} from '../models/auth.models';
import { ApiService } from './api.service';
import { readStorage, writeStorage } from './browser-storage';
import { jwtExpiresAt } from './jwt';
import { MenuService } from './menu.service';

export const AUTH_SESSION_KEY = 'agro.auth-session';

@Injectable({ providedIn: 'root' })
export class AuthService {
  private readonly api = inject(ApiService);
  private readonly menuService = inject(MenuService);
  private readonly router = inject(Router);
  private readonly _session = signal<AuthSession | null>(null);
  readonly session = this._session.asReadonly();

  private persistent = false;
  private expiryTimer: ReturnType<typeof setTimeout> | undefined;

  readonly user = computed(() => this._session()?.user ?? null);

  constructor() {
    // Remove the obsolete demo identity format; the current demo uses the validated session shape.
    writeStorage('agro.demo-session', null);
    writeStorage('agro.demo-session', null, false);
    this.restore();
    inject(DestroyRef).onDestroy(() => clearTimeout(this.expiryTimer));
  }

  login(credentials: LoginRequest, remember = false): Observable<void> {
    return this.api
      .post<LoginResponse>('auth/login', {
        email: credentials.email.trim(),
        password: credentials.password,
      })
      .pipe(
        timeout(15_000),
        map((response) => {
          if (
            typeof response !== 'object' ||
            response === null ||
            !('accessToken' in response) ||
            typeof response.accessToken !== 'string' ||
            !('tokenType' in response) ||
            typeof response.tokenType !== 'string' ||
            response.tokenType.toLowerCase() !== 'bearer'
          ) {
            throw new AuthResponseError('invalid-response');
          }
          const expiresAt = jwtExpiresAt(response.accessToken);
          if (!expiresAt) throw new AuthResponseError('invalid-response');
          if (expiresAt <= Date.now()) throw new AuthResponseError('expired-token');
          this.logout();
          this.persistent = remember;
          this._session.set({
            accessToken: response.accessToken,
            expiresAt
          });
          this.save();
          this.scheduleExpiry();
        }),
        switchMap(() => this.getUser()),
        map((): void => undefined),
      );
  }

  getUser(): Observable<AuthUser> {
    return this.api.get<AuthUser>('auth/user').pipe(
      timeout(15_000),
      tap((result) => {
        const current = this._session();
        if (current) {
          this._session.set({
            ...current,
            user: {
              ...result,
              roles: result.isAdmin ? ['Admin'] : result.roles,
            },
          });
          const menus = this._session().user.menus ?? [];
          this.menuService.setMenu(menus);
          this.save();
        }
      }),
    );
  }

  /** Opens a short-lived, local-only session without calling or impersonating the API. */
  startDemo(): void {
    this.logout();
    this.persistent = false;
    const demoUser: AuthUser = {
      id: 99999,
      firstName: 'Invitado Demo',
      lastName: '',
      fullName: 'Invitado',
      email: 'demo@agropredict.local',
      photoUrl: null,
      status: 'active',
      isAdmin: false,
      phone: "98885547",
      age: 18,
      roles: ['Explorador de negocio'],
      menus: []
    };
    this._session.set({
      accessToken: null,
      expiresAt: Date.now() + 8 * 60 * 60 * 1000,
      user: demoUser,
    });
    this.save();
    this.scheduleExpiry();
  }

  isAuthenticated(): boolean {
    const current = this._session();
    if (!current) return false;
    if (current.expiresAt <= Date.now()) {
      this.logout();
      return false;
    }
    return true;
  }

  getAccessToken(): string | null {
    const hadSession = this._session() !== null;
    if (this.isAuthenticated()) return this._session()?.accessToken ?? null;
    // A background tab may execute an HTTP request before its throttled expiry timer.
    if (hadSession) this.expireSession();
    return null;
  }

  /** Profile changes stay local until a profile endpoint is supplied. */
  updateProfile(update: Pick<AuthUser, 'firstName' | 'photoUrl'>): void {
    const current = this._session();
    if (current) {
      this._session.set({ ...current, user: { ...current.user, ...update } });
      this.save();
    }
  }

  logout(): void {
    clearTimeout(this.expiryTimer);
    this._session.set(null);
    writeStorage(AUTH_SESSION_KEY, null);
    writeStorage(AUTH_SESSION_KEY, null, false);
  }

  expireSession(): void {
    const returnUrl = this.router.url;
    this.logout();
    if (!returnUrl.startsWith('/auth/signin')) {
      void this.router.navigate(['/auth/signin'], { queryParams: { reason: 'expired', returnUrl } });
    }
  }

  private save(): void {
    const current = this._session();
    if (!current) return;
    // API sessions honor remember-me; demo access always remains in sessionStorage.
    writeStorage(
      AUTH_SESSION_KEY,
      JSON.stringify({
        accessToken: current.accessToken,
        expiresAt: current.expiresAt,
        user: { ...current.user, avatar: null },
      }),
      this.persistent,
    );
  }

  private restore(): void {
    for (const persistent of [false, true]) {
      const raw = readStorage(AUTH_SESSION_KEY, persistent);
      if (!raw) continue;
      try {
        const value: unknown = JSON.parse(raw);
        if (
          typeof value === 'object' &&
          value !== null &&
          'accessToken' in value &&
          'user' in value &&
          typeof value.user === 'object' &&
          value.user !== null &&
          'email' in value.user &&
          typeof value.user.email === 'string' &&
          'expiresAt' in value &&
          typeof value.expiresAt === 'number'
        ) {
          const accessToken = typeof value.accessToken === 'string' ? value.accessToken : null;
          const expiresAt = accessToken
            ? jwtExpiresAt(accessToken)
            : value.expiresAt;
          if (expiresAt && expiresAt > Date.now()) {
            this.persistent = persistent;
            this._session.set({
              accessToken,
              expiresAt,
              user: value.user as AuthUser,
            });
            const menus = this._session().user.menus ?? [];
            this.menuService.setMenu(menus);
            this.scheduleExpiry();

            return;
          }
        }
      } catch {
        /* Invalid sessions fail closed. */
      }
      writeStorage(AUTH_SESSION_KEY, null, persistent);
    }
  }

  private scheduleExpiry(): void {
    clearTimeout(this.expiryTimer);
    const expiresAt = this._session()?.expiresAt;
    if (!expiresAt) return;
    this.expiryTimer = setTimeout(
      () => {
        if (Date.now() >= expiresAt) this.expireSession();
        else this.scheduleExpiry();
      },
      Math.min(Math.max(0, expiresAt - Date.now()), 2_147_483_647),
    );
  }
}
