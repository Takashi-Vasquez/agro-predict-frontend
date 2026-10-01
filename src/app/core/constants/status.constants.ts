//Status
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

//Status Campaign
export const STATUSCAMPAIGN = {
  PLANNED: 'PLANNED',
  ACTIVE: 'ACTIVE',
  PAUSED: 'PAUSED',
  CLOSED: 'CLOSED',
} as const;

export type StatusCampaignType = (typeof STATUSCAMPAIGN)[keyof typeof STATUSCAMPAIGN];

export const STATUS_CAMPAIGN_OPTIONS = [
  { value: STATUSCAMPAIGN.PLANNED, label: 'Planificado', type: 'blue' },
  { value: STATUSCAMPAIGN.ACTIVE, label: 'Activo', type: 'success' },
  { value: STATUSCAMPAIGN.PAUSED, label: 'Pausado', type: 'amber' },
  { value: STATUSCAMPAIGN.CLOSED, label: 'Cerrado', type: 'danger' },
] as const;
