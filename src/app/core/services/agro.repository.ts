import { inject, Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, delay, of } from 'rxjs';
import { WorkspaceData } from '../models/agro.models';
import { MOCK_WORKSPACE } from '../data/mock-data';
import { environment } from '../../../environments/environment';

export abstract class AgroRepository {
  abstract loadWorkspace(): Observable<WorkspaceData>;
}
@Injectable({ providedIn: 'root' })
export class MockAgroRepository implements AgroRepository {
  loadWorkspace(): Observable<WorkspaceData> {
    return of(structuredClone(MOCK_WORKSPACE)).pipe(delay(300));
  }
}
/** Proposed REST contract. Implement the endpoint in the future backend before enabling. */
@Injectable({ providedIn: 'root' })
export class ApiAgroRepository implements AgroRepository {
  private readonly http = inject(HttpClient);
  loadWorkspace(): Observable<WorkspaceData> {
    return this.http.get<WorkspaceData>(`${environment.apiUrl}/workspace`);
  }
}
