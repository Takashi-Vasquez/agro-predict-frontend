import { Location } from '@angular/common';
import { ChangeDetectionStrategy, Component, computed, inject, signal } from '@angular/core';
import { FormBuilder, Validators } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { NgIcon, provideIcons } from '@ng-icons/core';
import { heroArrowLeftEndOnRectangleMicro } from '@ng-icons/heroicons/micro';
import { heroSquare3Stack3d } from '@ng-icons/heroicons/outline';
import { heroSparklesSolid } from '@ng-icons/heroicons/solid';
import { STATUS, StatusType } from '../../../../../core/constants';
import { BtnLoaderDirective } from '../../../../../shared/directives/agro-button-loader.directive';
import { Button } from '../../../../../shared/directives/agro-button.directive';
import { Empty } from '../../../../../shared/ui/agro-empty/agro-empty.component';
import { Loader } from '../../../../../shared/ui/agro-loader/agro-loader.component';
import { PageHeader } from '../../../../../shared/ui/agro-page-header/agro-page-header.component';
import { UserCompanyDto, UserWithProfile } from '../../user.model';
import { UserService } from '../../user.service';
import { DataGeneralFormComponent } from './data-general/data-general.component';
import { UserWebFormComponent } from './user-web/user-web.component';
type PredictionView = 'general' | 'web';

@Component({
  selector: 'user-editor-view',
  imports: [
    PageHeader,
    NgIcon,
    Loader,
    Button,
    BtnLoaderDirective,
    Empty,
    DataGeneralFormComponent,
    UserWebFormComponent,
  ],
  templateUrl: './user-editor-view.component.html',
  styleUrls: ['./user-editor-view.component.scss'],
  providers: [
    provideIcons({ heroArrowLeftEndOnRectangleMicro, heroSparklesSolid, heroSquare3Stack3d }),
  ],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class UserEditorViewComponent {
  private readonly userService = inject(UserService);
  private readonly activateRoute = inject(ActivatedRoute);
  private readonly router = inject(Router);
  private readonly location = inject(Location);
  readonly view = signal<PredictionView>('general');

  protected saving = signal(false);
  protected loading = signal(false);
  protected loadError = signal(false);
  readonly user = signal<UserWithProfile | undefined>(null);
  protected readonly isEditMode = computed(() => !!this.user()?.id);

  readonly form = inject(FormBuilder).nonNullable.group({
    id: [0, []],
    documentNumber: ['', [Validators.required, Validators.minLength(8)]],
    firstName: ['', [Validators.required, Validators.minLength(3), Validators.maxLength(60)]],
    lastName: ['', [Validators.required, Validators.minLength(3), Validators.maxLength(60)]],
    phone: [null as string | null, []],
    age: [null as number | null, [Validators.required, Validators.min(0), Validators.max(100)]],
    email: ['', [Validators.required, Validators.email, Validators.maxLength(200)]],
    password: ['', []],
    changePassword: [true, []],
    status: [STATUS.ACTIVE as StatusType, [Validators.required]],
    roleIds: [[] as number[], []],
    selectRoles: [0, []],
    companies: [[] as UserCompanyDto[], [Validators.required]],
  });

  constructor() {
    this.form.controls['changePassword'].valueChanges.subscribe((checked) => {
      const password = this.form.controls['password'];
      if (checked) {
        password.enable();
      } else {
        password.disable();
      }
    });

    const id = Number(this.activateRoute.snapshot.paramMap.get('id'));

    if (id) {
      this.loading.set(true);
      this.userService.get(id).subscribe({
        next: (user) => {
          this.hydrate(user);
          this.loading.set(false);
        },
        error: () => {
          this.loadError.set(true);
          this.loading.set(false);
        },
      });
    }
  }

  goBack(): void {
    this.location.back();
  }

  private hydrate(user: UserWithProfile): void {
    this.user.set(user);
    this.form.patchValue({
      id: user.id,
      documentNumber: user.documentNumber,
      firstName: user.firstName,
      lastName: user.lastName,
      phone: user.phone,
      age: user.age,
      email: user.email,
      status: user.status,
      roleIds: user.roleIds,
      companies: user.companies,
    });
    this.form.controls['changePassword'].setValue(false);
  }

  selectView(view: PredictionView): void {
    this.view.set(view);
  }

  private readonly viewFields: Record<PredictionView, string[]> = {
    general: ['documentNumber', 'firstName', 'lastName', 'phone', 'age'],
    web: ['email', 'password', 'changePassword', 'status', 'roleIds', 'selectRoles'],
  };

  save(): void {
    this.form.markAllAsTouched();

    const invalid = (Object.keys(this.viewFields) as PredictionView[]).find((view) =>
      this.viewFields[view].some((name) => this.form.get(name)?.invalid),
    );

    if (invalid) {
      this.selectView(invalid);
      return;
    }

    const value = this.form.getRawValue();
    this.saving.set(true);

    const request$ = this.user()?.id
      ? this.userService.update(this.user().id, value)
      : this.userService.create(value);

    request$.subscribe({
      next: () => {
        this.router.navigate(['/seguridad/usuarios']);
        this.saving.set(false);
      },
      error: () => this.saving.set(false),
    });
  }
}
