import { ChangeDetectionStrategy, Component, inject, OnInit } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import { RouterLink } from '@angular/router';
import { Button } from '../../../../shared/directives/agro-button.directive';
import { Card } from '../../../../shared/directives/agro-card.directive';
import { Empty } from '../../../../shared/ui/agro-empty/agro-empty.component';
import { Loader } from '../../../../shared/ui/agro-loader/agro-loader.component';
import { PageHeader } from '../../../../shared/ui/agro-page-header/agro-page-header.component';
import { Icon } from '../../../../shared/ui/icon';
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
  private readonly dialog = inject(MatDialog);

  crops = this.cropsService.listResource();

  ngOnInit() {}
}
