import {
  ChangeDetectionStrategy,
  Component,
  computed,
  inject,
  signal,
  TemplateRef,
  ViewChild,
} from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import { NgIcon, provideIcons } from '@ng-icons/core';
import { heroMagnifyingGlassMicro, heroPlusMicro } from '@ng-icons/heroicons/micro';
import { heroPencil, heroTrash } from '@ng-icons/heroicons/outline';
import { heroArrowPathSolid } from '@ng-icons/heroicons/solid';
import { CoreService } from '../../../../core/services/core.service';
import { Button } from '../../../../shared/directives/agro-button.directive';
import { Card } from '../../../../shared/directives/agro-card.directive';
import { AgroColorDirective } from '../../../../shared/directives/agro-color.directive';
import { Empty } from '../../../../shared/ui/agro-empty/agro-empty.component';
import { Loader } from '../../../../shared/ui/agro-loader/agro-loader.component';
import { PageHeader } from '../../../../shared/ui/agro-page-header/agro-page-header.component';
import { ConfirmDialog } from '../../../../shared/ui/confirm-dialog/confirm-dialog.component';
import {
  DataTable,
  TableColumn,
  TableRow,
} from '../../../../shared/ui/data-table/data-table.component';
import { SearchField } from '../../../../shared/ui/search-field/search-field.component';
import { filterBy } from '../../../../shared/utils/filter.util';
import { Utils } from '../../../../shared/utils/utils';
import { CampaignService } from '../campaigns.service';
import { CampaignDialog } from './campaign-dialog/campaign-dialog.component';
@Component({
  selector: 'agro-campaign',
  imports: [
    SearchField,
    NgIcon,
    Button,
    Card,
    Empty,
    Loader,
    PageHeader,
    DataTable,
    AgroColorDirective,
  ],
  providers: [
    provideIcons({
      heroPlusMicro,
      heroMagnifyingGlassMicro,
      heroPencil,
      heroTrash,
      heroArrowPathSolid,
    }),
  ],
  templateUrl: './campaign.component.html',
  styleUrls: ['./campaign.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush, // OnPush ya es el default en Angular 22.
})
export class CampaignComponent {
  private readonly coreService = inject(CoreService);
  private readonly campaignService = inject(CampaignService);
  private readonly dialog = inject(MatDialog);
  readonly searchTerm = signal('');

  readonly cropsOptions = this.coreService.cropsResource();
  readonly statusOptions = this.coreService.catalogsResource('campaign_status');

  campaign = this.campaignService.listResource();
  @ViewChild('actionsTpl', { static: true }) actionsTpl!: TemplateRef<{ $implicit: TableRow }>;

  readonly columns = computed<TableColumn[]>(() => [
    { key: 'name', label: 'NOMBRE' },
    { key: 'code', label: 'CODIGO' },
    { key: 'cropName', label: 'CULTIVO' },
    { key: 'startEstimateDate', label: 'FECHA INICIO' },
    { key: 'endEstimateDate', label: 'FECHA FIN' },
    { key: 'status', label: 'ESTADO', kind: 'status', width: '15%' },
    { key: 'actions', label: 'ACCIONES', kind: 'actions', width: '15%' },
  ]);

  // Rows:
  readonly rows = computed<TableRow[]>(() => {
    const all = (this.campaign.value() ?? []).map((campaign) => ({
      id: String(campaign.id),
      name: campaign.name,
      code: campaign.code,
      cropName: campaign.cropName,
      startEstimateDate: Utils.formatFecha(campaign.startDate, 'dd/MM/yyyy'),
      endEstimateDate: Utils.formatFecha(campaign.endDate, 'dd/MM/yyyy'),
      status: campaign.status,
    }));
    return filterBy(all, this.searchTerm(), ['name', 'cropName']);
  });

  createOrUpdate(row?: TableRow) {
    const campaign = row ? this.campaign.value()?.find((r) => r.id === Number(row.id)) : undefined;

    if (row && !campaign) return;

    this.dialog
      .open(CampaignDialog, {
        data: {
          campaign: campaign,
          options: { cropsOptions: this.cropsOptions, statusOptions: this.statusOptions },
        },
      })
      .afterClosed()
      .subscribe((saved: boolean) => {
        if (saved) this.campaign.reload();
      });
  }

  remove(row: TableRow) {
    const campaign = this.campaign.value()?.find((r) => r.id === Number(row.id));
    this.dialog
      .open(ConfirmDialog, {
        width: '440px',
        data: {
          title: '¿Eliminar esta campaña?',
          message: `Se eliminará ${campaign.name}. Esta acción no se puede deshacer.`,
          confirm: 'Eliminar',
          cancel: 'Cancelar',
          action: () => this.campaignService.delete(campaign.id),
        },
      })
      .afterClosed()
      .subscribe((done) => {
        if (done) this.campaign.reload();
      });
  }
}
