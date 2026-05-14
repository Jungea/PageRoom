'use client'

import { useEffect } from 'react'

interface ThemeProviderProps {
  themeId: string
  children: React.ReactNode
}

export function ThemeProvider({ themeId, children }: ThemeProviderProps) {
  useEffect(() => {
    document.documentElement.setAttribute('data-theme', themeId)
  }, [themeId])

  return <>{children}</>
}
