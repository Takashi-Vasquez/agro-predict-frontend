export function filterBy<T>(items: readonly T[], term: string, fields: (keyof T)[]): T[] {
  const normalized = term?.trim().toLowerCase();
  if (!normalized) return [...items];

  return items.filter((item) =>
    fields.some((field) => {
      const value = item[field];
      return value != null && String(value).toLowerCase().includes(normalized);
    }),
  );
}
