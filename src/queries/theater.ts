import { createMutation } from './utils'
import {
  type PurchaseTicketsRequest,
  type PurchaseTicketsResponse,
  purchaseTickets,
} from '@/services/theater'

export const purchaseTicketsMutation = createMutation<
  PurchaseTicketsResponse,
  PurchaseTicketsRequest
>({
  mutationKey: ['theater', 'purchase'],
  mutationFn: purchaseTickets,
})
