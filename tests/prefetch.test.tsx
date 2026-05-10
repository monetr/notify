import { page } from '@rstest/browser';
import { render } from '@rstest/browser-react';
import { describe, expect, test } from '@rstest/core';

import { ANIMATION_DURATION } from './constants';
import { PrefetchSnackbar } from './fixtures/PrefetchSnackbar';
import { NOTIFICATION_SELECTOR, wait } from './helpers';

describe('prefetch', () => {
  test('prefetch="never" + enqueue still produces a notification', async () => {
    await render(<PrefetchSnackbar prefetch='never' />);
    await page.getByTestId('enqueue').click();
    await wait(ANIMATION_DURATION + 200);
    expect(document.querySelectorAll(NOTIFICATION_SELECTOR).length).toBe(1);
  });

  test('prefetch="mount" doesn\'t crash; subsequent enqueue works', async () => {
    await render(<PrefetchSnackbar prefetch='mount' />);
    await wait(100); // mount-time prefetch should kick off
    await page.getByTestId('enqueue').click();
    await wait(ANIMATION_DURATION + 100);
    expect(document.querySelectorAll(NOTIFICATION_SELECTOR).length).toBe(1);
  });

  test('prefetch="idle" doesn\'t crash; subsequent enqueue works', async () => {
    await render(<PrefetchSnackbar prefetch='idle' />);
    await wait(300); // idle prefetch typically fires within an idle window
    await page.getByTestId('enqueue').click();
    await wait(ANIMATION_DURATION + 100);
    expect(document.querySelectorAll(NOTIFICATION_SELECTOR).length).toBe(1);
  });
});
