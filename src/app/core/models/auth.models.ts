import { MenuItem } from "./menu.models";

export interface LoginRequest {
  email: string;
  password: string;
}
export interface LoginResponse {
  accessToken: string;
  tokenType: string;
}
/** Display metadata only; login does not return a name or permissions. */

export interface AuthSession {
  accessToken: string | null;
  expiresAt: number;
  user?: AuthUser;
}
export class AuthResponseError extends Error {
  constructor(readonly reason: 'invalid-response' | 'expired-token') {
    super(reason);
    this.name = 'AuthResponseError';
  }
}

// Backend response from GET /auth/user
export interface AuthUser {

  id: number;
  email: string;
  status: string;
  isAdmin: boolean;
  firstName: string | null;
  lastName: string | null;
  fullName: string | null;
  phone: string | null;
  photoUrl: string | null;
  age: number | null;
  roles: string[];
  menus: MenuItem[];
}
