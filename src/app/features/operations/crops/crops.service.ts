import { Injectable, inject } from '@angular/core';
import { rxResource } from '@angular/core/rxjs-interop';
import { Observable } from 'rxjs';
import { ApiService } from '../../../core/services/api.service';
import { Crop } from './crop.model';

@Injectable({ providedIn: 'root' })
export class CropsService {
  private readonly api = inject(ApiService);

  list(): Observable<Crop[]> {
    return this.api.get<Crop[]>('operations/crops');
  }

  create(crop: Omit<Crop, 'id' | 'createdAt' | 'updatedAt'>): Observable<Crop> {
    return this.api.post<Crop>('operations/crops', crop);
  }

  update(id: number, changes: Partial<Crop>): Observable<Crop> {
    return this.api.put<Crop>(`operations/crops/${id}`, changes);
  }

  delete(id: number): Observable<void> {
    return this.api.delete<void>(`operations/crops/${id}`);
  }

  listResource() {
    return rxResource<Crop[], void>({
      stream: () => this.list(),
    });
  }
}
