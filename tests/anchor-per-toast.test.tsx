import { page } from '@rstest/browser';
import { render } from '@rstest/browser-react';
import { describe, expect, test } from '@rstest/core';

import { ANIMATION_DURATION } from './constants';
import { PerToastAnchorSnackbar } from './fixtures/PerToastAnchorSnackbar';
import { wait } from './helpers';

describe('per-toast anchor override', () => {
  test('anchorOrigin in options overrides the provider default', async () => {
    await render(<PerToastAnchorSnackbar />);
    await page.getByTestId('enqueue-override').click();
    await wait(ANIMATION_DURATION);

    // Provider default is bottom-center; the override is top-right.
    const stacks = document.querySelectorAll<HTMLElement>('[data-monetr-notifier-stack]');
    expect(stacks.length).toBe(1);
    expect(stacks[0].getAttribute('data-stack-anchor')).toBe('top-right');
  });
});
