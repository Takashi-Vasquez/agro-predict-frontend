
export type AppError =
  | { kind: 'network'; message: string }
  | { kind: 'timeout'; message: string }
  | { kind: 'unauthorized'; message: string }
  | { kind: 'forbidden'; message: string }
  | { kind: 'not-found'; message: string }
  | { kind: 'validation'; message: string; fields?: Record<string, string[]> }
  | { kind: 'server'; message: string; status: number }
  | { kind: 'unknown'; message: string; raw?: unknown };
