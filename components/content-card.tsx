import Link from 'next/link'
import Image from 'next/image'
import { ReadingStatusBadge } from './reading-status-badge'
import { formatProgress, getContentTypeLabel } from '@/lib/utils'
import type { ContentWithRecord } from '@/lib/types'

interface ContentCardProps {
  content: ContentWithRecord
}

export function ContentCard({ content }: ContentCardProps) {
  const record = content.reading_record

  const progress = record
    ? formatProgress(
        content.progress_type,
        record.progress_page,
        record.progress_episode,
        content.total_pages,
        content.total_episodes,
      )
    : ''

  const progressPercent =
    record && content.progress_type === 'page' && content.total_pages && record.progress_page
      ? Math.round((record.progress_page / content.total_pages) * 100)
      : record && content.progress_type === 'episode' && content.total_episodes && record.progress_episode
      ? Math.round((record.progress_episode / content.total_episodes) * 100)
      : null

  return (
    <Link href={`/library/${content.id}`}>
      <div
        className="flex gap-3 items-center rounded-xl p-3 border transition-shadow hover:shadow-sm"
        style={{
          backgroundColor: 'rgb(var(--color-surface-card))',
          borderColor: 'rgb(var(--color-border))',
        }}
      >
        <div
          className="w-10 h-14 rounded flex-shrink-0 overflow-hidden"
          style={{ backgroundColor: 'rgb(var(--color-accent))' }}
        >
          {content.cover_url && (
            <Image
              src={content.cover_url}
              alt={content.title}
              width={40}
              height={56}
              className="object-cover w-full h-full"
            />
          )}
        </div>

        <div className="flex-1 min-w-0">
          <p className="font-semibold text-sm truncate">{content.title}</p>
          <p className="text-xs mt-0.5" style={{ color: 'rgb(var(--color-text-muted))' }}>
            {content.author && `${content.author} · `}
            {getContentTypeLabel(content.type)}
            {progress && ` · ${progress}`}
          </p>
          {progressPercent !== null && (
            <div
              className="mt-1.5 h-1 rounded-full overflow-hidden"
              style={{ backgroundColor: 'rgb(var(--color-accent))' }}
            >
              <div
                className="h-full rounded-full"
                style={{
                  width: `${progressPercent}%`,
                  backgroundColor: 'rgb(var(--color-primary))',
                }}
              />
            </div>
          )}
        </div>

        {record && <ReadingStatusBadge status={record.status} />}
      </div>
    </Link>
  )
}
