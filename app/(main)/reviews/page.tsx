import { createClient } from '@/lib/supabase/server'
import Link from 'next/link'

export default async function ReviewsPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  const { data: reviews } = await supabase
    .from('reviews')
    .select('*, content:contents(title, type)')
    .eq('user_id', user!.id)
    .order('updated_at', { ascending: false })

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h1 className="text-xl font-bold">독후감</h1>
        <Link href="/reviews/new" className="text-sm px-3 py-1.5 rounded-lg" style={{ backgroundColor: 'rgb(var(--color-primary))', color: 'rgb(var(--color-primary-foreground))' }}>
          + 새 독후감
        </Link>
      </div>

      {(!reviews || reviews.length === 0) ? (
        <p className="text-center py-12 text-sm" style={{ color: 'rgb(var(--color-text-muted))' }}>
          작성한 독후감이 없어요.
        </p>
      ) : (
        <div className="space-y-2">
          {reviews.map((review) => (
            <Link key={review.id} href={`/reviews/${review.id}`}>
              <div
                className="rounded-xl p-4 border"
                style={{ backgroundColor: 'rgb(var(--color-surface-card))', borderColor: 'rgb(var(--color-border))' }}
              >
                <div className="flex items-start justify-between">
                  <div>
                    <p className="font-semibold">{(review.content as any)?.title}</p>
                    <p className="text-xs mt-0.5" style={{ color: 'rgb(var(--color-text-muted))' }}>
                      {review.rating > 0 && '★'.repeat(review.rating)}
                      {review.is_public && ' · 공개'}
                    </p>
                  </div>
                  <p className="text-xs" style={{ color: 'rgb(var(--color-text-muted))' }}>
                    {new Date(review.updated_at).toLocaleDateString('ko-KR')}
                  </p>
                </div>
                {review.body && (
                  <p className="mt-2 text-sm line-clamp-2" style={{ color: 'rgb(var(--color-text-muted))' }}>
                    {review.body}
                  </p>
                )}
              </div>
            </Link>
          ))}
        </div>
      )}
    </div>
  )
}
