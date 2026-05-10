import type { ReactNode } from 'react';

import { SnackbarProvider, type SnackbarProviderProps } from '@monetr/notify';

interface DemoProps extends Omit<SnackbarProviderProps, 'children'> {
  children: ReactNode;
}

export function Demo({ children, ...providerProps }: DemoProps) {
  return (
    <div
      style={{
        position: 'relative',
        padding: '24px',
        marginTop: '16px',
        marginBottom: '16px',
        border: '1px solid var(--rp-c-divider)',
        borderRadius: '12px',
        background: 'var(--rp-c-bg-soft)',
        display: 'flex',
        flexWrap: 'wrap',
        gap: '8px',
        alignItems: 'center',
        minHeight: '80px',
      }}
    >
      <SnackbarProvider {...providerProps}>{children}</SnackbarProvider>
    </div>
  );
}

interface ButtonProps {
  onClick: () => void;
  children: ReactNode;
  accent?: string;
}

export function Button({ onClick, children, accent }: ButtonProps) {
  return (
    <button
      onClick={onClick}
      style={{
        padding: '8px 14px',
        borderRadius: '8px',
        border: `1px solid ${accent ?? 'var(--rp-c-divider)'}`,
        background: 'transparent',
        color: accent ?? 'var(--rp-c-text-1)',
        cursor: 'pointer',
        fontFamily: 'inherit',
        fontSize: '13px',
        fontWeight: 600,
      }}
      type='button'
    >
      {children}
    </button>
  );
}
