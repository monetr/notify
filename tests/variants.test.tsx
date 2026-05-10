import { page } from '@rstest/browser';
import { render } from '@rstest/browser-react';
import { describe, expect, test } from '@rstest/core';

import { ANIMATION_DURATION } from './constants';
import { VariantsSnackbar } from './fixtures/VariantsSnackbar';
import { FRONT_NOTIFICATION_SELECTOR, wait } from './helpers';

const VARIANTS = ['default', 'success', 'error', 'warning', 'info'] as const;

describe('variants', () => {
  for (const variant of VARIANTS) {
    test(`enqueueSnackbar with variant '${variant}' sets the data attribute`, async () => {
      await render(<VariantsSnackbar />);
      await page.getByTestId(`enqueue-${variant}`).click();
      await wait(ANIMATION_DURATION);
      const node = document.querySelector<HTMLElement>(FRONT_NOTIFICATION_SELECTOR);
      expect(node).toBeTruthy();
      expect(node?.getAttribute('data-monetr-notification-variant')).toBe(variant);
    });
  }

  test('non-default variants render a pip', async () => {
    await render(<VariantsSnackbar />);
    await page.getByTestId('enqueue-success').click();
    await wait(ANIMATION_DURATION);
    expect(document.querySelector('[data-monetr-notification-pip]')).toBeTruthy();
  });

  test("'default' variant does NOT render a pip", async () => {
    await render(<VariantsSnackbar />);
    await page.getByTestId('enqueue-default').click();
    await wait(ANIMATION_DURATION);
    expect(document.querySelector('[data-monetr-notification-pip]')).toBeNull();
  });

  test('aria-live=polite for default/success/info, assertive for error/warning', async () => {
    await render(<VariantsSnackbar />);
    await page.getByTestId('enqueue-success').click();
    await wait(ANIMATION_DURATION);
    let node = document.querySelector<HTMLElement>(FRONT_NOTIFICATION_SELECTOR);
    expect(node?.getAttribute('aria-live')).toBe('polite');
    expect(node?.getAttribute('role')).toBe('status');

    await page.getByTestId('enqueue-error').click();
    await wait(ANIMATION_DURATION);
    node = document.querySelector<HTMLElement>(FRONT_NOTIFICATION_SELECTOR);
    expect(node?.getAttribute('aria-live')).toBe('assertive');
    expect(node?.getAttribute('role')).toBe('alert');
  });
});
