import { Component } from '@angular/core';
import { RouterLink } from '@angular/router';
import { Button } from '../../../shared/directives/agro-button.directive';
import { Empty } from '../../../shared/ui/agro-empty/agro-empty.component';

@Component({
  selector: 'agro-unauthorized',
  templateUrl: './unauthorized.component.html',
  imports: [RouterLink, Button, Empty],
})
export class UnauthorizedComponent { }
