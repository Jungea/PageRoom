import Link from 'next/link'
import { buttonVariants } from '@/components/ui/button'

export default function LandingPage() {
  return (
    <main className="flex min-h-screen flex-col items-center justify-center gap-6 p-8 text-center">
      <h1 className="text-4xl font-bold" style={{ color: 'rgb(var(--color-primary))' }}>
        📚 PageRoom
      </h1>
      <p className="text-lg max-w-md" style={{ color: 'rgb(var(--color-text-muted))' }}>
        읽고, 기록하고, 운영하고, 쓰는 나만의 서점
      </p>
      <Link href="/login" className={buttonVariants()}>
        시작하기
      </Link>
    </main>
  )
}
