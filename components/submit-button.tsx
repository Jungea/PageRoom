'use client'

import { useFormStatus } from 'react-dom'
import { Button } from '@/components/ui/button'
import type { ComponentProps } from 'react'

interface SubmitButtonProps extends ComponentProps<typeof Button> {
  pendingText?: string
}

export function SubmitButton({ children, pendingText = '처리중...', ...props }: SubmitButtonProps) {
  const { pending } = useFormStatus()

  return (
    <Button type="submit" disabled={pending} {...props}>
      {pending ? (
        <span className="flex items-center gap-2">
          <span className="w-4 h-4 rounded-full border-2 border-t-transparent animate-spin" style={{ borderColor: 'currentColor', borderTopColor: 'transparent' }} />
          {pendingText}
        </span>
      ) : children}
    </Button>
  )
}
