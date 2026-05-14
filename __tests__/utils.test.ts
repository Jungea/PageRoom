import {
  getStatusLabel,
  getStatusColor,
  getContentTypeLabel,
  formatProgress,
} from '@/lib/utils'

describe('getStatusLabel', () => {
  it('한국어 라벨 반환', () => {
    expect(getStatusLabel('reading')).toBe('읽는 중')
    expect(getStatusLabel('completed')).toBe('완독')
    expect(getStatusLabel('to_read')).toBe('읽기 전')
    expect(getStatusLabel('dropped')).toBe('중단')
    expect(getStatusLabel('rereading')).toBe('재독 중')
    expect(getStatusLabel('waiting')).toBe('휴재 대기')
    expect(getStatusLabel('up_to_date')).toBe('최신화 도달')
  })
})

describe('getStatusColor', () => {
  it('Tailwind 클래스 반환', () => {
    expect(getStatusColor('reading')).toContain('indigo')
    expect(getStatusColor('completed')).toContain('green')
    expect(getStatusColor('dropped')).toContain('red')
    expect(getStatusColor('up_to_date')).toContain('green')
  })
})

describe('getContentTypeLabel', () => {
  it('타입 라벨 반환', () => {
    expect(getContentTypeLabel('book')).toBe('책')
    expect(getContentTypeLabel('webnovel')).toBe('웹소설')
    expect(getContentTypeLabel('indie')).toBe('비출간')
    expect(getContentTypeLabel('original')).toBe('창작')
  })
})

describe('formatProgress', () => {
  it('책은 페이지, 웹소설은 화수로 포맷', () => {
    expect(formatProgress('book', 136, null, 247, null)).toBe('136 / 247p')
    expect(formatProgress('webnovel', null, 130, null, 271)).toBe('130 / 271화')
    expect(formatProgress('indie', null, null, null, null)).toBe('')
  })
})
