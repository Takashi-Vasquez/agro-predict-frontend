import { StatusType } from '../../../../core/constants';

export interface SelectedMenu {
  id: number;
  parentId: number | null;
  code: string;
  name: string;
  permissions: number[];
  children: SelectedMenu[];
}

export interface AccessProfileDto {
  name: string;
  status: StatusType;
  menus: SelectedMenu[];
}

export interface AccessProfile extends AccessProfileDto {
  id: number;
  createdAt: string;
  updatedAt: string;
}

export type UpdateAccessProfileDto = Partial<AccessProfileDto>;
