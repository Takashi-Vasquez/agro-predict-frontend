import { Injectable, inject } from '@angular/core';
import { Observable } from 'rxjs';
import { ApiService } from '../../../core/services/api.service';
import { toResource } from '../../../shared/utils/to-resource';
import { UpdateUserWithProfileDto, UserWithProfile, UserWithProfileDto } from './user.model';

@Injectable({ providedIn: 'root' })
export class UserService {
  private readonly api = inject(ApiService);
  private readonly moduleBaseUrl: string = 'security';

  list(): Observable<UserWithProfile[]> {
    return this.api.get<UserWithProfile[]>(`${this.moduleBaseUrl}/users`);
  }

  get(id: number): Observable<UserWithProfile> {
    return this.api.get<UserWithProfile>(`${this.moduleBaseUrl}/users/${id}`);
  }

  create(user: UserWithProfileDto): Observable<UserWithProfile> {
    return this.api.post<UserWithProfile>(`${this.moduleBaseUrl}/users`, user);
  }

  update(id: number, changes: UpdateUserWithProfileDto): Observable<UserWithProfile> {
    return this.api.patch<UserWithProfile>(`${this.moduleBaseUrl}/users/${id}`, changes);
  }

  delete(id: number): Observable<void> {
    return this.api.delete<void>(`${this.moduleBaseUrl}/users/${id}`);
  }

  listResource() {
    return toResource(() => this.list());
  }
}
