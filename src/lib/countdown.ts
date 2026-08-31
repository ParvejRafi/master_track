export type CountdownUrgency = 'passed' | 'critical' | 'urgent' | 'soon' | 'normal'

export type CountdownParts = {
  totalMs: number
  days: number
  hours: number
  minutes: number
  seconds: number
  isPast: boolean
  urgency: CountdownUrgency
  label: string
}

export function getCountdown(target: Date, now: Date): CountdownParts {
  const totalMs = target.getTime() - now.getTime()
  const isPast = totalMs <= 0
  const abs = Math.abs(totalMs)

  const days = Math.floor(abs / (24 * 60 * 60 * 1000))
  const hours = Math.floor((abs / (60 * 60 * 1000)) % 24)
  const minutes = Math.floor((abs / (60 * 1000)) % 60)
  const seconds = Math.floor((abs / 1000) % 60)

  let urgency: CountdownUrgency = 'normal'
  if (isPast) urgency = 'passed'
  else if (days < 1) urgency = 'critical'
  else if (days < 3) urgency = 'urgent'
  else if (days < 7) urgency = 'soon'

  let label: string
  if (isPast) {
    label = days > 0 ? `Passed ${days}d ago` : 'Passed today'
  } else if (days > 0) {
    label = days >= 10 ? `${days}d` : `${days}d ${hours}h`
  } else if (hours > 0) {
    label = `${hours}h ${minutes}m`
  } else {
    label = `${minutes}m ${seconds}s`
  }

  return { totalMs, days, hours, minutes, seconds, isPast, urgency, label }
}

export const urgencyStyles: Record<CountdownUrgency, { color: string; bg: string; ring: string }> = {
  passed: { color: 'text-muted', bg: 'bg-surface-hover', ring: 'ring-border' },
  critical: { color: 'text-danger', bg: 'bg-danger-soft', ring: 'ring-danger/30' },
  urgent: { color: 'text-warning', bg: 'bg-warning-soft', ring: 'ring-warning/30' },
  soon: { color: 'text-info', bg: 'bg-info-soft', ring: 'ring-info/30' },
  normal: { color: 'text-muted', bg: 'bg-surface-hover', ring: 'ring-border' },
}
