import { page } from '@rstest/browser';
import { render } from '@rstest/browser-react';
import { describe, expect, test } from '@rstest/core';

import { ANIMATION_DURATION } from './constants';
import { BlurListenerSnackbar } from './fixtures/BlurListenerSnackbar';
import { NOTIFICATION_SELECTOR, wait } from './helpers';

function dispatchBlur() {
  window.dispatchEvent(new Event('blur'));
}
function dispatchFocus() {
  window.dispatchEvent(new Event('focus'));
}

describe('disableWindowBlurListener', () => {
  test('default off: window blur pauses the auto-dismiss timer', async () => {
    await render(<BlurListenerSnackbar duration={500} />);
    await page.getByTestId('enqueue').click();
    await wait(ANIMATION_DURATION);

    dispatchBlur();
    await wait(800); // past 500ms duration
    expect(document.querySelectorAll(NOTIFICATION_SELECTOR).length).toBe(1);

    dispatchFocus();
    await wait(600 + ANIMATION_DURATION);
    expect(document.querySelectorAll(NOTIFICATION_SELECTOR).length).toBe(0);
  });

  test('disableWindowBlurListener: true: timer fires through blur', async () => {
    await render(<BlurListenerSnackbar disableWindowBlurListener duration={400} />);
    await page.getByTestId('enqueue').click();
    await wait(ANIMATION_DURATION);

    dispatchBlur();
    await wait(500 + ANIMATION_DURATION);
    expect(document.querySelectorAll(NOTIFICATION_SELECTOR).length).toBe(0);
  });
});
