import { page } from '@rstest/browser';
import { render } from '@rstest/browser-react';
import { describe, expect, test } from '@rstest/core';

import { ANIMATION_DURATION } from './constants';
import { DragSnackbar } from './fixtures/DragSnackbar';
import { dragHorizontally, dragVertically, NOTIFICATION_SELECTOR, wait } from './helpers';

const ANCHOR = { vertical: 'bottom', horizontal: 'right' } as const;

describe('drag bottom-right', () => {
  test('swipe down dismisses', async () => {
    await render(<DragSnackbar anchor={ANCHOR} />);
    await page.getByTestId('enqueue').click();
    await wait(ANIMATION_DURATION);
    await dragVertically(150);
    await wait(ANIMATION_DURATION + 200);
    expect(document.querySelectorAll(NOTIFICATION_SELECTOR).length).toBe(0);
  });

  test('swipe right dismisses', async () => {
    await render(<DragSnackbar anchor={ANCHOR} />);
    await page.getByTestId('enqueue').click();
    await wait(ANIMATION_DURATION);
    await dragHorizontally(150);
    await wait(ANIMATION_DURATION + 200);
    expect(document.querySelectorAll(NOTIFICATION_SELECTOR).length).toBe(0);
  });

  test('swipe left snaps back', async () => {
    await render(<DragSnackbar anchor={ANCHOR} />);
    await page.getByTestId('enqueue').click();
    await wait(ANIMATION_DURATION);
    await dragHorizontally(-150);
    await wait(ANIMATION_DURATION);
    expect(document.querySelectorAll(NOTIFICATION_SELECTOR).length).toBe(1);
  });
});
