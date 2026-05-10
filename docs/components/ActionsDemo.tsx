import { useState } from 'react';

import { useSnackbar } from '@monetr/notify';

import { Button } from './Demo';

export function ActionsDemo() {
  const { enqueueSnackbar } = useSnackbar();
  const [count, setCount] = useState(0);
  return (
    <>
      <Button
        onClick={() =>
          enqueueSnackbar(`Deleted item #${count + 1}`, {
            variant: 'success',
            persist: true,
            action: <span>Undo</span>,
            onClose: (_e, reason) => {
              if (reason === 'instructed') {
                setCount(c => c + 1);
              }
            },
          })
        }
      >
        Delete with undo
      </Button>
      <span style={{ marginLeft: '12px', opacity: 0.6 }}>Dismissed: {count}</span>
    </>
  );
}
