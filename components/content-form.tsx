'use client'

import { useState, useRef } from 'react'
import { createContent } from '@/lib/actions/content'
import { addCustomGenre } from '@/lib/actions/profile'
import { SubmitButton } from '@/components/submit-button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { getContentTypeLabel, getStatusLabel } from '@/lib/utils'
import type { ContentType, ProgressType, ReadingStatus } from '@/lib/types'

const CONTENT_TYPES: ContentType[] = ['book', 'webnovel', 'indie', 'original']
const INITIAL_STATUSES: ReadingStatus[] = ['to_read', 'reading', 'completed']

const DEFAULT_PROGRESS_TYPE: Record<ContentType, ProgressType> = {
  book: 'page',
  webnovel: 'episode',
  indie: 'episode',
  original: 'none',
}
const GENRE_OPTIONS = [
  '판타지', '현대판타지', '로맨스', '무협', 'SF', '미스터리', '추리',
  '공포', '일상', '성장', '드라마', '액션', '스릴러', '역사', '코미디',
  'BL', 'GL', '이세계', '회귀',
]

interface ContentFormProps {
  defaultType?: ContentType
  customGenres?: string[]
}

export function ContentForm({ defaultType = 'book', customGenres = [] }: ContentFormProps) {
  const [type, setType] = useState<ContentType>(defaultType)
  const [progressType, setProgressType] = useState<ProgressType>(DEFAULT_PROGRESS_TYPE[defaultType])
  const [isOngoing, setIsOngoing] = useState(false)
  const [selectedGenres, setSelectedGenres] = useState<string[]>([])
  const [localCustomGenres, setLocalCustomGenres] = useState<string[]>(customGenres)
  const [genreInput, setGenreInput] = useState('')
  const [genreOpen, setGenreOpen] = useState(false)
  const genreRef = useRef<HTMLDivElement>(null)


  const allGenres = [...GENRE_OPTIONS, ...localCustomGenres.filter((g) => !GENRE_OPTIONS.includes(g))]
    .sort((a, b) => {
      const category = (s: string) => {
        const c = s.charCodeAt(0)
        if (c >= 48 && c <= 57) return 0
        if ((c >= 65 && c <= 90) || (c >= 97 && c <= 122)) return 1
        return 2
      }
      const diff = category(a) - category(b)
      return diff !== 0 ? diff : a.localeCompare(b, 'ko')
    })
  const filteredGenres = allGenres.filter(
    (g) => g.includes(genreInput) && !selectedGenres.includes(g)
  )
  const trimmed = genreInput.trim()
  const canAdd = trimmed !== '' && !allGenres.includes(trimmed) && !selectedGenres.includes(trimmed)

  function addGenre(genre: string) {
    setSelectedGenres((prev) => [...prev, genre])
    setGenreInput('')
    setGenreOpen(false)
    if (!allGenres.includes(genre)) {
      addCustomGenre(genre)
      setLocalCustomGenres((prev) => [...prev, genre])
    }
  }

  function removeGenre(genre: string) {
    setSelectedGenres((prev) => prev.filter((g) => g !== genre))
  }

  async function handleSubmit(formData: FormData) {
    formData.set('type', type)
    formData.set('progress_type', progressType)
    formData.set('genre', selectedGenres.join(','))
    await createContent(formData)
  }

  return (
    <form action={handleSubmit} className="space-y-5">
      <div className="space-y-1">
        <Label>콘텐츠 타입</Label>
        <div className="flex gap-2 flex-wrap">
          {CONTENT_TYPES.map((t) => (
            <button
              key={t}
              type="button"
              onClick={() => { setType(t); setProgressType(DEFAULT_PROGRESS_TYPE[t]) }}
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
        <Label>장르</Label>
        {selectedGenres.length > 0 && (
          <div className="flex flex-wrap gap-1 mb-2">
            {selectedGenres.map((g) => (
              <span
                key={g}
                className="flex items-center gap-1 rounded-full px-2 py-0.5 text-xs"
                style={{ background: 'rgb(var(--color-primary))', color: 'white' }}
              >
                {g}
                <button
                  type="button"
                  onClick={() => removeGenre(g)}
                  className="hover:opacity-70 leading-none"
                >
                  ×
                </button>
              </span>
            ))}
          </div>
        )}
        <div className="relative" ref={genreRef}>
          <Input
            value={genreInput}
            onChange={(e) => { setGenreInput(e.target.value); setGenreOpen(true) }}
            onFocus={() => setGenreOpen(true)}
            onBlur={() => setTimeout(() => setGenreOpen(false), 150)}
            onKeyDown={(e) => {
              if (e.key === 'Enter') {
                e.preventDefault()
                if (canAdd) addGenre(trimmed)
                else if (filteredGenres.length > 0) addGenre(filteredGenres[0])
              }
            }}
            placeholder="장르 검색 또는 직접 입력"
          />
          {genreOpen && (filteredGenres.length > 0 || canAdd) && (
            <div
              className="absolute z-10 mt-1 w-full rounded-md border shadow-md overflow-hidden"
              style={{ background: 'rgb(var(--color-surface))', borderColor: 'rgb(var(--color-border))' }}
            >
              {canAdd && (
                <button
                  type="button"
                  onMouseDown={() => addGenre(trimmed)}
                  className="w-full px-3 py-2 text-left text-sm border-b"
                  style={{ borderColor: 'rgb(var(--color-border))', color: 'rgb(var(--color-primary))' }}
                >
                  + &quot;{trimmed}&quot; 추가
                </button>
              )}
              <div className="overflow-y-auto max-h-48">
                {filteredGenres.map((g) => (
                  <button
                    key={g}
                    type="button"
                    onMouseDown={() => addGenre(g)}
                    className="w-full px-3 py-2 text-left text-sm hover:opacity-70"
                  >
                    {g}
                  </button>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>

      <div className="space-y-1">
        <Label>진행도 방식</Label>
        <div className="flex gap-2">
          {(['page', 'episode', 'none'] as ProgressType[]).map((pt) => (
            <button
              key={pt}
              type="button"
              onClick={() => setProgressType(pt)}
              className="rounded-full px-3 py-1 text-sm border transition-colors"
              style={
                progressType === pt
                  ? { backgroundColor: 'rgb(var(--color-primary))', color: 'white', borderColor: 'transparent' }
                  : { borderColor: 'rgb(var(--color-border))', color: 'rgb(var(--color-text-muted))' }
              }
            >
              {pt === 'page' ? '페이지' : pt === 'episode' ? '화수' : '없음'}
            </button>
          ))}
        </div>
      </div>

      {progressType === 'page' && (
        <div className="space-y-1">
          <Label htmlFor="total_pages">총 페이지 수</Label>
          <Input id="total_pages" name="total_pages" type="number" min={1} />
        </div>
      )}

      {progressType === 'episode' && (
        <>
          <div className="flex items-center justify-between">
            <Label htmlFor="is_ongoing_toggle">연재 중</Label>
            <input type="hidden" name="is_ongoing" value={isOngoing ? 'true' : ''} />
            <button
              id="is_ongoing_toggle"
              type="button"
              role="switch"
              aria-checked={isOngoing}
              onClick={() => setIsOngoing((v) => !v)}
              className="relative inline-flex h-6 w-11 shrink-0 rounded-full border-2 border-transparent transition-colors duration-200"
              style={{ backgroundColor: isOngoing ? 'rgb(var(--color-primary))' : 'rgb(var(--color-border))' }}
            >
              <span
                className="pointer-events-none inline-block h-5 w-5 rounded-full bg-white shadow transition-transform duration-200"
                style={{ transform: isOngoing ? 'translateX(20px)' : 'translateX(0px)' }}
              />
            </button>
          </div>
          {!isOngoing && (
            <div className="space-y-1">
              <Label htmlFor="total_episodes">총 화수</Label>
              <Input id="total_episodes" name="total_episodes" type="number" min={1} />
            </div>
          )}
        </>
      )}

      <div className="space-y-1">
        <Label htmlFor="initial_status">초기 상태</Label>
        <select
          id="initial_status"
          name="initial_status"
          className="h-9 w-full rounded-md border px-3 text-sm"
          style={{ borderColor: 'rgb(var(--color-border))' }}
        >
          {INITIAL_STATUSES.map((s) => (
            <option key={s} value={s}>{getStatusLabel(s)}</option>
          ))}
        </select>
      </div>

      <SubmitButton className="w-full">등록하기</SubmitButton>
    </form>
  )
}
