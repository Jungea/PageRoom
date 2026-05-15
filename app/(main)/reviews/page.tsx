import { createClient } from '@/lib/supabase/server'
import { ReviewsWrapper } from '@/components/reviews-wrapper'

interface Props {
  searchParams: Promise<{ contentId?: string }>
}

export default async function ReviewsPage({ searchParams }: Props) {
  const { contentId } = await searchParams
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  let query = supabase
    .from('reviews')
    .select('*, content:contents(id, title, type)')
    .eq('user_id', user!.id)
    .order('updated_at', { ascending: false })

  if (contentId) {
    query = query.eq('content_id', contentId)
  }

  const { data: reviews } = await query

  const filteredContentTitle = contentId && reviews?.[0]
    ? (reviews[0].content as any)?.title
    : undefined

  return (
    <ReviewsWrapper
      reviews={(reviews ?? []).map((r) => ({ ...r, content: r.content as any }))}
      filteredContentId={contentId}
      filteredContentTitle={filteredContentTitle}
    />
  )
}
