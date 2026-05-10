import { useState } from 'react';

import { SnackbarProvider, useSnackbar } from '../../src';

function Inner({ onAction }: { onAction: () => void }) {
  const { enqueueSnackbar } = useSnackbar();
  return (
    <div data-fixture-page=''>
      <button
        data-testid='enqueue'
        onClick={() =>
          enqueueSnackbar('With action', {
            action: <span>Undo</span>,
            persist: true,
            onClose: onAction,
          })
        }
        type='button'
      >
        Enqueue with action
      </button>
    </div>
  );
}

export function ActionSnackbar() {
  const [count, setCount] = useState(0);
  return (
    <SnackbarProvider>
      <Inner onAction={() => setCount(c => c + 1)} />
      <span data-testid='close-count'>{count}</span>
    </SnackbarProvider>
  );
}
