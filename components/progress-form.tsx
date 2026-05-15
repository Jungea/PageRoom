'use client'

import { useState } from 'react'
import { updateProgress } from '@/lib/actions/reading-record'
import { SubmitButton } from '@/components/submit-button'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { Label } from '@/components/ui/label'
import { getStatusLabel } from '@/lib/utils'
import type { ReadingStatus, ProgressType, ReadingRecord } from '@/lib/types'

const STATUS_OPTIONS: ReadingStatus[] = [
  'reading', 'completed', 'to_read', 'dropped', 'rereading', 'waiting', 'up_to_date',
]

const SHOW_PROGRESS: ReadingStatus[] = ['reading', 'rereading', 'dropped']

interface ProgressFormProps {
  record: ReadingRecord
  contentId: string
  progressType: ProgressType
}

export function ProgressForm({ record, contentId, progressType }: ProgressFormProps) {
  const [status, setStatus] = useState<ReadingStatus>(record.status)
  const showProgress = progressType !== 'none' && SHOW_PROGRESS.includes(status)

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
          value={status}
          onChange={(e) => setStatus(e.target.value as ReadingStatus)}
          className="h-9 w-full rounded-md border px-3 text-sm"
          style={{ borderColor: 'rgb(var(--color-border))' }}
        >
          {STATUS_OPTIONS.map((s) => (
            <option key={s} value={s}>{getStatusLabel(s)}</option>
          ))}
        </select>
      </div>

      {showProgress && progressType === 'page' && (
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

      {showProgress && progressType === 'episode' && (
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
        <Textarea id="note" name="note" placeholder="오늘의 독서 메모..." />
      </div>

      <SubmitButton size="sm">기록하기</SubmitButton>
    </form>
  )
}
