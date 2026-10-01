import { inject, Injectable, Signal } from '@angular/core';
import { SelectOption } from '../../shared/ui/forms/agro-select/agro-select.component';
import { toResource, toResourceWithParams } from '../../shared/utils/to-resource';
import { Utils } from '../../shared/utils/utils';
import { ApiService } from './api.service';

@Injectable({ providedIn: 'root' })
export class CoreService {
  private readonly api = inject(ApiService);
  private readonly moduleBaseUrl: string = 'core';

  catalogsResource(code: string) {
    return toResource<SelectOption[]>(() =>
      this.api.get<SelectOption[]>(`${this.moduleBaseUrl}/catalogs/${code}`),
    );
  }

  cropsResource(filters?: Record<string, unknown>) {
    return toResource<SelectOption[]>(() =>
      this.api.get<SelectOption[]>(
        `${this.moduleBaseUrl}/select-options/crops${Utils.buildQuery(filters)}`,
      ),
    );
  }

  campaignsResource(filters: Signal<Record<string, unknown> | undefined>) {
    return toResourceWithParams(filters, (f) =>
      this.api.get<SelectOption[]>(
        `${this.moduleBaseUrl}/select-options/campaigns${Utils.buildQuery(f)}`,
      ),
    );
  }
}
