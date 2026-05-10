import { SnackbarProvider, useSnackbar } from '../../src';

interface Props {
  disableWindowBlurListener?: boolean;
  duration?: number;
}

function Inner({ disableWindowBlurListener, duration }: Props) {
  const { enqueueSnackbar } = useSnackbar();
  return (
    <div data-fixture-page=''>
      <button
        data-testid='enqueue'
        onClick={() => enqueueSnackbar('blur test', { autoHideDuration: duration ?? 300, disableWindowBlurListener })}
        type='button'
      >
        Enqueue
      </button>
    </div>
  );
}

export function BlurListenerSnackbar(props: Props) {
  return (
    <SnackbarProvider>
      <Inner {...props} />
    </SnackbarProvider>
  );
}
