import { createClient } from '@/lib/supabase/server'
import { NextResponse } from 'next/server'

export async function GET(request: Request) {
  const { searchParams, origin } = new URL(request.url)
  const code = searchParams.get('code')

  if (code) {
    const supabase = await createClient()
    const { data, error } = await supabase.auth.exchangeCodeForSession(code)

    if (!error && data.user) {
      // 첫 로그인 시 user_profiles 생성
      await supabase.from('user_profiles').upsert({
        user_id: data.user.id,
        store_name: '나의 서점',
        theme_id: 'default',
      }, { onConflict: 'user_id', ignoreDuplicates: true })

      return NextResponse.redirect(`${origin}/library`)
    }
  }

  return NextResponse.redirect(`${origin}/login?error=auth_failed`)
}
