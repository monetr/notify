import { page } from '@rstest/browser';
import { render } from '@rstest/browser-react';
import { describe, expect, test } from '@rstest/core';

import { ANIMATION_DURATION } from './constants';
import { BasicSnackbar } from './fixtures/BasicSnackbar';
import { FRONT_NOTIFICATION_SELECTOR, wait } from './helpers';

function readProgress(): number {
  const node = document.querySelector<HTMLElement>(FRONT_NOTIFICATION_SELECTOR);
  if (!node) {
    throw new Error('No notification mounted');
  }
  const v = node.style.getPropertyValue('--monetr-notification-progress');
  return Number(v || '0');
}

describe('progress rail', () => {
  test('--monetr-notification-progress increases monotonically', async () => {
    await render(<BasicSnackbar duration={1000} />);
    await page.getByTestId('enqueue').click();
    await wait(ANIMATION_DURATION);

    const at0 = readProgress();
    await wait(300);
    const at300 = readProgress();
    await wait(400);
    const at700 = readProgress();

    expect(at0).toBeLessThan(at300);
    expect(at300).toBeLessThan(at700);
    expect(at700).toBeLessThanOrEqual(1);
  });
});
