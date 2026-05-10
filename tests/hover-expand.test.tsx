import { page } from '@rstest/browser';
import { render } from '@rstest/browser-react';
import { describe, expect, test } from '@rstest/core';

import { ANIMATION_DURATION } from './constants';
import { MaxStackSnackbar } from './fixtures/MaxStackSnackbar';
import { hoverStack, NOTIFICATION_SELECTOR, unhoverStack, wait } from './helpers';

describe('hover-expand', () => {
  test('hovering the stack toggles data-stack-hovered', async () => {
    await render(<MaxStackSnackbar />);
    await page.getByTestId('enqueue-one').click();
    await page.getByTestId('enqueue-one').click();
    await page.getByTestId('enqueue-one').click();
    await wait(ANIMATION_DURATION);

    const stack = document.querySelector<HTMLElement>('[data-monetr-notifier-stack]');
    expect(stack?.getAttribute('data-stack-hovered')).toBe('false');

    await hoverStack();
    await wait(50);
    expect(stack?.getAttribute('data-stack-hovered')).toBe('true');

    await unhoverStack();
    await wait(50);
    expect(stack?.getAttribute('data-stack-hovered')).toBe('false');
  });

  test('background notification transform changes when hovered (offset 8px → 14px)', async () => {
    await render(<MaxStackSnackbar />);
    await page.getByTestId('enqueue-one').click();
    await page.getByTestId('enqueue-one').click();
    await wait(ANIMATION_DURATION + 100);

    const items = document.querySelectorAll<HTMLElement>(NOTIFICATION_SELECTOR);
    expect(items.length).toBe(2);
    // Read the computed --monetr-stack-offset on the back item; CSS swaps it from 8px to 14px.
    const before = window.getComputedStyle(items[1]).getPropertyValue('--monetr-stack-offset').trim();
    expect(before).toBe('8px');

    await hoverStack();
    await wait(50);
    const after = window.getComputedStyle(items[1]).getPropertyValue('--monetr-stack-offset').trim();
    expect(after).toBe('14px');
  });
});
