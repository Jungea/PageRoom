import { ContentForm } from '@/components/content-form'
import type { ContentType } from '@/lib/types'

interface Props {
  searchParams: Promise<{ type?: string }>
}

export default async function AddPage({ searchParams }: Props) {
  const { type } = await searchParams
  const validTypes: ContentType[] = ['book', 'webnovel', 'indie', 'original']
  const defaultType: ContentType = validTypes.includes(type as ContentType)
    ? (type as ContentType)
    : 'book'

  return (
    <div className="space-y-6">
      <h1 className="text-xl font-bold">콘텐츠 추가</h1>
      <ContentForm defaultType={defaultType} />
    </div>
  )
}
