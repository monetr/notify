import {
  type CSSProperties,
  type ReactNode,
  type PointerEvent as ReactPointerEvent,
  type SyntheticEvent,
  useCallback,
  useEffect,
  useRef,
  useState,
} from 'react';

import {
  DRAG_DAMPEN_MAX,
  DRAG_DISMISS_DISTANCE,
  DRAG_VELOCITY_THRESHOLD,
  DRAG_VELOCITY_WINDOW_MS,
  EXIT_TRANSITION_MS,
  SWIPE_EXIT_MS,
} from './constants';
import { dampenValue } from './helpers';
import type { AnchorOrigin, NotifierAction, SnackbarItem, VariantType } from './types';

interface NotificationProps {
  instance: SnackbarItem;
  index: number;
  total: number;
  stackHovered: boolean;
  iconNode?: ReactNode;
  dispatch: (action: NotifierAction) => void;
}

interface DragState {
  startX: number;
  startY: number;
  currentX: number;
  currentY: number;
  dragging: boolean;
  /** Last sample (for velocity). */
  sampleAt: number;
  sampleX: number;
  sampleY: number;
}

const initialDrag: DragState = {
  startX: 0,
  startY: 0,
  currentX: 0,
  currentY: 0,
  dragging: false,
  sampleAt: 0,
  sampleX: 0,
  sampleY: 0,
};

function isDismissAllowed(anchor: AnchorOrigin, axis: 'x' | 'y', sign: -1 | 1): boolean {
  if (axis === 'y') {
    return sign === (anchor.vertical === 'top' ? -1 : 1);
  }
  if (anchor.horizontal === 'left') {
    return sign === -1;
  }
  if (anchor.horizontal === 'right') {
    return sign === 1;
  }
  return false; // -center horizontal: no horizontal dismiss
}

const PIP_VARIANTS: VariantType[] = ['success', 'error', 'warning', 'info'];

export function Notification(props: NotificationProps): JSX.Element {
  const { instance, index, total: _total, stackHovered, iconNode, dispatch } = props;
  const {
    key,
    anchorOrigin,
    autoHideDuration,
    disableWindowBlurListener,
    action,
    variant,
    message,
    state,
    swipeDirection,
  } = instance;

  const elementRef = useRef<HTMLLIElement | null>(null);
  const dragRef = useRef<DragState>({ ...initialDrag });
  const elapsedRef = useRef(0);
  const lastResumeRef = useRef<number | null>(null);
  const swipeAxisRef = useRef<'x' | 'y' | null>(null);
  // Mirror instance.onClose into a ref so handlers/effects don't need to depend on the
  // instance object identity, which changes on every reducer dispatch.
  const onCloseRef = useRef(instance.onClose);
  useEffect(() => {
    onCloseRef.current = instance.onClose;
  });

  const [dragOffset, setDragOffset] = useState({ x: 0, y: 0 });
  const [windowBlurred, setWindowBlurred] = useState(false);

  // Two-frame mount: render in `entering` state, rAF×2, then flip to `visible`. The double rAF
  // gives the browser one frame to paint the entering styles before transitioning to visible.
  useEffect(() => {
    if (state !== 'entering') {
      return;
    }
    let raf2 = 0;
    const raf1 = requestAnimationFrame(() => {
      raf2 = requestAnimationFrame(() => {
        dispatch({ type: 'set-state', key, state: 'visible' });
      });
    });
    return () => {
      cancelAnimationFrame(raf1);
      cancelAnimationFrame(raf2);
    };
  }, [state, key, dispatch]);

  // Window-blur pause. Per-item so per-call disableWindowBlurListener is honored.
  useEffect(() => {
    if (disableWindowBlurListener) {
      return;
    }
    const onBlur = () => setWindowBlurred(true);
    const onFocus = () => setWindowBlurred(false);
    window.addEventListener('blur', onBlur);
    window.addEventListener('focus', onFocus);
    return () => {
      window.removeEventListener('blur', onBlur);
      window.removeEventListener('focus', onFocus);
    };
  }, [disableWindowBlurListener]);

  const effectivelyPaused = state === 'paused' || stackHovered || windowBlurred;

  // Auto-dismiss timer with pause-aware bookkeeping.
  useEffect(() => {
    if (state !== 'visible' || autoHideDuration === null || effectivelyPaused) {
      // Pausing: bank the elapsed delta from the last resume.
      if (lastResumeRef.current !== null) {
        elapsedRef.current += Date.now() - lastResumeRef.current;
        lastResumeRef.current = null;
      }
      return;
    }

    lastResumeRef.current = Date.now();
    const remaining = Math.max(0, autoHideDuration - elapsedRef.current);
    const timeoutId = window.setTimeout(() => {
      onCloseRef.current?.(null, 'timeout', key);
      dispatch({ type: 'dismiss', key });
    }, remaining);

    return () => {
      window.clearTimeout(timeoutId);
      if (lastResumeRef.current !== null) {
        elapsedRef.current += Date.now() - lastResumeRef.current;
        lastResumeRef.current = null;
      }
    };
  }, [state, autoHideDuration, effectivelyPaused, key, dispatch]);

  // Progress rail update via CSS custom property at rAF cadence.
  useEffect(() => {
    if (state !== 'visible' || autoHideDuration === null) {
      return;
    }
    if (effectivelyPaused) {
      return;
    }
    let raf = 0;
    const tick = () => {
      const el = elementRef.current;
      if (!el) {
        return;
      }
      const live = lastResumeRef.current !== null ? Date.now() - lastResumeRef.current : 0;
      const total = elapsedRef.current + live;
      const progress = Math.min(1, total / autoHideDuration);
      el.style.setProperty('--monetr-notification-progress', String(progress));
      if (progress < 1 && lastResumeRef.current !== null) {
        raf = requestAnimationFrame(tick);
      }
    };
    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
  }, [state, autoHideDuration, effectivelyPaused]);

  // Animation end → drop the item. We listen for both animation- and transition-end so the exit
  // and swipe-out timelines reach their natural end before the queue removes the item from state.
  useEffect(() => {
    if (state !== 'exiting' && state !== 'swiped-out') {
      return;
    }
    const fallback = window.setTimeout(
      () => dispatch({ type: 'remove', key }),
      state === 'swiped-out' ? SWIPE_EXIT_MS + 100 : EXIT_TRANSITION_MS + 100,
    );
    return () => window.clearTimeout(fallback);
  }, [state, key, dispatch]);

  const handlePointerDown = useCallback(
    (event: ReactPointerEvent<HTMLLIElement>) => {
      if (index !== 0) {
        return;
      }
      if (state !== 'visible' && state !== 'entering' && state !== 'paused') {
        return;
      }
      const now = performance.now();
      dragRef.current = {
        startX: event.clientX,
        startY: event.clientY,
        currentX: event.clientX,
        currentY: event.clientY,
        dragging: true,
        sampleAt: now,
        sampleX: event.clientX,
        sampleY: event.clientY,
      };
      const target = event.currentTarget;
      try {
        target.setPointerCapture(event.pointerId);
      } catch {
        // Synthetic events from tests never observed the pointerId; ignore.
      }
    },
    [index, state],
  );

  const handlePointerMove = useCallback(
    (event: ReactPointerEvent<HTMLLIElement>) => {
      const drag = dragRef.current;
      if (!drag.dragging) {
        return;
      }
      drag.currentX = event.clientX;
      drag.currentY = event.clientY;
      const now = performance.now();
      // Sliding velocity sample window.
      if (now - drag.sampleAt > DRAG_VELOCITY_WINDOW_MS) {
        drag.sampleAt = now;
        drag.sampleX = event.clientX;
        drag.sampleY = event.clientY;
      }

      const dx = event.clientX - drag.startX;
      const dy = event.clientY - drag.startY;
      const ax = Math.abs(dx);
      const ay = Math.abs(dy);

      if (ax >= ay) {
        const sign = (Math.sign(dx) || 1) as -1 | 1;
        if (isDismissAllowed(anchorOrigin, 'x', sign)) {
          setDragOffset({ x: dx, y: 0 });
        } else {
          const damp = Math.min(DRAG_DAMPEN_MAX, Math.max(0, dampenValue(ax)));
          setDragOffset({ x: damp * sign, y: 0 });
        }
      } else {
        const sign = (Math.sign(dy) || 1) as -1 | 1;
        if (isDismissAllowed(anchorOrigin, 'y', sign)) {
          setDragOffset({ x: 0, y: dy });
        } else {
          const damp = Math.min(DRAG_DAMPEN_MAX, Math.max(0, dampenValue(ay)));
          setDragOffset({ x: 0, y: damp * sign });
        }
      }
    },
    [anchorOrigin],
  );

  const finishDrag = useCallback(() => {
    const drag = dragRef.current;
    if (!drag.dragging) {
      return;
    }
    drag.dragging = false;

    const dx = drag.currentX - drag.startX;
    const dy = drag.currentY - drag.startY;
    const ax = Math.abs(dx);
    const ay = Math.abs(dy);

    // Velocity over the trailing window.
    const elapsed = Math.max(1, performance.now() - drag.sampleAt);
    const vx = Math.abs(drag.currentX - drag.sampleX) / elapsed;
    const vy = Math.abs(drag.currentY - drag.sampleY) / elapsed;

    let outcome: { axis: 'x' | 'y'; direction: -1 | 1 } | null = null;

    const checkAxis = (axis: 'x' | 'y', delta: number, vel: number) => {
      const sign = (Math.sign(delta) || 1) as -1 | 1;
      if (!isDismissAllowed(anchorOrigin, axis, sign)) {
        return null;
      }
      if (Math.abs(delta) >= DRAG_DISMISS_DISTANCE || vel >= DRAG_VELOCITY_THRESHOLD) {
        return { axis, direction: sign };
      }
      return null;
    };

    // Use the dominant axis preferentially.
    if (ax >= ay) {
      outcome = checkAxis('x', dx, vx) ?? checkAxis('y', dy, vy);
    } else {
      outcome = checkAxis('y', dy, vy) ?? checkAxis('x', dx, vx);
    }

    if (outcome) {
      swipeAxisRef.current = outcome.axis;
      onCloseRef.current?.(null, 'swipe', key);
      dispatch({ type: 'swipe', key, direction: outcome.direction });
      return;
    }

    setDragOffset({ x: 0, y: 0 });
  }, [anchorOrigin, key, dispatch]);

  const handlePointerUp = useCallback(() => {
    finishDrag();
  }, [finishDrag]);

  const handlePointerCancel = useCallback(() => {
    dragRef.current.dragging = false;
    setDragOffset({ x: 0, y: 0 });
  }, []);

  const handleDismiss = useCallback(
    (event: SyntheticEvent<HTMLElement>) => {
      event.stopPropagation();
      onCloseRef.current?.(event, 'instructed', key);
      dispatch({ type: 'dismiss', key });
    },
    [key, dispatch],
  );

  const handleAction = useCallback(
    (event: SyntheticEvent<HTMLElement>) => {
      event.stopPropagation();
      onCloseRef.current?.(event, 'instructed', key);
      dispatch({ type: 'dismiss', key });
    },
    [key, dispatch],
  );

  const renderedAction =
    action === undefined || action === null
      ? null
      : typeof action === 'function'
        ? (action(key) as ReactNode)
        : (action as ReactNode);

  // Inline style holds the per-instance stack-index, drag offset, and (for an authored swipe-axis)
  // the axis attribute that selects the right keyframe.
  const cssVars: CSSProperties = {
    ['--monetr-stack-index' as string]: String(index),
    ['--monetr-drag-x' as string]: `${dragOffset.x}px`,
    ['--monetr-drag-y' as string]: `${dragOffset.y}px`,
  };

  const showPip = !iconNode && PIP_VARIANTS.includes(variant);

  return (
    <li
      aria-atomic='true'
      aria-live={variant === 'error' || variant === 'warning' ? 'assertive' : 'polite'}
      data-dragging={dragRef.current.dragging ? 'true' : 'false'}
      data-monetr-notification=''
      data-monetr-notification-anchor={`${anchorOrigin.vertical}-${anchorOrigin.horizontal}`}
      data-monetr-notification-variant={variant}
      data-stack-hovered-self={stackHovered ? 'true' : 'false'}
      data-stack-index={index}
      data-state={state}
      data-swipe-axis={swipeAxisRef.current ?? undefined}
      data-swipe-direction={swipeDirection !== 0 ? String(swipeDirection) : undefined}
      onPointerCancel={handlePointerCancel}
      onPointerDown={handlePointerDown}
      onPointerMove={handlePointerMove}
      onPointerUp={handlePointerUp}
      ref={elementRef}
      role={variant === 'error' || variant === 'warning' ? 'alert' : 'status'}
      style={cssVars}
    >
      {iconNode ? <span data-monetr-notification-icon-slot=''>{iconNode}</span> : null}
      {showPip ? <span aria-hidden='true' data-monetr-notification-pip='' /> : null}
      <span data-monetr-notification-message=''>{message}</span>
      {renderedAction ? (
        <button data-monetr-notification-action='' onClick={handleAction} type='button'>
          {renderedAction}
        </button>
      ) : null}
      <button
        aria-label='Dismiss'
        data-monetr-notification-dismiss=''
        data-testid={index === 0 ? 'notification-dismiss' : undefined}
        onClick={handleDismiss}
        type='button'
      >
        ×
      </button>
      {autoHideDuration !== null ? (
        <div aria-hidden='true' data-monetr-notification-progress-track=''>
          <div data-monetr-notification-progress-bar-fill='' />
        </div>
      ) : null}
    </li>
  );
}
