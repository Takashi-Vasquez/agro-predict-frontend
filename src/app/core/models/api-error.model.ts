export type ErrorKind =
  | 'timeout'
  | 'network'
  | 'unauthorized'
  | 'forbidden'
  | 'not-found'
  | 'conflict'
  | 'validation'
  | 'server'
  | 'unknown';

export interface AppError {
  kind: ErrorKind;
  message: string;
  fields?: Record<string, string[]>;
  raw?: unknown;
  status?: number;
}
