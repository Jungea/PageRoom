'use client'

import { useState } from 'react'
import { upsertReview } from '@/lib/actions/review'
import { SubmitButton } from '@/components/submit-button'
import { Textarea } from '@/components/ui/textarea'
import { Label } from '@/components/ui/label'

interface ReviewEditorProps {
  contentId: string
  reviewId?: string
  initialBody?: string
  initialRating?: number
  initialIsPublic?: boolean
  contentTitle: string
}

export function ReviewEditor({
  contentId,
  reviewId,
  initialBody = '',
  initialRating = 0,
  initialIsPublic = false,
  contentTitle,
}: ReviewEditorProps) {
  const [rating, setRating] = useState(initialRating)
  return (
    <form action={upsertReview} className="space-y-5">
      <input type="hidden" name="content_id" value={contentId} />
      {reviewId && <input type="hidden" name="review_id" value={reviewId} />}
      <input type="hidden" name="rating" value={String(rating)} />

      <div>
        <h1 className="text-xl font-bold">{contentTitle}</h1>
        <p className="text-sm" style={{ color: 'rgb(var(--color-text-muted))' }}>독후감</p>
      </div>

      <div className="space-y-1">
        <Label>별점</Label>
        <div className="flex gap-1">
          {[1, 2, 3, 4, 5].map((star) => (
            <button
              key={star}
              type="button"
              onClick={() => setRating(rating === star ? 0 : star)}
              className="text-2xl transition-transform hover:scale-110"
            >
              {star <= rating ? '★' : '☆'}
            </button>
          ))}
        </div>
      </div>

      <div className="space-y-1">
        <Label htmlFor="body">내용 (마크다운 지원)</Label>
        <Textarea
          id="body"
          name="body"
          defaultValue={initialBody}
          rows={10}
          placeholder="이 책에 대한 생각을 자유롭게 기록해보세요..."
        />
      </div>

      <input type="hidden" name="is_public" value="false" />

      <SubmitButton className="w-full">저장하기</SubmitButton>
    </form>
  )
}
