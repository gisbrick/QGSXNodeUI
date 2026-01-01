import type { Meta, StoryObj } from '@storybook/react';
import { ApplicationList } from './ApplicationList';

const meta: Meta<typeof ApplicationList> = {
  title: 'QGSXNodeUI/ApplicationList',
  component: ApplicationList,
  parameters: {
    layout: 'fullscreen',
  },
  tags: ['autodocs'],
};

export default meta;
type Story = StoryObj<typeof ApplicationList>;

export const Default: Story = {
  args: {
    lang: 'es',
    onApplicationSelect: (app) => {
      console.log('Aplicación seleccionada:', app);
    },
  },
};

export const WithToken: Story = {
  args: {
    token: 'sample-token',
    lang: 'es',
  },
};

