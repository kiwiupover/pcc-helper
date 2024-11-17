import type { ButtonProps } from '../types';

export const ActionButton = ({ onClick, className = '', children, disabled = false }: ButtonProps) => (
  <button
    onClick={onClick}
    disabled={disabled}
    className={`rounded-md px-4 py-2 transition-colors ${disabled ? 'cursor-not-allowed opacity-50' : ''} ${className}`}>
    {children}
  </button>
);
