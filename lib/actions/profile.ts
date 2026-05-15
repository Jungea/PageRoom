'use server'

import { createClient } from '@/lib/supabase/server'
import { revalidatePath } from 'next/cache'
import { redirect } from 'next/navigation'

export async function updateProfile(formData: FormData) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) throw new Error('Unauthorized')

  const storeName = formData.get('store_name') as string
  const themeId = formData.get('theme_id') as string

  await supabase
    .from('user_profiles')
    .upsert({ user_id: user.id, store_name: storeName, theme_id: themeId })

  revalidatePath('/settings')
  revalidatePath('/', 'layout')
  redirect('/settings')
}

export async function addCustomGenre(genre: string) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) throw new Error('Unauthorized')

  const { data: profile } = await supabase
    .from('user_profiles')
    .select('custom_genres')
    .eq('user_id', user.id)
    .single()

  const current: string[] = profile?.custom_genres ?? []
  if (current.includes(genre)) return

  await supabase
    .from('user_profiles')
    .update({ custom_genres: [...current, genre] })
    .eq('user_id', user.id)
}
