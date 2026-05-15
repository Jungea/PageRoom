import { createClient } from '@/lib/supabase/server'
import { ReviewDetail } from '@/components/review-detail'
import { DeleteButton } from '@/components/delete-button'
import { deleteReview } from '@/lib/actions/review'
import { notFound } from 'next/navigation'

interface Props {
  params: Promise<{ reviewId: string }>
}

export default async function ReviewDetailPage({ params }: Props) {
  const { reviewId } = await params
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  const { data: review } = await supabase
    .from('reviews')
    .select('*, content:contents(id, title)')
    .eq('id', reviewId)
    .eq('user_id', user!.id)
    .single()

  if (!review) notFound()

  const content = review.content as { id: string; title: string }
  const createdAt = new Date(review.created_at).toLocaleDateString('ko-KR')
  const updatedAt = new Date(review.updated_at).toLocaleDateString('ko-KR')
  const isEdited = review.created_at !== review.updated_at

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <p className="text-sm font-semibold">{content.title}</p>
        <DeleteButton
          action={deleteReview.bind(null, review.id, content.id)}
          confirmMessage={`"${review.title || content.title}" 독후감을 삭제할까요?`}
        />
      </div>
      <ReviewDetail
        review={review}
        contentTitle={content.title}
        createdAt={createdAt}
        isEdited={isEdited}
        updatedAt={updatedAt}
      />
    </div>
  )
}
