# AGENTS.md

## Descripción del Proyecto
Frontend Angular 22.1 para planificación agrícola (AgroPredict). Componentes standalone, sin NgModules. Español peruano (es-PE).

## Comandos Rápidos
- **Instalar:** `pnpm install` (requiere Node 24.15, pnpm 11.19)
- **Servidor dev:** `pnpm start` → `http://127.0.0.1:4200`
- **Build:** `pnpm build`
- **Test:** `pnpm test` (Vitest, NO Karma)
- **Formatear:** `pnpm format` (Prettier 3.6)
- **Verificar formato:** `pnpm format:check`

## Backend
- API real en `http://localhost:8150` (Python)
- Proxy: `/api/**` redirigido vía `proxy.conf.json`
- Datos mock: alternar `useMockApi` en `src/environments/environment.ts`

## Arquitectura
- **Entrada:** `src/main.ts` → `src/app/app.ts` → `src/app/app.config.ts`
- **Rutas:** `src/app/app.routes.ts` (3 layouts: auth, app sidebar, blank)
- **Core:** auth, guards, interceptors, services, models, constants
- **Shared:** pipes, directivas, componentes UI, layouts
- **Features:** `general-panel`, `operations`, `monitoring`, `security` (todas lazy)
- **Patrón:** Repository pattern (`MockAgroRepository` / `ApiAgroRepository`)

## Convenciones Clave
- Prefijo de componente: `agro`
- Por defecto: SCSS + OnPush change detection (forzado vía schematics)
- Indentación de 2 espacios, comillas simples, trailing commas, 100 caracteres de ancho
- Guards/interceptors funcionales (no basados en clases)
- Angular Signals para estado (`WorkspaceStore`)
- JWT almacenado en sessionStorage (o localStorage con "recordar")

## Testing
- Vitest + jsdom (no Karma/Jasmine)
- Archivos de test: `*.spec.ts` junto al source
- Ejecutar test individual: `pnpm test -- --grep "nombre del test"`

## Puntos Clave
- `strictNullChecks: false` en tsconfig (intencional)
- Presupuestos de producción: 750kB warning / 1MB error (bundle inicial)
- Selector de directiva `agroInput`: `input[agroInput], select[agroInput], textarea[agroInput]`
- `ValidationService` mapea validadores a mensajes en español
- Pipe `validationError` es impuro (`pure: false`) — requerido para reactividad OnPush
- Notificaciones toast: `ngx-herald` — usar `{ provide: OVERLAY_DEFAULT_CONFIG, useValue: { usePopover: false } }` para arreglar z-index con MatDialog
- `WorkspaceStore` se provee a nivel de `AppLayoutComponent` (no root)
