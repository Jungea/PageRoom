export default function Loading() {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center" style={{ backgroundColor: 'rgba(0,0,0,0.4)' }}>
      <div
        className="w-10 h-10 rounded-full border-4 animate-spin"
        style={{ borderColor: 'rgb(var(--color-primary))', borderTopColor: 'transparent' }}
      />
    </div>
  )
}
