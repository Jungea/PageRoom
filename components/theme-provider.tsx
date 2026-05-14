'use client'

interface ThemeProviderProps {
  themeId: string
  children: React.ReactNode
}

export function ThemeProvider({ themeId, children }: ThemeProviderProps) {
  return <>{children}</>
}
