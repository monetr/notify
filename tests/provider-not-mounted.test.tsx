import { render } from '@rstest/browser-react';
import { describe, expect, test } from '@rstest/core';

import { OutsideProviderSnackbar } from './fixtures/OutsideProviderSnackbar';

describe('useSnackbar outside provider', () => {
  test('throws a clear error caught by the consumer ErrorBoundary', async () => {
    await render(<OutsideProviderSnackbar />);
    const boundary = document.querySelector<HTMLElement>('[data-testid="boundary-error"]');
    expect(boundary).toBeTruthy();
    expect(boundary?.textContent).toContain('useSnackbar must be used within a <SnackbarProvider>');
  });
});
