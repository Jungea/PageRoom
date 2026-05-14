export default function StorePage() {
  return (
    <div className="flex flex-col items-center justify-center py-24 gap-4 text-center">
      <span className="text-5xl">🏗️</span>
      <h1 className="text-xl font-bold">서점 준비 중</h1>
      <p className="text-sm max-w-xs" style={{ color: 'rgb(var(--color-text-muted))' }}>
        독서 기록이 쌓이면 서점이 열립니다. 더 많이 읽어보세요!
      </p>
    </div>
  )
}
