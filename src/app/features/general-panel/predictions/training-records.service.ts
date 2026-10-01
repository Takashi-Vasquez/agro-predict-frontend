import { Injectable, inject } from '@angular/core';
import { rxResource } from '@angular/core/rxjs-interop';
import { Observable } from 'rxjs';
import { ApiService } from '../../../core/services/api.service';
import { TrainingRecords, TrainingRecordsDto } from './training-records.model';

@Injectable({ providedIn: 'root' })
export class TrainingRecordService {
  private readonly api = inject(ApiService);
  private readonly moduleBaseUrl: string = 'general';
  list(): Observable<TrainingRecords[]> {
    return this.api.get<TrainingRecords[]>(`${this.moduleBaseUrl}/training-records`);
  }

  create(role: TrainingRecordsDto): Observable<TrainingRecords> {
    return this.api.post<TrainingRecords>(`${this.moduleBaseUrl}/training-records`, role);
  }

  // update(id: number, changes: UpdateRoleDto): Observable<Role> {
  //   return this.api.patch<Role>(`${this.moduleBaseUrl}/training-records/${id}`, changes);
  // }

  delete(id: number): Observable<void> {
    return this.api.delete<void>(`${this.moduleBaseUrl}/training-records/${id}`);
  }

  listResource() {
    return rxResource<TrainingRecords[], void>({
      stream: () => this.list(),
    });
  }
}
