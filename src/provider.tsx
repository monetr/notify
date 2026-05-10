import { lazy, Suspense, useCallback, useEffect, useMemo, useRef, useState } from 'react';

import { SnackbarContext } from './context';
import type {
  NotifierAction,
  OptionsObject,
  ProviderContext,
  SnackbarItem,
  SnackbarKey,
  SnackbarMessage,
  SnackbarProviderProps,
} from './types';
import {
  type Action,
  findOverflowKeys,
  initialQueue,
  isLiveState,
  makeInstance,
  providerDefaults,
  queueReducer,
} from './use-queue';

// React.lazy preserves the dynamic import literal. Bundlers (rsbuild/vite/webpack) treat this as a
// code-split point so `./renderer` and the CSS it imports become a separate chunk that downloads
// only once `enqueueSnackbar` flips `active` to true.
const LazyNotifierRoot = lazy(() => import('./renderer'));

interface RequestIdleWindow {
  requestIdleCallback?: (cb: () => void) => number;
  cancelIdleCallback?: (id: number) => void;
}

export function SnackbarProvider(props: SnackbarProviderProps) {
  const { children, prefetch = 'idle', iconVariant, container, anchorOrigin, autoHideDuration, maxSnack } = props;
  const defaults = useMemo(
    () => providerDefaults({ anchorOrigin, autoHideDuration, maxSnack }),
    [anchorOrigin?.vertical, anchorOrigin?.horizontal, anchorOrigin, autoHideDuration, maxSnack],
  );

  // Queue lives in a ref so synchronous bursts of enqueue/close calls (e.g. a loop) see up-to-date
  // state when computing maxSnack overflow. A version counter forces re-renders.
  const queueRef = useRef<SnackbarItem[]>(initialQueue);
  const [, setVersion] = useState(0);
  const dispatch = useCallback((action: Action) => {
    queueRef.current = queueReducer(queueRef.current, action);
    setVersion(v => v + 1);
  }, []);

  // StrictMode double-invokes effects in dev, and React.lazy's `import()` is non-cancellable.
  // Track whether the chunk has been requested to keep prefetch idempotent.
  const prefetchedRef = useRef(false);

  // Activates lazy mounting on first enqueue. Local state keeps the renderer absent from the tree
  // until needed.
  const [active, setActiveState] = useState(false);
  const activeRef = useRef(false);
  const setActive = useCallback(() => {
    if (!activeRef.current) {
      activeRef.current = true;
      setActiveState(true);
    }
  }, []);

  const enqueueSnackbar = useCallback(
    (message: SnackbarMessage, options?: OptionsObject): SnackbarKey => {
      // Dedup by consumer-supplied key. The same key will not produce a second toast.
      if (options?.key !== undefined) {
        const existing = queueRef.current.find(i => i.key === options.key);
        if (existing) {
          return existing.key;
        }
      }
      const item = makeInstance(message, options, defaults);
      const dropKeys = findOverflowKeys(queueRef.current, item, defaults.maxSnack);
      if (dropKeys.length > 0) {
        // Fire onClose with reason 'maxsnack' for items that get evicted to make room.
        for (const key of dropKeys) {
          const dropped = queueRef.current.find(i => i.key === key);
          dropped?.onClose?.(null, 'maxsnack', key);
        }
      }
      dispatch({ type: 'enqueue', item, dropKeys } satisfies Action);
      setActive();
      return item.key;
    },
    [defaults, setActive, dispatch],
  );

  const closeSnackbar = useCallback(
    (key?: SnackbarKey) => {
      if (key === undefined) {
        // Close-all: notistack v3 fires onClose with reason 'instructed' for each evicted item.
        for (const item of queueRef.current) {
          if (isLiveState(item.state)) {
            item.onClose?.(null, 'instructed', item.key);
          }
        }
        dispatch({ type: 'close-all' });
        return;
      }
      const item = queueRef.current.find(i => i.key === key);
      if (item && isLiveState(item.state)) {
        item.onClose?.(null, 'instructed', key);
      }
      dispatch({ type: 'dismiss', key });
    },
    [dispatch],
  );

  const api = useMemo<ProviderContext>(() => ({ enqueueSnackbar, closeSnackbar }), [enqueueSnackbar, closeSnackbar]);

  // Optional eager warm of the renderer chunk so the first enqueueSnackbar feels instant.
  // Default 'idle' uses requestIdleCallback when available; fall back to a deferred setTimeout.
  // 'never' opts out entirely; 'mount' triggers immediately on provider mount.
  useEffect(() => {
    if (prefetch === 'never' || typeof window === 'undefined' || prefetchedRef.current) {
      return;
    }
    const run = () => {
      prefetchedRef.current = true;
      void import('./renderer');
    };
    if (prefetch === 'mount') {
      run();
      return;
    }
    const w = window as Window & RequestIdleWindow;
    const ric = w.requestIdleCallback;
    const cic = w.cancelIdleCallback;
    if (ric) {
      const id = ric(run);
      return () => {
        if (cic) {
          cic(id);
        }
      };
    }
    const id = window.setTimeout(run, 200);
    return () => window.clearTimeout(id);
  }, [prefetch]);

  // The renderer subscribes to a narrow action set (its own NotifierAction). The provider widens
  // the dispatch type so the renderer doesn't need to know about enqueue/close-all.
  const rendererDispatch = useCallback((a: NotifierAction) => dispatch(a as Action), [dispatch]);

  return (
    <SnackbarContext.Provider value={api}>
      {children}
      {active ? (
        <Suspense fallback={null}>
          <LazyNotifierRoot
            container={container}
            dispatch={rendererDispatch}
            iconVariant={iconVariant}
            maxSnack={defaults.maxSnack}
            queue={queueRef.current}
          />
        </Suspense>
      ) : null}
    </SnackbarContext.Provider>
  );
}
