import { Injectable, inject } from '@angular/core';
import { Observable } from 'rxjs';
import { ApiService } from '../../../core/services/api.service';
import { toResource } from '../../../shared/utils/to-resource';
import {
  AccessProfile,
  AccessProfileDto,
  UpdateAccessProfileDto,
} from './models/access-profile.model';
import { MenuTree } from './models/menu.model';

@Injectable({ providedIn: 'root' })
export class AccessProfileService {
  private readonly api = inject(ApiService);
  private readonly moduleBaseUrl: string = 'security';

  list(): Observable<AccessProfile[]> {
    return this.api.get<AccessProfile[]>(`${this.moduleBaseUrl}/access-profile/role-permissions`);
  }

  get(roleId: number): Observable<AccessProfile> {
    return this.api.get<AccessProfile>(
      `${this.moduleBaseUrl}/access-profile/role-permissions/${roleId}`,
    );
  }

  create(role: AccessProfileDto): Observable<AccessProfile> {
    return this.api.post<AccessProfile>(
      `${this.moduleBaseUrl}/access-profile/role-permissions`,
      role,
    );
  }

  update(id: number, changes: UpdateAccessProfileDto): Observable<AccessProfile> {
    return this.api.patch<AccessProfile>(
      `${this.moduleBaseUrl}/access-profile/role-permissions/${id}`,
      changes,
    );
  }

  delete(id: number): Observable<void> {
    return this.api.delete<void>(`${this.moduleBaseUrl}/access-profile/role-permissions/${id}`);
  }

  getMenu(): Observable<MenuTree[]> {
    return this.api.get<MenuTree[]>(`${this.moduleBaseUrl}/access-profile/menus`);
  }

  getPermissions(): Observable<Permissions> {
    return this.api.get<Permissions>(`${this.moduleBaseUrl}/access-profile/permissions`);
  }

  listResource() {
    return toResource(() => this.list());
  }
}
