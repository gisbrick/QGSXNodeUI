import type { Meta, StoryObj } from "@storybook/react";
import { fn } from "@storybook/test";

/**
 * Ejemplo de story usando componentes de QGSXUI
 * 
 * Este es un ejemplo de cómo importar y usar componentes de QGSXUI
 * desde QGSXNodeUI usando el alias @qgsxui configurado.
 * 
 * Para usar componentes de QGSXUI en tus stories:
 * 1. Importa usando el alias @qgsxui o qgsxui
 * 2. Asegúrate de que los estilos CSS necesarios estén importados si es necesario
 * 3. Usa los componentes normalmente como cualquier otro componente React
 */

// Ejemplo de importación (descomentar cuando QGSXUI tenga estos componentes disponibles)
// import { Button } from '@qgsxui/components/UI/Button';
// import { Modal } from '@qgsxui/components/UI/Modal';

// Por ahora, mostramos la estructura sin importar componentes reales
// ya que necesitaríamos verificar qué componentes están disponibles

const meta = {
  title: "Examples/QGSXUI Integration",
  parameters: {
    layout: "centered",
    docs: {
      description: {
        component: "Este es un ejemplo de cómo integrar componentes de QGSXUI en QGSXNodeUI usando Storybook.",
      },
    },
  },
  tags: ["autodocs"],
} satisfies Meta;

export default meta;
type Story = StoryObj<typeof meta>;

/**
 * Ejemplo básico de uso de componentes QGSXUI
 * 
 * Cuando tengas componentes disponibles, puedes hacer algo como:
 * 
 * export const QGSXUIButton: Story = {
 *   render: () => (
 *     <Button onClick={fn()}>
 *       Botón desde QGSXUI
 *     </Button>
 *   ),
 * };
 */
export const IntegrationExample: Story = {
  render: () => (
    <div style={{ padding: '20px', textAlign: 'center' }}>
      <h3>Integración con QGSXUI</h3>
      <p>Este es un ejemplo de cómo usar componentes de QGSXUI en tus stories.</p>
      <p>
        Puedes importar componentes usando:
        <code style={{ display: 'block', marginTop: '10px', padding: '10px', background: '#f5f5f5', borderRadius: '4px' }}>
          {`import { Button } from '@qgsxui/components/UI/Button';`}
        </code>
      </p>
      <p style={{ marginTop: '20px', fontSize: '0.9em', color: '#666' }}>
        Ver README_QGSXUI_SETUP.md para más información sobre la configuración.
      </p>
    </div>
  ),
};

