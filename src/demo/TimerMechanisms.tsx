import { useEffect, useReducer, useRef } from 'react'

export type TimerMechanism =
  | 'setTimeout'
  | 'setInterval'
  | 'requestAnimationFrame'

export type TimerMechanismsProps = {
  /** Show a single mechanism; omit to show all three side by side. */
  only?: TimerMechanism
}

const ALL: TimerMechanism[] = [
  'setTimeout',
  'setInterval',
  'requestAnimationFrame',
]

/**
 * A diagnostic showcase for the chronokit addon. Each card is a stopwatch whose
 * elapsed time is read from the (mockable) clock via `Date.now()`, but which
 * re-renders on a cadence driven by exactly one timer mechanism. Because the
 * addon mocks `Date` plus all three scheduling APIs:
 *
 * - frozen (`canProgress: false`) → every card stays at 0.0s, even the
 *   requestAnimationFrame one that would normally animate;
 * - fast-forward (`clockSpeed`) → all three climb together, in sync.
 *
 * If the addon ever stops controlling one mechanism, that card visibly falls
 * out of step with the others.
 */
export function TimerMechanisms({ only }: TimerMechanismsProps) {
  const mechanisms = only ? [only] : ALL
  return (
    <div style={wrapStyle}>
      {mechanisms.map((mechanism) => (
        <Stopwatch key={mechanism} mechanism={mechanism} />
      ))}
    </div>
  )
}

const TICK_MS = 100

function Stopwatch({ mechanism }: { mechanism: TimerMechanism }) {
  const [, tick] = useReducer((n: number) => n + 1, 0)
  const startRef = useRef<number | null>(null)
  if (startRef.current === null) {
    startRef.current = Date.now()
  }

  useEffect(() => {
    let active = true
    let timeoutId: ReturnType<typeof setTimeout> | undefined
    let intervalId: ReturnType<typeof setInterval> | undefined
    let rafId: number | undefined

    if (mechanism === 'setInterval') {
      intervalId = setInterval(tick, TICK_MS)
    } else {
      const loop = () => {
        if (!active) return
        tick()
        if (mechanism === 'setTimeout') {
          timeoutId = setTimeout(loop, TICK_MS)
        } else {
          rafId = requestAnimationFrame(loop)
        }
      }
      loop()
    }

    return () => {
      active = false
      if (timeoutId !== undefined) clearTimeout(timeoutId)
      if (intervalId !== undefined) clearInterval(intervalId)
      if (rafId !== undefined) cancelAnimationFrame(rafId)
    }
  }, [mechanism])

  const elapsed = Math.max(0, (Date.now() - (startRef.current ?? 0)) / 1000)

  return (
    <div style={cardStyle}>
      <code style={labelStyle}>{mechanism}</code>
      <span style={valueStyle} data-testid={`elapsed-${mechanism}`}>
        {elapsed.toFixed(1)}s
      </span>
    </div>
  )
}

const wrapStyle: React.CSSProperties = {
  display: 'flex',
  gap: '1rem',
  fontFamily: 'system-ui, -apple-system, sans-serif',
}

const cardStyle: React.CSSProperties = {
  display: 'flex',
  flexDirection: 'column',
  alignItems: 'center',
  gap: '0.5rem',
  width: '180px',
  padding: '1.25rem',
  borderRadius: '12px',
  backgroundColor: '#111827',
  color: '#f9fafb',
  boxShadow: '0 10px 30px rgba(0, 0, 0, 0.3)',
}

const labelStyle: React.CSSProperties = {
  padding: '0.2rem 0.5rem',
  borderRadius: '6px',
  backgroundColor: '#1f2937',
  color: '#93c5fd',
  fontSize: '0.8rem',
}

const valueStyle: React.CSSProperties = {
  fontSize: '2.25rem',
  fontWeight: 700,
  fontVariantNumeric: 'tabular-nums',
}
