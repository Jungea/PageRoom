'use client'

import { useState } from 'react'
import { updateProfile } from '@/lib/actions/profile'
import { SubmitButton } from '@/components/submit-button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'

const THEMES = [
  { id: 'default', label: '기본 (인디고)' },
  { id: 'cream', label: '크림' },
]

interface SettingsFormProps {
  storeName: string
  themeId: string
}

export function SettingsForm({ storeName, themeId }: SettingsFormProps) {
  const [selectedTheme, setSelectedTheme] = useState(themeId)

  return (
    <form action={updateProfile} className="space-y-5">
      <div className="space-y-1">
        <Label htmlFor="store_name">서점 이름</Label>
        <Input
          id="store_name"
          name="store_name"
          defaultValue={storeName}
        />
      </div>

      <div className="space-y-2">
        <Label>테마</Label>
        <input type="hidden" name="theme_id" value={selectedTheme} />
        <div className="grid grid-cols-2 gap-2">
          {THEMES.map((theme) => (
            <button
              key={theme.id}
              type="button"
              onClick={() => setSelectedTheme(theme.id)}
              className="rounded-xl border p-3 text-sm text-left transition-colors"
              style={
                selectedTheme === theme.id
                  ? {
                      borderColor: 'rgb(var(--color-primary))',
                      backgroundColor: 'color-mix(in srgb, rgb(var(--color-primary)) 10%, transparent)',
                      color: 'rgb(var(--color-primary))',
                      fontWeight: 600,
                    }
                  : {
                      borderColor: 'rgb(var(--color-border))',
                      backgroundColor: 'rgb(var(--color-surface-card))',
                    }
              }
            >
              {theme.label}
            </button>
          ))}
        </div>
      </div>

      <SubmitButton>저장하기</SubmitButton>
    </form>
  )
}
