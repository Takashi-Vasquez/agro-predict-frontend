import { Component, inject, OnInit } from '@angular/core';
import { RouterLink } from '@angular/router';
import { Button } from '../../../shared/directives/agro-button.directive';
import { Empty } from '../../../shared/ui/agro-empty/agro-empty.component';
import { MenuService } from '../../services/menu.service';
@Component({
  selector: 'agro-not-found',
  templateUrl: './not-found.component.html',
  imports: [RouterLink, Button, Empty],
})
export class NotFoundComponent implements OnInit {
  private menuService = inject(MenuService);

  constructor() { }

  ngOnInit() {
  }
}
