# Configuración de QGSXUI en QGSXNodeUI

Este documento explica cómo está configurado QGSXNodeUI para utilizar componentes de QGSXUI.

## Estructura Actual

QGSXNodeUI está configurado para trabajar con una estructura similar a QGSXUI a nivel de gestión, logs, traducciones, etc.

### Directorios Creados

- `src/config/` - Configuraciones centralizadas (app, languages, qgsxui-reference)
- `src/utils/` - Utilidades (logger.js)
- `src/hooks/` - Hooks personalizados (preparado para futuros hooks)
- `src/locales/` - Archivos de traducción (es, en)

## Sistema de Referencia a QGSXUI

### Estado Actual: Referencia Local

Actualmente, QGSXUI se referencia desde el directorio local usando alias en:

1. **vite.config.ts**: Alias `@qgsxui` y `qgsxui` que apuntan a `../QGSXUI/src`
2. **tsconfig.app.json**: Path mapping para TypeScript
3. **.storybook/main.ts**: Configuración de viteFinal para incluir los alias en Storybook

### Uso de Componentes de QGSXUI

Puedes importar componentes de QGSXUI de las siguientes maneras:

```typescript
// Usando el alias @qgsxui
import { Button } from '@qgsxui/components/UI/Button';
import { Modal } from '@qgsxui/components/UI/Modal';

// O usando el alias más corto
import { Button } from 'qgsxui/components/UI/Button';

// También puedes importar desde los index.js exportados
import { Button, Modal } from '@qgsxui/components/UI';
import { Form, Map } from '@qgsxui/components/QGS';
```

### Migración Futura a Paquete desde GIT

Para cambiar a un paquete instalado desde GIT/npm:

1. **Instalar el paquete**:
   ```bash
   yarn add @gisbrick/qgsxui
   # O desde GIT:
   yarn add git+https://github.com/tu-org/qgsxui.git
   ```

2. **Actualizar configuración**:
   - Editar `src/config/qgsxui-reference.js` y cambiar `USE_LOCAL_REFERENCE` a `false`
   - Actualizar `PACKAGE_NAME` con el nombre correcto del paquete
   - Opcionalmente, remover o comentar los alias en `vite.config.ts` y `tsconfig.app.json`

3. **Actualizar imports** (si es necesario):
   Los imports seguirán funcionando si el paquete exporta desde los mismos paths, o puedes actualizar a:
   ```typescript
   import { Button } from '@gisbrick/qgsxui/components/UI/Button';
   ```

## Sistema de Logging

El proyecto incluye un sistema de logging similar a QGSXUI:

```typescript
import { createLogger } from '../utils/logger';

const log = createLogger('MyComponent');

log.info('Información');
log.debug('Debug detallado', { data: 'value' });
log.warn('Advertencia');
log.error('Error', error);
```

## Sistema de Traducciones

El proyecto usa i18next para traducciones, igual que QGSXUI:

```typescript
import { useTranslation } from 'react-i18next';

function MyComponent() {
  const { t } = useTranslation();
  return <div>{t('ui.common.ok')}</div>;
}
```

Los archivos de traducción están en:
- `src/locales/es/translation.json`
- `src/locales/en/translation.json`

## Storybook

Storybook está configurado para:
- Usar los alias de QGSXUI (a través de viteFinal)
- Inicializar i18n automáticamente (en `.storybook/preview.ts`)
- Importar componentes de QGSXUI en las stories

Ejemplo de story usando componentes de QGSXUI:

```typescript
import type { Meta, StoryObj } from '@storybook/react';
import { Button } from '@qgsxui/components/UI';

const meta: Meta<typeof Button> = {
  component: Button,
};

export default meta;
type Story = StoryObj<typeof Button>;

export const Primary: Story = {
  args: {
    children: 'Click me',
  },
};
```

## Archivos Estáticos de Leaflet

Los componentes QGS de QGSXUI (Map, Table, etc.) requieren archivos estáticos de Leaflet que deben estar disponibles en `public/leaflet/`.

**Copia Automática**: Un script `postinstall` copia automáticamente los archivos de Leaflet desde `@gisbrick/qgsx-ui/public/leaflet` a `public/leaflet` cada vez que se instalan las dependencias.

Si necesitas copiar los archivos manualmente:

1. Copia la carpeta `node_modules/@gisbrick/qgsx-ui/public/leaflet` a `public/leaflet`
2. O ejecuta el script manualmente: `node scripts/copy-leaflet.js`

**Importante**: Los archivos de Leaflet se cargan como scripts estáticos (no módulos npm), por lo que deben estar en `public/` para ser servidos correctamente por el servidor de desarrollo o el build de producción.

## Configuración de CORS y API

### Desarrollo

En desarrollo, se usa un **proxy de Vite/Storybook** para evitar problemas de CORS:

- **Vite dev server**: Las peticiones a `/api/*` se redirigen automáticamente a `http://localhost:3001`
- **Storybook**: Configurado en `.storybook/main.ts` con el mismo proxy

No es necesario configurar CORS en desarrollo cuando se usa el proxy.

### Producción

En producción, debes configurar:

1. **Variable de entorno** `VITE_API_BASE_URL` con la URL completa del backend
2. **CORS en el backend** (`QGSXNodSrv`) configurando `CORS_ORIGIN` con el dominio de producción

Ver `QGSXNodSrv/README_CORS.md` para más detalles sobre configuración de CORS.

## Notas Importantes

1. **Dependencias**: Asegúrate de que QGSXUI tenga todas sus dependencias instaladas antes de usar sus componentes en QGSXNodeUI.

2. **Tipos TypeScript**: Si QGSXUI usa TypeScript, los tipos deberían resolverse automáticamente. Si hay problemas, puedes necesitar configurar `tsconfig.json` para incluir los tipos.

3. **Estilos CSS**: Si los componentes de QGSXUI tienen estilos CSS, asegúrate de importarlos o incluirlos en tu configuración de Storybook/Vite.

4. **Compatibilidad de Versiones**: Mantén las versiones de React y otras dependencias compartidas sincronizadas entre QGSXUI y QGSXNodeUI.

5. **CORS**: En desarrollo, el proxy maneja CORS automáticamente. En producción, configura CORS correctamente en el backend.

