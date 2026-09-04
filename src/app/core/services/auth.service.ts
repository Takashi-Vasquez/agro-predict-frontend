import { DestroyRef, Injectable, computed, inject, signal } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Router } from '@angular/router';
import { Observable, map, timeout } from 'rxjs';
import { environment } from '../../../environments/environment';
import { AuthResponseError, AuthSession, AuthUser, LoginRequest } from '../models/auth.models';
import { readStorage, writeStorage } from './browser-storage';
import { jwtExpiresAt } from './jwt';

export const AUTH_SESSION_KEY = 'agro.auth-session';

@Injectable({ providedIn: 'root' })
export class AuthService {
  private readonly http = inject(HttpClient);
  private readonly router = inject(Router);
  private readonly session = signal<AuthSession | null>(null);
  private persistent = false;
  private expiryTimer: ReturnType<typeof setTimeout> | undefined;
  readonly user = computed(() => this.session()?.user ?? null);
  readonly isDemo = computed(() => this.session()?.mode === 'demo');

  constructor() {
    // Remove the obsolete demo identity format; the current demo uses the validated session shape.
    writeStorage('agro.demo-session', null);
    writeStorage('agro.demo-session', null, false);
    this.restore();
    inject(DestroyRef).onDestroy(() => clearTimeout(this.expiryTimer));
  }

  login(credentials: LoginRequest, remember = false): Observable<void> {
    return this.http
      .post<unknown>(environment.apiUrl + '/auth/login', {
        email: credentials.email.trim(),
        password: credentials.password,
      })
      .pipe(
        timeout(15_000),
        map((response) => {
          if (
            typeof response !== 'object' ||
            response === null ||
            !('access_token' in response) ||
            typeof response.access_token !== 'string' ||
            !('token_type' in response) ||
            typeof response.token_type !== 'string' ||
            response.token_type.toLowerCase() !== 'bearer'
          ) {
            throw new AuthResponseError('invalid-response');
          }
          const expiresAt = jwtExpiresAt(response.access_token);
          if (!expiresAt) throw new AuthResponseError('invalid-response');
          if (expiresAt <= Date.now()) throw new AuthResponseError('expired-token');
          this.logout();
          this.persistent = remember;
          this.session.set({
            accessToken: response.access_token,
            expiresAt,
            mode: 'api',
            user: {
              email: credentials.email.trim(),
              name: credentials.email.trim().split('@')[0],
              role: 'No informado',
              avatar: null,
            },
          });
          this.save();
          this.scheduleExpiry();
        }),
      );
  }

  /** Opens a short-lived, local-only session without calling or impersonating the API. */
  startDemo(): void {
    this.logout();
    this.persistent = false;
    this.session.set({
      accessToken: null,
      expiresAt: Date.now() + 8 * 60 * 60 * 1000,
      mode: 'demo',
      user: {
        name: 'Invitado Demo',
        email: 'demo@agropredict.local',
        role: 'Explorador de negocio',
        avatar: null,
      },
    });
    this.save();
    this.scheduleExpiry();
  }

  isAuthenticated(): boolean {
    const current = this.session();
    if (!current) return false;
    if (current.expiresAt <= Date.now()) {
      this.logout();
      return false;
    }
    return true;
  }

  getAccessToken(): string | null {
    const hadSession = this.session() !== null;
    if (this.isAuthenticated()) return this.session()?.accessToken ?? null;
    // A background tab may execute an HTTP request before its throttled expiry timer.
    if (hadSession) this.expireSession();
    return null;
  }

  /** Profile changes stay local until a profile endpoint is supplied. */
  updateProfile(update: Pick<AuthUser, 'name' | 'avatar'>): void {
    const current = this.session();
    if (current) {
      this.session.set({ ...current, user: { ...current.user, ...update } });
      this.save();
    }
  }

  logout(): void {
    clearTimeout(this.expiryTimer);
    this.session.set(null);
    writeStorage(AUTH_SESSION_KEY, null);
    writeStorage(AUTH_SESSION_KEY, null, false);
  }

  expireSession(): void {
    const returnUrl = this.router.url;
    this.logout();
    if (!returnUrl.startsWith('/login')) {
      void this.router.navigate(['/login'], { queryParams: { reason: 'expired', returnUrl } });
    }
  }

  private save(): void {
    const current = this.session();
    if (!current) return;
    // API sessions honor remember-me; demo access always remains in sessionStorage.
    writeStorage(
      AUTH_SESSION_KEY,
      JSON.stringify({
        accessToken: current.accessToken,
        expiresAt: current.expiresAt,
        mode: current.mode,
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
          'name' in value.user &&
          typeof value.user.name === 'string'
        ) {
          const mode = 'mode' in value && value.mode === 'demo' ? 'demo' : 'api';
          const accessToken = typeof value.accessToken === 'string' ? value.accessToken : null;
          const expiresAt =
            mode === 'demo' && 'expiresAt' in value && typeof value.expiresAt === 'number'
              ? value.expiresAt
              : accessToken
                ? jwtExpiresAt(accessToken)
                : null;
          if (expiresAt && expiresAt > Date.now()) {
            this.persistent = persistent;
            this.session.set({
              accessToken,
              expiresAt,
              mode,
              user: {
                email: value.user.email,
                name: value.user.name,
                role: mode === 'demo' ? 'Explorador de negocio' : 'No informado',
                avatar: null,
              },
            });
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
    const expiresAt = this.session()?.expiresAt;
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
