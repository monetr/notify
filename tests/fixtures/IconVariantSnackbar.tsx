import type { ReactNode } from 'react';

import { SnackbarProvider, useSnackbar } from '../../src';
import type { VariantType } from '../../src/types';

const ICONS: Partial<Record<VariantType, ReactNode>> = {
  success: <span data-testid='icon-success'>✓</span>,
  error: <span data-testid='icon-error'>!</span>,
  warning: <span data-testid='icon-warning'>⚠</span>,
};

function Inner() {
  const { enqueueSnackbar } = useSnackbar();
  return (
    <div data-fixture-page=''>
      <button
        data-testid='enqueue-success'
        onClick={() => enqueueSnackbar('Saved', { variant: 'success', persist: true })}
        type='button'
      >
        Success with icon
      </button>
      <button
        data-testid='enqueue-error'
        onClick={() => enqueueSnackbar('Failed', { variant: 'error', persist: true })}
        type='button'
      >
        Error with icon
      </button>
    </div>
  );
}

export function IconVariantSnackbar() {
  return (
    <SnackbarProvider iconVariant={ICONS}>
      <Inner />
    </SnackbarProvider>
  );
}
