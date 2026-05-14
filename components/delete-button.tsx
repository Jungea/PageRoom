'use client'

import { useLoadingOverlay } from '@/components/loading-overlay'

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
      className="text-sm px-3 py-1.5 rounded-lg"
      style={{ backgroundColor: 'rgb(var(--color-danger, 239 68 68))', color: 'white' }}
    >
      삭제
    </button>
  )
}
