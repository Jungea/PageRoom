'use client'

import { useState } from 'react'
import Link from 'next/link'
import { Input } from '@/components/ui/input'
import { buttonVariants } from '@/components/ui/button'

interface Review {
  id: string
  title: string
  body: string
  rating: number
  is_public: boolean
  updated_at: string
  content_id: string
  content: { title: string; type: string } | null
}

interface ReviewsWrapperProps {
  reviews: Review[]
  filteredContentId?: string
  filteredContentTitle?: string
}

export function ReviewsWrapper({ reviews, filteredContentId, filteredContentTitle }: ReviewsWrapperProps) {
  const [search, setSearch] = useState('')

  const filtered = reviews.filter((r) =>
    (r.content?.title ?? '').includes(search)
  )

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h1 className="text-xl font-bold">
          {filteredContentTitle ? `"${filteredContentTitle}" 독후감` : '독후감'}
        </h1>
        {filteredContentId && (
          <Link
            href={`/reviews/new?contentId=${filteredContentId}`}
            className={buttonVariants()}
            style={{ backgroundColor: 'rgb(var(--color-primary))', color: 'rgb(var(--color-primary-foreground))', borderColor: 'transparent' }}
          >
            새 독후감
          </Link>
        )}
      </div>

      {!filteredContentId && (
        <Input
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="작품명으로 검색"
        />
      )}

      {filtered.length === 0 ? (
        <div className="text-center py-12 space-y-3">
          <p className="text-sm" style={{ color: 'rgb(var(--color-text-muted))' }}>
            {search ? '검색 결과가 없어요.' : '작성한 독후감이 없어요.'}
          </p>
          {!search && !filteredContentId && (
            <>
              <p className="text-sm" style={{ color: 'rgb(var(--color-text-muted))' }}>
                서재에서 콘텐츠를 선택해 독후감을 작성할 수 있어요.
              </p>
              <Link
                href="/library"
                className="inline-block text-sm px-4 py-2 rounded-lg"
                style={{ backgroundColor: 'rgb(var(--color-primary))', color: 'rgb(var(--color-primary-foreground))' }}
              >
                서재 바로가기
              </Link>
            </>
          )}
        </div>
      ) : (
        <div className="space-y-2">
          {filtered.map((review) => (
            <Link key={review.id} href={`/reviews/${review.id}`}>
              <div
                className="rounded-xl p-4 border"
                style={{ backgroundColor: 'rgb(var(--color-surface-card))', borderColor: 'rgb(var(--color-border))' }}
              >
                <div className="flex items-start justify-between">
                  <div>
                    <p className="font-semibold">{review.title || '(제목 없음)'}</p>
                    <p className="text-xs mt-0.5" style={{ color: 'rgb(var(--color-text-muted))' }}>
                      {review.content?.title}
                      {review.rating > 0 && ` · ${'★'.repeat(review.rating)}`}
                    </p>
                  </div>
                  <p className="text-xs" style={{ color: 'rgb(var(--color-text-muted))' }}>
                    {new Date(review.updated_at).toLocaleDateString('ko-KR')}
                  </p>
                </div>
              </div>
            </Link>
          ))}
        </div>
      )}
    </div>
  )
}
