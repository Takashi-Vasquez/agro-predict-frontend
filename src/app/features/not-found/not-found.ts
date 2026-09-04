import { ChangeDetectionStrategy, Component } from '@angular/core';
import { RouterLink } from '@angular/router';
import { Button, Empty } from '../../shared/ui/primitives';
@Component({
  selector: 'agro-not-found',
  imports: [RouterLink, Button, Empty],
  template:
    '<agro-empty icon="location" title="Esta ruta no lleva a una parcela" description="La página que buscas no existe o cambió de dirección."><a agroButton="primary" routerLink="/dashboard">Volver al dashboard</a></agro-empty>',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class NotFound {}
