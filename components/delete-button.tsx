'use client'

import { useLoadingOverlay } from '@/components/loading-overlay'
import { buttonVariants } from '@/components/ui/button'

interface DeleteButtonProps {
  action: () => Promise<void>
  confirmMessage: string
}

export function DeleteButton({ action, confirmMessage }: DeleteButtonProps) {
  const { show } = useLoadingOverlay()

  async function handleClick() {
    if (!window.confirm(confirmMessage)) return
    show()
    await action()
  }

  return (
    <button
      type="button"
      onClick={handleClick}
      className={buttonVariants()}
      style={{ backgroundColor: 'rgb(var(--color-danger, 239 68 68))', color: 'white', borderColor: 'transparent' }}
    >
      삭제
    </button>
  )
}
