import { ContentForm } from '@/components/content-form'
import { createClient } from '@/lib/supabase/server'
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

  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  const { data: profile } = await supabase
    .from('user_profiles')
    .select('custom_genres')
    .eq('user_id', user!.id)
    .single()

  const customGenres: string[] = profile?.custom_genres ?? []

  return (
    <div className="space-y-6">
      <h1 className="text-xl font-bold">콘텐츠 추가</h1>
      <ContentForm defaultType={defaultType} customGenres={customGenres} />
    </div>
  )
}
