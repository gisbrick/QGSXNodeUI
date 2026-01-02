/**
 * Stories para componentes de administración
 * Usa los componentes CRUD unificados que combinan crear, listar, editar y eliminar
 */

import type { Meta, StoryObj } from '@storybook/react';
import React from 'react';
import { AdministratorCRUD } from './AdministratorCRUD';
import { UnitCRUD } from './UnitCRUD';
import { UnitManagerCRUD } from './UnitManagerCRUD';
import { useTranslation } from 'react-i18next';

const meta = {
  title: 'QGSXNodeUI_ADMIN/Administration Components',
  parameters: {
    layout: 'padded',
    docs: {
      description: {
        component: 'Componentes de administración que requieren permisos de administrador. Usa el token TEST_ADMIN para probar.',
      },
    },
  },
  tags: ['autodocs'],
  argTypes: {
    token: {
      control: 'text',
      description: 'Token de autenticación (usa TEST_ADMIN para administrador)',
      table: {
        category: 'Authentication'
      }
    },
    lang: {
      control: 'select',
      options: ['es', 'en'],
      description: 'Idioma de la interfaz',
      table: {
        category: 'Localization'
      }
    },
  },
} satisfies Meta;

export default meta;
type Story = StoryObj<typeof meta>;

/**
 * Story para el componente CRUD de administradores
 */
export const AdministratorCRUDStory: Story = {
  args: {
    token: 'TEST_ADMIN',
    lang: 'es',
  },
  render: (args) => <AdministratorCRUD {...args} />,
};

/**
 * Story para el componente CRUD de unidades
 */
export const UnitCRUDStory: Story = {
  args: {
    token: 'TEST_ADMIN',
    lang: 'es',
  },
  render: (args) => <UnitCRUD {...args} />,
};

/**
 * Story para el componente CRUD de gestores de unidades
 */
export const UnitManagerCRUDStory: Story = {
  args: {
    token: 'TEST_ADMIN',
    lang: 'es',
  },
  render: (args) => <UnitManagerCRUD {...args} />,
};

/**
 * Story combinada mostrando todos los componentes CRUD
 */
export const AllCRUDComponents: Story = {
  args: {
    token: 'TEST_ADMIN',
    lang: 'es',
  },
  render: (args) => (
    <div style={{ padding: '2rem', display: 'flex', flexDirection: 'column', gap: '3rem' }}>
      <AdministratorCRUD {...args} />
      <UnitCRUD {...args} />
      <UnitManagerCRUD {...args} />
    </div>
  ),
};

/**
 * Story mostrando el mensaje de error cuando no hay permisos
 */
export const NoPermissionMessage: Story = {
  args: {
    token: 'TEST_USER', // Usuario sin permisos de administrador
    lang: 'es',
  },
  render: (args) => (
    <div style={{ padding: '2rem' }}>
      <AdministratorCRUD {...args} />
    </div>
  ),
};

