import { inject } from '@angular/core';
import { CanActivateFn, CanMatchFn, Router } from '@angular/router';
import { MenuService } from '../services/menu.service';

function checkPermission(menuCode: string, permission: string): boolean {
  const menuService = inject(MenuService);
  const router = inject(Router);

  const hasAccess = menuService.hasPermission(menuCode, permission);

  if (!hasAccess) {
    router.navigate(['/unauthorized']);
    return false;
  }

  return true;
}

export const permissionGuard: CanActivateFn = (_route) => {
  const menuCode = _route.data['menuCode'] as string;
  const requiredPermission = _route.data['permission'] as string;
  return checkPermission(menuCode, requiredPermission);
};

export const permissionMatchGuard: CanMatchFn = (_route) => {
  const menuCode = _route.data?.['menuCode'] as string;
  const requiredPermission = _route.data?.['permission'] as string;
  return checkPermission(menuCode, requiredPermission);
};
