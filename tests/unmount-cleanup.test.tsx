import { useState } from 'react';

import { page } from '@rstest/browser';
import { render } from '@rstest/browser-react';
import { describe, expect, test } from '@rstest/core';

import { ANIMATION_DURATION } from './constants';
import { NOTIFICATION_SELECTOR, wait } from './helpers';
import { SnackbarProvider, useSnackbar } from '../src';

function Inner() {
  const { enqueueSnackbar } = useSnackbar();
  return (
    <button data-testid='enqueue' onClick={() => enqueueSnackbar('cleanup', { autoHideDuration: 5000 })} type='button'>
      Enqueue
    </button>
  );
}

function UnmountSnackbar() {
  const [mounted, setMounted] = useState(true);
  return (
    <>
      <button data-testid='unmount' onClick={() => setMounted(false)} type='button'>
        Unmount
      </button>
      {mounted ? (
        <SnackbarProvider>
          <Inner />
        </SnackbarProvider>
      ) : null}
    </>
  );
}

describe('unmount cleanup', () => {
  test('pending timers are cancelled when the provider unmounts; no errors thrown', async () => {
    const errors: string[] = [];
    const onError = (event: ErrorEvent) => errors.push(event.message);
    window.addEventListener('error', onError);

    try {
      await render(<UnmountSnackbar />);
      await page.getByTestId('enqueue').click();
      await wait(ANIMATION_DURATION);
      expect(document.querySelectorAll(NOTIFICATION_SELECTOR).length).toBe(1);

      await page.getByTestId('unmount').click();
      // The provider unmounts; pending 5000ms timer must be cleared. Wait beyond it.
      await wait(500);
      expect(document.querySelectorAll(NOTIFICATION_SELECTOR).length).toBe(0);
      expect(errors.length).toBe(0);
    } finally {
      window.removeEventListener('error', onError);
    }
  });
});
