import { ChangeDetectionStrategy, Component, inject, signal } from '@angular/core';
import { RouterLink } from '@angular/router';
import { NgIcon, provideIcons } from '@ng-icons/core';
import { heroSparkles, heroSquare3Stack3d } from '@ng-icons/heroicons/outline';
import { matHistory } from '@ng-icons/material-icons/baseline';
import { Button } from '../../../../shared/directives/agro-button.directive';
import { PageHeader } from '../../../../shared/ui/agro-page-header/agro-page-header.component';
import { TrainingRecordService } from '../training-records.service';
import { BatchTrainingComponent } from './training-records/batch/batch-training.component';
import { IndividualTrainingComponent } from './training-records/individual/individual-training.component';

type PredictionView = 'individual' | 'batch';

@Component({
  selector: 'agro-predictions',
  standalone: true,
  imports: [
    NgIcon,
    RouterLink,
    Button,
    PageHeader,
    IndividualTrainingComponent,
    BatchTrainingComponent,
  ],
  providers: [
    provideIcons({
      heroSquare3Stack3d,
      heroSparkles,
      matHistory,
    }),
  ],
  templateUrl: './training-records.component.html',
  styleUrl: './training-records.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class TrainingRecordsComponent {
  readonly view = signal<PredictionView>('individual');
  readonly trainingRecordService = inject(TrainingRecordService);
  readonly trainingStatus = this.trainingRecordService.trainingStatusResource();

  selectView(view: PredictionView): void {
    this.view.set(view);
  }

  onRecordAdded(): void {
    this.trainingStatus.reload();
  }

  onRecordsChanged(): void {
    this.trainingStatus.reload();
  }
}
