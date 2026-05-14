'use client'

import { updateProgress } from '@/lib/actions/reading-record'
import { SubmitButton } from '@/components/submit-button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { getStatusLabel } from '@/lib/utils'
import type { ReadingStatus, ContentType, ReadingRecord } from '@/lib/types'

const STATUS_OPTIONS: ReadingStatus[] = [
  'reading', 'completed', 'to_read', 'dropped', 'rereading', 'waiting', 'up_to_date',
]

interface ProgressFormProps {
  record: ReadingRecord
  contentId: string
  contentType: ContentType
}

export function ProgressForm({ record, contentId, contentType }: ProgressFormProps) {
  const isBook = contentType === 'book'
  const isEpisodic = contentType === 'webnovel' || contentType === 'indie'

  return (
    <form action={updateProgress} className="space-y-3 rounded-xl p-4 border"
      style={{ backgroundColor: 'rgb(var(--color-surface))', borderColor: 'rgb(var(--color-border))' }}>
      <input type="hidden" name="record_id" value={record.id} />
      <input type="hidden" name="content_id" value={contentId} />

      <div className="space-y-1">
        <Label htmlFor="status">상태</Label>
        <select
          id="status"
          name="status"
          defaultValue={record.status}
          className="w-full rounded-md border px-3 py-2 text-sm"
          style={{ borderColor: 'rgb(var(--color-border))' }}
        >
          {STATUS_OPTIONS.map((s) => (
            <option key={s} value={s}>{getStatusLabel(s)}</option>
          ))}
        </select>
      </div>

      {isBook && (
        <div className="space-y-1">
          <Label htmlFor="progress_page">현재 페이지</Label>
          <Input
            id="progress_page"
            name="progress_page"
            type="number"
            min={0}
            defaultValue={record.progress_page ?? ''}
          />
        </div>
      )}

      {isEpisodic && (
        <div className="space-y-1">
          <Label htmlFor="progress_episode">현재 화수</Label>
          <Input
            id="progress_episode"
            name="progress_episode"
            type="number"
            min={0}
            defaultValue={record.progress_episode ?? ''}
          />
        </div>
      )}

      <div className="space-y-1">
        <Label htmlFor="note">메모 (선택)</Label>
        <Input id="note" name="note" placeholder="오늘의 독서 메모..." />
      </div>

      <SubmitButton size="sm">기록하기</SubmitButton>
    </form>
  )
}
