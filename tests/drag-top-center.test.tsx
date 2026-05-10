import { page } from '@rstest/browser';
import { render } from '@rstest/browser-react';
import { describe, expect, test } from '@rstest/core';

import { ANIMATION_DURATION } from './constants';
import { DragSnackbar } from './fixtures/DragSnackbar';
import { dragVertically, NOTIFICATION_SELECTOR, wait } from './helpers';

const ANCHOR = { vertical: 'top', horizontal: 'center' } as const;

describe('drag top-center', () => {
  test('swipe up dismisses', async () => {
    await render(<DragSnackbar anchor={ANCHOR} />);
    await page.getByTestId('enqueue').click();
    await wait(ANIMATION_DURATION);
    await dragVertically(-150);
    await wait(ANIMATION_DURATION + 200);
    expect(document.querySelectorAll(NOTIFICATION_SELECTOR).length).toBe(0);
  });

  test('swipe down snaps back', async () => {
    await render(<DragSnackbar anchor={ANCHOR} />);
    await page.getByTestId('enqueue').click();
    await wait(ANIMATION_DURATION);
    await dragVertically(200);
    await wait(ANIMATION_DURATION);
    expect(document.querySelectorAll(NOTIFICATION_SELECTOR).length).toBe(1);
  });
});
