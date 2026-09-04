# AgroPredict

Frontend de planificación agrícola construido con **Angular 22.1**, componentes standalone, Signals, Router, Angular Material y SCSS. Interfaz en español con tema claro/oscuro y diseño adaptable. **El login está conectado a la API existente. Los módulos agrícolas, sensores y predicciones siguen usando datos simulados; este repositorio no implementa el backend.**

## Inicio rápido

### Requisitos

- Node.js 24.15 o una versión compatible con Angular 22.
- pnpm 11.19.0. El proyecto declara esta versión en `package.json`.
- Para el login real: backend Python ejecutándose en `http://localhost:8150`.

Comprueba las herramientas:

```sh
node --version
pnpm --version
```

### Instalar y ejecutar el frontend

```sh
git clone https://github.com/Takashi-Vasquez/agro-predict-frontend.git
cd agro-predict-frontend
pnpm install
pnpm start
```

Abre `http://127.0.0.1:4200`. Para ingresar con una cuenta real, inicia antes la API en `http://localhost:8150`. También puedes usar **Explorar con datos demo**: crea una sesión temporal local, no envía credenciales y no genera un token de API. El frontend nunca guarda contraseñas ni incluye usuarios o tokens reales precargados.

No es necesario crear un archivo `.env` para ejecutar el frontend actual. La URL base y el modo de datos se configuran en `src/environments/environment.ts`; nunca guardes claves privadas allí porque todo archivo Angular termina siendo visible en el navegador.

### Comandos disponibles

```sh
pnpm build        # salida: dist/agro-predict/browser
pnpm test         # pruebas unitarias y de integración Angular con Vitest + jsdom
pnpm watch        # compilación de desarrollo en modo watch
```

Versiones compatibles: [documentación de Angular](https://angular.dev/reference/versions). El lockfile fija las versiones instaladas. La fuente Inter se sirve localmente. El login sí necesita la API disponible.

### Backend mínimo requerido para el login

Este repositorio no contiene el backend. El servicio Python debe exponer:

```http
POST http://localhost:8150/api/v1/auth/login
Content-Type: application/json
```

Petición:

```json
{
  "email": "usuario@empresa.com",
  "password": "contraseña-del-usuario"
}
```

Respuesta exitosa:

```json
{
  "access_token": "jwt-firmado-y-vigente",
  "token_type": "bearer"
}
```

El JWT debe contener una expiración `exp` válida. Las credenciales del ejemplo son marcadores y no deben copiarse como usuarios reales ni incorporarse al repositorio.

## Login conectado

- `POST /api/v1/auth/login` envía JSON con **solo** `email` y `password`.
- `proxy.conf.json` reenvía `/api/**` a `http://localhost:8150` durante `pnpm start`, para que el navegador use su mismo origen sin requerir CORS en desarrollo. Reinicia el servidor Angular si modificas el proxy.
- Respuesta esperada: `access_token` (JWT con `exp`) y `token_type: "bearer"`. Se rechazan respuestas incompletas, tipos de token no soportados y tokens vencidos o sin expiración válida.
- El correo es obligatorio, se recortan sus espacios externos y se valida formato/longitud (254 caracteres). La contraseña es obligatoria y no acepta solo espacios; **no se recorta, convierte ni se le imponen reglas nuevas de complejidad o longitud mínima**. OpenAPI del backend no define esas reglas para iniciar sesión.
- El formulario bloquea envíos duplicados, muestra carga y errores accesibles, cancela la petición al abandonar la pantalla y aplica un timeout de 15 segundos. Maneja desconexión, 400/401, 403, 422, 429, errores del servidor y respuesta inválida. Los errores 422 con `detail[].loc` se asocian a los campos conocidos; no se muestran trazas internas.
- Después del éxito se limpia el campo contraseña y se vuelve a una ruta interna válida de `returnUrl`, o al dashboard.
- `authInterceptor` añade `Authorization: Bearer <token>` **solo a la API configurada**, nunca a otros orígenes, recursos estáticos o al propio login. Un 401 de la sesión actual la cierra; un 403 no la destruye. Una respuesta 401 tardía de una sesión antigua no invalida la nueva.
- Los guards verifican la vigencia local del JWT y el vencimiento devuelve al login. **Decodificar `exp` no verifica firmas ni permisos**: eso corresponde al backend en cada endpoint protegido.
- No se inventaron endpoints de refresh, recuperación, perfil o cierre de sesión. «Olvidé mi contraseña» informa que debe contactarse al administrador. Cerrar sesión elimina el token local; no revoca un JWT ya emitido en el servidor.
- El login no devuelve perfil ni roles. Se usa la parte local del correo como nombre inicial, con rol «No informado». Nombre y foto son preferencias locales; el correo de acceso queda de solo lectura.

### Almacenamiento y seguridad

Por defecto el token vive en `sessionStorage` y se elimina al cerrar la pestaña. Con **Recordarme** se usa `localStorage` hasta que expire el JWT o se cierre sesión. Nunca se persiste la contraseña. El acceso demo actual dura como máximo ocho horas, sólo vive en `sessionStorage` y nunca se adjunta como Bearer; las identidades del formato demo antiguo se descartan.

Ambos almacenes son accesibles a JavaScript y, por tanto, a un XSS. Esta solución respeta el contrato Bearer actual; para una sesión más robusta en producción, acordar con el backend cookies `HttpOnly`/`Secure`/`SameSite` y protección CSRF, o acceso en memoria con refresh seguro. Usar HTTPS, CSP y evitar código de terceros no confiable. No usar «Recordarme» en equipos compartidos. El HTTP de esta configuración es **solo para desarrollo local**.

El proxy de Angular **no forma parte del build de producción**: configurar un reverse proxy del despliegue para `/api` o ajustar `environment.apiUrl` a una API HTTPS con CORS permitido para el origen exacto del frontend. No incluir credenciales ni secretos en los archivos de configuración.

## Arquitectura: pocas capas, responsabilidades claras

```text
src/
  app/
    core/
      data/          # fixtures centralizados
      models/        # contratos tipados del dominio
      services/      # sesión JWT, preferencias, tema, repositorio y estado
      guards/        # acceso y redirección de invitados
      interceptors/  # Bearer acotado a la API y manejo de errores HTTP
    shared/
      ui/            # botones, inputs, tarjetas, tablas, gráficos y diálogos
      utils/         # exportación CSV segura
    layout/          # sidebar, drawer móvil, topbar y navegación
    features/
      auth/          # login y recuperación informativa
      dashboard/
      planning/
      predictions/
      plots/
      crops/
      weather/
      sensors/
      history/
      reports/
      settings/
      profile/
      not-found/
    app.routes.ts    # rutas con lazy loading
    app.config.ts    # proveedores globales
  environments/      # configuración de integración
  styles.scss        # tokens, tema Material y estilos compartidos
```

Las pantallas consumen `WorkspaceStore`. El store usa `AgroRepository`; `MockAgroRepository` devuelve fixtures y `ApiAgroRepository` deja preparado el acceso HTTP. El login usa `AuthService` y la API real independientemente de `useMockApi`. No hay NgModules, NgRx ni capas de casos de uso innecesarias. Los componentes usan `OnPush`; Signals mantiene sincronizados los datos derivados. El store pertenece al layout: se destruye al cerrar sesión y no comparte cambios de datos entre cuentas.

## Funcionalidad incluida

- Login conectado y validado, mostrar/ocultar contraseña, recordar sesión hasta el vencimiento del JWT y cerrar sesión con confirmación.
- Sidebar colapsable, drawer móvil con captura de foco, búsqueda de páginas, breadcrumbs, menús y notificaciones de muestra.
- Dashboard orientado al modelo: registros históricos, predicciones, cumplimiento de metas, brechas, R² demo, gráficos comparativos y alertas accionables.
- Registro de parcelas; búsqueda y filtros por estado.
- Creación y eliminación confirmada de planes, con validación de fechas.
- Flujo predictivo demostrable: captura de campañas históricas, reentrenamiento local, predicción individual y procesamiento masivo de hasta 20 escenarios.
- Variables de suelo, temperatura, humedad, pH, nitrógeno, precipitación y meta; el resultado muestra rendimiento, producción total, brecha y sugerencias ilustrativas.
- Datos de arándano, espárrago, palta, caña de azúcar, arroz y uva en zonas de La Libertad; catálogo, clima y sensores continúan como demostración.
- Historial filtrable, paginación y exportación CSV con protección frente a fórmulas inyectadas.
- Reportes CSV de parcelas, predicciones y planes, con vista previa.
- Tema persistente, preferencias locales, edición de perfil y foto local de hasta 2 MB.
- Estados de carga, vacío, error, reintento y página no encontrada.

## Qué se conserva y qué no

- Parcelas nuevas, planes y simulaciones: **solo en memoria durante la sesión**, se reinician al recargar o cerrar sesión.
- Token de acceso: `sessionStorage`; con «Recordarme», `localStorage`, siempre limitado por `exp`. Ver las consideraciones de seguridad anteriores.
- Tema y preferencias: `localStorage`. Si el navegador bloquea almacenamiento, la app sigue funcionando en memoria.
- Foto de perfil: vista previa en memoria, nunca se sube ni persiste.
- Clima y sensores: datos estáticos fechados como demostración, no información meteorológica actual.
- Las cifras de R², error, confianza, rendimiento y recomendaciones son ilustrativas: no provienen de un modelo entrenado real ni constituyen asesoría agronómica.

## Conectar los demás módulos a la API

1. Definir contratos reales a partir de `core/models/agro.models.ts`. El adaptador actual propone `GET /api/v1/workspace`, que devuelve `WorkspaceData` completo; ajustar el adaptador si el backend ofrece recursos separados.
2. Configurar `apiUrl` en `src/environments/environment.ts`; no guardar secretos en el frontend.
3. Implementar las operaciones reales de lectura/escritura en el repositorio. Hoy las escrituras son locales y se bloquean cuando `useMockApi` es falso para evitar aparentar que se guardaron en el servidor.
4. Mantener la autenticación conectada e implementar en el servidor validación de firmas, sesiones y permisos para cada operación. Añadir endpoints de perfil, recuperación, renovación o revocación únicamente cuando exista un contrato real.
5. Reemplazar la fórmula demo por contratos separados para datasets históricos, entrenamiento/versionado del modelo, predicción individual, predicción masiva y publicación controlada de versiones. Mantener validación de respuestas, cancelación, paginación y políticas de error según cada endpoint.
6. Activar `useMockApi: false` después de verificar la integración completa.

## Verificación y producción

La compilación usa TypeScript estricto y `strictTemplates`. Los tests cubren contrato HTTP, validaciones del login, manejo de errores y timeout, persistencia y expiración de sesión, alcance del Bearer, guards/rutas, renderizado de todas las pantallas, estado compartido, planes, simulación y exportación. Las pruebas jsdom **no sustituyen una revisión visual/E2E en navegadores y dispositivos reales**.

El frontend puede compilarse para producción, pero la integración agrícola sigue pendiente de persistencia, permisos verificados en servidor, modelo validado, monitoreo y auditoría de seguridad/accesibilidad. Antes de desplegar, configurar el reverse proxy/API HTTPS, fallback de las rutas de la SPA a `index.html` y caché inmutable para archivos con hash.

## Solución de problemas

- **`pnpm` no existe:** instala o activa pnpm 11 y vuelve a ejecutar `pnpm install`.
- **El puerto 4200 está ocupado:** ejecuta `pnpm exec ng serve --host 127.0.0.1 --port 4201` y abre el nuevo puerto.
- **El login muestra un error de conexión:** comprueba que la API responda en el puerto 8150 y reinicia `pnpm start` después de cambiar `proxy.conf.json`.
- **Una ruta devuelve 404 al recargar en producción:** configura el servidor web para devolver `index.html` como fallback de la SPA.
- **Cambios de API no aparecen:** revisa `src/environments/environment.ts`, el prefijo `/api/v1` y el reverse proxy del entorno; `proxy.conf.json` sólo se usa en desarrollo.
- **La instalación no coincide con otra máquina:** usa el `pnpm-lock.yaml` versionado y evita instalar con otro gestor de paquetes.

## Archivos que no se versionan

`.gitignore` excluye dependencias, builds, cachés, cobertura, archivos de entorno, configuraciones del editor y documentación administrada por separado (`docs/`, manuales Word/PDF y sus renders). El único documento operativo versionado es este `README.md`.
