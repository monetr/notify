import { SnackbarProvider, useSnackbar } from '../../src';
import type { AnchorOrigin } from '../../src/types';

const ANCHORS: AnchorOrigin[] = [
  { vertical: 'top', horizontal: 'left' },
  { vertical: 'top', horizontal: 'center' },
  { vertical: 'top', horizontal: 'right' },
  { vertical: 'bottom', horizontal: 'left' },
  { vertical: 'bottom', horizontal: 'center' },
  { vertical: 'bottom', horizontal: 'right' },
];

function Inner() {
  const { enqueueSnackbar, closeSnackbar } = useSnackbar();
  return (
    <div data-fixture-page=''>
      {ANCHORS.map(a => (
        <button
          data-testid={`enqueue-${a.vertical}-${a.horizontal}`}
          key={`${a.vertical}-${a.horizontal}`}
          onClick={() => enqueueSnackbar(`${a.vertical}-${a.horizontal}`, { anchorOrigin: a, persist: true })}
          type='button'
        >
          .{a.vertical}-{a.horizontal}
        </button>
      ))}
      <button data-testid='close-all' onClick={() => closeSnackbar()} type='button'>
        Close all
      </button>
    </div>
  );
}

export function AnchorMatrixSnackbar() {
  return (
    <SnackbarProvider>
      <Inner />
    </SnackbarProvider>
  );
}
