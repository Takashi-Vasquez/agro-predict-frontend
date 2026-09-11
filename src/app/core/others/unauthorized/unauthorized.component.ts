import { Component } from '@angular/core';
import { RouterLink } from '@angular/router';
import { Button, Empty } from '../../../shared/ui/primitives';

@Component({
  selector: 'agro-unauthorized',
  templateUrl: './unauthorized.component.html',
  imports: [RouterLink, Button, Empty],
})
export class UnauthorizedComponent {}
