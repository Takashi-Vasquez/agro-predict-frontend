import {
  ChangeDetectionStrategy,
  Component,
  computed,
  input,
  OnInit,
  output,
  signal,
} from '@angular/core';
import { NgIcon, provideIcons } from '@ng-icons/core';
import { heroChevronRightMini } from '@ng-icons/heroicons/mini';
import { MenuNodeState, MenuTree, Permissions, permKey } from '../../models/menu.model';
import { InputCheckboxComponent } from '../../../../../shared/ui/forms/input-checkbox/input-checkbox.component';

@Component({
  selector: 'agro-permission-node',
  imports: [NgIcon, InputCheckboxComponent, PermissionNodeComponent],
  templateUrl: './permission-node.component.html',
  styleUrls: ['./permission-node.component.scss'],
  providers: [provideIcons({ heroChevronRightMini })],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class PermissionNodeComponent implements OnInit {
  protected readonly permKey = permKey;

  readonly node = input.required<MenuTree>();
  readonly depth = input(0);
  readonly states = input.required<Map<number, MenuNodeState>>();
  readonly menuIds = input.required<ReadonlySet<number>>();
  readonly permIds = input.required<ReadonlySet<string>>();
  readonly readonly = input(false);

  readonly menuToggle = output<{ node: MenuTree; checked: boolean }>();
  readonly permToggle = output<{ menu: MenuTree; permId: number; checked: boolean }>();

  readonly expanded = signal(false);

  readonly hasNested = computed(
    () => this.node().children.length > 0 || this.node().permissions.length > 0,
  );

  readonly menuState = computed<MenuNodeState>(
    () => this.states().get(this.node().id) ?? { checked: false, indeterminate: false },
  );

  ngOnInit(): void {
    if (this.hasSelectionBelow()) this.expanded.set(true);
  }

  toggleExpanded(): void {
    this.expanded.update((value) => !value);
  }

  onMenuToggle(checked: boolean): void {
    this.menuToggle.emit({ node: this.node(), checked });
  }

  onPermToggle(perm: Permissions, checked: boolean): void {
    this.permToggle.emit({ menu: this.node(), permId: perm.id, checked });
  }

  private hasSelectionBelow(): boolean {
    const menuIds = this.menuIds();
    const permIds = this.permIds();
    const walk = (menu: MenuTree): boolean => {
      if (menuIds.has(menu.id)) return true;
      if (menu.permissions.some((p) => permIds.has(permKey(menu.id, p.id)))) return true;
      return menu.children.some(walk);
    };
    return walk(this.node());
  }
}
