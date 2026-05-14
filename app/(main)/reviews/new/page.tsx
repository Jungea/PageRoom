import { createClient } from '@/lib/supabase/server'
import { ReviewEditor } from '@/components/review-editor'
import { notFound } from 'next/navigation'

interface Props {
  searchParams: Promise<{ contentId?: string }>
}

export default async function NewReviewPage({ searchParams }: Props) {
  const { contentId } = await searchParams
  if (!contentId) notFound()

  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  const { data: content } = await supabase
    .from('contents')
    .select('id, title')
    .eq('id', contentId)
    .eq('user_id', user!.id)
    .single()

  if (!content) notFound()

  return (
    <ReviewEditor
      contentId={content.id}
      contentTitle={content.title}
    />
  )
}
