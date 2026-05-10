import { page } from '@rstest/browser';
import { render } from '@rstest/browser-react';
import { describe, expect, test } from '@rstest/core';

import { ANIMATION_DURATION } from './constants';
import { AnchorMatrixSnackbar } from './fixtures/AnchorMatrixSnackbar';
import { wait } from './helpers';

describe('anchor origin positions', () => {
  test.each([
    ['top-left', (rect: DOMRect, vp: { w: number; h: number }) => rect.top < vp.h * 0.4 && rect.left < vp.w * 0.5],
    [
      'top-center',
      (rect: DOMRect, vp: { w: number; h: number }) =>
        rect.top < vp.h * 0.4 && rect.left + rect.width / 2 > vp.w * 0.3 && rect.left + rect.width / 2 < vp.w * 0.7,
    ],
    ['top-right', (rect: DOMRect, vp: { w: number; h: number }) => rect.top < vp.h * 0.4 && rect.right > vp.w * 0.5],
    [
      'bottom-left',
      (rect: DOMRect, vp: { w: number; h: number }) => rect.bottom > vp.h * 0.6 && rect.left < vp.w * 0.5,
    ],
    [
      'bottom-center',
      (rect: DOMRect, vp: { w: number; h: number }) =>
        rect.bottom > vp.h * 0.6 && rect.left + rect.width / 2 > vp.w * 0.3 && rect.left + rect.width / 2 < vp.w * 0.7,
    ],
    [
      'bottom-right',
      (rect: DOMRect, vp: { w: number; h: number }) => rect.bottom > vp.h * 0.6 && rect.right > vp.w * 0.5,
    ],
  ])("'%s' renders the toast in the expected viewport region", async (anchor, predicate) => {
    await render(<AnchorMatrixSnackbar />);
    await page.getByTestId(`enqueue-${anchor}`).click();
    await wait(ANIMATION_DURATION);

    const node = document.querySelector<HTMLElement>(`[data-monetr-notification-anchor="${anchor}"]`);
    expect(node).toBeTruthy();
    const rect = node!.getBoundingClientRect();
    const vp = { w: window.innerWidth, h: window.innerHeight };
    expect(predicate(rect, vp)).toBe(true);
  });
});
