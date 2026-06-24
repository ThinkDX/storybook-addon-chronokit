import { dirname, join } from 'node:path'
import { fileURLToPath } from 'node:url'
import type { StorybookConfig } from '@storybook/react-vite'

const __dirname = dirname(fileURLToPath(import.meta.url))

const config: StorybookConfig = {
  stories: ['../src/**/*.mdx', '../src/**/*.stories.@(js|jsx|mjs|ts|tsx)'],
  addons: [
    '@storybook/addon-docs',
    '@storybook/addon-vitest',
    '@storybook/addon-a11y',
  ],
  framework: '@storybook/react-vite',
  core: {
    builder: {
      name: '@storybook/builder-vite',
      options: {
        viteConfigPath: join(__dirname, 'vite.config.ts'),
      },
    },
  },
}
export default config
