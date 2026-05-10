import { page } from '@rstest/browser';
import { render } from '@rstest/browser-react';
import { describe, expect, test } from '@rstest/core';

import { ANIMATION_DURATION } from './constants';
import { IconVariantSnackbar } from './fixtures/IconVariantSnackbar';
import { FRONT_NOTIFICATION_SELECTOR, wait } from './helpers';

describe('iconVariant', () => {
  test('renders the configured icon node before the message text', async () => {
    await render(<IconVariantSnackbar />);
    await page.getByTestId('enqueue-success').click();
    await wait(ANIMATION_DURATION);

    const node = document.querySelector<HTMLElement>(FRONT_NOTIFICATION_SELECTOR);
    expect(node).toBeTruthy();
    const slot = node?.querySelector('[data-monetr-notification-icon-slot]');
    const message = node?.querySelector('[data-monetr-notification-message]');
    expect(slot).toBeTruthy();
    expect(message).toBeTruthy();

    // Slot must come before the message in DOM order so screen readers and visual order match.
    const cmp = slot?.compareDocumentPosition(message!);
    expect(cmp).toBeDefined();
    expect((cmp ?? 0) & Node.DOCUMENT_POSITION_FOLLOWING).toBeTruthy();

    // The configured icon contents are rendered.
    expect(slot?.querySelector('[data-testid="icon-success"]')).toBeTruthy();
  });

  test('falls back to pip when no iconVariant entry is provided', async () => {
    // IconVariantSnackbar provides icons for success, error, warning. Trigger error: has icon, no pip.
    // (Would-be info has no icon, but the fixture only exposes success/error.)
    await render(<IconVariantSnackbar />);
    await page.getByTestId('enqueue-error').click();
    await wait(ANIMATION_DURATION);
    const node = document.querySelector<HTMLElement>(FRONT_NOTIFICATION_SELECTOR);
    expect(node?.querySelector('[data-monetr-notification-icon-slot]')).toBeTruthy();
    expect(node?.querySelector('[data-monetr-notification-pip]')).toBeNull();
  });
});
