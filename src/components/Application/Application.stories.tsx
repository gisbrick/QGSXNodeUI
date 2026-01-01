import type { Meta, StoryObj } from '@storybook/react';
import { Application } from './Application';

const meta: Meta<typeof Application> = {
  title: 'QGSXNodeUI/Application',
  component: Application,
  parameters: {
    layout: 'fullscreen',
  },
  tags: ['autodocs'],
};

export default meta;
type Story = StoryObj<typeof Application>;

const sampleConfig = [
  {
    type: 'PARENT',
    key: 'view-1',
    title: 'Vista Principal',
    children: [
      {
        type: 'LEAF',
        key: 'content-map',
        title: 'Mapa Principal',
        component: 'Map',
        qgsProject: 'project.qgz',
      },
      {
        type: 'LEAF',
        key: 'content-table',
        title: 'Tabla de Datos',
        component: 'Table',
        qgsProject: 'project.qgz',
      },
    ],
  },
  {
    type: 'PARENT',
    key: 'view-2',
    title: 'Vista Secundaria',
    permission: 'view_secondary',
    children: [
      {
        type: 'LEAF',
        key: 'content-chart',
        title: 'Gráficos',
        component: 'Chart',
        qgsProject: 'project.qgz',
      },
    ],
  },
  {
    type: 'LEAF',
    key: 'content-direct',
    title: 'Contenido Directo',
    component: 'Map',
    qgsProject: 'project.qgz',
  },
];

export const Default: Story = {
  args: {
    idApp: 1,
    appName: 'Aplicación de Ejemplo',
    description: 'Esta es una aplicación de ejemplo para demostrar la funcionalidad',
    config: sampleConfig,
    lang: 'es',
    onContentSelect: (content) => {
      console.log('Contenido seleccionado:', content);
    },
  },
};

export const WithThumbnail: Story = {
  args: {
    idApp: 2,
    appName: 'Aplicación con Thumbnail',
    description: 'Aplicación que incluye una imagen thumbnail',
    thumbnail: 'https://via.placeholder.com/150',
    config: sampleConfig,
    lang: 'es',
  },
};

export const WithPermission: Story = {
  args: {
    idApp: 3,
    appName: 'Aplicación con Permisos',
    description: 'Aplicación que requiere permisos para acceder',
    config: sampleConfig,
    token: 'sample-token',
    lang: 'es',
  },
};

