import { useSnackbar } from '@monetr/notify';

import { Button } from './Demo';

export function BasicDemo() {
  const { enqueueSnackbar, closeSnackbar } = useSnackbar();
  return (
    <>
      <Button onClick={() => enqueueSnackbar('Saved')}>Show toast</Button>
      <Button onClick={() => closeSnackbar()}>Close all</Button>
    </>
  );
}
