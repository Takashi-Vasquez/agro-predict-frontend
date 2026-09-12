import { inject, Injectable } from '@angular/core';
import { Observable, delay, of } from 'rxjs';
import { WorkspaceData } from '../models/agro.models';
import { MOCK_WORKSPACE } from '../data/mock-data';
import { ApiService } from './api.service';

export abstract class AgroRepository {
  abstract loadWorkspace(): Observable<WorkspaceData>;
}

@Injectable({ providedIn: 'root' })
export class MockAgroRepository implements AgroRepository {
  loadWorkspace(): Observable<WorkspaceData> {
    return of(structuredClone(MOCK_WORKSPACE)).pipe(delay(300));
  }
}

@Injectable({ providedIn: 'root' })
export class ApiAgroRepository implements AgroRepository {
  private readonly api = inject(ApiService);

  loadWorkspace(): Observable<WorkspaceData> {
    return this.api.get<WorkspaceData>('workspace');
  }
}
