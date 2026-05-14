import { createClient } from '@/lib/supabase/server'
import { LibraryFiltersWrapper } from './library-filters-wrapper'
import Link from 'next/link'
import { buttonVariants } from '@/components/ui/button'
import type { ContentWithRecord } from '@/lib/types'

export default async function LibraryPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  const { data: contents } = await supabase
    .from('contents')
    .select(`
      *,
      reading_record:reading_records(*)
    `)
    .eq('user_id', user!.id)
    .order('created_at', { ascending: false })

  const items: ContentWithRecord[] = (contents ?? []).map((c) => ({
    ...c,
    reading_record: Array.isArray(c.reading_record) ? c.reading_record[0] ?? null : c.reading_record,
  }))

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h1 className="text-xl font-bold">내 서재</h1>
        <Link href="/add" className={buttonVariants({ size: 'sm' })}>
          + 추가
        </Link>
      </div>
      <LibraryFiltersWrapper contents={items} />
    </div>
  )
}
