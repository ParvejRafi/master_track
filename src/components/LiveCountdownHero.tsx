import { Radio } from 'lucide-react'
import { useNow } from '../hooks/useNow'
import { getCountdown, urgencyStyles } from '../lib/countdown'

export default function LiveCountdownHero({
  title,
  subtitle,
  date,
  kind,
}: {
  title: string
  subtitle: string
  date: string
  kind: 'opens' | 'deadline'
}) {
  const now = useNow(1_000)
  const c = getCountdown(new Date(date), now)
  const style = urgencyStyles[c.urgency]

  return (
    <div className={`relative overflow-hidden rounded-2xl border border-border bg-surface p-5 shadow-sm ring-1 ${style.ring}`}>
      <div className="flex items-start justify-between">
        <div className="min-w-0">
          <div className="flex items-center gap-1.5 text-xs font-semibold uppercase tracking-wide text-subtle">
            <Radio className="h-3 w-3 text-danger animate-pulse" />
            Live &middot; {kind === 'opens' ? 'Opens' : 'Deadline'}
          </div>
          <p className="mt-1 truncate text-sm font-semibold text-text">{title}</p>
          <p className="truncate text-xs text-muted">{subtitle}</p>
        </div>
      </div>

      {c.isPast ? (
        <p className={`mt-4 text-2xl font-bold tracking-tight ${style.color}`}>{c.label}</p>
      ) : (
        <div className="mt-4 flex items-end gap-3">
          <TimeBlock value={c.days} unit="days" />
          <TimeBlock value={c.hours} unit="hrs" />
          <TimeBlock value={c.minutes} unit="min" />
          <TimeBlock value={c.seconds} unit="sec" />
        </div>
      )}
    </div>
  )
}

function TimeBlock({ value, unit }: { value: number; unit: string }) {
  return (
    <div className="flex flex-col items-center">
      <span className="tabular-nums text-2xl font-bold text-text tracking-tight">
        {String(value).padStart(2, '0')}
      </span>
      <span className="text-[10px] font-medium uppercase tracking-wide text-subtle">{unit}</span>
    </div>
  )
}
