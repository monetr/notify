import type { ReactNode } from 'react';

import { useSnackbar, type VariantType } from '@monetr/notify';

import { Button } from './Demo';

const iconStyle = {
  display: 'inline-flex',
  alignItems: 'center',
  justifyContent: 'center',
  width: '18px',
  height: '18px',
  borderRadius: '50%',
  fontSize: '11px',
  fontWeight: 700,
};

export const iconVariant: Partial<Record<VariantType, ReactNode>> = {
  success: <span style={{ ...iconStyle, background: '#34d399', color: '#022c22' }}>✓</span>,
  error: <span style={{ ...iconStyle, background: '#f87171', color: '#450a0a' }}>!</span>,
  warning: <span style={{ ...iconStyle, background: '#fbbf24', color: '#451a03' }}>!</span>,
  info: <span style={{ ...iconStyle, background: '#60a5fa', color: '#0c1e3a' }}>i</span>,
};

export function IconsDemo() {
  const { enqueueSnackbar } = useSnackbar();
  return (
    <>
      <Button accent='#34d399' onClick={() => enqueueSnackbar('Changes saved', { variant: 'success' })}>
        Success
      </Button>
      <Button accent='#f87171' onClick={() => enqueueSnackbar('Network error', { variant: 'error' })}>
        Error
      </Button>
      <Button accent='#fbbf24' onClick={() => enqueueSnackbar('Disk almost full', { variant: 'warning' })}>
        Warning
      </Button>
      <Button accent='#60a5fa' onClick={() => enqueueSnackbar('Update available', { variant: 'info' })}>
        Info
      </Button>
    </>
  );
}
