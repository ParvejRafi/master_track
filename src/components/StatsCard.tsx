import { type ReactNode } from 'react'

export default function StatsCard({
  title,
  value,
  icon,
  trend,
  color = 'primary',
}: {
  title: string
  value: string | number
  icon: ReactNode
  trend?: string
  color?: 'primary' | 'success' | 'warning' | 'danger' | 'info'
}) {
  const colorClasses = {
    primary: 'bg-primary-soft text-primary',
    success: 'bg-success-soft text-success',
    warning: 'bg-warning-soft text-warning',
    danger: 'bg-danger-soft text-danger',
    info: 'bg-info-soft text-info',
  }

  return (
    <div className="group relative overflow-hidden rounded-2xl border border-border bg-surface p-6 shadow-sm transition-all duration-200 hover:shadow-md hover:border-primary/20">
      <div className="flex items-center justify-between">
        <div className="space-y-1">
          <p className="text-sm font-medium text-muted">{title}</p>
          <p className="text-3xl font-bold text-text tracking-tight">{value}</p>
          {trend && <p className="text-sm text-subtle">{trend}</p>}
        </div>
        <div className={`rounded-xl p-3 transition-transform duration-200 group-hover:scale-110 ${colorClasses[color]}`}>
          {icon}
        </div>
      </div>
      <div className="absolute -right-4 -top-4 h-24 w-24 rounded-full bg-gradient-to-br from-primary/5 to-transparent transition-opacity group-hover:opacity-100 opacity-0" />
    </div>
  )
}
