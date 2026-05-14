import type { Metadata } from 'next'
import { Geist, Geist_Mono } from 'next/font/google'
import './globals.css'
import { ThemeProvider } from '@/components/theme-provider'
import { createClient } from '@/lib/supabase/server'

const geistSans = Geist({
  variable: '--font-geist-sans',
  subsets: ['latin'],
})

const geistMono = Geist_Mono({
  variable: '--font-geist-mono',
  subsets: ['latin'],
})

export const metadata: Metadata = {
  title: 'PageRoom',
  description: '읽고, 기록하고, 운영하고, 쓰는 나만의 서점',
}

export default async function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  let themeId = 'default'
  if (user) {
    const { data } = await supabase
      .from('user_profiles')
      .select('theme_id')
      .eq('user_id', user.id)
      .single()
    if (data) themeId = data.theme_id
  }

  return (
    <html lang="ko" className={`${geistSans.variable} ${geistMono.variable}`}>
      <body className="min-h-screen antialiased">
        <ThemeProvider themeId={themeId}>
          {children}
        </ThemeProvider>
      </body>
    </html>
  )
}
