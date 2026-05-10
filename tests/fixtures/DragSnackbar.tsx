import { SnackbarProvider, useSnackbar } from '../../src';
import type { AnchorOrigin } from '../../src/types';

function Inner({ anchor }: { anchor: AnchorOrigin }) {
  const { enqueueSnackbar } = useSnackbar();
  return (
    <div data-fixture-page=''>
      <button
        data-testid='enqueue'
        onClick={() =>
          enqueueSnackbar(`${anchor.vertical}-${anchor.horizontal}`, { persist: true, anchorOrigin: anchor })
        }
        type='button'
      >
        Enqueue
      </button>
    </div>
  );
}

export function DragSnackbar({ anchor }: { anchor: AnchorOrigin }) {
  return (
    <SnackbarProvider anchorOrigin={anchor}>
      <Inner anchor={anchor} />
    </SnackbarProvider>
  );
}
