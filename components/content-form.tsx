'use client'

import { useState } from 'react'
import { createContent } from '@/lib/actions/content'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { getContentTypeLabel, getStatusLabel } from '@/lib/utils'
import type { ContentType, ReadingStatus } from '@/lib/types'

const CONTENT_TYPES: ContentType[] = ['book', 'webnovel', 'indie', 'original']
const INITIAL_STATUSES: ReadingStatus[] = ['to_read', 'reading', 'completed']

interface ContentFormProps {
  defaultType?: ContentType
}

export function ContentForm({ defaultType = 'book' }: ContentFormProps) {
  const [type, setType] = useState<ContentType>(defaultType)
  const [loading, setLoading] = useState(false)

  const isBook = type === 'book'
  const isEpisodic = type === 'webnovel' || type === 'indie'

  async function handleSubmit(formData: FormData) {
    setLoading(true)
    formData.set('type', type)
    await createContent(formData)
  }

  return (
    <form action={handleSubmit} className="space-y-5">
      {/* 타입 선택 */}
      <div className="space-y-1">
        <Label>콘텐츠 타입</Label>
        <div className="flex gap-2 flex-wrap">
          {CONTENT_TYPES.map((t) => (
            <button
              key={t}
              type="button"
              onClick={() => setType(t)}
              className="rounded-full px-3 py-1 text-sm border transition-colors"
              style={
                type === t
                  ? { backgroundColor: 'rgb(var(--color-primary))', color: 'white', borderColor: 'transparent' }
                  : { borderColor: 'rgb(var(--color-border))', color: 'rgb(var(--color-text-muted))' }
              }
            >
              {getContentTypeLabel(t)}
            </button>
          ))}
        </div>
      </div>

      <div className="space-y-1">
        <Label htmlFor="title">제목 *</Label>
        <Input id="title" name="title" required />
      </div>

      <div className="space-y-1">
        <Label htmlFor="author">작가</Label>
        <Input id="author" name="author" />
      </div>

      <div className="space-y-1">
        <Label htmlFor="genre">장르 (쉼표로 구분)</Label>
        <Input id="genre" name="genre" placeholder="판타지, 로맨스" />
      </div>

      {isBook && (
        <div className="space-y-1">
          <Label htmlFor="total_pages">총 페이지 수</Label>
          <Input id="total_pages" name="total_pages" type="number" min={1} />
        </div>
      )}

      {isEpisodic && (
        <>
          <div className="space-y-1">
            <Label htmlFor="total_episodes">총 화수</Label>
            <Input id="total_episodes" name="total_episodes" type="number" min={1} />
          </div>
          <div className="flex items-center gap-2">
            <input type="checkbox" id="is_ongoing" name="is_ongoing" value="true" />
            <Label htmlFor="is_ongoing">연재 중</Label>
          </div>
        </>
      )}

      <div className="space-y-1">
        <Label htmlFor="cover">커버 이미지</Label>
        <Input id="cover" name="cover" type="file" accept="image/*" />
      </div>

      <div className="space-y-1">
        <Label htmlFor="initial_status">초기 상태</Label>
        <select
          id="initial_status"
          name="initial_status"
          className="w-full rounded-md border px-3 py-2 text-sm"
          style={{ borderColor: 'rgb(var(--color-border))' }}
        >
          {INITIAL_STATUSES.map((s) => (
            <option key={s} value={s}>{getStatusLabel(s)}</option>
          ))}
        </select>
      </div>

      <Button type="submit" className="w-full" disabled={loading}>
        {loading ? '저장 중...' : '등록하기'}
      </Button>
    </form>
  )
}
