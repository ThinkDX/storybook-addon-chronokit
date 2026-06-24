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
    docs: {
      // Each embedded story renders in its own iframe. The mock decorator
      // replaces the global Date/timers, so multiple inline examples on one
      // docs page would share (and clobber) a single clock. Separate iframes
      // give each example its own globals and an isolated mocked clock.
      story: { inline: false },
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
