import { act, render, screen } from '@testing-library/react'
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import { CountdownComplex } from './CountdownComplex'

describe('CountdownComplex', () => {
  beforeEach(() => {
    vi.useFakeTimers()
  })

  afterEach(() => {
    vi.useRealTimers()
  })

  it('renders countdown with seconds only when less than a minute', () => {
    const now = Date.now()
    vi.setSystemTime(now)
    const target = now + 30 * 1000 // 30 seconds from now

    render(<CountdownComplex datetime={target} />)

    expect(screen.getByTestId('countdown')).toHaveTextContent('30s')
  })

  it('renders countdown with minutes and seconds', () => {
    const now = Date.now()
    vi.setSystemTime(now)
    const target = now + (5 * 60 + 30) * 1000 // 5 minutes 30 seconds

    render(<CountdownComplex datetime={target} />)

    expect(screen.getByTestId('countdown')).toHaveTextContent('5m 30s')
  })

  it('renders countdown with hours, minutes, and seconds', () => {
    const now = Date.now()
    vi.setSystemTime(now)
    const target = now + (2 * 60 * 60 + 15 * 60 + 45) * 1000 // 2h 15m 45s

    render(<CountdownComplex datetime={target} />)

    expect(screen.getByTestId('countdown')).toHaveTextContent('2h 15m 45s')
  })

  it('renders countdown with days', () => {
    const now = Date.now()
    vi.setSystemTime(now)
    const target = now + (3 * 24 * 60 * 60 + 5 * 60 * 60) * 1000 // 3 days 5 hours

    render(<CountdownComplex datetime={target} />)

    expect(screen.getByTestId('countdown')).toHaveTextContent('3d 5h')
  })

  it('renders 0s when target time has passed', () => {
    const now = Date.now()
    vi.setSystemTime(now)
    const target = now - 1000 // 1 second ago

    render(<CountdownComplex datetime={target} />)

    expect(screen.getByTestId('countdown')).toHaveTextContent('0s')
  })

  it('updates countdown using requestAnimationFrame', () => {
    const now = Date.now()
    vi.setSystemTime(now)
    const target = now + 10000 // 10 seconds

    render(<CountdownComplex datetime={target} />)

    expect(screen.getByTestId('countdown')).toHaveTextContent('10s')

    // Advance time and trigger animation frames
    act(() => {
      vi.advanceTimersByTime(3000)
      vi.advanceTimersToNextFrame()
    })

    // Should have decreased (exact timing may vary due to rAF batching)
    const text = screen.getByTestId('countdown').textContent
    expect(text).toMatch(/^[0-7]s$/) // Should be 7s or less

    act(() => {
      vi.advanceTimersByTime(5000)
      vi.advanceTimersToNextFrame()
    })

    const text2 = screen.getByTestId('countdown').textContent
    expect(text2).toMatch(/^[0-2]s$/) // Should be 2s or less
  })

  it('applies size prop correctly', () => {
    const now = Date.now()
    vi.setSystemTime(now)
    const target = now + 30000

    render(<CountdownComplex datetime={target} size="xl" />)

    expect(screen.getByTestId('countdown')).toHaveStyle({ fontSize: '1.5rem' })
  })

  it('applies color prop correctly', () => {
    const now = Date.now()
    vi.setSystemTime(now)
    const target = now + 30000

    render(<CountdownComplex datetime={target} color="red" />)

    expect(screen.getByTestId('countdown').style.color).toBe('red')
  })

  it('applies className prop correctly', () => {
    const now = Date.now()
    vi.setSystemTime(now)
    const target = now + 30000

    render(<CountdownComplex datetime={target} className="custom-class" />)

    expect(screen.getByTestId('countdown')).toHaveClass('custom-class')
  })

  it('applies threshold props when remaining time is below threshold', () => {
    const now = Date.now()
    vi.setSystemTime(now)
    const target = now + 30000 // 30 seconds

    render(
      <CountdownComplex
        datetime={target}
        size="m"
        color="green"
        thresholdProps={{
          warning: { threshold: 60, size: 'l', color: 'orange' },
          critical: { threshold: 10, size: 'xl', color: 'red' },
        }}
      />,
    )

    // 30s remaining, threshold 60 applies (smallest > 30)
    const el = screen.getByTestId('countdown')
    expect(el).toHaveStyle({ fontSize: '1.25rem' })
    expect(el.style.color).toBe('orange')
  })

  it('uses smallest matching threshold', () => {
    const now = Date.now()
    vi.setSystemTime(now)
    const target = now + 5000 // 5 seconds

    render(
      <CountdownComplex
        datetime={target}
        size="m"
        color="green"
        thresholdProps={{
          warning: { threshold: 60, size: 'l', color: 'orange' },
          critical: { threshold: 10, size: 'xl', color: 'red' },
        }}
      />,
    )

    // 5s remaining, threshold 10 is smallest > 5
    const el = screen.getByTestId('countdown')
    expect(el).toHaveStyle({ fontSize: '1.5rem' })
    expect(el.style.color).toBe('red')
  })

  it('uses default props when no threshold matches', () => {
    const now = Date.now()
    vi.setSystemTime(now)
    const target = now + 120000 // 120 seconds

    render(
      <CountdownComplex
        datetime={target}
        size="m"
        color="green"
        thresholdProps={{
          warning: { threshold: 60, size: 'l', color: 'orange' },
          critical: { threshold: 10, size: 'xl', color: 'red' },
        }}
      />,
    )

    // 120s remaining, no threshold > 120, use defaults
    const el = screen.getByTestId('countdown')
    expect(el).toHaveStyle({ fontSize: '1rem' })
    expect(el.style.color).toBe('green')
  })

  it('switches threshold as countdown progresses', () => {
    const now = Date.now()
    vi.setSystemTime(now)
    const target = now + 65000 // 65 seconds

    render(
      <CountdownComplex
        datetime={target}
        size="m"
        color="green"
        thresholdProps={{
          warning: { threshold: 60, size: 'l', color: 'orange' },
          critical: { threshold: 10, size: 'xl', color: 'red' },
        }}
      />,
    )

    const el = screen.getByTestId('countdown')

    // Initially no threshold applies (65s > 60)
    expect(el.style.color).toBe('green')

    // Advance to 55s remaining
    act(() => {
      vi.advanceTimersByTime(10000)
      vi.advanceTimersToNextFrame()
    })

    // Now warning threshold applies
    expect(el.style.color).toBe('orange')

    // Advance to 5s remaining
    act(() => {
      vi.advanceTimersByTime(50000)
      vi.advanceTimersToNextFrame()
    })

    // Now critical threshold applies
    expect(el.style.color).toBe('red')
  })

  it('cleans up requestAnimationFrame on unmount', () => {
    const now = Date.now()
    vi.setSystemTime(now)
    const target = now + 30000

    const cancelSpy = vi.spyOn(globalThis, 'cancelAnimationFrame')

    const { unmount } = render(<CountdownComplex datetime={target} />)

    unmount()

    expect(cancelSpy).toHaveBeenCalled()
    cancelSpy.mockRestore()
  })
})
