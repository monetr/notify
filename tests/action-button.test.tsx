import { page } from '@rstest/browser';
import { render } from '@rstest/browser-react';
import { describe, expect, test } from '@rstest/core';

import { ANIMATION_DURATION } from './constants';
import { ActionSnackbar } from './fixtures/ActionSnackbar';
import { NOTIFICATION_SELECTOR, wait } from './helpers';

describe('action button', () => {
  test('clicking the action button dismisses and fires onClose', async () => {
    await render(<ActionSnackbar />);
    await page.getByTestId('enqueue').click();
    await wait(ANIMATION_DURATION);

    const action = document.querySelector<HTMLButtonElement>('[data-monetr-notification-action]');
    expect(action).toBeTruthy();
    expect(action?.textContent).toContain('Undo');

    action?.click();
    await wait(ANIMATION_DURATION + 100);
    expect(document.querySelectorAll(NOTIFICATION_SELECTOR).length).toBe(0);
    // ActionSnackbar increments a counter on each onClose. After 1 click, count = 1.
    expect(document.querySelector('[data-testid="close-count"]')?.textContent).toBe('1');
  });
});
