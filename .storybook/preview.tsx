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
    options: {
      storySort: {
        order: [
          'Introduction',
          'Guide',
          [
            'The date Parameter',
            'Static Time',
            'Controlled Dynamic Time',
            'Under the Hood',
          ],
          'Demo',
          ['Countdown', 'FlashSale', 'Timer Mechanisms'],
        ],
      },
    },
  },
}

export default preview
