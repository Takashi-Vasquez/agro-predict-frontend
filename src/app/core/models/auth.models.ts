export interface LoginRequest {
  email: string;
  password: string;
}
export interface LoginResponse {
  access_token: string;
  token_type: string;
}
/** Display metadata only; login does not return a name or permissions. */
export interface AuthUser {
  name: string;
  email: string;
  role: string;
  avatar: string | null;
}
export interface AuthSession {
  accessToken: string | null;
  expiresAt: number;
  user: AuthUser;
  mode: 'api' | 'demo';
}
export class AuthResponseError extends Error {
  constructor(readonly reason: 'invalid-response' | 'expired-token') {
    super(reason);
    this.name = 'AuthResponseError';
  }
}
