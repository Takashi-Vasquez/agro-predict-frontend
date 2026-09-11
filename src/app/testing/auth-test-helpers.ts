import { HttpTestingController } from '@angular/common/http/testing';
import { TestBed } from '@angular/core/testing';
import { AUTH_SESSION_KEY, AuthService } from '../core/services/auth.service';

export const TEST_CREDENTIALS = { email: 'user@example.com', password: 'test-password-only' };
export function fakeToken(expiresAt = Date.now() + 3_600_000, subject = 'test-user'): string {
  return `${btoa('{"alg":"HS256","typ":"JWT"}')}.${btoa(
    JSON.stringify({ sub: subject, exp: Math.floor(expiresAt / 1000) }),
  )
    .replaceAll('+', '-')
    .replaceAll('/', '_')
    .replaceAll('=', '')}.test-signature`;
}
export function clearAuthStorage(): void {
  for (const key of [AUTH_SESSION_KEY, 'agro.demo-session']) {
    localStorage.removeItem(key);
    sessionStorage.removeItem(key);
  }
}
export function authenticate(remember = false, token = fakeToken()): string {
  TestBed.inject(AuthService).login(TEST_CREDENTIALS, remember).subscribe();
  TestBed.inject(HttpTestingController)
    .expectOne('/api/v1/auth/signin')
    .flush({ access_token: token, token_type: 'bearer' });
  return token;
}
