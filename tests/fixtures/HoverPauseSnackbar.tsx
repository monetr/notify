import { SnackbarProvider, useSnackbar } from '../../src';

function Inner({ duration }: { duration: number }) {
  const { enqueueSnackbar } = useSnackbar();
  return (
    <div data-fixture-page=''>
      <button
        data-testid='enqueue'
        onClick={() => enqueueSnackbar('Hover-pause me', { autoHideDuration: duration })}
        type='button'
      >
        Enqueue ({duration} ms)
      </button>
    </div>
  );
}

export function HoverPauseSnackbar({ duration = 600 }: { duration?: number } = {}) {
  return (
    <SnackbarProvider>
      <Inner duration={duration} />
    </SnackbarProvider>
  );
}
