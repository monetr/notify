import { useEffect, useMemo, useState } from 'react';
import { createPortal } from 'react-dom';

import { Notifier } from './notifier';
import type { AnchorOrigin, NotifierRootProps, SnackbarItem } from './types';
import { anchorKey, isLiveState } from './use-queue';

import './style.css';

/** All six anchors. The renderer mounts a portal per anchor that has at least one item;
 * empty anchors are skipped to avoid stray DOM nodes. */
const ALL_ANCHORS: AnchorOrigin[] = [
  { vertical: 'top', horizontal: 'left' },
  { vertical: 'top', horizontal: 'center' },
  { vertical: 'top', horizontal: 'right' },
  { vertical: 'bottom', horizontal: 'left' },
  { vertical: 'bottom', horizontal: 'center' },
  { vertical: 'bottom', horizontal: 'right' },
];

function NotifierRoot(props: NotifierRootProps): JSX.Element | null {
  const { queue, dispatch, iconVariant, container } = props;

  // Resolve the portal target only after mount so SSR snapshots don't try to read `document`.
  const [target, setTarget] = useState<HTMLElement | null>(null);
  useEffect(() => {
    if (container !== undefined && container !== null) {
      setTarget(container);
      return;
    }
    if (typeof document !== 'undefined') {
      setTarget(document.body);
    }
  }, [container]);

  // Group queue entries by anchor. Items keep their newest-first ordering.
  const grouped = useMemo(() => {
    const map = new Map<string, SnackbarItem[]>();
    for (const item of queue) {
      const k = anchorKey(item.anchorOrigin);
      const list = map.get(k);
      if (list) {
        list.push(item);
      } else {
        map.set(k, [item]);
      }
    }
    return map;
  }, [queue]);

  if (!target) {
    return null;
  }

  return (
    <>
      {ALL_ANCHORS.map(anchor => {
        const k = anchorKey(anchor);
        const items = grouped.get(k) ?? [];
        // Exiting items still occupy the DOM until their animation finishes; live items only
        // count toward the rendered list.
        if (items.length === 0) {
          return null;
        }
        return createPortal(
          <Notifier anchor={anchor} dispatch={dispatch} iconVariant={iconVariant} instances={items} />,
          target,
          k,
        );
      })}
    </>
  );
}

// `useLiveCount` is exported for tests that want to assert the visible count separately from the
// raw queue length (which can include exiting items). Currently unused outside tests; kept here
// so test code doesn't have to re-implement the live-state predicate.
export function liveCount(queue: SnackbarItem[]): number {
  let n = 0;
  for (const item of queue) {
    if (isLiveState(item.state)) {
      n += 1;
    }
  }
  return n;
}

export default NotifierRoot;
