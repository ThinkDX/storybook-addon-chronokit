import type { Meta, StoryObj } from '@storybook/react-vite'
import { expect, waitFor, within } from 'storybook/test'
import { TimerMechanisms } from './TimerMechanisms'

/**
 * Proof that chronokit controls every scheduling API, not just `Date`. Each
 * mechanism gets its own story (a quick smoke test that it's still driven by the
 * mock), plus an "All Three" view that shows they stay in lockstep.
 */
const BASE_TIME = new Date('2025-01-15T12:00:00').getTime()

const meta = {
  title: 'Demo/Timer Mechanisms',
  component: TimerMechanisms,
  parameters: {
    layout: 'centered',
    // Default: clock runs at 5x so the stopwatches visibly climb.
    date: { now: BASE_TIME, canProgress: true, clockSpeed: 5 },
  },
} satisfies Meta<typeof TimerMechanisms>

export default meta
type Story = StoryObj<typeof meta>

/** `setTimeout` re-schedules itself; the addon scales it, so the clock climbs fast. */
export const SetTimeout: Story = {
  args: { only: 'setTimeout' },
}

/** `setInterval` fires on a fixed cadence; the addon scales it too. */
export const SetInterval: Story = {
  args: { only: 'setInterval' },
}

/** `requestAnimationFrame` drives the smooth case; the addon mocks and scales it. */
export const RequestAnimationFrame: Story = {
  args: { only: 'requestAnimationFrame' },
}

/** All three driven off the same mocked clock — they advance together. */
export const AllThree: Story = {
  args: {},
}

/**
 * Frozen clock. Every mechanism is pinned at 0.0s — including
 * requestAnimationFrame, which would normally animate forever. This is the
 * clearest proof that time is fully under the addon's control.
 */
export const AllThreeFrozen: Story = {
  args: {},
  parameters: { date: { now: BASE_TIME, canProgress: false } },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement)
    // Give the timers a few real ticks; the mocked clock must not advance.
    await waitFor(() => {
      for (const m of ['setTimeout', 'setInterval', 'requestAnimationFrame']) {
        expect(canvas.getByTestId(`elapsed-${m}`)).toHaveTextContent('0.0s')
      }
    })
  },
}
