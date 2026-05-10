import { SnackbarProvider, useSnackbar } from '../../src';

function Inner() {
  const { enqueueSnackbar } = useSnackbar();
  return (
    <div data-fixture-page=''>
      <button data-testid='enqueue' onClick={() => enqueueSnackbar('Persisted', { persist: true })} type='button'>
        Enqueue persist
      </button>
    </div>
  );
}

export function PersistSnackbar() {
  return (
    <SnackbarProvider autoHideDuration={200}>
      <Inner />
    </SnackbarProvider>
  );
}
