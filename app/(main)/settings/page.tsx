import { createClient } from '@/lib/supabase/server'
import { SettingsForm } from '@/components/settings-form'

export default async function SettingsPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  const { data: profile } = await supabase
    .from('user_profiles')
    .select('*')
    .eq('user_id', user!.id)
    .single()

  return (
    <div className="space-y-8">
      <h1 className="text-xl font-bold">설정</h1>
      <SettingsForm
        storeName={profile?.store_name ?? '나의 서점'}
        themeId={profile?.theme_id ?? 'default'}
      />
    </div>
  )
}
