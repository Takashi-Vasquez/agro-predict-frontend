import { DOCUMENT } from '@angular/common';
import { Injectable, effect, inject, signal } from '@angular/core';
import { readStorage, writeStorage } from './browser-storage';

@Injectable({ providedIn: 'root' })
export class ThemeService {
  private readonly document = inject(DOCUMENT);
  readonly dark = signal(readStorage('agro.theme') === 'dark');
  constructor() {
    effect(() => {
      this.document.documentElement.classList.toggle('dark', this.dark());
      writeStorage('agro.theme', this.dark() ? 'dark' : 'light');
    });
  }
  toggle(): void {
    this.dark.update((value) => !value);
  }
}
