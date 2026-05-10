import { page } from '@rstest/browser';
import { render } from '@rstest/browser-react';
import { describe, expect, test } from '@rstest/core';

import { ANIMATION_DURATION } from './constants';
import { PersistSnackbar } from './fixtures/PersistSnackbar';
import { NOTIFICATION_SELECTOR, wait } from './helpers';

describe('persist', () => {
  test('persist:true keeps the toast visible past the provider default duration', async () => {
    await render(<PersistSnackbar />);
    await page.getByTestId('enqueue').click();
    await wait(ANIMATION_DURATION);
    expect(document.querySelectorAll(NOTIFICATION_SELECTOR).length).toBe(1);

    // Provider default is 200ms; wait well past it. Persistent toast should still be visible.
    await wait(800);
    expect(document.querySelectorAll(NOTIFICATION_SELECTOR).length).toBe(1);
    // No progress rail when there's no autoHideDuration.
    const progressTrack = document.querySelector('[data-monetr-notification-progress-track]');
    expect(progressTrack).toBeNull();
  });
});
