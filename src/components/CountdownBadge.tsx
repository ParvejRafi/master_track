import { useNow } from '../hooks/useNow'
import { getCountdown, urgencyStyles } from '../lib/countdown'

export default function CountdownBadge({
  date,
  prefix,
}: {
  date: string
  prefix?: string
}) {
  const now = useNow(60_000)
  const countdown = getCountdown(new Date(date), now)
  const style = urgencyStyles[countdown.urgency]

  return (
    <span
      className={`inline-flex items-center gap-1.5 rounded-lg px-2.5 py-1 text-xs font-semibold ${style.bg} ${style.color}`}
    >
      {countdown.urgency === 'critical' && (
        <span className="h-1.5 w-1.5 rounded-full bg-danger animate-pulse" />
      )}
      {prefix ? `${prefix} ` : ''}
      {countdown.label}
    </span>
  )
}
