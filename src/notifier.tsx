import { type JSX, type ReactNode, useState } from 'react';

import { Notification } from './notification';
import type { AnchorOrigin, NotifierAction, SnackbarItem, VariantType } from './types';

interface NotifierProps {
  anchor: AnchorOrigin;
  instances: SnackbarItem[];
  iconVariant?: Partial<Record<VariantType, ReactNode>>;
  dispatch: (action: NotifierAction) => void;
}

export function Notifier(props: NotifierProps): JSX.Element {
  const { anchor, instances, iconVariant, dispatch } = props;
  const [hovered, setHovered] = useState(false);

  return (
    <ol
      data-monetr-notifier-stack=''
      data-stack-anchor={`${anchor.vertical}-${anchor.horizontal}`}
      data-stack-empty={instances.length === 0 ? 'true' : 'false'}
      data-stack-hovered={hovered ? 'true' : 'false'}
      onPointerEnter={() => setHovered(true)}
      onPointerLeave={() => setHovered(false)}
      style={{ listStyle: 'none', padding: 0, margin: 0 }}
    >
      {instances.map((inst, index) => (
        <Notification
          dispatch={dispatch}
          iconNode={iconVariant?.[inst.variant]}
          index={index}
          instance={inst}
          key={inst.key}
          stackHovered={hovered}
        />
      ))}
    </ol>
  );
}
