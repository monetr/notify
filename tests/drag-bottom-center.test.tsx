import { page } from '@rstest/browser';
import { render } from '@rstest/browser-react';
import { describe, expect, test } from '@rstest/core';

import { ANIMATION_DURATION } from './constants';
import { DragSnackbar } from './fixtures/DragSnackbar';
import { dragHorizontally, dragVertically, dragVerticallyImperfect, NOTIFICATION_SELECTOR, wait } from './helpers';

const ANCHOR = { vertical: 'bottom', horizontal: 'center' } as const;

describe('drag bottom-center', () => {
  test('swipe down past threshold dismisses', async () => {
    await render(<DragSnackbar anchor={ANCHOR} />);
    await page.getByTestId('enqueue').click();
    await wait(ANIMATION_DURATION);
    await dragVertically(150);
    await wait(ANIMATION_DURATION + 200);
    expect(document.querySelectorAll(NOTIFICATION_SELECTOR).length).toBe(0);
  });

  test('swipe up snaps back', async () => {
    await render(<DragSnackbar anchor={ANCHOR} />);
    await page.getByTestId('enqueue').click();
    await wait(ANIMATION_DURATION);
    await dragVertically(-200);
    await wait(ANIMATION_DURATION);
    expect(document.querySelectorAll(NOTIFICATION_SELECTOR).length).toBe(1);
  });

  test('swipe right dismisses', async () => {
    await render(<DragSnackbar anchor={ANCHOR} />);
    await page.getByTestId('enqueue').click();
    await wait(ANIMATION_DURATION);
    await dragHorizontally(150);
    await wait(ANIMATION_DURATION + 200);
    expect(document.querySelectorAll(NOTIFICATION_SELECTOR).length).toBe(0);
  });

  test('swipe left dismisses', async () => {
    await render(<DragSnackbar anchor={ANCHOR} />);
    await page.getByTestId('enqueue').click();
    await wait(ANIMATION_DURATION);
    await dragHorizontally(-150);
    await wait(ANIMATION_DURATION + 200);
    expect(document.querySelectorAll(NOTIFICATION_SELECTOR).length).toBe(0);
  });

  test('upward swipe with slight horizontal drift does not dismiss', async () => {
    await render(<DragSnackbar anchor={ANCHOR} />);
    await page.getByTestId('enqueue').click();
    await wait(ANIMATION_DURATION);
    // Up is disallowed for a bottom anchor and the 60px horizontal drift is well below the 100px
    // distance threshold. Its velocity in the final sample window does satisfy the velocity
    // threshold though, so without an axis-confusion guard the toast dismisses as a sideways
    // swipe the user never intended.
    await dragVerticallyImperfect(-200, 60);
    await wait(ANIMATION_DURATION + 200);
    expect(document.querySelectorAll(NOTIFICATION_SELECTOR).length).toBe(1);
  });
});
