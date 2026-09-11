export interface MenuItem {
  id: number;
  parentId: number | null;
  name: string;
  code: string;
  icon: string;
  route: string;
  orderIndex: number;
  badge: string;
  status: string;
  children: MenuItem[];
  permissions: string[];
}
