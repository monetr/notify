import { useEffect, useMemo, useState } from 'react';
import { createPortal } from 'react-dom';

import { Notifier } from './notifier';
import type { AnchorOrigin, NotifierRootProps, SnackbarItem } from './types';
import { anchorKey } from './use-queue';

import './style.css';

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

  // Resolve the portal target after mount so the server snapshot doesn't read `document`.
  const [target, setTarget] = useState<HTMLElement | null>(null);
  useEffect(() => {
    if (container) {
      setTarget(container);
    } else if (typeof document !== 'undefined') {
      setTarget(document.body);
    }
  }, [container]);

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

export default NotifierRoot;
