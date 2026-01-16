import { useEffect, useMemo, useState } from 'react'
import { calculateTimeRemaining, type TimeRemaining } from '@/utils/datetime'

export type TextSize = 'xs' | 's' | 'm' | 'l' | 'xl'

export type TimeUnit = 'years' | 'months' | 'days' | 'hours' | 'minutes' | 'seconds'

export interface ThresholdConfig {
  threshold: number
  size?: TextSize
  className?: string
  color?: string
}

export interface CountdownSimpleProps {
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

export function CountdownSimple({
  datetime,
  size = 'm',
  color,
  className,
  thresholdProps,
  lowestUnit = 'seconds',
}: CountdownSimpleProps) {
  const [timeRemaining, setTimeRemaining] = useState<TimeRemaining>(() =>
    calculateTimeRemaining(datetime),
  )

  useEffect(() => {
    const updateCountdown = () => {
      setTimeRemaining(calculateTimeRemaining(datetime))
    }

    const intervalId = setInterval(updateCountdown, 1000)

    return () => clearInterval(intervalId)
  }, [datetime])

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
  // Find thresholds greater than remaining time, then pick the smallest
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
