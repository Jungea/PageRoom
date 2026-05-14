import { createClient } from '@/lib/supabase/server'
import { ReviewEditor } from '@/components/review-editor'
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
    <ReviewEditor
      contentId={content.id}
      reviewId={review.id}
      initialBody={review.body}
      initialRating={review.rating}
      initialIsPublic={review.is_public}
      contentTitle={content.title}
    />
  )
}
