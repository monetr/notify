import { useSnackbar } from '@monetr/notify';

import { Button } from './Demo';

const messages = [
  { msg: 'Changes saved successfully', variant: 'success' as const },
  { msg: 'Failed to connect to server', variant: 'error' as const },
  { msg: 'Your trial expires in 3 days', variant: 'warning' as const },
  { msg: 'New version available: v2.4.1', variant: 'info' as const },
  { msg: 'File uploaded', variant: 'default' as const },
];

export function RapidFireDemo() {
  const { enqueueSnackbar } = useSnackbar();
  const fire = () => {
    messages.forEach((m, i) => setTimeout(() => enqueueSnackbar(m.msg, { variant: m.variant }), i * 250));
  };
  return <Button onClick={fire}>Rapid fire 5 toasts</Button>;
}
