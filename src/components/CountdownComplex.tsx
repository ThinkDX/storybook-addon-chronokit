import { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import { calculateTimeRemaining, type TimeRemaining } from '@/utils/datetime'

export type TextSize = 'xs' | 's' | 'm' | 'l' | 'xl'

export type TimeUnit = 'years' | 'months' | 'days' | 'hours' | 'minutes' | 'seconds'

export type ThresholdConfig = {
  threshold: number
  size?: TextSize
  className?: string
  color?: string
}

export type CountdownComplexProps = {
  datetime: number
  size?: TextSize
  color?: string
  className?: string
  thresholdProps?: Record<string, ThresholdConfig>
  /** The smallest unit to display. Units below this will not be rendered. */
  lowestUnit?: TimeUnit
}

const SIZE_STYLES: Record<TextSize, string> = {
  xs: '0.75rem',
  s: '0.875rem',
  m: '1rem',
  l: '1.25rem',
  xl: '1.5rem',
}

export function CountdownComplex({
  datetime,
  size = 'm',
  color,
  className,
  thresholdProps,
  lowestUnit = 'seconds',
}: CountdownComplexProps) {
  const [timeRemaining, setTimeRemaining] = useState<TimeRemaining>(() =>
    calculateTimeRemaining(datetime),
  )
  const rafIdRef = useRef<number | null>(null)
  const lastSecondsRef = useRef<number>(timeRemaining.totalSeconds)

  const updateCountdown = useCallback(() => {
    const newTime = calculateTimeRemaining(datetime)

    // Only update state when seconds change to avoid unnecessary re-renders
    if (newTime.totalSeconds !== lastSecondsRef.current) {
      lastSecondsRef.current = newTime.totalSeconds
      setTimeRemaining(newTime)
    }

    rafIdRef.current = requestAnimationFrame(updateCountdown)
  }, [datetime])

  useEffect(() => {
    rafIdRef.current = requestAnimationFrame(updateCountdown)

    return () => {
      if (rafIdRef.current !== null) {
        cancelAnimationFrame(rafIdRef.current)
      }
    }
  }, [updateCountdown])

  const matchingThreshold = useMemo(
    () => findMatchingThreshold(timeRemaining.totalSeconds, thresholdProps),
    [timeRemaining.totalSeconds, thresholdProps],
  )

  const effectiveSize = matchingThreshold?.size ?? size
  const effectiveColor = matchingThreshold?.color ?? color
  const effectiveClassName = matchingThreshold?.className ?? className

  const style: React.CSSProperties = {
    fontSize: SIZE_STYLES[effectiveSize],
    color: effectiveColor,
  }

  const timeDisplay = formatTimeRemaining(timeRemaining, lowestUnit)

  return (
    <span data-testid="countdown" className={effectiveClassName} style={style}>
      {timeDisplay}
    </span>
  )
}

function findMatchingThreshold(
  totalSeconds: number,
  thresholdProps?: Record<string, ThresholdConfig>,
): ThresholdConfig | undefined {
  if (!thresholdProps) return undefined

  const entries = Object.values(thresholdProps)
  const validThresholds = entries.filter(
    (config) => config.threshold > totalSeconds,
  )

  if (validThresholds.length === 0) return undefined

  return validThresholds.reduce((smallest, current) =>
    current.threshold < smallest.threshold ? current : smallest,
  )
}

const UNIT_ORDER: TimeUnit[] = [
  'years',
  'months',
  'days',
  'hours',
  'minutes',
  'seconds',
]

const UNIT_LABELS: Record<TimeUnit, string> = {
  years: 'y',
  months: 'mo',
  days: 'd',
  hours: 'h',
  minutes: 'm',
  seconds: 's',
}

function formatTimeRemaining(
  timeRemaining: TimeRemaining,
  lowestUnit: TimeUnit,
) {
  const { years, months, days, hours, minutes, seconds } = timeRemaining
  const values: Record<TimeUnit, number> = {
    years,
    months,
    days,
    hours,
    minutes,
    seconds,
  }

  const lowestIndex = UNIT_ORDER.indexOf(lowestUnit)
  const parts: string[] = []

  for (let i = 0; i <= lowestIndex; i++) {
    const unit = UNIT_ORDER[i]
    const value = values[unit]
    // Always show the lowest unit, only show others if non-zero
    if (value > 0 || i === lowestIndex) {
      parts.push(`${value}${UNIT_LABELS[unit]}`)
    }
  }

  return parts.join(' ')
}
