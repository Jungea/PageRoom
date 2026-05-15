'use server'

import { createClient } from '@/lib/supabase/server'
import { revalidatePath } from 'next/cache'
import { redirect } from 'next/navigation'

export async function upsertReview(formData: FormData) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) throw new Error('Unauthorized')

  const reviewId = formData.get('review_id') as string | null
  const contentId = formData.get('content_id') as string
  const title = formData.get('title') as string
  const body = formData.get('body') as string
  const rating = Number(formData.get('rating')) || 0
  const isPublic = formData.get('is_public') === 'true'

  let resultId = reviewId

  if (reviewId) {
    await supabase
      .from('reviews')
      .update({ title, body, rating, is_public: isPublic, updated_at: new Date().toISOString() })
      .eq('id', reviewId)
      .eq('user_id', user.id)
  } else {
    const { data, error } = await supabase
      .from('reviews')
      .insert({ user_id: user.id, content_id: contentId, title, body, rating, is_public: isPublic })
      .select()
      .single()
    if (error || !data) throw new Error(error?.message)
    resultId = data.id

    const { data: record } = await supabase
      .from('reading_records')
      .select('id')
      .eq('content_id', contentId)
      .eq('user_id', user.id)
      .single()

    if (record) {
      await supabase.from('activity_logs').insert({
        user_id: user.id,
        content_id: contentId,
        record_id: record.id,
        action: 'review_written',
        note: '독후감 작성',
      })
    }
  }

  revalidatePath('/reviews')
  revalidatePath(`/library/${contentId}`)
  redirect('/reviews')
}

export async function deleteReview(reviewId: string, contentId: string) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) throw new Error('Unauthorized')

  await supabase
    .from('reviews')
    .delete()
    .eq('id', reviewId)
    .eq('user_id', user.id)

  revalidatePath('/reviews')
  revalidatePath(`/library/${contentId}`)
  redirect('/reviews')
}
