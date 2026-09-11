import { ChangeDetectionStrategy, Component, inject, OnInit, signal } from '@angular/core';
import { RouterLink } from '@angular/router';
import { WorkspaceStore } from '../../../../core/services/workspace.store';
import { Icon } from '../../../../shared/ui/icon';
import { Button, Card, Empty, Loader, PageHeader } from '../../../../shared/ui/primitives';
import { CropsService } from '../crops.service';

@Component({
  selector: 'agro-crops',
  imports: [RouterLink, Icon, Button, Card, Empty, Loader, PageHeader],
  templateUrl: './crops.component.html',
  styleUrls: ['./crops.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush, // OnPush ya es el default en Angular 22.
})
export class CropsComponent implements OnInit {
  private readonly cropsService = inject(CropsService);
  private readonly store = inject(WorkspaceStore);
  loading = signal(false);
  error = signal<string | null>(null);
  crops = this.cropsService.listResource();

  ngOnInit() {
  }

  plotCount(name: string): number {
    return this.store.plots().filter((plot) => plot.crop === name).length;
  }
}
