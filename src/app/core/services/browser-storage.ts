/** Never store passwords. Auth owns token lifetime and opt-in persistence. */
export function readStorage(key: string, persistent = true): string | null {
  try {
    return (persistent ? localStorage : sessionStorage).getItem(key);
  } catch {
    return null;
  }
}
export function writeStorage(key: string, value: string | null, persistent = true): void {
  try {
    const storage = persistent ? localStorage : sessionStorage;
    if (value === null) storage.removeItem(key);
    else storage.setItem(key, value);
  } catch {
    /* Browser storage can be unavailable; the app still works in memory. */
  }
}
