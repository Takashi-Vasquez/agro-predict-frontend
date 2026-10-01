import { Injectable, inject } from '@angular/core';
import { Observable } from 'rxjs';
import { ApiService } from '../../../core/services/api.service';
import { toResource } from '../../../shared/utils/to-resource';
import { TrainingField } from './models/training-field.model';
import { TrainingRecordsStats } from './models/training-records-stats.model';
import { TrainingRecords, TrainingRecordsDto } from './models/training-records.model';
import { UploadResult } from './models/upload.model';

@Injectable({ providedIn: 'root' })
export class TrainingRecordService {
  private readonly api = inject(ApiService);
  private readonly moduleBaseUrl: string = 'general';

  list(): Observable<TrainingRecords[]> {
    return this.api.get<TrainingRecords[]>(`${this.moduleBaseUrl}/training-records`);
  }

  create(obj: TrainingRecordsDto): Observable<TrainingRecords> {
    return this.api.post<TrainingRecords>(`${this.moduleBaseUrl}/training-records`, obj);
  }

  delete(id: number): Observable<void> {
    return this.api.delete<void>(`${this.moduleBaseUrl}/training-records/${id}`);
  }

  getStatus(): Observable<TrainingRecordsStats> {
    return this.api.get<TrainingRecordsStats>(`${this.moduleBaseUrl}/training-records/stats`);
  }

  fields(): Observable<TrainingField[]> {
    return this.api.get<TrainingField[]>(`${this.moduleBaseUrl}/training-records/fields`);
  }

  downloadTemplate(format: 'xlsx' | 'csv' = 'xlsx'): Observable<any> {
    return this.api.download(`${this.moduleBaseUrl}/training-records/template`, { format });
  }

  upload(file: File): Observable<UploadResult> {
    return this.api.upload<UploadResult>(`${this.moduleBaseUrl}/training-records/upload`, file);
  }

  listResource() {
    return toResource(() => this.list());
  }

  trainingStatusResource() {
    return toResource(() => this.getStatus());
  }

  fieldsResource() {
    return toResource(() => this.fields());
  }
}
