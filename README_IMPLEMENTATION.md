# Documentación de Implementación - QGSXNodeUI y QGSXNodSrv

## Resumen

Este documento describe la implementación del sistema de indexación de contenido basado en componentes QGSXUI, incluyendo tanto el frontend (QGSXNodeUI) como el backend (QGSXNodSrv).

## Arquitectura General

### Componentes del Sistema

1. **QGSXNodSrv** - Backend Node.js con SQLite
   - API REST para gestión de aplicaciones, unidades, permisos
   - Integración con servicios externos de seguridad
   - Persistencia en SQLite

2. **QGSXNodeUI** - Frontend Storybook con componentes React
   - Componentes para mostrar aplicaciones, vistas y contenidos
   - Integración con componentes QGSXUI (Map, Table, Charts)
   - Sistema de navegación y menús

3. **QGSXSecuritySrv** (Futuro) - Servicio de seguridad externo
   - Validación de tokens
   - Gestión de usuarios, roles y permisos
   - Endpoints definidos en `QGSXNodSrv/src/config/README_SECURITY_ENDPOINTS.md`

## Base de Datos (SQLite)

### Esquema

El esquema completo está definido en `QGSXNodSrv/database/schema.sql`. Las tablas principales son:

- **units** - Unidades de gestión
- **applications** - Aplicaciones con configuración JSON
- **permissions** - Permisos (referencia local)
- **roles** - Roles (referencia local)
- **role_permissions** - Relación roles-permisos
- **general_params** - Parámetros generales del sistema

### Estructura del Campo `config` en Applications

El campo `config` almacena un JSON con estructura de árbol:

```json
[
  {
    "type": "PARENT",
    "key": "view-1",
    "title": "Vista Principal",
    "permission": "optional-permission",
    "children": [
      {
        "type": "LEAF",
        "key": "content-1",
        "title": "Mapa Principal",
        "component": "Map",
        "qgsProject": "project.qgz",
        "permission": null
      }
    ]
  }
]
```

- **PARENT**: Representa vistas/menús que contienen otros elementos
- **LEAF**: Representa contenidos específicos (mapas, tablas, gráficos, etc.)

## Backend (QGSXNodSrv)

### Estructura del Proyecto

```
QGSXNodSrv/
├── database/
│   └── schema.sql          # Esquema de base de datos
├── src/
│   ├── config/
│   │   ├── config.js       # Configuración principal
│   │   └── README_SECURITY_ENDPOINTS.md
│   ├── controllers/
│   │   ├── appController.js
│   │   └── unitController.js
│   ├── middleware/
│   │   └── auth.js         # Middleware de autenticación
│   ├── repositories/
│   │   ├── applicationRepository.js
│   │   └── unitRepository.js
│   ├── services/
│   │   └── securityService.js  # Servicio de seguridad externo
│   ├── database/
│   │   └── database.js     # Gestión de SQLite
│   ├── routes/
│   │   ├── applications.js
│   │   └── units.js
│   ├── utils/
│   │   └── logger.js
│   └── server.js           # Servidor principal
└── package.json
```

### API Endpoints

#### Aplicaciones

- `GET /api/v1/app/list/:lang` - Lista aplicaciones accesibles
- `GET /api/v1/app/init/:idUnit/:lang` - Lista aplicaciones de una unidad
- `GET /api/v1/app/list/manager/:idUnit` - Lista aplicaciones para gestor
- `GET /api/v1/app/:idApp` - Obtiene una aplicación
- `POST /api/v1/app` - Crea una aplicación (requiere gestor/admin)
- `PUT /api/v1/app/:idApp` - Actualiza una aplicación (requiere gestor/admin)
- `DELETE /api/v1/app/:idApp` - Elimina una aplicación (requiere gestor/admin)

#### Unidades

- `GET /api/v1/unit` - Lista todas las unidades
- `GET /api/v1/unit/:idUnit` - Obtiene una unidad
- `POST /api/v1/unit` - Crea una unidad (requiere admin)
- `PUT /api/v1/unit/:idUnit` - Actualiza una unidad (requiere admin)
- `DELETE /api/v1/unit/:idUnit` - Elimina una unidad (requiere admin)

### Sistema de Seguridad

Todos los endpoints que requieren autenticación esperan un header:
```
Authorization: Bearer {token}
```

El token se valida contra servicios externos de seguridad configurados en `config.js`.

#### Roles y Permisos

- **Usuario anónimo**: Acceso a contenido público (sin permiso requerido)
- **Usuario registrado**: Acceso a público + contenido con permisos que tenga
- **Usuario gestor**: Puede crear contenido para sus unidades, crear/asignar permisos
- **Usuario administrador**: Puede crear unidades, asignar gestores, crear administradores
- **Superadministrador**: Usuario hardcodeado en config (por defecto: 'admin')

## Frontend (QGSXNodeUI)

### Estructura del Proyecto

```
QGSXNodeUI/
├── src/
│   ├── components/
│   │   ├── Application/
│   │   │   ├── Application.tsx
│   │   │   └── Application.stories.tsx
│   │   ├── ApplicationList/
│   │   │   ├── ApplicationList.tsx
│   │   │   └── ApplicationList.stories.tsx
│   │   └── Content/
│   │       └── Content.tsx
│   ├── config/
│   │   └── qgsxui-reference.js
│   ├── hooks/
│   ├── locales/
│   ├── utils/
│   └── stories/
└── package.json
```

### Componentes Principales

#### ApplicationList

Lista las aplicaciones disponibles. Se conecta al backend para obtener la lista según permisos del usuario.

**Props:**
- `token?: string` - Token de autenticación
- `lang?: string` - Idioma (default: 'es')
- `apiBaseUrl?: string` - URL base de la API
- `onApplicationSelect?: (app: Application) => void` - Callback al seleccionar

#### Application

Muestra una aplicación con menú de navegación de vistas/contenidos.

**Props:**
- `token?: string` - Token de autenticación
- `idApp: number` - ID de la aplicación
- `appName: string` - Nombre de la aplicación
- `description?: string` - Descripción
- `thumbnail?: string` - Imagen thumbnail
- `config: ApplicationConfigItem[]` - Configuración JSON
- `lang?: string` - Idioma
- `onContentSelect?: (content: ApplicationConfigItem) => void` - Callback al seleccionar contenido
- `apiBaseUrl?: string` - URL base de la API

#### Content

Renderiza diferentes tipos de contenido basado en componentes QGSXUI.

**Props:**
- `contentType: string` - Tipo: 'Map', 'Table', 'Chart', 'HTML'
- `config: any` - Configuración del contenido
- `token?: string` - Token de autenticación
- `lang?: string` - Idioma

### Integración con QGSXUI

Los componentes utilizan componentes de QGSXUI:

- **Map**: `@qgsxui/components/QGS/Map`
- **Table**: `@qgsxui/components/QGS/Table`
- **Charts**: `@qgsxui/components/QGS/Charts`
- **UI Components**: `@qgsxui/components/UI/*`

La referencia se configura mediante alias en `vite.config.ts` y `tsconfig.app.json`.

## Instalación y Configuración

### QGSXNodSrv

1. Instalar dependencias:
```bash
cd QGSXNodSrv
npm install
```

2. Configurar variables de entorno (opcional, crear `.env`):
```env
PORT=3001
HOST=localhost
DATABASE_PATH=./database/qgsxnode.db
SUPERADMIN_USER=admin
SECURITY_VALIDATE_TOKEN_URL=http://localhost:3002/api/security/validate-token
SECURITY_CHECK_ADMIN_URL=http://localhost:3002/api/security/check-admin
SECURITY_CHECK_MANAGER_URL=http://localhost:3002/api/security/check-manager
SECURITY_GET_MANAGED_UNITS_URL=http://localhost:3002/api/security/managed-units
SECURITY_CHECK_PERMISSION_URL=http://localhost:3002/api/security/check-permission
SECURITY_GET_USER_INFO_URL=http://localhost:3002/api/security/user-info
```

3. Inicializar base de datos:
```bash
npm run init-db
```

4. Iniciar servidor:
```bash
npm start
# o para desarrollo con watch
npm run dev
```

### QGSXNodeUI

1. Instalar dependencias:
```bash
cd QGSXNodeUI
yarn install
```

2. Asegurarse de que QGSXUI esté disponible en `../QGSXUI/src`

3. Iniciar Storybook:
```bash
yarn storybook
```

## Uso

### Crear una Unidad

```bash
curl -X POST http://localhost:3001/api/v1/unit \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer {admin-token}" \
  -d '{
    "unit_name": "Unidad de Ejemplo",
    "description": "Descripción de la unidad",
    "path": "/ejemplo"
  }'
```

### Crear una Aplicación

```bash
curl -X POST http://localhost:3001/api/v1/app \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer {token}" \
  -d '{
    "id_unt": 1,
    "app_name": "Aplicación de Ejemplo",
    "description": "Descripción",
    "config": [
      {
        "type": "LEAF",
        "key": "content-1",
        "title": "Mapa Principal",
        "component": "Map",
        "qgsProject": "project.qgz"
      }
    ],
    "lang": "es",
    "is_published": true
  }'
```

### Listar Aplicaciones

```bash
curl http://localhost:3001/api/v1/app/list/es
# Con autenticación
curl http://localhost:3001/api/v1/app/list/es \
  -H "Authorization: Bearer {token}"
```

## Desarrollo Futuro

### Próximos Pasos

1. **QGSXSecuritySrv**: Implementar el servicio de seguridad externo
2. **Componentes adicionales**: Expandir componentes de contenido
3. **Permisos**: Implementar gestión completa de permisos y roles
4. **Tests**: Añadir tests unitarios e integración
5. **Documentación**: Ampliar documentación de API con Swagger/OpenAPI

## Notas Importantes

1. **Seguridad**: Actualmente la validación de permisos se hace contra servicios externos. Hasta que QGSXSecuritySrv esté implementado, se pueden usar mocks o servicios de prueba.

2. **Base de Datos**: SQLite es adecuado para desarrollo y pequeñas instalaciones. Para producción, considerar migración a PostgreSQL.

3. **Componentes QGSXUI**: Los componentes deben estar disponibles localmente o mediante el alias configurado. En el futuro se importarán desde un paquete npm/GIT.

4. **Tokens**: Los tokens JWT deben ser emitidos por el servicio de seguridad. QGSXNodSrv solo los valida.

## Contacto y Soporte

Para más información, consultar:
- `QGSXNodSrv/src/config/README_SECURITY_ENDPOINTS.md` - Endpoints de seguridad
- `QGSXNodeUI/README_QGSXUI_SETUP.md` - Configuración de QGSXUI

