import { ChangeDetectionStrategy, Component, computed, inject, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { MatDialogModule, MatDialogRef } from '@angular/material/dialog';
import { Router } from '@angular/router';
import { ALL_NAV, NavItem } from './navigation';
import { Icon } from '../shared/ui/icon';
import { Button, Input } from '../shared/ui/primitives';

@Component({
  selector: 'agro-search-dialog',
  imports: [FormsModule, MatDialogModule, Icon, Button, Input],
  template: `
    <div class="dialog-content">
      <h2 mat-dialog-title>Buscar en AgroPredict</h2>
      <div class="search-field">
        <agro-icon name="search" />
        <input
          agroInput
          type="search"
          aria-label="Buscar páginas"
          placeholder="¿A dónde quieres ir?"
          [ngModel]="query()"
          (ngModelChange)="query.set($event)"
        />
      </div>
      <div class="page-results">
        @for (page of results(); track page.path) {
          <button agroButton="ghost" (click)="navigate(page)">
            <agro-icon [name]="page.icon" />
            {{ page.label }}
            <agro-icon name="arrow" />
          </button>
        } @empty {
          <p>No encontramos esa página.</p>
        }
      </div>
      <div class="dialog-actions"><button agroButton mat-dialog-close>Cerrar</button></div>
    </div>
  `,
  styles: [
    '.search-field{max-width:none;margin:20px 0 10px}.page-results{max-height:50dvh;overflow:auto}.page-results button{width:100%;justify-content:flex-start;min-height:46px}.page-results button agro-icon:last-child{margin-left:auto}.page-results p{padding:15px}',
  ],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class SearchDialog {
  private readonly router = inject(Router);
  private readonly dialog = inject(MatDialogRef<SearchDialog>);
  readonly query = signal('');
  readonly results = computed(() =>
    ALL_NAV.filter((page) =>
      page.label.toLocaleLowerCase('es').includes(this.query().trim().toLocaleLowerCase('es')),
    ),
  );
  navigate(page: NavItem): void {
    this.dialog.close();
    void this.router.navigateByUrl(page.path);
  }
}
