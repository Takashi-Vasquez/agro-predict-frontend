export interface NavItem {
  label: string;
  path: string;
  icon: string;
  badge?: string;
}
export const MAIN_NAV: NavItem[] = [
  { label: 'Dashboard', path: '/dashboard', icon: 'grid' },
  { label: 'Planificación de cultivos', path: '/planificacion', icon: 'calendar' },
  { label: 'Predicciones', path: '/predicciones', icon: 'sparkles', badge: 'IA' },
  { label: 'Parcelas', path: '/parcelas', icon: 'layers' },
  { label: 'Cultivos', path: '/cultivos', icon: 'sprout' },
];
export const MONITOR_NAV: NavItem[] = [
  { label: 'Clima', path: '/clima', icon: 'sun' },
  { label: 'Sensores IoT', path: '/sensores', icon: 'sensor' },
  { label: 'Historial', path: '/historial', icon: 'history' },
  { label: 'Reportes', path: '/reportes', icon: 'chart' },
];
export const ACCOUNT_NAV: NavItem[] = [
  { label: 'Configuración', path: '/configuracion', icon: 'settings' },
  { label: 'Mi perfil', path: '/perfil', icon: 'user' },
];
export const ALL_NAV = [...MAIN_NAV, ...MONITOR_NAV, ...ACCOUNT_NAV];
