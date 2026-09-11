import { Injectable, signal } from '@angular/core';
import { MenuItem } from '../models/menu.models';
import { readStorage } from './browser-storage';

export const AUTH_SESSION_KEY = 'agro.auth-session';

@Injectable({ providedIn: 'root' })
export class MenuService {
  menuTree = signal<MenuItem[]>([]);
  permissionMap = new Map<string, Set<string>>();

  constructor() {
    this.loadFromStorage();
  }

  private loadFromStorage(): void {
    for (const persistent of [false, true]) {
      const raw = readStorage(AUTH_SESSION_KEY, persistent);
      if (!raw) continue;
      try {
        const value = JSON.parse(raw);
        if (value?.user?.menus && Array.isArray(value.user.menus) && value.user.menus.length > 0) {
          this.setMenu(value.user.menus);
          return;
        }
      } catch { /* ignore */ }
    }
  }


  setMenu(tree: MenuItem[]) {
    this.menuTree.set(tree);
    this.buildPermissionMap(tree);
  }

  hasPermission(menuCode: string, permission: string): boolean {
    return this.permissionMap.get(menuCode)?.has(permission) ?? false;
  }


  private buildPermissionMap(items: MenuItem[]) {
    for (const item of items) {
      this.permissionMap.set(item.code, new Set(item.permissions));
      if (item.children?.length) this.buildPermissionMap(item.children);
    }
  }

  findMenuItem(currentUrl: string, menu?: MenuItem[]): MenuItem | null {
    for (const item of menu) {
      if (currentUrl === item.route) {
        return item;
      }

      if (item.children && item.children.length > 0) {
        const found = this.findMenuItem(currentUrl, item.children);
        if (found) return found;
      }

    }
    return null;
  }

}
