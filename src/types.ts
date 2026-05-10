import type { ReactNode, SyntheticEvent } from 'react';

export type VariantType = 'default' | 'success' | 'error' | 'warning' | 'info';

export type SnackbarKey = string | number;

export type SnackbarMessage = ReactNode;

export interface AnchorOrigin {
  vertical: 'top' | 'bottom';
  horizontal: 'left' | 'center' | 'right';
}

export type CloseReason = 'timeout' | 'instructed' | 'maxsnack' | 'clickaway' | 'swipe';

export interface OptionsObject {
  key?: SnackbarKey;
  variant?: VariantType;
  /** Shorthand for `autoHideDuration: null`. */
  persist?: boolean;
  /** Auto-hide duration in ms. `null` or `0` disables auto-hide; `undefined` inherits the provider default. */
  autoHideDuration?: number | null;
  anchorOrigin?: AnchorOrigin;
  /** When `true`, this item ignores window-blur events. */
  disableWindowBlurListener?: boolean;
  /** Action button. A node, or a render fn that receives the snackbar key. */
  action?: ReactNode | ((key: SnackbarKey) => ReactNode);
  onClose?: (event: SyntheticEvent<HTMLElement> | null, reason: CloseReason, key: SnackbarKey) => void;
}

export interface ProviderContext {
  enqueueSnackbar: (message: SnackbarMessage, options?: OptionsObject) => SnackbarKey;
  /** Pass no argument to close every active notification. */
  closeSnackbar: (key?: SnackbarKey) => void;
}

export interface SnackbarProviderProps {
  children: ReactNode;
  /** Visible items per anchor stack. */
  maxSnack?: number;
  /** Default anchor for new notifications. */
  anchorOrigin?: AnchorOrigin;
  /** Default auto-hide duration in ms. `null` disables auto-hide. */
  autoHideDuration?: number | null;
  /** Replaces the variant pip with a node per variant. Rendered before the message. */
  iconVariant?: Partial<Record<VariantType, ReactNode>>;
  /** Portal target. Defaults to `document.body`. */
  container?: HTMLElement | null;
  /** When the lazy renderer chunk should download. Defaults to `'idle'`. */
  prefetch?: 'never' | 'idle' | 'mount';
}

export type SnackbarItemState = 'entering' | 'visible' | 'paused' | 'exiting' | 'swiped-out';

export interface SnackbarItem {
  key: SnackbarKey;
  message: SnackbarMessage;
  variant: VariantType;
  autoHideDuration: number | null;
  anchorOrigin: AnchorOrigin;
  disableWindowBlurListener: boolean;
  action: OptionsObject['action'];
  onClose: OptionsObject['onClose'];
  createdAt: number;
  state: SnackbarItemState;
  swipeDirection: -1 | 0 | 1;
}

export interface NotifierRootProps {
  queue: SnackbarItem[];
  dispatch: (action: NotifierAction) => void;
  iconVariant?: Partial<Record<VariantType, ReactNode>>;
  container?: HTMLElement | null;
  maxSnack: number;
}

export type NotifierAction =
  | { type: 'set-state'; key: SnackbarKey; state: SnackbarItemState }
  | { type: 'swipe'; key: SnackbarKey; direction: -1 | 1 }
  | { type: 'dismiss'; key: SnackbarKey }
  | { type: 'remove'; key: SnackbarKey };
