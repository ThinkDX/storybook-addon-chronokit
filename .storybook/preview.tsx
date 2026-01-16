import type { Preview } from '@storybook/react-vite'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { initialize, mswLoader } from 'msw-storybook-addon'
import { mockDateDecorator } from './addons/mockDateDecorator'
import { networkPanelDecorator } from './addons/networkPanel'
import { storyRouterDecorator } from './addons/storyRouter'
import '../src/app/app.css'

// Initialize MSW
initialize()

// Create a new QueryClient for each story to ensure isolation
const queryClientDecorator: Preview['decorators'] = [
  (Story) => {
    const queryClient = new QueryClient({
      defaultOptions: {
        queries: {
          retry: false,
        },
        mutations: {
          retry: false,
        },
      },
    })

    return (
      <QueryClientProvider client={queryClient}>
        <Story />
      </QueryClientProvider>
    )
  },
]

const preview: Preview = {
  tags: ['!autodocs'],
  decorators: [mockDateDecorator, networkPanelDecorator, storyRouterDecorator, ...queryClientDecorator],
  parameters: {
    controls: {
      matchers: {
        color: /(background|color)$/i,
        date: /Date$/i,
      },
    },
  },
  loaders: [mswLoader],
}

export default preview
