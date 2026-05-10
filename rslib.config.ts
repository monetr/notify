import { pluginReact } from '@rsbuild/plugin-react';
import { RsdoctorRspackPlugin } from '@rsdoctor/rspack-plugin';
import { defineConfig } from '@rslib/core';

export default defineConfig({
  source: {
    tsconfigPath: './tsconfig.build.json',
  },
  lib: [
    {
      format: 'esm',
      bundle: false,
      dts: { autoExtension: true },
    },
  ],
  output: {
    target: 'web',
    cleanDistPath: true,
  },
  plugins: [pluginReact()],
  // Only opt in when RSDOCTOR=true since the plugin meaningfully slows builds. In CI, narrow to brief + JSON for the
  // rsdoctor-action; locally, fall through to the default mode so the interactive HTML report opens in the browser.
  tools: {
    rspack: {
      plugins: [
        process.env.RSDOCTOR === 'true' &&
          new RsdoctorRspackPlugin(
            process.env.CI
              ? {
                  output: {
                    mode: 'brief',
                    options: { type: ['json'] },
                  },
                }
              : {},
          ),
      ].filter(Boolean),
    },
  },
});
