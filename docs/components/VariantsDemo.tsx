import { useSnackbar, type VariantType } from '@monetr/notify';

import { Button } from './Demo';

const variants: Array<{ variant: VariantType; label: string; accent: string }> = [
  { variant: 'default', label: 'Default', accent: '#9ca3af' },
  { variant: 'success', label: 'Success', accent: '#34d399' },
  { variant: 'error', label: 'Error', accent: '#f87171' },
  { variant: 'warning', label: 'Warning', accent: '#fbbf24' },
  { variant: 'info', label: 'Info', accent: '#60a5fa' },
];

export function VariantsDemo() {
  const { enqueueSnackbar } = useSnackbar();
  return (
    <>
      {variants.map(({ variant, label, accent }) => (
        <Button accent={accent} key={variant} onClick={() => enqueueSnackbar(label, { variant })}>
          {label}
        </Button>
      ))}
    </>
  );
}
