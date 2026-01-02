/**
 * Componente Input simple usando estilos de QGSXUI
 */

import React from 'react';
import '@qgsxui/components/UI/ui.css';

export interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  error?: string;
  helperText?: string;
}

/**
 * Componente Input que usa los estilos de QGSXUI
 */
export const Input: React.FC<InputProps> = ({
  label,
  error,
  helperText,
  className = '',
  ...props
}) => {
  const inputClasses = [
    'ui-input',
    error && 'ui-input--error',
    className,
  ].filter(Boolean).join(' ');

  return (
    <div style={{ marginBottom: '1rem' }}>
      {label && (
        <label
          style={{
            display: 'block',
            marginBottom: '0.5rem',
            fontSize: '0.875rem',
            fontWeight: 500,
            color: 'var(--color-text-primary)',
          }}
        >
          {label}
          {props.required && <span style={{ color: 'var(--color-error)', marginLeft: '0.25rem' }}>*</span>}
        </label>
      )}
      <input
        className={inputClasses}
        {...props}
      />
      {error && (
        <div
          style={{
            marginTop: '0.25rem',
            fontSize: '0.75rem',
            color: 'var(--color-error)',
          }}
        >
          {error}
        </div>
      )}
      {helperText && !error && (
        <div
          style={{
            marginTop: '0.25rem',
            fontSize: '0.75rem',
            color: 'var(--color-text-secondary)',
          }}
        >
          {helperText}
        </div>
      )}
    </div>
  );
};

export default Input;

