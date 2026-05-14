'use client'

import { createContext, useContext, useState, useCallback } from 'react'

interface LoadingOverlayContextType {
  show: () => void
  hide: () => void
}

const LoadingOverlayContext = createContext<LoadingOverlayContextType | null>(null)

export function LoadingOverlayProvider({ children }: { children: React.ReactNode }) {
  const [visible, setVisible] = useState(false)

  const show = useCallback(() => setVisible(true), [])
  const hide = useCallback(() => setVisible(false), [])

  return (
    <LoadingOverlayContext.Provider value={{ show, hide }}>
      {children}
      {visible && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center"
          style={{ backgroundColor: 'rgba(0,0,0,0.4)' }}
        >
          <div className="w-10 h-10 rounded-full border-4 border-t-transparent animate-spin"
            style={{ borderColor: 'rgb(var(--color-primary))', borderTopColor: 'transparent' }}
          />
        </div>
      )}
    </LoadingOverlayContext.Provider>
  )
}

export function useLoadingOverlay() {
  const ctx = useContext(LoadingOverlayContext)
  if (!ctx) throw new Error('useLoadingOverlay must be used within LoadingOverlayProvider')
  return ctx
}
