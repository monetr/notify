import { page } from '@rstest/browser';
import { render } from '@rstest/browser-react';
import { describe, expect, test } from '@rstest/core';

import { ANIMATION_DURATION } from './constants';
import { HoverPauseSnackbar } from './fixtures/HoverPauseSnackbar';
import { hoverStack, NOTIFICATION_SELECTOR, unhoverStack, wait } from './helpers';

describe('hover-pause', () => {
  test('hovering the stack pauses the auto-dismiss timer; unhovering resumes', async () => {
    // Use a longer duration so we can hover before the timer expires.
    await render(<HoverPauseSnackbar duration={1500} />);
    await page.getByTestId('enqueue').click();
    await wait(ANIMATION_DURATION);

    // Hover well before the 1500ms timer would fire.
    await hoverStack();

    // Wait beyond the original duration — the toast must still be present because the timer is
    // paused while the stack is hovered.
    await wait(2000);
    expect(document.querySelectorAll(NOTIFICATION_SELECTOR).length).toBe(1);

    // Unhover; the remaining time resumes and the toast disappears within roughly the same
    // duration's worth of time.
    await unhoverStack();
    await wait(2000 + ANIMATION_DURATION);
    expect(document.querySelectorAll(NOTIFICATION_SELECTOR).length).toBe(0);
  });
});
