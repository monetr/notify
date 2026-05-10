import path from 'node:path';
import { defineConfig } from 'rspress/config';

export default defineConfig({
  root: path.join(__dirname, 'docs'),
  outDir: 'docs-dist',
  title: '@monetr/notify',
  description: 'Notification toasts for React with a notistack-compatible API and a lazy-loaded renderer.',
  route: {
    exclude: ['components/**/*'],
  },
  themeConfig: {
    socialLinks: [
      { icon: 'github', mode: 'link', content: 'https://github.com/monetr/notify' },
    ],
    footer: {
      message: 'EPL-2.0 Licensed | Copyright © monetr',
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
