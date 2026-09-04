import { ChangeDetectionStrategy, Component, input } from '@angular/core';

// Lucide-style outline icons. SVG stays local and inherits the accessible control label.
const paths: Record<string, string> = {
  sprout: 'M12 22v-9 M12 16C3 17 3 9 3 7c6 0 9 3 9 9Z M12 13c0-7 5-10 10-10 0 7-3 10-10 10Z',
  grid: 'M3 3h7v7H3z M14 3h7v7h-7z M3 14h7v7H3z M14 14h7v7h-7z',
  calendar:
    'M8 2v4 M16 2v4 M3 10h18 M5 4h14a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V6a2 2 0 0 1 2-2Z M8 14h2 M14 14h2 M8 18h2',
  sparkles: 'm12 3 2.7 6.3L21 12l-6.3 2.7L12 21l-2.7-6.3L3 12l6.3-2.7L12 3Z M20 2v4 M18 4h4',
  layers: 'm12 3 10 5-10 5L2 8l10-5Z M2 12l10 5 10-5 M2 16l10 5 10-5',
  sun: 'M12 8a4 4 0 1 0 0 8 4 4 0 0 0 0-8 M12 2v2 M12 20v2 M2 12h2 M20 12h2 M4.9 4.9l1.4 1.4 M17.7 17.7l1.4 1.4 M4.9 19.1l1.4-1.4 M17.7 6.3l1.4-1.4',
  cloud: 'M7 18h11a4 4 0 0 0 .8-7.9A7 7 0 0 0 5.3 8.7 4.8 4.8 0 0 0 1 13.4 4.6 4.6 0 0 0 6 18',
  rain: 'M7 15H5a4 4 0 0 1 0-8 7 7 0 0 1 13-1 4.5 4.5 0 0 1 0 9h-1 M8 17l-1 3 M13 17l-1 3 M18 17l-1 3',
  sensor:
    'M8 8h8v8H8z M9 2v3 M15 2v3 M9 19v3 M15 19v3 M2 9h3 M2 15h3 M19 9h3 M19 15h3 M5 5h14v14H5z',
  history: 'M3 12a9 9 0 1 0 3-6.7L3 8 M3 3v5h5 M12 7v5l3 2',
  chart: 'M3 3v18h18 M7 15v-4 M12 15V7 M17 15v-7',
  settings:
    'M12 8a4 4 0 1 0 0 8 4 4 0 0 0 0-8 M9 3l1-2h4l1 2 2 1 2-1 2 4-2 2v3l2 2-2 4-2-1-2 1-1 3h-4l-1-3-2-1-2 1-2-4 2-2V9L3 7l2-4 2 1 2-1Z',
  user: 'M12 3a4 4 0 1 0 0 8 4 4 0 0 0 0-8 M4 21v-2a8 8 0 0 1 16 0v2',
  logout: 'M9 21H4a1 1 0 0 1-1-1V4a1 1 0 0 1 1-1h5 M10 12h11 M17 8l4 4-4 4',
  search: 'M10.5 3a7.5 7.5 0 1 0 0 15 7.5 7.5 0 0 0 0-15 M16 16l5 5',
  bell: 'M18 8a6 6 0 0 0-12 0c0 7-3 7-3 9h18c0-2-3-2-3-9 M10 21h4',
  message: 'M21 11a9 9 0 0 1-9 9 10 10 0 0 1-4-1l-5 2 1-5a9 9 0 1 1 17-5Z M8 10h8 M8 14h5',
  moon: 'M21 13A9 9 0 0 1 11 3a9 9 0 1 0 10 10Z',
  chevron: 'm9 5 7 7-7 7',
  down: 'm6 9 6 6 6-6',
  plus: 'M12 5v14 M5 12h14',
  arrow: 'M5 12h14 M13 6l6 6-6 6',
  up: 'm7 14 5-5 5 5 M12 9v11',
  trend: 'm3 17 6-6 4 4 8-10 M15 5h6v6',
  download: 'M12 3v12 M7 10l5 5 5-5 M3 15v5h18v-5',
  more: 'M5 12h.01 M12 12h.01 M19 12h.01',
  location: 'M20 10c0 6-8 12-8 12S4 16 4 10a8 8 0 1 1 16 0Z M12 7a3 3 0 1 0 0 6 3 3 0 0 0 0-6',
  check: 'm5 12 4 4L19 6',
  close: 'm6 6 12 12 M6 18 18 6',
  menu: 'M3 6h18 M3 12h18 M3 18h18',
  panel: 'M3 3h18v18H3z M9 3v18',
  eye: 'M2 12s4-7 10-7 10 7 10 7-4 7-10 7S2 12 2 12Z M12 9a3 3 0 1 0 0 6 3 3 0 0 0 0-6',
  eyeOff:
    'm3 3 18 18 M10.5 5.1C17 4 22 12 22 12a20 20 0 0 1-3 4 M6.5 6.5A21 21 0 0 0 2 12s4 7 10 7a12 12 0 0 0 5.5-1.5 M10 10a3 3 0 0 0 4 4',
  mail: 'M3 4h18v16H3z m0 0 9 8 9-8',
  lock: 'M5 10h14v11H5z M8 10V6a4 4 0 0 1 8 0v4 M12 14v3',
  shield: 'm12 2 9 4v6c0 6-9 10-9 10S3 18 3 12V6l9-4Z m-5 10 3 3 7-7',
  info: 'M12 2a10 10 0 1 0 0 20 10 10 0 0 0 0-20 M12 11v6 M12 7h.01',
  alert: 'm12 3 10 18H2L12 3Z M12 9v5 M12 17h.01',
  drop: 'M12 2S4 11 4 15a8 8 0 0 0 16 0c0-4-8-13-8-13Z',
  wind: 'M3 8h12a3 3 0 1 0-3-3 M2 12h17a3 3 0 1 1-3 3 M4 16h5a3 3 0 1 1-3 3',
  thermometer: 'M9 14V5a3 3 0 0 1 6 0v9a5 5 0 1 1-6 0Z M12 9v9',
  filter: 'M4 5h16l-6 7v7l-4 2v-9L4 5Z',
  file: 'M14 2H4v20h16V8l-6-6Z M14 2v6h6 M8 12h8 M8 16h6',
  wifi: 'M2 8a16 16 0 0 1 20 0 M5 12a11 11 0 0 1 14 0 M8 16a6 6 0 0 1 8 0 M12 20h.01',
};
@Component({
  selector: 'agro-icon',
  template:
    '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.7" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path [attr.d]="paths[name()] || paths[\'sprout\']" /></svg>',
  styles: [
    ':host{display:inline-flex;align-items:center;justify-content:center;width:20px;height:20px;flex-shrink:0}svg{width:100%;height:100%}',
  ],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class Icon {
  readonly name = input('sprout');
  readonly paths = paths;
}
