import type { ActivityLog } from '@/lib/types'

interface ActivityLogTimelineProps {
  logs: ActivityLog[]
}

const ACTION_LABELS: Record<string, string> = {
  progress: '진행도 업데이트',
  status_change: '상태 변경',
  review_written: '독후감 작성',
  started: '등록',
  completed: '완독',
}

export function ActivityLogTimeline({ logs }: ActivityLogTimelineProps) {
  if (logs.length === 0) {
    return (
      <p className="text-sm text-center py-4" style={{ color: 'rgb(var(--color-text-muted))' }}>
        활동 기록이 없어요.
      </p>
    )
  }

  return (
    <div className="space-y-3">
      {logs.map((log) => (
        <div key={log.id} className="flex gap-3 text-sm">
          <span className="flex-shrink-0 w-16 text-right" style={{ color: 'rgb(var(--color-text-muted))' }}>
            {new Date(log.logged_at).toLocaleDateString('ko-KR', { month: 'numeric', day: 'numeric' })}
          </span>
          <div>
            <span className="font-medium">{ACTION_LABELS[log.action] ?? log.action}</span>
            {log.note && (
              <span style={{ color: 'rgb(var(--color-text-muted))' }}> — {log.note}</span>
            )}
            {log.progress_snapshot !== null && !log.note && (
              <span style={{ color: 'rgb(var(--color-text-muted))' }}> {log.progress_snapshot}</span>
            )}
          </div>
        </div>
      ))}
    </div>
  )
}
