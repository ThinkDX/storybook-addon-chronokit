export type SnackItem = {
  name: string
  quantity: number
  price: number
}

export type PurchaseTicketsRequest = {
  movieTitle: string
  showtime: string
  ticketCount: number
  seats: string[]
  snacks: SnackItem[]
  totalAmount: number
}

export type PurchaseTicketsResponse = {
  confirmationNumber: string
  movieTitle: string
  showtime: string
  ticketCount: number
  seats: string[]
  snacks: SnackItem[]
  totalAmount: number
  purchasedAt: string
}

function generateConfirmationNumber(): string {
  const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789'
  let result = ''
  for (let i = 0; i < 8; i++) {
    result += chars.charAt(Math.floor(Math.random() * chars.length))
  }
  return result
}

export async function purchaseTickets(
  request: PurchaseTicketsRequest,
): Promise<PurchaseTicketsResponse> {
  const response = await fetch('https://jsonplaceholder.typicode.com/posts', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(request),
  })

  if (!response.ok) {
    throw new Error('Failed to complete purchase')
  }

  return response.json()
}

// Mock response generator for MSW handlers
export function createMockPurchaseResponse(
  request: PurchaseTicketsRequest,
): PurchaseTicketsResponse {
  return {
    confirmationNumber: generateConfirmationNumber(),
    movieTitle: request.movieTitle,
    showtime: request.showtime,
    ticketCount: request.ticketCount,
    seats: request.seats,
    snacks: request.snacks,
    totalAmount: request.totalAmount,
    purchasedAt: new Date().toISOString(),
  }
}
