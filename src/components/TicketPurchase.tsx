import { useState } from 'react'
import { Link, useNavigate } from 'react-router'
import { purchaseTicketsMutation } from '@/queries/theater'
import type { PurchaseTicketsResponse, SnackItem } from '@/services/theater'

const SNACKS = [
  { name: 'Popcorn (Small)', price: 5.99, icon: '🍿' },
  { name: 'Popcorn (Large)', price: 8.99, icon: '🍿' },
  { name: 'Soda (Medium)', price: 4.49, icon: '🥤' },
  { name: 'Soda (Large)', price: 5.49, icon: '🥤' },
  { name: 'Candy', price: 3.99, icon: '🍬' },
  { name: 'Hot Dog', price: 6.99, icon: '🌭' },
  { name: 'Nachos', price: 7.99, icon: '🧀' },
  { name: 'Ice Cream', price: 4.99, icon: '🍦' },
]

const TICKET_PRICE = 12.99

// Generate seating layout: 8 rows (A-H), 12 seats each
const ROWS = ['A', 'B', 'C', 'D', 'E', 'F', 'G', 'H']
const SEATS_PER_ROW = 12

// Some seats are "taken" (for visual effect)
const TAKEN_SEATS = new Set([
  'A-3', 'A-4', 'A-5',
  'B-7', 'B-8',
  'C-2', 'C-3', 'C-10', 'C-11',
  'D-5', 'D-6', 'D-7',
  'E-1', 'E-2', 'E-9', 'E-10', 'E-11', 'E-12',
  'F-4', 'F-5', 'F-6', 'F-7',
  'G-3', 'G-8', 'G-9',
  'H-5', 'H-6', 'H-7', 'H-8',
])

type ConfirmationModalProps = {
  confirmation: PurchaseTicketsResponse
  onClose: () => void
}

function ConfirmationModal({ confirmation, onClose }: ConfirmationModalProps) {
  return (
    <div className="fixed inset-0 bg-black/70 flex items-center justify-center z-50 p-4">
      <div className="bg-gray-900 rounded-lg max-w-md w-full p-6 shadow-xl">
        <div className="text-center mb-6">
          <div className="inline-flex items-center justify-center w-16 h-16 bg-green-500/20 rounded-full mb-4">
            <span className="text-3xl">✓</span>
          </div>
          <h2 className="text-2xl font-bold text-white">Purchase Complete!</h2>
        </div>

        <div className="bg-gray-800 rounded-lg p-4 mb-6">
          <div className="text-center mb-4">
            <p className="text-gray-400 text-sm">Confirmation Number</p>
            <p className="text-2xl font-mono font-bold text-amber-500">
              {confirmation.confirmationNumber}
            </p>
          </div>

          <div className="space-y-3 text-sm">
            <div className="flex justify-between">
              <span className="text-gray-400">Movie</span>
              <span className="text-white">{confirmation.movieTitle}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-400">Showtime</span>
              <span className="text-white">{confirmation.showtime}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-400">Tickets</span>
              <span className="text-white">{confirmation.ticketCount}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-400">Seats</span>
              <span className="text-white">{confirmation.seats.join(', ')}</span>
            </div>
            {confirmation.snacks.length > 0 && (
              <div className="border-t border-gray-700 pt-3 mt-3">
                <p className="text-gray-400 mb-2">Snacks</p>
                {confirmation.snacks.map((snack) => (
                  <div key={snack.name} className="flex justify-between text-white">
                    <span>
                      {snack.name} {snack.quantity > 1 && `x${snack.quantity}`}
                    </span>
                    <span>${(snack.price * snack.quantity).toFixed(2)}</span>
                  </div>
                ))}
              </div>
            )}
            <div className="border-t border-gray-700 pt-3 mt-3 flex justify-between font-semibold">
              <span className="text-gray-400">Total Paid</span>
              <span className="text-amber-500">${confirmation.totalAmount.toFixed(2)}</span>
            </div>
          </div>
        </div>

        <button
          type="button"
          onClick={onClose}
          className="w-full rounded-lg bg-amber-500 py-3 font-semibold text-black hover:bg-amber-400 transition-colors"
        >
          Back to Movies
        </button>
      </div>
    </div>
  )
}

export function TicketPurchase() {
  const navigate = useNavigate()
  const [ticketCount, setTicketCount] = useState(1)
  const [selectedSeats, setSelectedSeats] = useState<Set<string>>(new Set())
  const [selectedSnacks, setSelectedSnacks] = useState<Map<string, SnackItem>>(new Map())
  const [confirmation, setConfirmation] = useState<PurchaseTicketsResponse | null>(null)

  const mutation = purchaseTicketsMutation.use({
    onSuccess: (data) => {
      setConfirmation(data)
    },
  })

  const handleTicketChange = (delta: number) => {
    const newCount = Math.max(1, ticketCount + delta)
    setTicketCount(newCount)
    // If we now have fewer tickets than selected seats, remove excess seats
    if (selectedSeats.size > newCount) {
      const seatsArray = Array.from(selectedSeats)
      setSelectedSeats(new Set(seatsArray.slice(0, newCount)))
    }
  }

  const handleSeatClick = (seatId: string) => {
    if (TAKEN_SEATS.has(seatId)) return

    setSelectedSeats((prev) => {
      const newSeats = new Set(prev)
      if (newSeats.has(seatId)) {
        newSeats.delete(seatId)
      } else if (newSeats.size < ticketCount) {
        newSeats.add(seatId)
      }
      return newSeats
    })
  }

  const handleSnackClick = (snack: { name: string; price: number }) => {
    setSelectedSnacks((prev) => {
      const newSnacks = new Map(prev)
      const existing = newSnacks.get(snack.name)
      if (existing) {
        if (existing.quantity >= 5) {
          // Remove if at max
          newSnacks.delete(snack.name)
        } else {
          newSnacks.set(snack.name, { ...existing, quantity: existing.quantity + 1 })
        }
      } else {
        newSnacks.set(snack.name, { name: snack.name, price: snack.price, quantity: 1 })
      }
      return newSnacks
    })
  }

  const handleRemoveSnack = (snackName: string) => {
    setSelectedSnacks((prev) => {
      const newSnacks = new Map(prev)
      const existing = newSnacks.get(snackName)
      if (existing && existing.quantity > 1) {
        newSnacks.set(snackName, { ...existing, quantity: existing.quantity - 1 })
      } else {
        newSnacks.delete(snackName)
      }
      return newSnacks
    })
  }

  const handlePurchase = () => {
    const snacksArray = Array.from(selectedSnacks.values())
    mutation.mutate({
      movieTitle: 'Spider-Man: Across the Spider-Verse',
      showtime: 'Today at 7:30 PM',
      ticketCount,
      seats: Array.from(selectedSeats).sort(),
      snacks: snacksArray,
      totalAmount: total,
    })
  }

  const handleCloseConfirmation = () => {
    setConfirmation(null)
    navigate('/')
  }

  const ticketTotal = ticketCount * TICKET_PRICE
  const snacksArray = Array.from(selectedSnacks.values())
  const snackTotal = snacksArray.reduce(
    (sum, item) => sum + item.price * item.quantity,
    0,
  )
  const total = ticketTotal + snackTotal

  const canPurchase = ticketCount > 0 && selectedSeats.size === ticketCount

  return (
    <div className="space-y-8">
      {confirmation && (
        <ConfirmationModal
          confirmation={confirmation}
          onClose={handleCloseConfirmation}
        />
      )}

      {/* Back Button */}
      <Link
        to="/"
        className="inline-flex items-center gap-2 text-gray-400 hover:text-white transition-colors"
      >
        <span>←</span>
        <span>Back to Movies</span>
      </Link>

      {/* Movie Info & Ticket Selection */}
      <div className="rounded-lg bg-gray-900 p-6">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <h2 className="text-xl font-semibold text-white">
              Spider-Man: Across the Spider-Verse
            </h2>
            <p className="text-gray-400">Today at 7:30 PM - Theater 3</p>
          </div>
          <div className="flex items-center gap-4">
            <button
              type="button"
              onClick={() => handleTicketChange(-1)}
              disabled={ticketCount <= 1}
              className="flex h-10 w-10 items-center justify-center rounded-full bg-gray-800 text-white hover:bg-gray-700 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              −
            </button>
            <span className="text-2xl font-bold text-white w-12 text-center">
              {ticketCount}
            </span>
            <button
              type="button"
              onClick={() => handleTicketChange(1)}
              disabled={ticketCount >= 10}
              className="flex h-10 w-10 items-center justify-center rounded-full bg-gray-800 text-white hover:bg-gray-700 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              +
            </button>
            <span className="text-gray-400">${TICKET_PRICE.toFixed(2)} ea</span>
          </div>
        </div>
      </div>

      {/* Seating Chart */}
      <div className="rounded-lg bg-gray-900 p-6">
        <h3 className="text-lg font-semibold text-white mb-2">Select Seats</h3>
        <p className="text-sm text-gray-400 mb-4">
          Select {ticketCount} seat{ticketCount !== 1 && 's'} ({selectedSeats.size} of {ticketCount} selected)
        </p>

        {/* Screen */}
        <div className="mb-8">
          <div className="mx-auto w-3/4 h-2 bg-gradient-to-r from-transparent via-amber-500 to-transparent rounded-full" />
          <p className="text-center text-xs text-gray-500 mt-2">SCREEN</p>
        </div>

        {/* Seats */}
        <div className="space-y-2">
          {ROWS.map((row) => (
            <div key={row} className="flex items-center justify-center gap-1">
              <span className="w-6 text-xs text-gray-500">{row}</span>
              <div className="flex gap-1">
                {Array.from({ length: SEATS_PER_ROW }, (_, i) => {
                  const seatId = `${row}-${i + 1}`
                  const isTaken = TAKEN_SEATS.has(seatId)
                  const isSelected = selectedSeats.has(seatId)
                  const isDisabled = isTaken || (!isSelected && selectedSeats.size >= ticketCount)

                  return (
                    <button
                      key={seatId}
                      type="button"
                      data-testid={`seat-${seatId}`}
                      onClick={() => handleSeatClick(seatId)}
                      disabled={isTaken}
                      className={`h-6 w-6 rounded-t-lg text-xs transition-colors ${
                        isTaken
                          ? 'bg-gray-700 cursor-not-allowed'
                          : isSelected
                            ? 'bg-amber-500 text-black'
                            : isDisabled
                              ? 'bg-gray-600 opacity-50 cursor-not-allowed'
                              : 'bg-gray-600 hover:bg-gray-500 cursor-pointer'
                      }`}
                    >
                      {i + 1}
                    </button>
                  )
                })}
              </div>
              <span className="w-6 text-xs text-gray-500">{row}</span>
            </div>
          ))}
        </div>

        {/* Legend */}
        <div className="flex justify-center gap-6 mt-6">
          <div className="flex items-center gap-2">
            <div className="h-4 w-4 rounded-t bg-gray-600" />
            <span className="text-xs text-gray-400">Available</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="h-4 w-4 rounded-t bg-amber-500" />
            <span className="text-xs text-gray-400">Selected</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="h-4 w-4 rounded-t bg-gray-700" />
            <span className="text-xs text-gray-400">Taken</span>
          </div>
        </div>
      </div>

      {/* Snacks */}
      <div className="rounded-lg bg-gray-900 p-6">
        <h3 className="text-lg font-semibold text-white mb-2">Add Snacks</h3>
        <p className="text-sm text-gray-400 mb-4">
          Click to add, click again to increase quantity (max 5 each)
        </p>
        <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
          {SNACKS.map((snack) => {
            const selected = selectedSnacks.get(snack.name)
            return (
              <button
                key={snack.name}
                type="button"
                onClick={() => handleSnackClick(snack)}
                className={`relative flex flex-col items-center rounded-lg p-4 transition-colors ${
                  selected
                    ? 'bg-amber-500/20 ring-2 ring-amber-500'
                    : 'bg-gray-800 hover:bg-gray-700'
                }`}
              >
                {selected && (
                  <span className="absolute top-2 right-2 bg-amber-500 text-black text-xs font-bold rounded-full w-5 h-5 flex items-center justify-center">
                    {selected.quantity}
                  </span>
                )}
                <span className="text-3xl mb-2">{snack.icon}</span>
                <span className="text-sm text-white text-center">
                  {snack.name}
                </span>
                <span className="text-xs text-gray-400 mt-1">
                  ${snack.price.toFixed(2)}
                </span>
              </button>
            )
          })}
        </div>
      </div>

      {/* Order Summary */}
      <div className="rounded-lg bg-gray-900 p-6">
        <h3 className="text-lg font-semibold text-white mb-4">Order Summary</h3>
        <div className="space-y-3">
          <div className="flex justify-between text-gray-300">
            <span>Tickets ({ticketCount}x)</span>
            <span>${ticketTotal.toFixed(2)}</span>
          </div>
          {selectedSeats.size > 0 && (
            <div className="flex justify-between text-gray-400 text-sm">
              <span>Seats: {Array.from(selectedSeats).sort().join(', ')}</span>
            </div>
          )}
          {snacksArray.map((item) => (
            <div key={item.name} className="flex justify-between items-center text-gray-300">
              <span>
                {item.name} {item.quantity > 1 && `(${item.quantity}x)`}
              </span>
              <div className="flex items-center gap-3">
                <span>${(item.price * item.quantity).toFixed(2)}</span>
                <button
                  type="button"
                  onClick={() => handleRemoveSnack(item.name)}
                  className="text-gray-500 hover:text-red-400 text-sm"
                >
                  ×
                </button>
              </div>
            </div>
          ))}
          <div className="border-t border-gray-800 pt-3 flex justify-between text-white font-semibold">
            <span>Total</span>
            <span>${total.toFixed(2)}</span>
          </div>
        </div>
        <button
          type="button"
          onClick={handlePurchase}
          disabled={!canPurchase || mutation.isPending}
          className="mt-6 w-full rounded-lg bg-amber-500 py-3 font-semibold text-black hover:bg-amber-400 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {mutation.isPending ? 'Processing...' : 'Complete Purchase'}
        </button>
        {!canPurchase && selectedSeats.size < ticketCount && (
          <p className="mt-2 text-center text-sm text-amber-500">
            Please select {ticketCount - selectedSeats.size} more seat{ticketCount - selectedSeats.size !== 1 && 's'}
          </p>
        )}
        {mutation.isError && (
          <p className="mt-2 text-center text-sm text-red-500">
            Failed to complete purchase. Please try again.
          </p>
        )}
      </div>
    </div>
  )
}
