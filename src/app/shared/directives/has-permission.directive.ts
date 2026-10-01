import { Directive, effect, inject, input, TemplateRef, ViewContainerRef } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { MenuService, Permission } from '../../core/services/menu.service';

@Directive({ selector: '[appHasPermission]', standalone: true })
export class HasPermissionDirective {
  private readonly templateRef = inject(TemplateRef<unknown>);
  private readonly viewContainer = inject(ViewContainerRef);
  private readonly menuService = inject(MenuService);
  private readonly route = inject(ActivatedRoute);

  readonly appHasPermission = input.required<Permission>();
  readonly appHasPermissionMenu = input<string>();

  private hasView = false;

  constructor() {
    effect(() => {
      const menuCode =
        this.appHasPermissionMenu() ?? (this.route.snapshot.data['menuCode'] as string);
      const allowed = this.menuService.hasPermission(menuCode, this.appHasPermission());

      if (allowed && !this.hasView) {
        this.viewContainer.createEmbeddedView(this.templateRef);
        this.hasView = true;
      } else if (!allowed && this.hasView) {
        this.viewContainer.clear();
        this.hasView = false;
      }
    });
  }
}
