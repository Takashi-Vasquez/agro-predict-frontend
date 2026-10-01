import {
  ChangeDetectionStrategy,
  Component,
  computed,
  inject,
  ResourceRef,
  signal,
} from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { MAT_DIALOG_DATA, MatDialogModule, MatDialogRef } from '@angular/material/dialog';
import { MatSlideToggleModule } from '@angular/material/slide-toggle';
import { STATUSCAMPAIGN, StatusCampaignType } from '../../../../../core/constants';
import { CoreService } from '../../../../../core/services/core.service';
import { ValidationErrorPipe } from '../../../../../shared/pipes/validation-error.pipe';
import { AgroFormDialog } from '../../../../../shared/ui/agro-from-dialog/agro-dialog.component';
import {
  SelectComponent,
  SelectOption,
} from '../../../../../shared/ui/forms/agro-select/agro-select.component';
import { InputDateComponent } from '../../../../../shared/ui/forms/input-date/input-date.component';
import { InputTextComponent } from '../../../../../shared/ui/forms/input-text/input-text.component';
import { Utils } from '../../../../../shared/utils/utils';
import { Campaign } from '../../campaign.model';
import { CampaignService } from '../../campaigns.service';

@Component({
  selector: 'agro-campaign-dialog',
  imports: [
    ReactiveFormsModule,
    MatSlideToggleModule,
    AgroFormDialog,
    MatDialogModule,
    InputTextComponent,
    InputDateComponent,
    SelectComponent,
    ValidationErrorPipe,
  ],
  templateUrl: './campaign-dialog.component.html',
  styleUrls: ['./campaign-dialog.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class CampaignDialog {
  readonly coreService = inject(CoreService);

  protected readonly ref = inject(MatDialogRef<CampaignDialog>);
  readonly STATUSCAMPAIGN = STATUSCAMPAIGN;
  private readonly campaignService = inject(CampaignService);
  protected saving = signal(false);
  readonly data = inject<{
    campaign: Campaign | undefined;
    options: {
      cropsOptions: ResourceRef<SelectOption[]>;
      statusOptions: ResourceRef<SelectOption[]>;
    };
  }>(MAT_DIALOG_DATA);
  protected readonly isEditMode = computed(() => !!this.data.campaign?.id);

  readonly cropsOptions = this.data.options.cropsOptions;
  readonly statusOptions = this.data.options.statusOptions;
  protected readonly today = Utils.formatFecha(new Date(), 'yyyy-MM-dd');

  readonly form = inject(FormBuilder).nonNullable.group({
    name: [
      this.data.campaign?.name ?? '',
      [Validators.required, Validators.minLength(3), Validators.maxLength(60)],
    ],
    code: [
      this.data.campaign?.code ?? '',
      [Validators.required, Validators.minLength(3), Validators.maxLength(20)],
    ],
    startDate: [this.data.campaign?.startDate ?? this.today, [Validators.required]],
    endDate: [this.data.campaign?.endDate ?? this.today, [Validators.required]],
    cropId: [this.data.campaign?.cropId ?? null, [Validators.required]],
    status: [(this.data.campaign?.status ?? null) as StatusCampaignType, [Validators.required]],
  });

  save(): void {
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      return;
    }

    const value = this.form.getRawValue();
    this.saving.set(true);

    const request$ = this.data.campaign?.id
      ? this.campaignService.update(this.data.campaign.id, value)
      : this.campaignService.create(value);

    request$.subscribe({
      next: () => {
        this.ref.close(true);
        this.saving.set(false);
      },
      error: () => this.saving.set(false),
    });
  }
}
