import { createClient } from '@/lib/supabase/server'
import { notFound } from 'next/navigation'
import { ReadingStatusBadge } from '@/components/reading-status-badge'
import { ProgressForm } from '@/components/progress-form'
import { ActivityLogTimeline } from '@/components/activity-log-timeline'
import { getContentTypeLabel, formatProgress } from '@/lib/utils'
import Image from 'next/image'
import Link from 'next/link'
import { buttonVariants } from '@/components/ui/button'
import { DeleteButton } from '@/components/delete-button'
import { deleteContent } from '@/lib/actions/content'

interface Props {
  params: Promise<{ contentId: string }>
}

export default async function ContentDetailPage({ params }: Props) {
  const { contentId } = await params
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  const { data: content } = await supabase
    .from('contents')
    .select('*')
    .eq('id', contentId)
    .eq('user_id', user!.id)
    .single()

  if (!content) notFound()

  const { data: record } = await supabase
    .from('reading_records')
    .select('*')
    .eq('content_id', contentId)
    .eq('user_id', user!.id)
    .single()

  const { data: logs } = await supabase
    .from('activity_logs')
    .select('*')
    .eq('content_id', contentId)
    .eq('user_id', user!.id)
    .order('logged_at', { ascending: false })

  const { data: review } = await supabase
    .from('reviews')
    .select('id')
    .eq('content_id', contentId)
    .eq('user_id', user!.id)
    .single()

  const progress = record
    ? formatProgress(content.type, record.progress_page, record.progress_episode, content.total_pages, content.total_episodes)
    : ''

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between mb-2">
        <span />
        <DeleteButton
          action={deleteContent.bind(null, contentId)}
          confirmMessage={`"${content.title}"을(를) 삭제할까요? 활동 로그와 독후감도 함께 삭제됩니다.`}
        />
      </div>

      <div className="flex gap-4">
        <div className="w-16 h-22 flex-shrink-0 rounded-lg overflow-hidden"
          style={{ backgroundColor: 'rgb(var(--color-accent))' }}>
          {content.cover_url && (
            <Image src={content.cover_url} alt={content.title} width={64} height={88} className="object-cover w-full h-full" />
          )}
        </div>
        <div className="flex-1">
          <h1 className="text-xl font-bold">{content.title}</h1>
          <p className="text-sm mt-1" style={{ color: 'rgb(var(--color-text-muted))' }}>
            {content.author && `${content.author} · `}
            {getContentTypeLabel(content.type)}
            {progress && ` · ${progress}`}
          </p>
          {record && <ReadingStatusBadge status={record.status} className="mt-2" />}
        </div>
      </div>

      {record && (
        <div>
          <h2 className="font-semibold mb-2">진행도 업데이트</h2>
          <ProgressForm record={record} contentId={content.id} contentType={content.type} />
        </div>
      )}

      <div className="flex items-center justify-between">
        <h2 className="font-semibold">독후감</h2>
        <Link
          href={review ? `/reviews/${review.id}` : `/reviews/new?contentId=${content.id}`}
          className={buttonVariants({ variant: 'outline', size: 'sm' })}
        >
          {review ? '독후감 보기' : '독후감 쓰기'}
        </Link>
      </div>

      <div>
        <h2 className="font-semibold mb-3">활동 로그</h2>
        <ActivityLogTimeline logs={logs ?? []} />
      </div>
    </div>
  )
}
