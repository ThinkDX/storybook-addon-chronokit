import type { Meta, StoryObj } from '@storybook/react-vite'
import { expect, waitFor, within } from 'storybook/test'
import { Countdown } from './Countdown'

/**
 * `Countdown` ticks via `requestAnimationFrame`. These stories show the
 * chronokit `date` parameter driving an rAF-based clock — the addon mocks and
 * scales `requestAnimationFrame` too, not just timers — see `FlashSale` for the
 * full real-world showcase.
 */
const BASE_TIME = new Date('2025-01-15T12:00:00').getTime()

const meta = {
  title: 'Demo/Countdown',
  component: Countdown,
  parameters: {
    layout: 'centered',
    // Default: clock advances from `now` at normal speed.
    date: { now: BASE_TIME, canProgress: true },
    docs: { story: { height: '140px' } },
  },
  argTypes: {
    datetime: {
      control: 'date',
      description: 'Target datetime as a timestamp (milliseconds)',
    },
  },
} satisfies Meta<typeof Countdown>

export default meta
type Story = StoryObj<typeof meta>

/** Clock advances from the mocked `now` at real speed, driven by requestAnimationFrame. */
export const RealTime: Story = {
  args: { datetime: BASE_TIME + 5 * 60 * 1000, size: 'xl' },
}

/** `canProgress: false` pins the clock, so the countdown never moves — deterministic for snapshots. */
export const Frozen: Story = {
  parameters: { date: { now: BASE_TIME, canProgress: false } },
  args: { datetime: BASE_TIME + 5 * 60 * 1000, size: 'xl' },
}

/** `clockSpeed: 20` scales rAF 20x, so a 5-minute countdown finishes in ~15 real seconds. */
export const FastForward: Story = {
  parameters: { date: { now: BASE_TIME, canProgress: true, clockSpeed: 20 } },
  args: {
    datetime: BASE_TIME + 5 * 60 * 1000,
    size: 'xl',
    thresholdProps: {
      warning: { threshold: 180, color: 'orange' },
      critical: { threshold: 60, color: 'red' },
    },
  },
}

/**
 * `canProgress` as a predicate over the story context. Set once (e.g. globally
 * in `preview`), it lets the clock run only for stories that have a play
 * function — which usually rely on waits/timers — without flipping it per story.
 * This story has a play function, so the predicate returns true and the
 * countdown ticks down; the play below asserts it actually progressed.
 */
export const ProgressesDuringPlay: Story = {
  parameters: {
    date: { now: BASE_TIME, canProgress: (ctx) => Boolean(ctx.playFunction) },
  },
  args: { datetime: BASE_TIME + 5 * 60 * 1000, size: 'xl' },
  play: async ({ canvasElement }) => {
    const countdown = within(canvasElement).getByTestId('countdown')
    const initial = countdown.textContent
    await waitFor(
      () => expect(countdown).not.toHaveTextContent(initial ?? ''),
      {
        timeout: 4000,
      },
    )
  },
}
