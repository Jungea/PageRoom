'use client'

import { usePathname } from 'next/navigation'
import { useEffect } from 'react'
import { useLoadingOverlay } from '@/components/loading-overlay'

export function NavigationProgress() {
  const pathname = usePathname()
  const { show, hide } = useLoadingOverlay()

  useEffect(() => {
    hide()
  }, [pathname])

  useEffect(() => {
    function handleClick(e: MouseEvent) {
      const target = (e.target as HTMLElement).closest('a')
      if (!target) return
      const href = target.getAttribute('href')
      if (!href || href.startsWith('http') || href.startsWith('#') || href.startsWith('mailto')) return
      show()
    }

    document.addEventListener('click', handleClick)
    return () => document.removeEventListener('click', handleClick)
  }, [show])

  return null
}
