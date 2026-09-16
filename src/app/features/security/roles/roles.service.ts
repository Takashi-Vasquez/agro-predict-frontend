import { Injectable, inject } from '@angular/core';
import { rxResource } from '@angular/core/rxjs-interop';
import { Observable } from 'rxjs';
import { ApiService } from '../../../core/services/api.service';
import { Role, RoleDto, UpdateRoleDto } from './roles.model';

@Injectable({ providedIn: 'root' })
export class RolesService {
  private readonly api = inject(ApiService);
  private readonly moduleBaseUrl: string = 'security';
  list(): Observable<Role[]> {
    return this.api.get<Role[]>(`${this.moduleBaseUrl}/roles`);
  }

  create(role: RoleDto): Observable<Role> {
    return this.api.post<Role>(`${this.moduleBaseUrl}/roles`, role);
  }

  update(id: number, changes: UpdateRoleDto): Observable<Role> {
    return this.api.patch<Role>(`${this.moduleBaseUrl}/roles/${id}`, changes);
  }

  delete(id: number): Observable<void> {
    return this.api.delete<void>(`${this.moduleBaseUrl}/roles/${id}`);
  }

  listResource() {
    return rxResource<Role[], void>({
      stream: () => this.list(),
    });
  }
}
