import { StatusType } from '../../../core/constants';

export interface RoleDto {
  name: string;
  description: string;
  status: StatusType;
}

export interface Role extends RoleDto {
  id: number;
  createdAt: string;
  updatedAt: string;
}

export type UpdateRoleDto = Partial<RoleDto>;
