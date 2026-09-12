import { Injectable, inject } from '@angular/core';
import { ToastService } from 'ngx-herald';

@Injectable({ providedIn: 'root' })
export class NotificationService {
  private readonly toast = inject(ToastService);

  success(message: string): void {
    this.toast.success(message);
  }

  error(message: string): void {
    this.toast.error(message);
  }

  warning(message: string): void {
    this.toast.warning(message);
  }

  info(message: string): void {
    this.toast.info(message);
  }
}
