import { StatusType } from '../../../core/constants';

export interface UserCompanyDto {
  id: number;
  isDefault: boolean;
}

export interface UserWithProfileDto {
  id: number;
  documentNumber: string | null;
  firstName: string | null;
  lastName: string | null;
  email: string;
  phone: string | null;
  age: number | null;
  roleIds: number[];
  companies: UserCompanyDto[];
  status: StatusType;
}

export interface UserWithProfile extends UserWithProfileDto {
  isAdmin: boolean;
  createdAt: string;
  updatedAt: string;
}

export type UpdateUserWithProfileDto = Partial<UserWithProfileDto>;

// src/app/core/models/user.model.ts

export interface UserWithProfileRead {}
