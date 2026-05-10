import { SnackbarProvider, useSnackbar } from '../../src';

function Inner() {
  const { enqueueSnackbar } = useSnackbar();
  return (
    <div data-fixture-page=''>
      <button
        data-testid='enqueue-override'
        onClick={() =>
          enqueueSnackbar('top-right toast', { anchorOrigin: { vertical: 'top', horizontal: 'right' }, persist: true })
        }
        type='button'
      >
        Override anchor
      </button>
    </div>
  );
}

export function PerToastAnchorSnackbar() {
  return (
    <SnackbarProvider anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}>
      <Inner />
    </SnackbarProvider>
  );
}
