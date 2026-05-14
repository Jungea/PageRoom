'use server'

import { createClient } from '@/lib/supabase/server'
import { revalidatePath } from 'next/cache'

export async function updateProfile(formData: FormData) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) throw new Error('Unauthorized')

  const storeName = formData.get('store_name') as string
  const themeId = formData.get('theme_id') as string

  await supabase
    .from('user_profiles')
    .update({ store_name: storeName, theme_id: themeId })
    .eq('user_id', user.id)

  revalidatePath('/settings')
  revalidatePath('/', 'layout')
}
