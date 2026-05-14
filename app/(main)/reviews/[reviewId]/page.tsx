import { createClient } from '@/lib/supabase/server'
import { ReviewEditor } from '@/components/review-editor'
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

  return (
    <div className="space-y-4">
      <div className="flex justify-end">
        <DeleteButton
          action={deleteReview.bind(null, review.id, content.id)}
          confirmMessage={`"${content.title}" 독후감을 삭제할까요?`}
        />
      </div>
      <ReviewEditor
        contentId={content.id}
        reviewId={review.id}
        initialBody={review.body}
        initialRating={review.rating}
        initialIsPublic={review.is_public}
        contentTitle={content.title}
      />
    </div>
  )
}
