import { getStatusLabel, getStatusColor, cn } from '@/lib/utils'
import type { ReadingStatus } from '@/lib/types'

interface ReadingStatusBadgeProps {
  status: ReadingStatus
  className?: string
}

export function ReadingStatusBadge({ status, className }: ReadingStatusBadgeProps) {
  return (
    <span
      className={cn(
        'inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium',
        getStatusColor(status),
        className,
      )}
    >
      {getStatusLabel(status)}
    </span>
  )
}
