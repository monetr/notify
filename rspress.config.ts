import path from 'node:path';
import { defineConfig } from '@rspress/core';

// `DOCS_BASE` is set in CI from the `actions/configure-pages` output, so the
// site works under https://<user>.github.io/<repo>/. Empty string means root.
const rawBase = process.env.DOCS_BASE ?? '';
const base = rawBase === '' || rawBase === '/' ? '/' : `${rawBase.replace(/\/$/, '')}/`;

export default defineConfig({
  root: path.join(__dirname, 'docs'),
  outDir: 'docs-dist',
  base,
  title: '@monetr/notify',
  description: 'Notification toasts for React with a notistack-compatible API and a lazy-loaded renderer.',
  route: {
    exclude: ['components/**/*'],
    cleanUrls: true,
  },
  themeConfig: {
    socialLinks: [
      { icon: 'github', mode: 'link', content: 'https://github.com/monetr/notify' },
      { icon: 'npm', mode: 'link', content: 'https://www.npmjs.com/package/@monetr/notify' },
    ],
    footer: {
      message: 'EPL-2.0 Licensed | Copyright © monetr LLC',
    },
  },
  builderConfig: {
    resolve: {
      alias: {
        '@monetr/notify': path.join(__dirname, 'src'),
      },
    },
  },
});
