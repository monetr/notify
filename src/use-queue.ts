import {
  DEFAULT_ANCHOR_HORIZONTAL,
  DEFAULT_ANCHOR_VERTICAL,
  DEFAULT_AUTO_HIDE_DURATION,
  DEFAULT_MAX_SNACK,
} from './constants';
import type {
  AnchorOrigin,
  NotifierAction,
  OptionsObject,
  SnackbarItem,
  SnackbarKey,
  SnackbarMessage,
  VariantType,
} from './types';

export type EnqueueAction = {
  type: 'enqueue';
  item: SnackbarItem;
  /** Keys to drop from the same anchor before inserting `item`, due to maxSnack overflow. */
  dropKeys: SnackbarKey[];
};

export type Action = EnqueueAction | NotifierAction | { type: 'close-all' } | { type: 'reset' };

let _idCounter = 0;
export function nextKey(): SnackbarKey {
  // Monotonic; survives StrictMode double-invoke since the counter is module-scoped.
  _idCounter += 1;
  return _idCounter;
}

export function sameAnchor(a: AnchorOrigin, b: AnchorOrigin): boolean {
  return a.vertical === b.vertical && a.horizontal === b.horizontal;
}

export function anchorKey(a: AnchorOrigin): string {
  return `${a.vertical}-${a.horizontal}`;
}

export function isLiveState(state: SnackbarItem['state']): boolean {
  return state === 'entering' || state === 'visible' || state === 'paused';
}

interface ProviderDefaults {
  anchorOrigin?: AnchorOrigin;
  autoHideDuration?: number | null;
}

export function makeInstance(
  message: SnackbarMessage,
  options: OptionsObject | undefined,
  defaults: ProviderDefaults,
): SnackbarItem {
  const variant: VariantType = options?.variant ?? 'default';
  const persist = options?.persist === true;
  const autoHideDuration = persist
    ? null
    : options?.autoHideDuration !== undefined
      ? options.autoHideDuration
      : defaults.autoHideDuration !== undefined
        ? defaults.autoHideDuration
        : DEFAULT_AUTO_HIDE_DURATION;
  const anchorOrigin: AnchorOrigin = options?.anchorOrigin ??
    defaults.anchorOrigin ?? {
      vertical: DEFAULT_ANCHOR_VERTICAL,
      horizontal: DEFAULT_ANCHOR_HORIZONTAL,
    };

  return {
    key: options?.key ?? nextKey(),
    message,
    variant,
    autoHideDuration,
    anchorOrigin,
    disableWindowBlurListener: options?.disableWindowBlurListener ?? false,
    action: options?.action,
    onClose: options?.onClose,
    createdAt: Date.now(),
    state: 'entering',
    swipeDirection: 0,
  };
}

export function findOverflowKeys(state: SnackbarItem[], incoming: SnackbarItem, maxSnack: number): SnackbarKey[] {
  // Items at the same anchor that are still on screen (not exiting) — including the soon-to-be added
  // incoming item. If that count would exceed maxSnack, the oldest entries get evicted.
  const live = state.filter(s => sameAnchor(s.anchorOrigin, incoming.anchorOrigin) && isLiveState(s.state));
  const projected = live.length + 1;
  if (projected <= maxSnack) {
    return [];
  }
  const dropCount = projected - maxSnack;
  // Items are stored newest-first (prepended on enqueue), so the oldest live items are at the
  // tail of `live`. Take the last `dropCount`.
  return live.slice(-dropCount).map(s => s.key);
}

export function queueReducer(state: SnackbarItem[], action: Action): SnackbarItem[] {
  switch (action.type) {
    case 'enqueue': {
      const filtered = action.dropKeys.length > 0 ? state.filter(s => !action.dropKeys.includes(s.key)) : state;
      return [action.item, ...filtered];
    }
    case 'set-state':
      return state.map(s => (s.key === action.key ? { ...s, state: action.state } : s));
    case 'swipe':
      return state.map(s =>
        s.key === action.key ? { ...s, state: 'swiped-out', swipeDirection: action.direction } : s,
      );
    case 'dismiss':
      return state.map(s => (s.key === action.key && isLiveState(s.state) ? { ...s, state: 'exiting' } : s));
    case 'remove':
      return state.filter(s => s.key !== action.key);
    case 'close-all':
      return state.map(s => (isLiveState(s.state) ? { ...s, state: 'exiting' } : s));
    case 'reset':
      return [];
    default:
      return state;
  }
}

export const initialQueue: SnackbarItem[] = [];

/** Defaults for makeInstance, packaged. */
export function providerDefaults(props: {
  anchorOrigin?: AnchorOrigin;
  autoHideDuration?: number | null;
  maxSnack?: number;
}): {
  anchorOrigin: AnchorOrigin;
  autoHideDuration: number | null;
  maxSnack: number;
} {
  return {
    anchorOrigin: props.anchorOrigin ?? {
      vertical: DEFAULT_ANCHOR_VERTICAL,
      horizontal: DEFAULT_ANCHOR_HORIZONTAL,
    },
    autoHideDuration: props.autoHideDuration !== undefined ? props.autoHideDuration : DEFAULT_AUTO_HIDE_DURATION,
    maxSnack: props.maxSnack ?? DEFAULT_MAX_SNACK,
  };
}
