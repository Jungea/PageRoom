'use client'

import { useState } from 'react'
import ReactMarkdown from 'react-markdown'
import { ReviewEditor } from '@/components/review-editor'
import { buttonVariants } from '@/components/ui/button'

interface ReviewDetailProps {
  review: {
    id: string
    content_id: string
    title: string
    body: string
    rating: number
    is_public: boolean
    created_at: string
    updated_at: string
  }
  contentTitle: string
  createdAt: string
  isEdited: boolean
  updatedAt: string
}

export function ReviewDetail({ review, contentTitle, createdAt, isEdited, updatedAt }: ReviewDetailProps) {
  const [editing, setEditing] = useState(false)

  if (editing) {
    return (
      <ReviewEditor
        contentId={review.content_id}
        reviewId={review.id}
        initialTitle={review.title}
        initialBody={review.body}
        initialRating={review.rating}
        initialIsPublic={review.is_public}
        contentTitle={contentTitle}
      />
    )
  }

  return (
    <div className="space-y-4">
      <div className="flex items-start justify-between gap-2">
        <div>
          <p className="text-xs" style={{ color: 'rgb(var(--color-text-muted))' }}>
            {createdAt} 작성{isEdited && ` · ${updatedAt} 수정`}
          </p>
          {review.rating > 0 && (
            <p className="text-sm mt-0.5">{'★'.repeat(review.rating)}{'☆'.repeat(5 - review.rating)}</p>
          )}
        </div>
        <button
          type="button"
          onClick={() => setEditing(true)}
          className={buttonVariants({ variant: 'outline' })}
        >
          수정
        </button>
      </div>

      {review.title && (
        <h2 className="text-lg font-bold">{review.title}</h2>
      )}

      {review.body ? (
        <div className="text-sm leading-relaxed space-y-2" style={{ color: 'rgb(var(--color-text))' }}>
          <ReactMarkdown
            components={{
              h1: ({ children }) => <h1 className="text-xl font-bold mt-4 mb-2">{children}</h1>,
              h2: ({ children }) => <h2 className="text-lg font-bold mt-3 mb-1">{children}</h2>,
              h3: ({ children }) => <h3 className="text-base font-semibold mt-2 mb-1">{children}</h3>,
              p: ({ children }) => <p className="whitespace-pre-wrap">{children}</p>,
              strong: ({ children }) => <strong className="font-bold">{children}</strong>,
              em: ({ children }) => <em className="italic">{children}</em>,
              ul: ({ children }) => <ul className="list-disc pl-5 space-y-1">{children}</ul>,
              ol: ({ children }) => <ol className="list-decimal pl-5 space-y-1">{children}</ol>,
              li: ({ children }) => <li>{children}</li>,
              blockquote: ({ children }) => (
                <blockquote className="border-l-4 pl-3 italic" style={{ borderColor: 'rgb(var(--color-border))', color: 'rgb(var(--color-text-muted))' }}>
                  {children}
                </blockquote>
              ),
              hr: () => <hr style={{ borderColor: 'rgb(var(--color-border))' }} />,
              code: ({ children }) => (
                <code className="rounded px-1 py-0.5 text-xs font-mono" style={{ backgroundColor: 'rgb(var(--color-accent))' }}>
                  {children}
                </code>
              ),
            }}
          >
            {review.body}
          </ReactMarkdown>
        </div>
      ) : (
        <p className="text-sm" style={{ color: 'rgb(var(--color-text-muted))' }}>내용이 없어요.</p>
      )}
    </div>
  )
}
