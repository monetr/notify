// Public barrel. Intentionally does NOT import './style.css' — CSS is colocated with the lazy
// renderer chunk so consumers who import the provider but never enqueue a notification pay no CSS
// download cost. See src/renderer.ts.

export { useSnackbar } from './hook';
export { SnackbarProvider } from './provider';
export type {
  AnchorOrigin,
  CloseReason,
  OptionsObject,
  ProviderContext,
  SnackbarKey,
  SnackbarMessage,
  SnackbarProviderProps,
  VariantType,
} from './types';
