import { render, screen } from '@testing-library/react'
import { ReadingStatusBadge } from '@/components/reading-status-badge'

describe('ReadingStatusBadge', () => {
  it('상태 라벨 렌더링', () => {
    render(<ReadingStatusBadge status="reading" />)
    expect(screen.getByText('읽는 중')).toBeInTheDocument()
  })

  it('완독 상태 렌더링', () => {
    render(<ReadingStatusBadge status="completed" />)
    expect(screen.getByText('완독')).toBeInTheDocument()
  })

  it('최신화 도달 상태 렌더링', () => {
    render(<ReadingStatusBadge status="up_to_date" />)
    expect(screen.getByText('최신화 도달')).toBeInTheDocument()
  })
})
