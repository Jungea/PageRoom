import { createClient } from '@/lib/supabase/server'
import { updateProfile } from '@/lib/actions/profile'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'

const THEMES = [
  { id: 'default', label: '기본 (인디고)' },
  { id: 'cream', label: '크림' },
]

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

      <form action={updateProfile} className="space-y-5">
        <div className="space-y-1">
          <Label htmlFor="store_name">서점 이름</Label>
          <Input
            id="store_name"
            name="store_name"
            defaultValue={profile?.store_name ?? '나의 서점'}
          />
        </div>

        <div className="space-y-2">
          <Label>테마</Label>
          <div className="grid grid-cols-2 gap-2">
            {THEMES.map((theme) => (
              <label
                key={theme.id}
                className="flex items-center gap-2 rounded-lg border p-3 cursor-pointer"
                style={{ borderColor: 'rgb(var(--color-border))' }}
              >
                <input
                  type="radio"
                  name="theme_id"
                  value={theme.id}
                  defaultChecked={profile?.theme_id === theme.id}
                />
                <span className="text-sm">{theme.label}</span>
              </label>
            ))}
          </div>
        </div>

        <Button type="submit">저장하기</Button>
      </form>
    </div>
  )
}
