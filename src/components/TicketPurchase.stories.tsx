import type { Meta, StoryObj } from '@storybook/react-vite'
import { expect, userEvent, within } from 'storybook/test'
import { http, HttpResponse, delay } from 'msw'
import { TicketPurchase } from './TicketPurchase'
import {
  createMockPurchaseResponse,
  type PurchaseTicketsRequest,
} from '@/services/theater'

const meta = {
  title: 'Components/TicketPurchase',
  component: TicketPurchase,
  parameters: {
    layout: 'padded',
    storyRouter: {
      path: '/tickets',
      allowNavigation: false,
    },
  },
} satisfies Meta<typeof TicketPurchase>

export default meta
type Story = StoryObj<typeof meta>

// Default story with successful purchase handler
export const Default: Story = {
  parameters: {
    msw: {
      handlers: [
        http.post(
          'https://jsonplaceholder.typicode.com/posts',
          async ({ request }) => {
            const body = (await request.json()) as PurchaseTicketsRequest
            await delay(500)
            return HttpResponse.json(createMockPurchaseResponse(body))
          },
        ),
      ],
    },
  },
}

// Story showing purchase error state
export const PurchaseError: Story = {
  parameters: {
    msw: {
      handlers: [
        http.post('https://jsonplaceholder.typicode.com/posts', async () => {
          await delay(500)
          return new HttpResponse(null, { status: 500 })
        }),
      ],
    },
  },
}


// Story showing purchase error state
export const PurchaseErrorBug: Story = {
  args: {
    input: ''
  },
  parameters: {
    msw: {
      handlers: [
        http.post('https://jsonplaceholder.typicode.com/posts', async () => {
          await delay(500)
          return new HttpResponse(null, { status: 500 })
        }),
      ],
    },
  },
}

// Story showing slow network response
export const SlowNetwork: Story = {
  parameters: {
    msw: {
      handlers: [
        http.post(
          'https://jsonplaceholder.typicode.com/posts',
          async ({ request }) => {
            const body = (await request.json()) as PurchaseTicketsRequest
            await delay(3000)
            return HttpResponse.json(createMockPurchaseResponse(body))
          },
        ),
      ],
    },
  },
}

// Test: Select tickets and seats
export const SelectSeats: Story = {
  parameters: {
    msw: {
      handlers: [
        http.post(
          'https://jsonplaceholder.typicode.com/posts',
          async ({ request }) => {
            const body = (await request.json()) as PurchaseTicketsRequest
            await delay(200)
            return HttpResponse.json(createMockPurchaseResponse(body))
          },
        ),
      ],
    },
  },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement)

    // Increase ticket count to 3
    const plusButton = canvas.getAllByRole('button', { name: '+' })[0]
    await userEvent.click(plusButton)
    await userEvent.click(plusButton)

    // Verify ticket count is 3 (find in the ticket selector section by looking for the large bold text)
    const ticketCountDisplay = canvas.getByText('3', { selector: '.text-2xl' })
    await expect(ticketCountDisplay).toBeInTheDocument()

    // Select seats A-1 and A-2 using test IDs
    await userEvent.click(canvas.getByTestId('seat-A-1'))
    await userEvent.click(canvas.getByTestId('seat-A-2'))

    // Verify selected seats are shown in order summary
    await expect(canvas.getByText(/Seats:.*A-1/)).toBeInTheDocument()
  },
}

// Test: Add snacks
export const WithSnacks: Story = {
  parameters: {
    msw: {
      handlers: [
        http.post(
          'https://jsonplaceholder.typicode.com/posts',
          async ({ request }) => {
            const body = (await request.json()) as PurchaseTicketsRequest
            await delay(200)
            return HttpResponse.json(createMockPurchaseResponse(body))
          },
        ),
      ],
    },
  },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement)

    // Click on popcorn button (find by its container text)
    const popcornButton = canvas.getByText('Popcorn (Large)').closest('button')!
    await userEvent.click(popcornButton)
    await userEvent.click(popcornButton)

    // Click on soda
    const sodaButton = canvas.getByText('Soda (Medium)').closest('button')!
    await userEvent.click(sodaButton)

    // Verify popcorn has quantity badge of 2 (the badge is a span inside the button)
    const popcornQuantityBadge = within(popcornButton).getByText('2')
    await expect(popcornQuantityBadge).toBeInTheDocument()
  },
}

// Test: Complete purchase flow
export const CompletePurchase: Story = {
  parameters: {
    msw: {
      handlers: [
        http.post(
          'https://jsonplaceholder.typicode.com/posts',
          async ({ request }) => {
            const body = (await request.json()) as PurchaseTicketsRequest
            await delay(200)
            return HttpResponse.json(createMockPurchaseResponse(body))
          },
        ),
      ],
    },
  },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement)

    // Select seat A-1 (ticket count starts at 1) using test ID
    await userEvent.click(canvas.getByTestId('seat-A-1'))

    // Add a snack
    const candyButton = canvas.getByText('Candy').closest('button')!
    await userEvent.click(candyButton)

    // Click complete purchase
    const purchaseButton = canvas.getByRole('button', {
      name: 'Complete Purchase',
    })
    await userEvent.click(purchaseButton)

    // Wait for and verify confirmation modal
    await expect(
      await canvas.findByText('Purchase Complete!'),
    ).toBeInTheDocument()
    await expect(canvas.getByText('Confirmation Number')).toBeInTheDocument()
    // Find the "Back to Movies" button in the modal (not the link at top)
    await expect(
      canvas.getByRole('button', { name: 'Back to Movies' }),
    ).toBeInTheDocument()
  },
}

// Test: Decrease ticket count removes excess seats
export const DecreaseTicketsRemovesSeats: Story = {
  parameters: {
    msw: {
      handlers: [
        http.post(
          'https://jsonplaceholder.typicode.com/posts',
          async ({ request }) => {
            const body = (await request.json()) as PurchaseTicketsRequest
            await delay(200)
            return HttpResponse.json(createMockPurchaseResponse(body))
          },
        ),
      ],
    },
  },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement)

    // Increase to 3 tickets
    const plusButton = canvas.getAllByRole('button', { name: '+' })[0]
    await userEvent.click(plusButton)
    await userEvent.click(plusButton)

    // Select 2 seats (A-1 and A-2) using test IDs
    await userEvent.click(canvas.getByTestId('seat-A-1'))
    await userEvent.click(canvas.getByTestId('seat-A-2'))

    // Verify 2 seats selected
    await expect(canvas.getByText(/2 of 3 selected/)).toBeInTheDocument()

    // Decrease back to 1 ticket
    const minusButton = canvas.getAllByRole('button', { name: '−' })[0]
    await userEvent.click(minusButton)
    await userEvent.click(minusButton)

    // Verify ticket count is 1 and only 1 seat remains
    const ticketCountDisplay = canvas.getByText('1', { selector: '.text-2xl' })
    await expect(ticketCountDisplay).toBeInTheDocument()
    await expect(canvas.getByText(/1 of 1 selected/)).toBeInTheDocument()
  },
}
