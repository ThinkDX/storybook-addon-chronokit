import type { Meta, StoryObj } from '@storybook/react-vite'
import { FlashSale } from './FlashSale'

/**
 * `FlashSale` is a real-world example of why you'd mock the clock in a story:
 * its UI depends entirely on "what time is it now?" relative to a fixed end
 * time. These stories show the two ways chronokit's `date` parameter is used.
 */
const SALE_START = new Date('2025-06-01T12:00:00').getTime()

const meta = {
  title: 'Demo/FlashSale',
  component: FlashSale,
  parameters: { layout: 'centered' },
} satisfies Meta<typeof FlashSale>

export default meta
type Story = StoryObj<typeof meta>

const minutes = (n: number) => n * 60 * 1000

/**
 * STATIC TIME — freeze the clock at an exact moment so the UI is deterministic.
 *
 * Here we pin "now" to 45 seconds before the sale ends, so the component is
 * always captured in its red "critical" final-minute state — ideal for visual
 * review, screenshots, or regression snapshots that must look identical every run.
 */
export const FrozenInFinalMinute: Story = {
  args: {
    endsAt: SALE_START + minutes(10),
    product: 'all sneakers',
    discount: 40,
  },
  parameters: {
    date: {
      now: SALE_START + minutes(10) - 45 * 1000,
      canProgress: false,
    },
  },
}

/**
 * STATIC TIME — the same component frozen with plenty of time left, showing the
 * healthy state. Swapping only the frozen `now` lets you document every state
 * without ever waiting for the real clock.
 */
export const FrozenEarly: Story = {
  args: {
    endsAt: SALE_START + minutes(10),
    product: 'all sneakers',
    discount: 40,
  },
  parameters: {
    date: {
      now: SALE_START,
      canProgress: false,
    },
  },
}

/**
 * STATIC TIME — frozen after the end time, so the "sale ended" state renders
 * deterministically without having to wait for a countdown to reach zero.
 */
export const FrozenAfterEnd: Story = {
  args: {
    endsAt: SALE_START + minutes(10),
    product: 'all sneakers',
    discount: 40,
  },
  parameters: {
    date: {
      now: SALE_START + minutes(11),
      canProgress: false,
    },
  },
}

/**
 * CONTROLLED DYNAMIC TIME — let the clock run, but 30x faster.
 *
 * The sale lasts 6 minutes, so at 30x speed you watch the full lifecycle play
 * out in ~12 real seconds: healthy → amber "warning" (under 5 min) → red
 * "critical" (under 1 min) → "sale ended". This exercises real time-based
 * transitions in seconds instead of minutes.
 */
export const WatchItExpire: Story = {
  args: {
    endsAt: SALE_START + minutes(6),
    product: 'all sneakers',
    discount: 40,
  },
  parameters: {
    date: {
      now: SALE_START,
      canProgress: true,
      clockSpeed: 30,
    },
  },
}
