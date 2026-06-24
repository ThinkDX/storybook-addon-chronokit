import type { Preview } from '@storybook/react-vite'
import { mockDateDecorator } from '../src/addon/mockDateDecorator'

const preview: Preview = {
  tags: ['!autodocs'],
  decorators: [mockDateDecorator],
  parameters: {
    controls: {
      matchers: {
        color: /(background|color)$/i,
        date: /Date$/i,
      },
    },
  },
}

export default preview
