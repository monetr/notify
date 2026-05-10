import { page } from '@rstest/browser';
import { render } from '@rstest/browser-react';
import { describe, expect, test } from '@rstest/core';

import { ANIMATION_DURATION } from './constants';
import { MaxStackSnackbar } from './fixtures/MaxStackSnackbar';
import { NOTIFICATION_SELECTOR, wait } from './helpers';
import type { CloseReason, SnackbarKey } from '../src/types';

describe('max-stack', () => {
  test('only maxSnack=5 notifications are in the DOM after enqueueing 7', async () => {
    const closes: { reason: CloseReason; key: SnackbarKey }[] = [];
    await render(<MaxStackSnackbar maxSnack={5} onClose={(reason, key) => closes.push({ reason, key })} />);
    await page.getByTestId('enqueue-many').click();
    await wait(ANIMATION_DURATION);

    expect(document.querySelectorAll(NOTIFICATION_SELECTOR).length).toBe(5);
    // The first two enqueued items are dropped via maxsnack, so we expect 2 callbacks with reason='maxsnack'.
    const maxsnack = closes.filter(c => c.reason === 'maxsnack');
    expect(maxsnack.length).toBe(2);
  });
});
