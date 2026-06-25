import type { Decorator } from '@storybook/react-vite'
import { useEffect, useRef } from 'react'

/** The story context Storybook passes to a decorator (second argument). */
export type MockDateContext = Parameters<Decorator>[1]

export type MockDateParameters =
  | string
  | number
  | Date
  | {
      /** The mocked "current" time. */
      now: string | number | Date
      /**
       * Whether the clock advances from `now` (`true`) or stays frozen (`false`).
       *
       * Can also be a function that receives the story context and returns a
       * boolean, so you can decide per story without setting it everywhere —
       * e.g. set globally in `preview`:
       * `canProgress: (ctx) => !!ctx.playFunction` lets the clock run only for
       * stories that have a play function (which usually rely on waits/timers).
       * @default false
       */
      canProgress?: boolean | ((context: MockDateContext) => boolean)
      /** Real-time multiplier for the advancing clock (e.g. 20 = 20x faster). @default 1 */
      clockSpeed?: number
    }

declare module '@storybook/react-vite' {
  interface Parameters {
    date?: MockDateParameters
  }
}

const RealDate = globalThis.Date
const realSetTimeout = globalThis.setTimeout
const realSetInterval = globalThis.setInterval
const realRequestAnimationFrame = globalThis.requestAnimationFrame
const realCancelAnimationFrame = globalThis.cancelAnimationFrame

// Track pending animation frames for cancellation
const pendingFrames = new Map<number, ReturnType<typeof setTimeout>>()
let nextFrameId = 1

class MockDate extends RealDate {
  static mockNow: number = RealDate.now()
  static realtimeStart: number | null = null
  static clockSpeed: number = 1.0

  constructor(value?: string | number | Date) {
    if (value === undefined) {
      super(MockDate.now())
    } else {
      super(value as string | number)
    }
  }

  static override now(): number {
    if (MockDate.realtimeStart === null) {
      return MockDate.mockNow
    }
    const elapsed = RealDate.now() - MockDate.realtimeStart
    return MockDate.mockNow + elapsed * MockDate.clockSpeed
  }

  static override parse(dateString: string): number {
    return RealDate.parse(dateString)
  }

  static override UTC(...args: Parameters<typeof Date.UTC>): number {
    return RealDate.UTC(...args)
  }
}

function mockSetTimeout(speed: number) {
  return ((callback: TimerHandler, ms?: number, ...args: unknown[]) => {
    return realSetTimeout(callback, (ms ?? 0) / speed, ...args)
  }) as typeof setTimeout
}

function mockSetInterval(speed: number) {
  return ((callback: TimerHandler, ms?: number, ...args: unknown[]) => {
    return realSetInterval(callback, (ms ?? 0) / speed, ...args)
  }) as typeof setInterval
}

function mockRequestAnimationFrame(speed: number) {
  return (callback: FrameRequestCallback): number => {
    const frameId = nextFrameId++
    // Normal RAF is ~60fps = 16.67ms between frames
    // With speed multiplier, frames should come faster in real time
    const frameDelay = Math.max(1, 16.67 / speed)

    const timeoutId = realSetTimeout(() => {
      pendingFrames.delete(frameId)
      // Pass the mocked timestamp to the callback
      callback(MockDate.now())
    }, frameDelay)

    pendingFrames.set(frameId, timeoutId)
    return frameId
  }
}

function mockCancelAnimationFrame() {
  return (frameId: number): void => {
    const timeoutId = pendingFrames.get(frameId)
    if (timeoutId !== undefined) {
      clearTimeout(timeoutId)
      pendingFrames.delete(frameId)
    }
  }
}

function parseDate(date: string | number | Date): number {
  if (date instanceof Date) {
    return date.getTime()
  }
  if (typeof date === 'number') {
    return date
  }
  return new RealDate(date).getTime()
}

function applyMock(dateParam: MockDateParameters, context: MockDateContext) {
  const {
    now,
    canProgress: rawCanProgress = false,
    clockSpeed = 1.0,
  } = typeof dateParam === 'object' && 'now' in dateParam
    ? dateParam
    : { now: dateParam }

  // canProgress may be a predicate over the story context (e.g. "has a play fn").
  const canProgress =
    typeof rawCanProgress === 'function'
      ? rawCanProgress(context)
      : rawCanProgress

  MockDate.mockNow = parseDate(now)
  MockDate.realtimeStart = canProgress ? RealDate.now() : null
  MockDate.clockSpeed = clockSpeed

  // @ts-expect-error - replacing global Date with MockDate
  globalThis.Date = MockDate

  if (canProgress && clockSpeed !== 1.0) {
    globalThis.setTimeout = mockSetTimeout(clockSpeed)
    globalThis.setInterval = mockSetInterval(clockSpeed)
    globalThis.requestAnimationFrame = mockRequestAnimationFrame(clockSpeed)
    globalThis.cancelAnimationFrame = mockCancelAnimationFrame()
  }
}

function restoreMock() {
  globalThis.Date = RealDate
  globalThis.setTimeout = realSetTimeout
  globalThis.setInterval = realSetInterval
  globalThis.requestAnimationFrame = realRequestAnimationFrame
  globalThis.cancelAnimationFrame = realCancelAnimationFrame

  // Cancel any pending animation frames
  for (const timeoutId of pendingFrames.values()) {
    clearTimeout(timeoutId)
  }
  pendingFrames.clear()
}

export const mockDateDecorator: Decorator = (Story, context) => {
  const dateParam = context.parameters?.date as MockDateParameters | undefined
  const appliedRef = useRef(false)

  // Hold the latest context in a ref so the re-apply effect can read it without
  // depending on its identity (the decorator re-runs on every render; depending
  // on `context` would re-apply the mock each tick and reset a progressing clock).
  const contextRef = useRef(context)
  contextRef.current = context

  // Apply mock synchronously on first render
  if (dateParam && !appliedRef.current) {
    applyMock(dateParam, context)
    appliedRef.current = true
  }

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (appliedRef.current) {
        restoreMock()
        appliedRef.current = false
      }
    }
  }, [])

  // Re-apply if dateParam changes
  useEffect(() => {
    if (dateParam) {
      applyMock(dateParam, contextRef.current)
      appliedRef.current = true
    } else if (appliedRef.current) {
      restoreMock()
      appliedRef.current = false
    }
  }, [dateParam])

  return Story()
}
