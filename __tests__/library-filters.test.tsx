import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { LibraryFilters } from '@/components/library-filters'

describe('LibraryFilters', () => {
  it('필터 버튼 렌더링', () => {
    render(
      <LibraryFilters
        selectedStatus={null}
        selectedType={null}
        onStatusChange={() => {}}
        onTypeChange={() => {}}
      />,
    )
    expect(screen.getByText('전체')).toBeInTheDocument()
    expect(screen.getByText('읽는 중')).toBeInTheDocument()
    expect(screen.getByText('완독')).toBeInTheDocument()
  })

  it('상태 필터 클릭 시 콜백 호출', async () => {
    const onStatusChange = jest.fn()
    render(
      <LibraryFilters
        selectedStatus={null}
        selectedType={null}
        onStatusChange={onStatusChange}
        onTypeChange={() => {}}
      />,
    )
    await userEvent.click(screen.getByText('읽는 중'))
    expect(onStatusChange).toHaveBeenCalledWith('reading')
  })
})
