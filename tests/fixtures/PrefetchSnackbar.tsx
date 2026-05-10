import { SnackbarProvider, useSnackbar } from '../../src';

function Inner() {
  const { enqueueSnackbar } = useSnackbar();
  return (
    <div data-fixture-page=''>
      <button data-testid='enqueue' onClick={() => enqueueSnackbar('Hi')} type='button'>
        Enqueue
      </button>
    </div>
  );
}

export function PrefetchSnackbar({ prefetch }: { prefetch: 'never' | 'idle' | 'mount' }) {
  return (
    <SnackbarProvider prefetch={prefetch}>
      <Inner />
    </SnackbarProvider>
  );
}
