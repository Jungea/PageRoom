'use server'

import { createClient } from '@/lib/supabase/server'
import { revalidatePath } from 'next/cache'
import type { ReadingStatus } from '@/lib/types'

export async function updateProgress(formData: FormData) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) throw new Error('Unauthorized')

  const recordId = formData.get('record_id') as string
  const contentId = formData.get('content_id') as string
  const progressPage = formData.get('progress_page') ? Number(formData.get('progress_page')) : null
  const progressEpisode = formData.get('progress_episode') ? Number(formData.get('progress_episode')) : null
  const status = formData.get('status') as ReadingStatus
  const note = formData.get('note') as string | null

  await supabase
    .from('reading_records')
    .update({
      status,
      progress_page: progressPage,
      progress_episode: progressEpisode,
      ...(status === 'completed' ? { completed_at: new Date().toISOString() } : {}),
    })
    .eq('id', recordId)
    .eq('user_id', user.id)

  await supabase.from('activity_logs').insert({
    user_id: user.id,
    content_id: contentId,
    record_id: recordId,
    action: status === 'completed' ? 'completed' : 'progress',
    note: note || null,
    progress_snapshot: progressPage ?? progressEpisode,
  })

  revalidatePath(`/library/${contentId}`)
}
