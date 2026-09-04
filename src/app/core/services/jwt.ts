/** Decode exp ONLY for UI lifetime. Signature/authorization remain server responsibilities. */
export function jwtExpiresAt(token: string): number | null {
  try {
    const parts = token.split('.');
    if (parts.length !== 3 || !parts.every((part) => /^[A-Za-z0-9_-]+$/.test(part))) return null;
    const base64 = parts[1].replaceAll('-', '+').replaceAll('_', '/');
    const payload: unknown = JSON.parse(atob(base64.padEnd(Math.ceil(base64.length / 4) * 4, '=')));
    if (
      typeof payload !== 'object' ||
      payload === null ||
      !('exp' in payload) ||
      typeof payload.exp !== 'number'
    )
      return null;
    const expiresAt = payload.exp * 1000;
    return Number.isSafeInteger(expiresAt) && expiresAt > 0 ? expiresAt : null;
  } catch {
    return null;
  }
}
