import { Component, inject, OnInit } from '@angular/core';
import { RouterLink } from '@angular/router';
import { Button, Empty } from '../../../shared/ui/primitives';
import { AUTH_SESSION_KEY } from '../../services/auth.service';
import { readStorage } from '../../services/browser-storage';
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
    const raw = readStorage(AUTH_SESSION_KEY, true);
    const raw2 = readStorage(AUTH_SESSION_KEY, false);
    console.log('raw :>> ', raw);
    console.log('raw2 :>> ', raw2);

    const menu = this.menuService.menuTree();

  }
}
