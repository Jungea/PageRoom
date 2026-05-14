'use server'

import { createClient } from '@/lib/supabase/server'
import { revalidatePath } from 'next/cache'
import { redirect } from 'next/navigation'
import type { ContentType, ReadingStatus } from '@/lib/types'

export async function createContent(formData: FormData) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) throw new Error('Unauthorized')

  const type = formData.get('type') as ContentType
  const title = formData.get('title') as string
  const author = (formData.get('author') as string) || ''
  const genre = ((formData.get('genre') as string) || '')
    .split(',').map((g) => g.trim()).filter(Boolean)
  const totalPages = formData.get('total_pages') ? Number(formData.get('total_pages')) : null
  const totalEpisodes = formData.get('total_episodes') ? Number(formData.get('total_episodes')) : null
  const isOngoing = formData.get('is_ongoing') === 'true'
  const initialStatus = (formData.get('initial_status') as ReadingStatus) || 'to_read'

  // 커버 이미지 업로드
  let coverUrl: string | null = null
  const coverFile = formData.get('cover') as File | null
  if (coverFile && coverFile.size > 0) {
    const ext = coverFile.name.split('.').pop()
    const path = `${user.id}/${Date.now()}.${ext}`
    const { error: uploadError } = await supabase.storage
      .from('covers')
      .upload(path, coverFile)
    if (!uploadError) {
      const { data: urlData } = supabase.storage.from('covers').getPublicUrl(path)
      coverUrl = urlData.publicUrl
    }
  }

  // contents 삽입
  const { data: content, error: contentError } = await supabase
    .from('contents')
    .insert({
      user_id: user.id,
      type,
      title,
      author,
      genre,
      cover_url: coverUrl,
      total_pages: totalPages,
      total_episodes: totalEpisodes,
      is_ongoing: isOngoing,
    })
    .select()
    .single()

  if (contentError || !content) throw new Error(contentError?.message)

  // reading_records 삽입
  const { data: record, error: recordError } = await supabase
    .from('reading_records')
    .insert({ user_id: user.id, content_id: content.id, status: initialStatus })
    .select()
    .single()

  if (recordError || !record) throw new Error(recordError?.message)

  // 초기 activity_log
  await supabase.from('activity_logs').insert({
    user_id: user.id,
    content_id: content.id,
    record_id: record.id,
    action: 'started',
    note: `${title} 등록`,
  })

  revalidatePath('/library')
  redirect(`/library/${content.id}`)
}

export async function deleteContent(contentId: string) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) throw new Error('Unauthorized')

  await supabase
    .from('contents')
    .delete()
    .eq('id', contentId)
    .eq('user_id', user.id)

  revalidatePath('/library')
  redirect('/library')
}
