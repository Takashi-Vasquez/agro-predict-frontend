import { environment } from '../../../environments/environment';

export function isApiRequest(requestUrl: string, documentUrl: string): boolean {
  const base = new URL(environment.apiUrl.replace(/\/$/, '') + '/', documentUrl);
  const target = new URL(requestUrl, documentUrl);
  return target.origin === base.origin && target.pathname.startsWith(base.pathname);
}
export function isLoginRequest(requestUrl: string, documentUrl: string): boolean {
  return (
    isApiRequest(requestUrl, documentUrl) &&
    new URL(requestUrl, documentUrl).pathname ===
      new URL(`${environment.apiUrl}/auth/login`, documentUrl).pathname
  );
}
