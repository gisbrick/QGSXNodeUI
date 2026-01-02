/**
 * Script para copiar archivos de Leaflet desde @gisbrick/qgsx-ui a public/leaflet
 * Este script se ejecuta automáticamente después de instalar dependencias
 */

import { cpSync, existsSync, mkdirSync } from 'fs';
import { join, dirname } from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const projectRoot = join(__dirname, '..');
const qgsxuiLeafletPath = join(projectRoot, 'node_modules', '@gisbrick', 'qgsx-ui', 'public', 'leaflet');
const targetLeafletPath = join(projectRoot, 'public', 'leaflet');

try {
  // Verificar que existe la carpeta fuente
  if (!existsSync(qgsxuiLeafletPath)) {
    console.warn(`⚠️  No se encontró ${qgsxuiLeafletPath}`);
    console.warn('   Los archivos de Leaflet no se copiarán automáticamente.');
    console.warn('   Asegúrate de que @gisbrick/qgsx-ui esté instalado correctamente.');
    process.exit(0); // No es un error crítico, solo un warning
  }

  // Crear el directorio destino si no existe
  if (!existsSync(targetLeafletPath)) {
    mkdirSync(targetLeafletPath, { recursive: true });
  }

  // Copiar recursivamente todos los archivos
  cpSync(qgsxuiLeafletPath, targetLeafletPath, { recursive: true, force: true });
  
  console.log('✅ Archivos de Leaflet copiados exitosamente desde @gisbrick/qgsx-ui');
  console.log(`   Desde: ${qgsxuiLeafletPath}`);
  console.log(`   Hacia: ${targetLeafletPath}`);
} catch (error) {
  console.error('❌ Error al copiar archivos de Leaflet:', error.message);
  console.error('   Los archivos deben copiarse manualmente desde QGSXUI/public/leaflet');
  // No lanzar error para no romper npm install
  process.exit(0);
}

