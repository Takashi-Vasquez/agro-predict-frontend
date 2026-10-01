import { Injectable, inject } from '@angular/core';
import { rxResource } from '@angular/core/rxjs-interop';
import { Observable } from 'rxjs';
import { ApiService } from '../../../core/services/api.service';
import { Campaign, CampaignDto, UpdateCampaignDto } from './campaign.model';

@Injectable({ providedIn: 'root' })
export class CampaignService {
  private readonly api = inject(ApiService);
  private readonly moduleBaseUrl: string = 'general';
  list(): Observable<Campaign[]> {
    return this.api.get<Campaign[]>(`${this.moduleBaseUrl}/campaigns`);
  }

  create(campaign: CampaignDto): Observable<Campaign> {
    return this.api.post<Campaign>(`${this.moduleBaseUrl}/campaigns`, campaign);
  }

  update(id: number, changes: UpdateCampaignDto): Observable<Campaign> {
    return this.api.patch<Campaign>(`${this.moduleBaseUrl}/campaigns/${id}`, changes);
  }

  delete(id: number): Observable<void> {
    return this.api.delete<void>(`${this.moduleBaseUrl}/campaigns/${id}`);
  }

  listResource() {
    return rxResource<Campaign[], void>({
      stream: () => this.list(),
    });
  }
}
