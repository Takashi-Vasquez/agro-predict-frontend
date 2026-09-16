export const STATUS = {
  ACTIVE: 'ACTIVE',
  INACTIVE: 'INACTIVE',
  DELETED: 'DELETED',
} as const;

export type StatusType = (typeof STATUS)[keyof typeof STATUS];

export const STATUS_OPTIONS = [
  { value: STATUS.ACTIVE, label: 'Activo', type: 'success' },
  { value: STATUS.INACTIVE, label: 'Inactivo', type: 'amber' },
  { value: STATUS.DELETED, label: 'Eliminado', type: 'danger' },
] as const;
