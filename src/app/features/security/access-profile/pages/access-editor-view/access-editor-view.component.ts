import { Location } from '@angular/common';
import {
  ChangeDetectionStrategy,
  Component,
  computed,
  effect,
  inject,
  signal,
} from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { NgIcon, provideIcons } from '@ng-icons/core';
import { heroArrowLeftEndOnRectangleMicro } from '@ng-icons/heroicons/micro';
import { heroSquare3Stack3d } from '@ng-icons/heroicons/outline';
import { heroSparklesSolid } from '@ng-icons/heroicons/solid';
import { finalize, forkJoin, of } from 'rxjs';
import { STATUS, StatusType } from '../../../../../core/constants';
import { BtnLoaderDirective } from '../../../../../shared/directives/agro-button-loader.directive';
import { Button } from '../../../../../shared/directives/agro-button.directive';
import { Card } from '../../../../../shared/directives/agro-card.directive';
import { ValidationErrorPipe } from '../../../../../shared/pipes/validation-error.pipe';
import { Empty } from '../../../../../shared/ui/agro-empty/agro-empty.component';
import { Loader } from '../../../../../shared/ui/agro-loader/agro-loader.component';
import { PageHeader } from '../../../../../shared/ui/agro-page-header/agro-page-header.component';
import { InputTextComponent } from '../../../../../shared/ui/forms/input-text/input-text.component';
import { SildeToggle } from '../../../../../shared/ui/forms/slide-toggle/slide-toggle.component';
import { AccessProfileService } from '../../access-profile.service';
import { PermissionNodeComponent } from '../../components/permission-node/permission-node.component';
import { AccessProfile, AccessProfileDto, SelectedMenu } from '../../models/access-profile.model';
import { MenuNodeState, MenuTree, permKey } from '../../models/menu.model';

@Component({
  selector: 'access-editor-view',
  imports: [
    ReactiveFormsModule,
    PageHeader,
    Loader,
    NgIcon,
    Card,
    Button,
    BtnLoaderDirective,

    InputTextComponent,
    SildeToggle,
    ValidationErrorPipe,
    PermissionNodeComponent,
    Empty,
  ],
  templateUrl: './access-editor-view.component.html',
  styleUrls: ['./access-editor-view.component.scss'],
  providers: [
    provideIcons({ heroArrowLeftEndOnRectangleMicro, heroSparklesSolid, heroSquare3Stack3d }),
  ],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class AccesProfileEditorViewComponent {
  private readonly accessProfileService = inject(AccessProfileService);
  private readonly activateRoute = inject(ActivatedRoute);
  private readonly router = inject(Router);
  private readonly location = inject(Location);
  readonly STATUS = STATUS;

  protected saving = signal(false);
  protected loading = signal(false);
  protected loadError = signal(false);
  readonly user = signal<AccessProfile | undefined>(null);
  protected readonly isEditMode = computed(() => !!this.user()?.id);

  protected menuTreee = signal<MenuTree[]>([]);

  protected readonly menuIds = signal<ReadonlySet<number>>(new Set());
  protected readonly permIds = signal<ReadonlySet<string>>(new Set());

  protected readonly nodeStates = computed(() => {
    const menuIds = this.menuIds();
    const permIds = this.permIds();
    const states = new Map<number, MenuNodeState>();
    const walk = (nodes: MenuTree[]): void => {
      for (const n of nodes) {
        walk(n.children);
        const checked = menuIds.has(n.id);
        const anyChild = n.children.some((c) => {
          const s = states.get(c.id);
          return !!s && (s.checked || s.indeterminate);
        });
        const anyPerm = n.permissions.some((p) => permIds.has(permKey(n.id, p.id)));
        states.set(n.id, { checked, indeterminate: !checked && (anyChild || anyPerm) });
      }
    };
    walk(this.menuTreee());
    return states;
  });

  protected readonly selectedTree = computed<MenuTree[]>(() => {
    const permIds = this.permIds();
    const states = this.nodeStates();
    const filter = (nodes: MenuTree[]): MenuTree[] =>
      nodes
        .filter((n) => {
          const s = states.get(n.id);
          return !!s && (s.checked || s.indeterminate);
        })
        .map((n) => ({
          ...n,
          children: filter(n.children),
          permissions: n.permissions.filter((p) => permIds.has(permKey(n.id, p.id))),
        }));
    return filter(this.menuTreee());
  });

  readonly form = inject(FormBuilder).nonNullable.group({
    id: [0, []],
    name: ['', [Validators.required, Validators.minLength(3), Validators.maxLength(60)]],
    status: [STATUS.ACTIVE as StatusType, [Validators.required]],
  });

  constructor() {
    const id = Number(this.activateRoute.snapshot.paramMap.get('id'));

    this.loading.set(true);

    forkJoin({
      menu: this.accessProfileService.getMenu(),
      profile: id ? this.accessProfileService.get(id) : of(null),
    })
      .pipe(finalize(() => this.loading.set(false)))
      .subscribe({
        next: ({ menu, profile }) => {
          this.menuTreee.set(menu);
          if (profile) this.hydrate(profile);
        },
        error: () => this.loadError.set(true),
      });

    effect(() => {
      if (this.loading()) {
        this.form.disable();
      } else {
        this.form.enable();
      }
    });
  }

  goBack(): void {
    this.location.back();
  }

  private hydrate(profile: AccessProfile): void {
    this.user.set(profile);
    this.form.patchValue({
      id: profile.id,
      name: profile.name,
      status: profile.status,
    });

    const permIds = new Set<string>();
    const walk = (menus: SelectedMenu[]): void => {
      for (const m of menus) {
        for (const permId of m.permissions) permIds.add(permKey(m.id, permId));
        walk(m.children ?? []);
      }
    };
    walk(profile.menus);
    this.permIds.set(permIds);
    this.syncAncestors();
  }

  protected onMenuToggle(event: { node: MenuTree; checked: boolean }): void {
    const menuIds = new Set(this.menuIds());
    const permIds = new Set(this.permIds());
    const walk = (n: MenuTree): void => {
      if (event.checked) menuIds.add(n.id);
      else menuIds.delete(n.id);
      for (const p of n.permissions) {
        const key = permKey(n.id, p.id);
        if (event.checked) permIds.add(key);
        else permIds.delete(key);
      }
      n.children.forEach(walk);
    };
    walk(event.node);
    this.menuIds.set(menuIds);
    this.permIds.set(permIds);
    this.syncAncestors();
  }

  protected onPermToggle(event: { menu: MenuTree; permId: number; checked: boolean }): void {
    const permIds = new Set(this.permIds());
    const key = permKey(event.menu.id, event.permId);
    if (event.checked) permIds.add(key);
    else permIds.delete(key);
    this.permIds.set(permIds);
    this.syncAncestors();
  }

  private syncAncestors(): void {
    const menuIds = new Set(this.menuIds());
    const permIds = new Set(this.permIds());
    const walk = (nodes: MenuTree[]): void => {
      for (const n of nodes) {
        walk(n.children);
        if (!n.children.length && !n.permissions.length) continue;
        const complete =
          n.children.every((c) => menuIds.has(c.id)) &&
          n.permissions.every((p) => permIds.has(permKey(n.id, p.id)));
        if (complete) menuIds.add(n.id);
        else menuIds.delete(n.id);
      }
    };
    walk(this.menuTreee());
    this.menuIds.set(menuIds);
  }

  private buildMenusPayload(): SelectedMenu[] {
    const permIds = this.permIds();
    const states = this.nodeStates();
    const build = (nodes: MenuTree[]): SelectedMenu[] =>
      nodes
        .filter((n) => {
          const s = states.get(n.id);
          return !!s && (s.checked || s.indeterminate);
        })
        .map((n) => ({
          id: n.id,
          parentId: n.parentId,
          code: n.code,
          name: n.name,
          permissions: n.permissions
            .filter((p) => permIds.has(permKey(n.id, p.id)))
            .map((p) => p.id),
          children: build(n.children),
        }));
    return build(this.menuTreee());
  }

  save(): void {
    this.form.markAllAsTouched();
    if (this.form.invalid) return;

    const value = this.form.getRawValue();
    const payload: AccessProfileDto = {
      name: value.name,
      status: value.status,
      menus: this.buildMenusPayload(),
    };

    this.saving.set(true);
    const request$ = this.isEditMode()
      ? this.accessProfileService.update(value.id, payload)
      : this.accessProfileService.create(payload);

    request$.subscribe({
      next: () => this.router.navigate(['/seguridad/perfil-acceso']),
      error: () => this.saving.set(false),
    });
  }
}
