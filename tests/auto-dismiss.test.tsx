import { page } from '@rstest/browser';
import { render } from '@rstest/browser-react';
import { describe, expect, test } from '@rstest/core';

import { ANIMATION_DURATION } from './constants';
import { BasicSnackbar } from './fixtures/BasicSnackbar';
import { NOTIFICATION_SELECTOR, wait } from './helpers';

describe('auto-dismiss', () => {
  test('toast disappears after autoHideDuration', async () => {
    await render(<BasicSnackbar duration={300} />);
    await page.getByTestId('enqueue').click();
    await wait(ANIMATION_DURATION);
    expect(document.querySelectorAll(NOTIFICATION_SELECTOR).length).toBe(1);

    await wait(300 + ANIMATION_DURATION + 100);
    expect(document.querySelectorAll(NOTIFICATION_SELECTOR).length).toBe(0);
  });
});
