import { page } from '@rstest/browser';
import { render } from '@rstest/browser-react';
import { describe, expect, test } from '@rstest/core';

import { ANIMATION_DURATION } from './constants';
import { BasicSnackbar } from './fixtures/BasicSnackbar';
import { NOTIFICATION_SELECTOR, wait } from './helpers';

function notifications(): NodeListOf<HTMLElement> {
  return document.querySelectorAll<HTMLElement>(NOTIFICATION_SELECTOR);
}

describe('enqueueSnackbar', () => {
  test('renders a notification with a string message', async () => {
    await render(<BasicSnackbar message='hello world' />);
    expect(notifications().length).toBe(0);
    await page.getByTestId('enqueue').click();
    await wait(ANIMATION_DURATION);
    expect(notifications().length).toBe(1);
    expect(notifications()[0].textContent).toContain('hello world');
  });

  test('renders a notification with a JSX message', async () => {
    await render(<BasicSnackbar />);
    await page.getByTestId('enqueue-jsx').click();
    await wait(ANIMATION_DURATION);
    const node = notifications()[0];
    expect(node).toBeTruthy();
    const strong = node.querySelector('strong');
    expect(strong).toBeTruthy();
    expect(strong?.textContent).toBe('Bold message');
  });

  test('closeSnackbar() removes all live notifications', async () => {
    await render(<BasicSnackbar duration={10_000} />);
    await page.getByTestId('enqueue').click();
    await page.getByTestId('enqueue').click();
    await wait(ANIMATION_DURATION);
    expect(notifications().length).toBe(2);

    await page.getByTestId('close-all').click();
    await wait(ANIMATION_DURATION + 100);
    expect(notifications().length).toBe(0);
  });
});
