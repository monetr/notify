import { page } from '@rstest/browser';
import { render } from '@rstest/browser-react';
import { describe, expect, test } from '@rstest/core';

import { ANIMATION_DURATION } from './constants';
import { MaxStackSnackbar } from './fixtures/MaxStackSnackbar';
import { NOTIFICATION_SELECTOR, wait } from './helpers';

describe('drag only top of stack', () => {
  test('background notifications have pointer-events: none', async () => {
    await render(<MaxStackSnackbar />);
    await page.getByTestId('enqueue-one').click();
    await page.getByTestId('enqueue-one').click();
    await page.getByTestId('enqueue-one').click();
    await wait(ANIMATION_DURATION);

    const items = document.querySelectorAll<HTMLElement>(NOTIFICATION_SELECTOR);
    expect(items.length).toBe(3);
    expect(window.getComputedStyle(items[0]).pointerEvents).toBe('auto');
    expect(window.getComputedStyle(items[1]).pointerEvents).toBe('none');
    expect(window.getComputedStyle(items[2]).pointerEvents).toBe('none');
  });
});
