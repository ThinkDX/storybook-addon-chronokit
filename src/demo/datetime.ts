export interface TimeRemaining {
  years: number
  months: number
  days: number
  hours: number
  minutes: number
  seconds: number
  totalSeconds: number
}

export function calculateTimeRemaining(targetTime: number): TimeRemaining {
  const now = Date.now()
  const diff = Math.max(0, targetTime - now)
  const totalSeconds = Math.floor(diff / 1000)

  if (totalSeconds <= 0) {
    return {
      years: 0,
      months: 0,
      days: 0,
      hours: 0,
      minutes: 0,
      seconds: 0,
      totalSeconds: 0,
    }
  }

  const seconds = totalSeconds % 60
  const totalMinutes = Math.floor(totalSeconds / 60)
  const minutes = totalMinutes % 60
  const totalHours = Math.floor(totalMinutes / 60)
  const hours = totalHours % 24
  const totalDays = Math.floor(totalHours / 24)

  // Approximate months and years (using 30 days/month, 365 days/year)
  const years = Math.floor(totalDays / 365)
  const remainingDaysAfterYears = totalDays % 365
  const months = Math.floor(remainingDaysAfterYears / 30)
  const days = remainingDaysAfterYears % 30

  return { years, months, days, hours, minutes, seconds, totalSeconds }
}
