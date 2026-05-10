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

// Static `import('./renderer')` survives rslib's bundleless build, so the consumer's bundler
// treats this as a code-split point and ships the renderer + its CSS as a separate chunk.
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

  // The queue lives in a ref so a synchronous burst of enqueue/close calls (e.g. a `for` loop)
  // sees up-to-date state when computing maxSnack overflow.
  const queueRef = useRef<SnackbarItem[]>(initialQueue);
  const [, setVersion] = useState(0);
  const dispatch = useCallback((action: Action) => {
    queueRef.current = queueReducer(queueRef.current, action);
    setVersion(v => v + 1);
  }, []);

  // Idempotent across StrictMode's double-invoke; `import()` is non-cancellable.
  const prefetchedRef = useRef(false);

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
      if (options?.key !== undefined) {
        const existing = queueRef.current.find(i => i.key === options.key);
        if (existing) {
          return existing.key;
        }
      }
      const item = makeInstance(message, options, defaults);
      const dropKeys = findOverflowKeys(queueRef.current, item, defaults.maxSnack);
      for (const key of dropKeys) {
        const dropped = queueRef.current.find(i => i.key === key);
        dropped?.onClose?.(null, 'maxsnack', key);
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
