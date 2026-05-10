import { SnackbarProvider, useSnackbar } from '../../src';
import type { AnchorOrigin } from '../../src/types';

interface Props {
  message?: string;
  duration?: number;
  anchorOrigin?: AnchorOrigin;
  prefetch?: 'never' | 'idle' | 'mount';
}

function Inner({ message = 'Hello', duration }: Props) {
  const { enqueueSnackbar, closeSnackbar } = useSnackbar();
  return (
    <div data-fixture-page=''>
      <button
        data-testid='enqueue'
        onClick={() => enqueueSnackbar(message, duration !== undefined ? { autoHideDuration: duration } : undefined)}
        type='button'
      >
        Enqueue
      </button>
      <button data-testid='enqueue-jsx' onClick={() => enqueueSnackbar(<strong>Bold message</strong>)} type='button'>
        Enqueue JSX
      </button>
      <button data-testid='close-all' onClick={() => closeSnackbar()} type='button'>
        Close all
      </button>
    </div>
  );
}

export function BasicSnackbar(props: Props) {
  return (
    <SnackbarProvider anchorOrigin={props.anchorOrigin} autoHideDuration={props.duration} prefetch={props.prefetch}>
      <Inner {...props} />
    </SnackbarProvider>
  );
}
