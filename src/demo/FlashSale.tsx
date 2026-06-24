import { useEffect, useState } from 'react'
import { Countdown } from './Countdown'

export type FlashSaleProps = {
  /** When the sale ends, as a timestamp in milliseconds. */
  endsAt: number
  /** What's on sale. */
  product?: string
  /** Discount percentage shown on the banner. */
  discount?: number
}

/**
 * A real-world example surface for the chronokit addon: an e-commerce flash
 * sale that counts down to a fixed end time and flips to an "ended" state once
 * time runs out. It reads the (mockable) wall clock, so stories can freeze it
 * at a precise moment or let it run fast-forward.
 */
export function FlashSale({
  endsAt,
  product = 'everything',
  discount = 30,
}: FlashSaleProps) {
  const [now, setNow] = useState(() => Date.now())

  useEffect(() => {
    const id = setInterval(() => setNow(Date.now()), 1000)
    return () => clearInterval(id)
  }, [])

  if (now >= endsAt) {
    return (
      <div style={{ ...cardStyle, alignItems: 'center', gap: '0.5rem' }}>
        <span style={{ fontSize: '2.5rem' }}>⌛</span>
        <strong style={{ fontSize: '1.25rem' }}>Flash sale ended</strong>
        <span style={{ color: '#9ca3af' }}>Check back next time!</span>
      </div>
    )
  }

  return (
    <div style={cardStyle}>
      <span style={badgeStyle}>⚡ FLASH SALE</span>
      <div style={{ fontSize: '1.5rem', fontWeight: 700 }}>
        {discount}% off {product}
      </div>
      <div style={{ display: 'flex', flexDirection: 'column', gap: '0.25rem' }}>
        <span style={{ color: '#9ca3af', fontSize: '0.875rem' }}>Ends in</span>
        <Countdown
          datetime={endsAt}
          size="xl"
          lowestUnit="seconds"
          thresholdProps={{
            warning: { threshold: 300, color: '#f59e0b' },
            critical: { threshold: 60, color: '#ef4444' },
          }}
        />
      </div>
    </div>
  )
}

const cardStyle: React.CSSProperties = {
  display: 'flex',
  flexDirection: 'column',
  gap: '0.75rem',
  width: '260px',
  padding: '1.5rem',
  borderRadius: '12px',
  backgroundColor: '#111827',
  color: '#f9fafb',
  fontFamily: 'system-ui, -apple-system, sans-serif',
  boxShadow: '0 10px 30px rgba(0, 0, 0, 0.3)',
}

const badgeStyle: React.CSSProperties = {
  alignSelf: 'flex-start',
  padding: '0.2rem 0.6rem',
  borderRadius: '999px',
  backgroundColor: '#f59e0b',
  color: '#000',
  fontSize: '0.75rem',
  fontWeight: 700,
  letterSpacing: '0.05em',
}
