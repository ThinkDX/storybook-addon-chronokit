import type { Meta, StoryObj } from '@storybook/react-vite'
import { expect, userEvent, within, waitFor } from 'storybook/test'
import { http, HttpResponse, delay } from 'msw'
import {
  createMockPurchaseResponse,
  type PurchaseTicketsRequest,
} from '@/services/theater'

// Placeholder component - the actual route component is rendered by storyRouter
function WorkflowPlaceholder() {
  return null
}

const meta = {
  title: 'Workflows/PurchaseWorkflow',
  component: WorkflowPlaceholder,
  parameters: {
    layout: 'fullscreen',
    storyRouter: {
      path: '/',
      allowNavigation: true, // Allow full navigation for workflow tests
    },
    msw: {
      handlers: [
        http.post(
          'https://jsonplaceholder.typicode.com/posts',
          async ({ request }) => {
            const body = (await request.json()) as PurchaseTicketsRequest
            await delay(800)
            return HttpResponse.json(createMockPurchaseResponse(body))
          },
        ),
      ],
    },
  },
} satisfies Meta<typeof WorkflowPlaceholder>

export default meta
type Story = StoryObj<typeof meta>

// Default view - just shows the movie selection
export const Default: Story = {}

// Complete purchase workflow interaction test
export const CompletePurchaseWorkflow: Story = {
  play: async ({ canvasElement, step }) => {
    const canvas = within(canvasElement)

    await step('View movie and click Buy Tickets', async () => {
      // Wait for movies to load
      await waitFor(
        () => {
          expect(canvas.getByText('Now Showing')).toBeInTheDocument()
        },
        { timeout: 5000 },
      )

      // Find a movie card and hover to reveal Buy Tickets
      const buyButtons = await canvas.findAllByRole('link', {
        name: 'Buy Tickets',
      })
      const firstBuyButton = buyButtons[0]

      // Hover over parent to reveal button, then click
      const movieCard = firstBuyButton.closest('.group') as HTMLElement
      if (movieCard) {
        await userEvent.hover(movieCard)
      }
      await userEvent.click(firstBuyButton)
    })

    await step('Select ticket quantity', async () => {
      // Wait for tickets page to load
      await waitFor(() => {
        expect(canvas.getByText('Select Seats')).toBeInTheDocument()
      })

      // Increase ticket count to 2
      const plusButton = canvas.getAllByRole('button', { name: '+' })[0]
      await userEvent.click(plusButton)

      // Verify ticket count is now 2 (use specific selector for the large display)
      await expect(canvas.getByText('2', { selector: '.text-2xl' })).toBeInTheDocument()
    })

    await step('Select seats', async () => {
      // Select seats using test IDs
      await userEvent.click(canvas.getByTestId('seat-A-1'))
      await userEvent.click(canvas.getByTestId('seat-A-2'))

      // Verify seats are shown in order summary
      await waitFor(() => {
        expect(canvas.getByText(/Seats:/)).toBeInTheDocument()
      })
    })

    await step('Add snacks', async () => {
      // Find snack buttons by their text content within button elements
      const popcornButton = canvas.getByRole('button', { name: /Popcorn \(Large\)/ })
      await userEvent.click(popcornButton)

      const sodaButton = canvas.getByRole('button', { name: /Soda \(Medium\)/ })
      await userEvent.click(sodaButton)
      await userEvent.click(sodaButton)

      // Verify snacks were added by checking for quantity badges
      await expect(within(popcornButton).getByText('1')).toBeInTheDocument()
      await expect(within(sodaButton).getByText('2')).toBeInTheDocument()
    })

    await step('Complete purchase', async () => {
      const purchaseButton = canvas.getByRole('button', {
        name: 'Complete Purchase',
      })
      await expect(purchaseButton).not.toBeDisabled()
      await userEvent.click(purchaseButton)

      await expect(
        await canvas.findByRole('button', { name: 'Processing...' }),
      ).toBeInTheDocument()
    })

    await step('Verify confirmation modal', async () => {
      await waitFor(
        () => {
          expect(canvas.getByText('Purchase Complete!')).toBeInTheDocument()
        },
        { timeout: 5000 },
      )

      await expect(canvas.getByText('Confirmation Number')).toBeInTheDocument()
      await expect(canvas.getByText('Today at 7:30 PM')).toBeInTheDocument()
      await expect(canvas.getByText('Tickets')).toBeInTheDocument()
      await expect(canvas.getByText('Seats')).toBeInTheDocument()
      await expect(canvas.getByText('Total Paid')).toBeInTheDocument()
      // Find the button in the modal (not the link at top)
      await expect(canvas.getByRole('button', { name: 'Back to Movies' })).toBeInTheDocument()
    })
  },
}

// Quick purchase - minimum selections
export const QuickPurchase: Story = {
  play: async ({ canvasElement, step }) => {
    const canvas = within(canvasElement)

    await step('Navigate to tickets', async () => {
      await waitFor(
        () => {
          expect(canvas.getByText('Now Showing')).toBeInTheDocument()
        },
        { timeout: 5000 },
      )

      const buyButtons = await canvas.findAllByRole('link', {
        name: 'Buy Tickets',
      })
      const movieCard = buyButtons[0].closest('.group') as HTMLElement
      if (movieCard) await userEvent.hover(movieCard)
      await userEvent.click(buyButtons[0])
    })

    await step('Select single seat', async () => {
      await waitFor(() => {
        expect(canvas.getByText('Select Seats')).toBeInTheDocument()
      })

      // Select seat using test ID
      await userEvent.click(canvas.getByTestId('seat-A-1'))
    })

    await step('Purchase without snacks', async () => {
      const purchaseButton = canvas.getByRole('button', {
        name: 'Complete Purchase',
      })
      await userEvent.click(purchaseButton)

      await waitFor(
        () => {
          expect(canvas.getByText('Purchase Complete!')).toBeInTheDocument()
        },
        { timeout: 5000 },
      )
    })
  },
}

// Large group purchase - 5 tickets with lots of snacks
export const GroupPurchase: Story = {
  play: async ({ canvasElement, step }) => {
    const canvas = within(canvasElement)

    await step('Navigate to tickets', async () => {
      await waitFor(
        () => {
          expect(canvas.getByText('Now Showing')).toBeInTheDocument()
        },
        { timeout: 5000 },
      )

      const buyButtons = await canvas.findAllByRole('link', {
        name: 'Buy Tickets',
      })
      const movieCard = buyButtons[0].closest('.group') as HTMLElement
      if (movieCard) await userEvent.hover(movieCard)
      await userEvent.click(buyButtons[0])
    })

    await step('Select 5 tickets', async () => {
      await waitFor(() => {
        expect(canvas.getByText('Select Seats')).toBeInTheDocument()
      })

      const plusButton = canvas.getAllByRole('button', { name: '+' })[0]
      for (let i = 0; i < 4; i++) {
        await userEvent.click(plusButton)
      }

      await expect(canvas.getByText('5', { selector: '.text-2xl' })).toBeInTheDocument()
    })

    await step('Select 5 seats', async () => {
      // Select 5 seats using test IDs (avoiding taken seats A-3, A-4, A-5)
      await userEvent.click(canvas.getByTestId('seat-A-1'))
      await userEvent.click(canvas.getByTestId('seat-A-2'))
      await userEvent.click(canvas.getByTestId('seat-A-6'))
      await userEvent.click(canvas.getByTestId('seat-A-7'))
      await userEvent.click(canvas.getByTestId('seat-A-8'))

      await waitFor(() => {
        expect(canvas.getByText(/5 of 5 selected/)).toBeInTheDocument()
      })
    })

    await step('Add snacks for everyone', async () => {
      // Find snack buttons by role
      const popcornButton = canvas.getByRole('button', { name: /Popcorn \(Large\)/ })
      await userEvent.click(popcornButton)
      await userEvent.click(popcornButton)

      const sodaButton = canvas.getByRole('button', { name: /Soda \(Medium\)/ })
      for (let i = 0; i < 5; i++) {
        await userEvent.click(sodaButton)
      }

      const candyButton = canvas.getByRole('button', { name: /Candy/ })
      await userEvent.click(candyButton)
      await userEvent.click(candyButton)
      await userEvent.click(candyButton)
    })

    await step('Complete group purchase', async () => {
      const purchaseButton = canvas.getByRole('button', {
        name: 'Complete Purchase',
      })
      await userEvent.click(purchaseButton)

      await waitFor(
        () => {
          expect(canvas.getByText('Purchase Complete!')).toBeInTheDocument()
        },
        { timeout: 5000 },
      )

      await expect(canvas.getByText('Snacks')).toBeInTheDocument()
    })
  },
}
