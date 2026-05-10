import { withRslibConfig } from '@rstest/adapter-rslib';
import { defineConfig } from '@rstest/core';

import type { BrowserContextOptions, LaunchOptions } from 'playwright';

type PlaywrightProviderOptions = {
  launch?: LaunchOptions;
  context?: BrowserContextOptions;
};

// providerOptions must be identical across browser-mode projects in one rstest invocation, so per-project differences
// live in `browser.viewport` only. The Safari UA is enough for `isSafari()` to return true; touch-vs-mouse comes from
// synthetic PointerEvents in tests.
const sharedProviderOptions = {
  context: {
    userAgent:
      'Mozilla/5.0 (iPhone; CPU iPhone OS 16_0 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/16.0 Mobile/15E148 Safari/604.1',
  },
} satisfies PlaywrightProviderOptions;

const browserBase = {
  enabled: true as const,
  provider: 'playwright' as const,
  browser: 'chromium' as const,
  headless: !!process.env.CI,
  providerOptions: sharedProviderOptions,
};

const include = ['tests/**/*.test.{ts,tsx}'];

export default defineConfig({
  testTimeout: 10_000,
  projects: [
    {
      extends: withRslibConfig(),
      name: 'iphone',
      include,
      browser: { ...browserBase, viewport: { width: 390, height: 844 } },
    },
  ],
});
