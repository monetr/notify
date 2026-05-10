import { SnackbarProvider, useSnackbar } from '../../src';
import type { VariantType } from '../../src/types';

const VARIANTS: VariantType[] = ['default', 'success', 'error', 'warning', 'info'];

function Inner() {
  const { enqueueSnackbar } = useSnackbar();
  return (
    <div data-fixture-page=''>
      {VARIANTS.map(v => (
        <button data-testid={`enqueue-${v}`} key={v} onClick={() => enqueueSnackbar(v, { variant: v })} type='button'>
          .{v}
        </button>
      ))}
    </div>
  );
}

export function VariantsSnackbar() {
  return (
    <SnackbarProvider>
      <Inner />
    </SnackbarProvider>
  );
}
