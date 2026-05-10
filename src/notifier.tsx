import { type ReactNode, useMemo, useState } from 'react';

import { Notification } from './notification';
import type { AnchorOrigin, NotifierAction, SnackbarItem, VariantType } from './types';

interface NotifierProps {
  anchor: AnchorOrigin;
  instances: SnackbarItem[];
  iconVariant?: Partial<Record<VariantType, ReactNode>>;
  dispatch: (action: NotifierAction) => void;
}

/** One stack at one anchor. Owns the hover state for the whole stack, which pauses each
 * notification's auto-dismiss timer and triggers the expanded layout. */
export function Notifier(props: NotifierProps): JSX.Element {
  const { anchor, instances, iconVariant, dispatch } = props;
  const [hovered, setHovered] = useState(false);

  const visible = useMemo(() => instances, [instances]);

  return (
    <ol
      data-monetr-notifier-stack=''
      data-stack-anchor={`${anchor.vertical}-${anchor.horizontal}`}
      data-stack-empty={visible.length === 0 ? 'true' : 'false'}
      data-stack-hovered={hovered ? 'true' : 'false'}
      onPointerEnter={() => setHovered(true)}
      onPointerLeave={() => {
        setHovered(false);
      }}
      style={{ listStyle: 'none', padding: 0, margin: 0 }}
    >
      {visible.map((inst, index) => (
        <Notification
          dispatch={dispatch}
          iconNode={iconVariant?.[inst.variant]}
          index={index}
          instance={inst}
          key={inst.key}
          stackHovered={hovered}
          total={visible.length}
        />
      ))}
    </ol>
  );
}
