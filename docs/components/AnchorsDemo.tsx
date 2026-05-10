import { type AnchorOrigin, useSnackbar } from '@monetr/notify';

import { Button } from './Demo';

const anchors: AnchorOrigin[] = [
  { vertical: 'top', horizontal: 'left' },
  { vertical: 'top', horizontal: 'center' },
  { vertical: 'top', horizontal: 'right' },
  { vertical: 'bottom', horizontal: 'left' },
  { vertical: 'bottom', horizontal: 'center' },
  { vertical: 'bottom', horizontal: 'right' },
];

export function AnchorsDemo() {
  const { enqueueSnackbar } = useSnackbar();
  return (
    <>
      {anchors.map(anchor => {
        const label = `${anchor.vertical}-${anchor.horizontal}`;
        return (
          <Button
            key={label}
            onClick={() => enqueueSnackbar(label, { anchorOrigin: anchor, variant: 'info' })}
          >
            {label}
          </Button>
        );
      })}
    </>
  );
}
