import { createContext, useContext } from 'react';

import type { ProviderContext } from './types';

export const SnackbarContext = createContext<ProviderContext | null>(null);

export function useSnackbarContext(): ProviderContext {
  const ctx = useContext(SnackbarContext);
  if (ctx === null) {
    throw new Error('useSnackbar must be used within a <SnackbarProvider>.');
  }
  return ctx;
}
