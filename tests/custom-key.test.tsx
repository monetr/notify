import { useRef } from 'react';

import { page } from '@rstest/browser';
import { render } from '@rstest/browser-react';
import { describe, expect, test } from '@rstest/core';

import { ANIMATION_DURATION } from './constants';
import { NOTIFICATION_SELECTOR, wait } from './helpers';
import { SnackbarProvider, useSnackbar } from '../src';

function Inner() {
  const { enqueueSnackbar } = useSnackbar();
  const last = useRef<string | number | null>(null);
  return (
    <div data-fixture-page=''>
      <button
        data-testid='enqueue-custom-key'
        onClick={() => {
          last.current = enqueueSnackbar('Same key', { key: 'fixed', persist: true });
        }}
        type='button'
      >
        Enqueue (key=fixed)
      </button>
      <span data-testid='last-key'>{String(last.current ?? '')}</span>
    </div>
  );
}

describe('custom key', () => {
  test('consumer-supplied key is used and dedup prevents a second toast', async () => {
    await render(
      <SnackbarProvider>
        <Inner />
      </SnackbarProvider>,
    );

    await page.getByTestId('enqueue-custom-key').click();
    await wait(ANIMATION_DURATION);
    expect(document.querySelectorAll(NOTIFICATION_SELECTOR).length).toBe(1);

    await page.getByTestId('enqueue-custom-key').click();
    await page.getByTestId('enqueue-custom-key').click();
    await wait(ANIMATION_DURATION);
    expect(document.querySelectorAll(NOTIFICATION_SELECTOR).length).toBe(1);
  });
});
