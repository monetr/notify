import { useRef } from 'react';

import { SnackbarProvider, useSnackbar } from '../../src';
import type { CloseReason, SnackbarKey } from '../../src/types';

function Inner({ onClose }: { onClose: (reason: CloseReason, key: SnackbarKey) => void }) {
  const { enqueueSnackbar } = useSnackbar();
  const counter = useRef(0);
  return (
    <div data-fixture-page=''>
      <button
        data-testid='enqueue-one'
        onClick={() => {
          counter.current += 1;
          enqueueSnackbar(`Item ${counter.current}`, {
            persist: true,
            onClose: (_e, reason, key) => onClose(reason, key),
          });
        }}
        type='button'
      >
        Enqueue one
      </button>
      <button
        data-testid='enqueue-many'
        onClick={() => {
          for (let i = 0; i < 7; i++) {
            counter.current += 1;
            enqueueSnackbar(`Item ${counter.current}`, {
              persist: true,
              onClose: (_e, reason, key) => onClose(reason, key),
            });
          }
        }}
        type='button'
      >
        Enqueue 7
      </button>
    </div>
  );
}

interface Props {
  maxSnack?: number;
  onClose?: (reason: CloseReason, key: SnackbarKey) => void;
}

export function MaxStackSnackbar({ maxSnack = 5, onClose = () => {} }: Props) {
  return (
    <SnackbarProvider maxSnack={maxSnack}>
      <Inner onClose={onClose} />
    </SnackbarProvider>
  );
}
