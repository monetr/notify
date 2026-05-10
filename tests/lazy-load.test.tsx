import { page } from '@rstest/browser';
import { render } from '@rstest/browser-react';
import { describe, expect, test } from '@rstest/core';

import { ANIMATION_DURATION } from './constants';
import { BasicSnackbar } from './fixtures/BasicSnackbar';
import { NOTIFICATION_SELECTOR, wait } from './helpers';

describe('lazy load', () => {
  test('the renderer chunk is not requested until first enqueueSnackbar (prefetch=never)', async () => {
    await render(<BasicSnackbar prefetch='never' />);
    await wait(100);
    // No notification yet; chunk should not be in the DOM.
    expect(document.querySelectorAll(NOTIFICATION_SELECTOR).length).toBe(0);

    await page.getByTestId('enqueue').click();
    // After enqueue: the lazy chunk loads, renderer mounts, notification appears.
    await wait(ANIMATION_DURATION + 200);
    expect(document.querySelectorAll(NOTIFICATION_SELECTOR).length).toBe(1);
  });
});
