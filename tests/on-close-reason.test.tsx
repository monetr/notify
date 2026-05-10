import { useRef } from 'react';

import { page } from '@rstest/browser';
import { render } from '@rstest/browser-react';
import { describe, expect, test } from '@rstest/core';

import { ANIMATION_DURATION } from './constants';
import { dragVertically, NOTIFICATION_SELECTOR, wait } from './helpers';
import { SnackbarProvider, useSnackbar } from '../src';
import type { CloseReason } from '../src/types';

interface CloseRecord {
  reason: CloseReason;
}

function CloseListenerInner({ onClose }: { onClose: (r: CloseReason) => void }) {
  const { enqueueSnackbar, closeSnackbar } = useSnackbar();
  const last = useRef<string | number | null>(null);
  return (
    <div data-fixture-page=''>
      <button
        data-testid='enqueue-timer'
        onClick={() => {
          enqueueSnackbar('timer', { autoHideDuration: 300, onClose: (_e, reason) => onClose(reason) });
        }}
        type='button'
      >
        timer
      </button>
      <button
        data-testid='enqueue-persist'
        onClick={() => {
          last.current = enqueueSnackbar('persist', { persist: true, onClose: (_e, reason) => onClose(reason) });
        }}
        type='button'
      >
        persist
      </button>
      <button
        data-testid='close-last'
        onClick={() => last.current !== null && closeSnackbar(last.current)}
        type='button'
      >
        close-last
      </button>
      <button
        data-testid='enqueue-swipe'
        onClick={() => {
          enqueueSnackbar('swipe', {
            persist: true,
            anchorOrigin: { vertical: 'bottom', horizontal: 'center' },
            onClose: (_e, reason) => onClose(reason),
          });
        }}
        type='button'
      >
        swipe
      </button>
    </div>
  );
}

describe('onClose reason', () => {
  test("timer fires reason 'timeout'", async () => {
    const records: CloseRecord[] = [];
    await render(
      <SnackbarProvider>
        <CloseListenerInner onClose={r => records.push({ reason: r })} />
      </SnackbarProvider>,
    );
    await page.getByTestId('enqueue-timer').click();
    await wait(300 + ANIMATION_DURATION + 100);
    expect(records.find(r => r.reason === 'timeout')).toBeTruthy();
  });

  test("programmatic close fires reason 'instructed'", async () => {
    const records: CloseRecord[] = [];
    await render(
      <SnackbarProvider>
        <CloseListenerInner onClose={r => records.push({ reason: r })} />
      </SnackbarProvider>,
    );
    await page.getByTestId('enqueue-persist').click();
    await wait(ANIMATION_DURATION);
    await page.getByTestId('close-last').click();
    await wait(ANIMATION_DURATION);
    expect(records.find(r => r.reason === 'instructed')).toBeTruthy();
  });

  test("swipe past threshold fires reason 'swipe'", async () => {
    const records: CloseRecord[] = [];
    await render(
      <SnackbarProvider>
        <CloseListenerInner onClose={r => records.push({ reason: r })} />
      </SnackbarProvider>,
    );
    await page.getByTestId('enqueue-swipe').click();
    await wait(ANIMATION_DURATION + 100);
    await dragVertically(150);
    await wait(500);
    expect(records.find(r => r.reason === 'swipe')).toBeTruthy();
    expect(document.querySelectorAll(NOTIFICATION_SELECTOR).length).toBe(0);
  });
});
