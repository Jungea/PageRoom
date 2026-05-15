'use client'

import { useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'

export default function LoginPage() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [isSignUp, setIsSignUp] = useState(false)
  const [message, setMessage] = useState('')
  const [loading, setLoading] = useState(false)

  const supabase = createClient()

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setLoading(true)
    setMessage('')

    if (isSignUp) {
      const { error } = await supabase.auth.signUp({
        email,
        password,
        options: { emailRedirectTo: `${location.origin}/auth/callback` },
      })
      if (error) setMessage(error.message)
      else setMessage('이메일을 확인해주세요.')
    } else {
      const { data, error } = await supabase.auth.signInWithPassword({ email, password })
      if (error) setMessage(error.message)
      else {
        if (data.user) {
          await supabase.from('user_profiles').upsert({
            user_id: data.user.id,
            store_name: '나의 서점',
            theme_id: 'default',
          }, { onConflict: 'user_id', ignoreDuplicates: true })
        }
        window.location.href = '/library'
      }
    }

    setLoading(false)
  }

  return (
    <main className="flex min-h-screen items-center justify-center p-8">
      <div className="w-full max-w-sm space-y-6">
        <div className="text-center">
          <h1 className="text-2xl font-bold">📚 PageRoom</h1>
        </div>

        <div className="flex rounded-lg overflow-hidden border" style={{ borderColor: 'rgb(var(--color-border))' }}>
          <button
            type="button"
            onClick={() => { setIsSignUp(false); setMessage(''); setEmail(''); setPassword('') }}
            className="flex-1 py-2 text-sm font-medium transition-colors"
            style={!isSignUp
              ? { background: 'rgb(var(--color-primary))', color: 'rgb(var(--color-primary-foreground))' }
              : { color: 'rgb(var(--color-text-muted))' }
            }
          >
            로그인
          </button>
          <button
            type="button"
            onClick={() => { setIsSignUp(true); setMessage(''); setEmail(''); setPassword('') }}
            className="flex-1 py-2 text-sm font-medium transition-colors"
            style={isSignUp
              ? { background: 'rgb(var(--color-primary))', color: 'rgb(var(--color-primary-foreground))' }
              : { color: 'rgb(var(--color-text-muted))' }
            }
          >
            회원가입
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-1">
            <Label htmlFor="email">이메일</Label>
            <Input
              id="email"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />
          </div>
          <div className="space-y-1">
            <Label htmlFor="password">비밀번호</Label>
            <Input
              id="password"
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
            />
          </div>
          {message && (
            <p className="text-sm text-center" style={{ color: 'rgb(var(--color-text-muted))' }}>
              {message}
            </p>
          )}
          <Button type="submit" className="w-full" disabled={loading}>
            {loading ? '처리 중...' : isSignUp ? '가입하기' : '로그인'}
          </Button>
        </form>
      </div>
    </main>
  )
}
