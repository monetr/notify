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
  /** Stable key for dedup and external close. Auto-assigned if omitted. */
  key?: SnackbarKey;
  /** Variant; default 'default'. */
  variant?: VariantType;
  /** Shorthand for `autoHideDuration: null`. */
  persist?: boolean;
  /** ms; null/0 means persist; undefined inherits provider default. */
  autoHideDuration?: number | null;
  /** Per-call anchor override. */
  anchorOrigin?: AnchorOrigin;
  /** When true, the auto-hide timer ignores window-blur events for this notification. */
  disableWindowBlurListener?: boolean;
  /** Action button. Static node, or a render fn that receives the snackbar key. */
  action?: ReactNode | ((key: SnackbarKey) => ReactNode);
  /** Fires when the notification is closed (timer, click, swipe, programmatic, maxsnack). */
  onClose?: (event: SyntheticEvent<HTMLElement> | null, reason: CloseReason, key: SnackbarKey) => void;
}

export interface ProviderContext {
  /** Enqueue a notification. Returns the assigned key. */
  enqueueSnackbar: (message: SnackbarMessage, options?: OptionsObject) => SnackbarKey;
  /** Dismiss a specific notification. Pass no argument to close all. */
  closeSnackbar: (key?: SnackbarKey) => void;
}

export interface SnackbarProviderProps {
  children: ReactNode;
  /** Visible items per anchor stack. Default 5. */
  maxSnack?: number;
  /** Default anchor for new notifications. Default `{ vertical: 'bottom', horizontal: 'center' }`. */
  anchorOrigin?: AnchorOrigin;
  /** Default auto-hide duration, ms. Null means persist. Default 4000. */
  autoHideDuration?: number | null;
  /** Replace the variant pip with a node per variant. Rendered immediately left of the message. */
  iconVariant?: Partial<Record<VariantType, ReactNode>>;
  /** Portal target. Default `document.body`. */
  container?: HTMLElement | null;
  /** When the lazy renderer chunk should download. Default `'idle'`. */
  prefetch?: 'never' | 'idle' | 'mount';
}

/** Internal state of one notification in the queue. */
export type SnackbarItemState = 'entering' | 'visible' | 'paused' | 'exiting' | 'swiped-out';

/** A fully-resolved item in the queue. */
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

/** Props passed to the lazy <NotifierRoot>. */
export interface NotifierRootProps {
  queue: SnackbarItem[];
  dispatch: (action: NotifierAction) => void;
  iconVariant?: Partial<Record<VariantType, ReactNode>>;
  container?: HTMLElement | null;
  maxSnack: number;
}

/** Internal queue actions, exported so the lazy renderer can dispatch them. */
export type NotifierAction =
  | { type: 'set-state'; key: SnackbarKey; state: SnackbarItemState }
  | { type: 'swipe'; key: SnackbarKey; direction: -1 | 1 }
  | { type: 'dismiss'; key: SnackbarKey }
  | { type: 'remove'; key: SnackbarKey };
