import { page } from '@rstest/browser';
import { render } from '@rstest/browser-react';
import { describe, expect, test } from '@rstest/core';

import { ANIMATION_DURATION } from './constants';
import { DragSnackbar } from './fixtures/DragSnackbar';
import { dragVertically, NOTIFICATION_SELECTOR, wait } from './helpers';

describe('drag threshold', () => {
  test('drag less than 100px (the dismiss distance) snaps back', async () => {
    await render(<DragSnackbar anchor={{ vertical: 'bottom', horizontal: 'center' }} />);
    await page.getByTestId('enqueue').click();
    await wait(ANIMATION_DURATION);
    await dragVertically(50);
    await wait(ANIMATION_DURATION);
    expect(document.querySelectorAll(NOTIFICATION_SELECTOR).length).toBe(1);
  });
});
