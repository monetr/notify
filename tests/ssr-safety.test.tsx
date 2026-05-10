import { renderToString } from 'react-dom/server';

import { describe, expect, test } from '@rstest/core';

import { SnackbarProvider } from '../src';

describe('SSR safety', () => {
  test('renderToString does not throw and emits the children', () => {
    const html = renderToString(
      <SnackbarProvider>
        <span data-testid='child'>hello</span>
      </SnackbarProvider>,
    );
    expect(html).toContain('hello');
    expect(html).toContain('data-testid="child"');
    // No portal/notifications on the server output.
    expect(html).not.toContain('data-monetr-notification');
  });
});
