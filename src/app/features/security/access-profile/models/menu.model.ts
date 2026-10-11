export interface Permissions {
  id: number;
  code: string;
  name: string;
  description: string;
  status: string;
}

export interface MenuTree {
  id: number;
  parentId: number | null;
  name: string;
  code: string;
  icon: string;
  route: string;
  orderIndex: number;
  badge: string;
  status: string;
  children: MenuTree[];
  permissions: Permissions[];
}

export interface MenuNodeState {
  checked: boolean;
  indeterminate: boolean;
}

export function permKey(menuId: number, permId: number): string {
  return `${menuId}:${permId}`;
}
