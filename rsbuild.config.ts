import { defineConfig } from '@rsbuild/core';
import { pluginReact } from '@rsbuild/plugin-react';

// Dev server for the test fixtures. Run with `pnpm dev:demo` (or
// `pnpm exec rsbuild dev`). This is purely for interactive development --
// the test runner is rstest, configured separately in rstest.config.ts.
export default defineConfig({
  source: {
    entry: { index: './tests/dev/main.tsx' },
    tsconfigPath: './tsconfig.json',
  },
  html: {
    template: './tests/dev/index.html',
    title: 'Notify fixtures',
  },
  server: {
    port: 3000,
  },
  plugins: [pluginReact()],
});
