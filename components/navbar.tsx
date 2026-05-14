'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import { useRouter } from 'next/navigation'
import { cn } from '@/lib/utils'

const NAV_ITEMS = [
  { href: '/library', label: '서재' },
  { href: '/store', label: '서점' },
  { href: '/reviews', label: '독후감' },
  { href: '/settings', label: '설정' },
]

export function Navbar() {
  const pathname = usePathname()
  const router = useRouter()
  const supabase = createClient()

  async function handleSignOut() {
    await supabase.auth.signOut()
    router.push('/')
    router.refresh()
  }

  return (
    <nav
      className="sticky top-0 z-50 border-b px-4 py-3 flex items-center justify-between"
      style={{
        backgroundColor: 'rgb(var(--color-surface-card))',
        borderColor: 'rgb(var(--color-border))',
      }}
    >
      <Link href="/library" className="font-bold text-lg">
        📚 PageRoom
      </Link>

      <div className="flex items-center gap-4">
        {NAV_ITEMS.map((item) => (
          <Link
            key={item.href}
            href={item.href}
            className={cn(
              'text-sm font-medium transition-colors',
              pathname.startsWith(item.href) ? 'font-semibold' : '',
            )}
            style={{
              color: pathname.startsWith(item.href)
                ? 'rgb(var(--color-primary))'
                : 'rgb(var(--color-text-muted))',
            }}
          >
            {item.label}
          </Link>
        ))}
        <button
          onClick={handleSignOut}
          className="text-sm"
          style={{ color: 'rgb(var(--color-text-muted))' }}
        >
          로그아웃
        </button>
      </div>
    </nav>
  )
}
