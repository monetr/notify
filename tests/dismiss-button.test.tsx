import { page } from '@rstest/browser';
import { render } from '@rstest/browser-react';
import { describe, expect, test } from '@rstest/core';

import { ANIMATION_DURATION } from './constants';
import { BasicSnackbar } from './fixtures/BasicSnackbar';
import { NOTIFICATION_SELECTOR, wait } from './helpers';

describe('dismiss button', () => {
  test('clicking × dismisses the toast (real pointer click via Playwright)', async () => {
    await render(<BasicSnackbar duration={10_000} />);
    await page.getByTestId('enqueue').click();
    await wait(ANIMATION_DURATION);
    expect(document.querySelectorAll(NOTIFICATION_SELECTOR).length).toBe(1);

    // Use Playwright's real click so the full pointerdown/pointerup/click sequence fires and
    // we catch regressions where the LI's drag handler steals the click.
    await page.getByTestId('notification-dismiss').click();
    await wait(ANIMATION_DURATION + 100);
    expect(document.querySelectorAll(NOTIFICATION_SELECTOR).length).toBe(0);
  });
});
